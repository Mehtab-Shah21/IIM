# Lead automation spec (Make or n8n)

How a form submission becomes a row in the "IIM Leads" Google Sheet, an alert for the owner, and later renewal reminders. A human builds the scenarios (MANUAL_TASKS T7) from this spec. The website side is done and tested (`frontend/lib/forms/`, `frontend/app/api/quote/`).

## 1. What the website sends

For each valid quote request or contract application, the site sends a `POST` to `LEAD_WEBHOOK_URL`:

- Content type `application/json`, timeout 5 s.
- Up to 3 attempts, with back-off of 0.3 s and then 0.9 s.
- The owner is **always** emailed as well. If the webhook fails, that email's subject starts with `[WEBHOOK FAILED]`, so no lead is lost while the scenario is down.

Headers:

| Header            | Value                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `X-IIM-Timestamp` | Unix time in seconds when the attempt was made                                            |
| `X-IIM-Signature` | `sha256=` + hex HMAC-SHA256 of `<timestamp>.<raw body>`, keyed with `LEAD_WEBHOOK_SECRET` |

Body (every field is always present; empty string when not applicable):

```json
{
  "ref": "IIM-261009-K7QX",
  "type": "quote",
  "createdAt": "2026-10-09T08:00:00.000Z",
  "service": "plumbing-services-dubai",
  "description": "Kitchen sink leaking under the cabinet",
  "emirate": "Dubai",
  "area": "Dubai Marina",
  "address": "",
  "preferredDate": "2026-10-11",
  "preferredTime": "morning",
  "propertyType": "",
  "plan": "",
  "name": "Test Person",
  "phone": "+971501234567",
  "email": "customer@example.com",
  "pageUrl": "https://www.iimtechnicalservices.com/services/plumbing-services-dubai/",
  "utm": {"source": "", "medium": "", "campaign": ""}
}
```

- `type`: `quote` (3-step quote form) or `amc` (annual maintenance contract application). AMC rows have `propertyType` and `plan` (`residential` / `commercial`) and no `service`, `description`, date or time.
- `phone` is already normalised to `+971…`.
- `ref` is unique, and the customer sees it on the thank-you page and in their email. Use it as the row key.

## 2. Scenario A: "New lead" (instant)

1. **Webhook trigger** (custom webhook). Keep the raw body available: the signature is over the exact bytes.
2. **Verify the signature.** Reject (HTTP 401, stop) unless all three hold:
   - `X-IIM-Timestamp` is within 5 minutes of now.
   - `sha256=` + HMAC-SHA256(secret, `timestamp + "." + rawBody`) equals `X-IIM-Signature`. Compare the whole string.
   - The `ref` is not already in the Sheet. This makes a retried delivery after a slow response a no-op.

   Make: the built-in `sha256` HMAC function, or a small "Run JavaScript" step. n8n: a Code node using `crypto.createHmac`. The secret lives in the scenario's connection or credential store, never in a plain text field.

3. **Respond 200 quickly**, before slow steps where the tool allows it. The site waits 5 s at most per attempt.
4. **Add a row** to the **Leads** tab (columns in section 4). `status` = `New`.
5. **Alert the owner**: the channel the owner chose in PLACEHOLDERS C4 (WhatsApp provider, or email + Telegram). Suggested text:
   `New {type} {ref}: {service or plan}, {area}, {emirate}. Call {phone}.` Add a link to the Sheet row. No description or email address in chat alerts.
6. **On error** in steps 4–5: send an email to the owner with the `ref` and the error. Don't retry the Sheet write blindly: check for the `ref` first.

## 3. Scenario B: "Contract reminders" (daily, 08:00 Asia/Dubai)

1. Read rows where `type` = `amc`, `status` = `Booked` and `renewal_date` is set.
2. If `renewal_date` is 30 days away and `reminded_30` is empty: alert the owner ("Contract {ref} for {name} renews on {renewal_date}"), then set `reminded_30` to today.
3. The same at 7 days with `reminded_7`.
4. The owner fills `contract_start` and `renewal_date` by hand when a contract is signed. The site never sets them.

## 4. Google Sheet: "IIM Leads", tab "Leads"

Columns, in this order:

| Column                                     | From                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| `ref`                                      | `ref`                                                                        |
| `created_at`                               | `createdAt` (shown in Asia/Dubai time)                                       |
| `type`                                     | `type`                                                                       |
| `status`                                   | `New` on insert; validation list: New, Contacted, Quoted, Booked, Done, Lost |
| `name`                                     | `name`                                                                       |
| `phone`                                    | `phone` (format the column as plain text so `+971…` survives)                |
| `email`                                    | `email`                                                                      |
| `service`                                  | `service`                                                                    |
| `emirate`                                  | `emirate`                                                                    |
| `area`                                     | `area`                                                                       |
| `address`                                  | `address`                                                                    |
| `preferred_date`                           | `preferredDate`                                                              |
| `preferred_time`                           | `preferredTime`                                                              |
| `description`                              | `description`                                                                |
| `property_type`                            | `propertyType`                                                               |
| `plan`                                     | `plan`                                                                       |
| `source_page`                              | `pageUrl`                                                                    |
| `utm_source`, `utm_medium`, `utm_campaign` | `utm.*`                                                                      |
| `contract_start`, `renewal_date`           | owner, by hand                                                               |
| `reminded_30`, `reminded_7`                | Scenario B                                                                   |
| `owner_notes`                              | owner, by hand                                                               |

Share the Sheet only with the owner and the automation account. It holds personal data. Retention follows the privacy policy (PLACEHOLDERS A22).

## 5. Testing the scenario

1. Run the site locally with `LEAD_WEBHOOK_URL` set to the scenario's URL and a test secret.
2. Submit the quote form and the contract form. Check one row each, plus the alert.
3. Change one character of the secret on the site: the scenario must reject the request. The owner email must arrive with `[WEBHOOK FAILED]`.
4. Use the real secret only in Hostinger's environment settings.
