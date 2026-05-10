# RescueRoute

A real-time food rescue logistics platform that matches surplus food from restaurants, grocery stores, dining halls, and events with shelters and volunteer drivers based on urgency, distance, dietary needs, storage type, and pickup windows.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (seeded automatically)

After the first server start, `data/store.json` is created with demo users (password **`demo1234`**):

| Role    | Email                      |
|---------|----------------------------|
| Donor   | `donor@rescueroute.demo`   |
| Shelter | `shelter@rescueroute.demo` |
| Driver  | `driver@rescueroute.demo` |

### Demo flow

1. Log in as **donor** → **Donor dashboard** → optionally create another listing, or open the existing one.
2. Log in as **shelter** → **Claim** an open donation (or use the donation detail page to review matches).
3. Log in as **driver** → **Accept pickup** on a matched run → open **Google Maps** route → complete safety checklists on the donation page as each party → **Mark delivery completed**.

## Problem

Every day, edible surplus is discarded while shelters lack coordination and transport. RescueRoute is a **logistics and decision-making** layer—not only a listing board.

## This implementation

| Area | Implementation |
|------|----------------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js Route Handlers (`app/api/**`) |
| Persistence | JSON file `data/store.json` (hackathon-friendly; swap for Postgres/Supabase in production) |
| Auth | httpOnly session cookie + bcrypt password hashes |
| Matching | Rule-based scoring: distance, shelter need score, pickup urgency, category fit (`lib/matching.ts`) |
| Need prediction | Heuristic 0–100 score (`lib/need-prediction.ts`, SPEC §4.4) |
| Routing | Google Maps directions URLs (`lib/maps-link.ts`) |
| Impact | Meals, lbs food, CO₂ avoided (`lib/constants.ts` factors) |

## Documentation

- [`SPEC.md`](./SPEC.md) — product specification
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system architecture

## Scripts

- `npm run dev` — development (Turbopack)
- `npm run build` — production build
- `npm start` — serve production build

## License

Hackathon / educational use unless otherwise specified.
