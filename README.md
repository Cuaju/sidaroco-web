# Sidaroco — Frontend

> Vue 3 web application for **Sidaroco**, a bus operations and ticketing platform. Provides role-specific interfaces for customers, cashiers, route managers, finance managers, and drivers.

---

## What is Sidaroco?

Sidaroco is a transportation operations platform built for bus companies. This frontend consumes the Sidaroco microservices backend and renders a tailored UI for each user role — from passengers buying tickets to finance managers pulling monthly earnings reports.

> **Backend repo:** [sidaroco_backend](https://github.com/Cuaju/sidaroco_backend)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 |
| Build Tool | Vite |
| Routing | Vue Router 4 |
| State Management | Pinia |
| Styling | SCSS |
| Maps | Mapbox GL |
| PDF Generation | jsPDF + jsPDF AutoTable |
| Alerts & Toasts | SweetAlert2 + Vue Toastification |
| Auth | JWT (decoded client-side via jwt-decode) |
| QR Codes | qrcode |
| Package Manager | pnpm |

---

## Roles

| Role | Entry Point | Description |
|---|---|---|
| Customer | `/home` | Browse routes, select seats, purchase tickets, view booking history |
| Cashier | `/cashier` | Sell tickets on behalf of customers, daily cut and monthly reports |
| RouteManager | `/routes` | Manage routes, buses, drivers, and daily schedules |
| FinanceManager | `/finance/daily` | Financial reports by day, month, route, and cashier |
| Driver | `/driver` | View assigned trips and passenger manifests |

Route guards in `src/router/index.js` enforce role-based access by checking `account.userType` and redirecting to the correct home for each role.

---

## Project Structure

```
src/
├── assets/          # Logo, fonts, base64 assets
├── components/      # Reusable components (cards, forms, modals, maps, seat grid)
├── layouts/         # Role-based layout shells (one per role)
├── router/          # Vue Router config with role guards
├── services/        # API modules per backend service
├── stores/          # Pinia stores (auth)
├── styles/          # SCSS (colors, global, finance-specific)
├── utils/           # Image compression, ticket PDF builder, report PDF builder
└── views/           # Page components (~32 views)
```

### Services (API layer)

Each file maps to one backend microservice:

| File | Backend Service |
|---|---|
| `authApi.js` | authentication-service |
| `usersApi.js` | users-service |
| `ticketsApi.js` | ticket-service |
| `tripsApi.js` | ticket-service (trips) |
| `routesApi.js` | route-service |
| `scheduleApi.js` | schedule-service |
| `fleetApi.js` | fleet-service |
| `driverApi.js` | fleet-service (driver portal) |

---

## Environment Variables

Create a `.env` file at the root with the following:

```env
VITE_AUTH_API_URL=http://localhost:3000
VITE_FLEET_API_URL=http://localhost:3001
VITE_ROUTE_API_URL=http://localhost:3003
VITE_TICKET_API_URL=http://localhost:3004
VITE_USERS_API_URL=http://localhost:3005
VITE_SCHEDULE_API_URL=http://localhost:3006
```

Ports match the backend service defaults. Adjust for your environment.

---

## Getting Started

```bash
pnpm install
pnpm dev
```

The app runs on `http://localhost:5173` by default.

```bash
pnpm build    # production build → dist/
pnpm preview  # preview the production build locally
```

---

## Key Features

- **Seat selection** — visual bus seat grid with real-time availability
- **Ticket PDFs** — generated client-side with QR codes embedded
- **Financial reports** — daily/monthly/route/cashier breakdowns exportable as PDF
- **Route maps** — Mapbox GL integration for visualizing and picking route endpoints
- **Image upload** — browser-side compression before sending driver/bus photos to S3
- **Email notifications** — triggered after ticket purchase

---

## Team

Built as a university project at **Universidad Veracruzana** in one semester.

- [@marco1gk](https://github.com/marco1gk)
- [@Cuaju](https://github.com/Cuaju)
- [@unaay20](https://github.com/unaay20)
- [@AquilezE](https://github.com/AquilezE)
