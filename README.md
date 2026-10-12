# Resume Studio

Single-user resume analysis and job matching MVP built with React, TypeScript, Express, and MongoDB.

## Current stage

The MVP supports a protected single-user workspace, a saved main resume, saved job comparisons, deterministic requirement coverage, and tailored resume drafts. It uses no AI services.

## Project structure

```text
client/  React, TypeScript, Vite, Tailwind CSS
server/  Express, TypeScript, Mongoose, auth, REST routes
```

## Local setup

1. Install Node.js and run MongoDB locally, or create a MongoDB Atlas database.
2. Copy `.env.example` to `.env` and set a private `APP_PASSWORD`, a random `SESSION_SECRET` with at least 32 characters, and `MONGODB_URI`.
3. Install packages and run the frontend and API in separate terminals:

```sh
npm install
npm run dev
npm run dev:server
```

The API listens on port 4000 by default. Set `CLIENT_ORIGINS` to the exact frontend origin (comma-separated if needed). The browser login uses an HTTP-only cookie; production cookies require HTTPS.

Resume and job text are sent to the configured application server and stored in MongoDB. The application does not send this text to an AI service. Comparison checks a fixed skills, experience, and education vocabulary, scans the full resume for evidence, and shows matching excerpts where available. A term absent from the vocabulary may not be detected.

## API

All routes are prefixed by `/api`. `GET /api/health` is public; data routes require a session cookie obtained from `POST /api/auth/login` with `{ "password": "..." }`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/auth/session` | Check the current login |
| `POST` | `/api/auth/login` | Start a session |
| `POST` | `/api/auth/logout` | Clear the session |
| `GET`, `PUT`, `DELETE` | `/api/resume` | Read, save, or delete the main resume |
| `GET`, `POST` | `/api/jobs` | List saved job descriptions or add one |
| `GET`, `DELETE` | `/api/jobs/:jobId` | Read or delete a saved job |
| `POST` | `/api/jobs/:jobId/analyze` | Compare a saved job with the main resume; `{ "force": true }` reruns the rules |
| `GET` | `/api/tailored-resumes` | List saved tailored resumes |
| `POST` | `/api/tailored-resumes/jobs/:jobId` | Save a tailored resume for a job |
| `PATCH`, `DELETE` | `/api/tailored-resumes/:resumeId` | Edit or delete a saved tailored resume |

Resume text and tailored resume text are stored without trimming their whitespace so line breaks are preserved. Updating the main resume clears its cached analysis. Deleting a job also deletes its tailored resumes.

The score uses weighted requirement coverage: required criteria weigh 5, preferred 2, and unclassified mentions 1; explicit resume evidence earns full credit, related evidence half credit, and missing or unconfirmed criteria no credit. The result is not a hiring probability. Historical AI analyses are retained in MongoDB, labeled as historical in the app, and excluded from new rule-based job insights.

## Deployment notes

The API can run as a Node service (for example on Render) and the client can be built as a static Vite site (for example on Vercel). Configure the server environment variables in the hosting dashboard; never put `APP_PASSWORD`, `SESSION_SECRET`, or the database URI in frontend variables. Set `CLIENT_ORIGINS` to the deployed frontend origin and set `VITE_API_BASE_URL` to the API's public `/api` URL when building the frontend.
