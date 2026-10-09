#!/usr/bin/env node
/**
 * Mock Make/n8n webhook for E2E tests. Verifies the HMAC signature exactly like the real
 * scenario should, records payloads, and fails on purpose when the lead name contains
 * "FAILWEBHOOK" (to test the retry + [WEBHOOK FAILED] email path).
 *   POST /hook           receive a lead
 *   GET  /received/:ref  the recorded payload for a reference (404 if none)
 */
import {createHmac, timingSafeEqual} from 'node:crypto'
import {createServer} from 'node:http'

const port = Number(process.argv[2] ?? 4010)
const secret = process.env.LEAD_WEBHOOK_SECRET ?? 'e2e-secret'
const received = new Map()
const attempts = new Map()

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url?.startsWith('/received/')) {
    const ref = decodeURIComponent(req.url.slice('/received/'.length))
    const entry = received.get(ref)
    res.writeHead(entry ? 200 : 404, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(entry ?? {attempts: attempts.get(ref) ?? 0}))
    return
  }
  if (req.method !== 'POST' || req.url !== '/hook') {
    res.writeHead(404).end()
    return
  }
  let body = ''
  req.on('data', (c) => (body += c))
  req.on('end', () => {
    const ts = req.headers['x-iim-timestamp']
    const sig = String(req.headers['x-iim-signature'] ?? '')
    const expected = `sha256=${createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex')}`
    const valid =
      sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    if (!valid) {
      res.writeHead(401).end('bad signature')
      return
    }
    const lead = JSON.parse(body)
    attempts.set(lead.ref, (attempts.get(lead.ref) ?? 0) + 1)
    if (String(lead.name).includes('FAILWEBHOOK')) {
      res.writeHead(500).end('failing on purpose')
      return
    }
    received.set(lead.ref, {lead, attempts: attempts.get(lead.ref)})
    res.writeHead(200, {'Content-Type': 'application/json'}).end('{"ok":true}')
  })
})

server.listen(port, () => console.info(`mock webhook listening on ${port}`))
