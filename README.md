# Resume Studio

Single-user resume analysis and job matching MVP built with React, TypeScript, Express, and MongoDB.

## Current stage

The responsive frontend shell and protected REST API foundation are implemented. The frontend forms are still presentation-only; AI analysis and frontend/API integration are later stages.

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
| `GET` | `/api/tailored-resumes` | List saved tailored resumes |
| `POST` | `/api/tailored-resumes/jobs/:jobId` | Save a tailored resume for a job |
| `PATCH`, `DELETE` | `/api/tailored-resumes/:resumeId` | Edit or delete a saved tailored resume |

Resume text and tailored resume text are stored without trimming their whitespace so line breaks are preserved. Updating the main resume clears its cached analysis. Deleting a job also deletes its tailored resumes.

## Deployment notes

The API can run as a Node service (for example on Render) and the client can be built as a static Vite site (for example on Vercel). Configure the server environment variables in the hosting dashboard; never put `APP_PASSWORD`, `SESSION_SECRET`, or the database URI in frontend variables. Set `CLIENT_ORIGINS` to the deployed frontend origin and set `VITE_API_BASE_URL` to the API's public `/api` URL when building the frontend.
