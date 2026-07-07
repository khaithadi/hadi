# hadi — apps monorepo

Three independent apps, one folder each:

| App | Folder | Stack | Live |
|---|---|---|---|
| **ميثاق Mithaq** — CRM & invoicing for craftsmen (PWA) | [`mithaq/`](mithaq/) | React + Vite | [khaithadi.github.io/hadi](https://khaithadi.github.io/hadi/) |
| **غابتي Ghabti** — forest & villa rental manager | [`ghabti/`](ghabti/) | React + Vite | [khaithadi.github.io/hadi/ghabti](https://khaithadi.github.io/hadi/ghabti/) |
| **نزل Nuzul** — short-term rental marketplace (PWA) | [`nuzul/`](nuzul/) | Next.js + Prisma | Vercel |

## Deployment

- `mithaq` and `ghabti` are built and published to **GitHub Pages** by
  [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `main`:
  Mithaq at the site root, Ghabti under `/ghabti/` (the old `/forest-rental/` URL redirects).
- `nuzul` is deployed by **Vercel** from its folder (root directory: `nuzul`).

## Development

Each app is self-contained — `cd` into its folder and use its own `package.json`:

```bash
cd mithaq   # or ghabti, nuzul
npm install
npm run dev
```

See each folder's README for app-specific docs.
