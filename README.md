# probkalshi.com

Live Kalshi odds overlay for OBS streamers.

## What is this?

A free tool that turns any Kalshi market URL into an OBS-ready overlay widget with live updating prices.

**The Polymarket ticker (`ticker.polymarket.com`) — but for Kalshi.**

## How it works

1. Paste a Kalshi market URL
2. Pick a layout preset (Big Card, Compact Ticker, Side Panel)
3. Copy the overlay URL
4. Add it as a Browser Source in OBS
5. Done — odds update live automatically

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS 4**
- **TypeScript**
- **Vercel** deployment

No database. No auth. Config lives in URL params.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Routes

All routes proxy to Kalshi's public REST API (no auth required):

- `GET /api/kalshi/market/[ticker]` — Market data
- `GET /api/kalshi/orderbook/[ticker]` — Orderbook
- `GET /api/kalshi/trades/[ticker]` — Latest trade
- `GET /api/resolve?url=...` — Parse URL → market data

## Overlay URL Format

```
https://probkalshi.com/overlay?ticker=KXFEDCUT-26JAN-T0.5&preset=big-card&theme=transparent
```

Query params:
- `ticker` — Kalshi market ticker (required)
- `preset` — `big-card` | `compact-ticker` | `side-panel`
- `theme` — `transparent` | `dark` | `light`
- `showTrade` — `true` | `false`
- `showButton` — `true` | `false`

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/probkalshi)

## License

MIT
