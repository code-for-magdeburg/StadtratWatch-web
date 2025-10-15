# StadtratWatch Web Application

Web frontend for StadtratWatch, a civic participation platform for tracking Magdeburg city council sessions. Built with Astro 5, Alpine.js, Tailwind CSS, and Chart.js.

## Prerequisites

- Node.js 18+ and npm
- Processed data in `../data/` directory (see root HOWTO.md)
- Typesense server running (for search functionality)

## Getting Started

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server runs at `http://localhost:4321`

## Project Structure

```text
astro/
├── public/              # Static assets (images, fonts)
├── src/
│   ├── components/      # Reusable Astro/Alpine.js components
│   ├── data-analysis/   # Voting analysis algorithms
│   ├── layouts/         # Page layouts
│   ├── models/          # TypeScript models (shared with Deno)
│   ├── pages/           # Routes (file-based routing)
│   │   └── api/v1/      # REST API endpoints
│   └── styles/          # Global CSS
└── astro.config.mjs     # Astro configuration + env vars
```

## Commands

| Command              | Action                                      |
| :------------------- | :------------------------------------------ |
| `npm install`        | Install dependencies                        |
| `npm run dev`        | Start dev server at `localhost:4321`        |
| `npm run build`      | Build production site to `./dist/`          |
| `npm run preview`    | Preview production build locally            |
| `npm test`           | Run Vitest tests                            |
| `npm run format`     | Format code with Prettier                   |
| `npm run format:check` | Check code formatting                     |

## Configuration

Environment variables are configured in `astro.config.mjs` using Astro's env schema:

- `DEFAULT_PARLIAMENT_PERIOD` - Default period ID (e.g., "magdeburg-8")
- `AWS_CLOUDFRONT_BASE_URL` - CDN base URL for assets
- Typesense connection details (host, port, API key, protocol)

## Data Sources

The application reads from the `../data/` directory:

- `data/{period-id}/registry.json` - Parliament period metadata
- `data/{period-id}/{session-date}/` - Session votings, speeches, speakers
- `data/papers/` - Council papers and PDFs

Run data processing scripts (see root HOWTO.md) before starting the web app.

## Tech Stack

- **Astro 5** - Static site generator with SSR
- **Alpine.js** - Lightweight JavaScript framework
- **Tailwind CSS 4 + DaisyUI** - Styling
- **Chart.js + D3.js** - Data visualization
- **Typesense** - Full-text search engine

## API

Public REST API available at `/api/v1/`. See `src/pages/api/v1/README.md` for documentation.
