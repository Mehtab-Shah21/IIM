# Web fonts

Self-hosted, trimmed copies of the two brand fonts, loaded with `next/font/local` in `app/layout.tsx`.

| File                          | Font                         | Version | Weights            | Characters |
| ----------------------------- | ---------------------------- | ------- | ------------------ | ---------- |
| `inter-latin-400-700.woff2`   | Inter (body)                 | 4.001   | 400–700 (variable) | see below  |
| `jakarta-latin-700-800.woff2` | Plus Jakarta Sans (headings) | 2.071   | 700–800 (variable) | see below  |

Characters: Basic Latin, Latin-1 Supplement, en and em dashes, smart quotes, bullet, ellipsis,
single guillemets, euro, trademark, arrows, minus and approximately-equal. Anything else falls back
to the size-adjusted system font. To change weights or characters, re-run
`scripts/subset-fonts.py` (instructions in the file) and update the `unicode-range` in
`app/layout.tsx` to match. Why the fonts are trimmed: `docs/DECISIONS.md`, ADR-005.

## Licence

Both fonts are licensed under the **SIL Open Font License, Version 1.1** (https://openfontlicense.org).
The OFL allows subsetting and redistribution, provided the copyright notice and licence go with them. The
modified files keep the original font names; neither font declares a Reserved Font Name in its
name table.

- Inter: Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)
- Plus Jakarta Sans: Copyright 2020 The Plus Jakarta Sans Project Authors (https://github.com/tokotype/PlusJakartaSans)

`OFL.txt` (the full licence text) must sit next to the fonts. Add it from
https://openfontlicense.org/open-font-license-official-text/ (tracked in `docs/MANUAL_TASKS.md`, T10).
