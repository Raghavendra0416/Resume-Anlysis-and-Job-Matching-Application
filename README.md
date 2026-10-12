# Resume Studio

Single-user resume analysis and job matching MVP built with React, TypeScript, Express, and MongoDB.

## Current stage

The MVP supports a protected single-user workspace, a saved main resume, saved job comparisons, Gemini-assisted analysis, explainable requirement coverage, and job-search skill insights.

## Project structure

```text
client/  React, TypeScript, Vite, Tailwind CSS
server/  Express, TypeScript, Mongoose, auth, REST routes
```

## Local setup

1. Install Node.js and run MongoDB locally, or create a MongoDB Atlas database.
2. Copy `.env.example` to `.env` and set a private `APP_PASSWORD`, a random `SESSION_SECRET` with at least 32 characters, `MONGODB_URI`, and `GEMINI_API_KEY`.
3. Install packages and run the frontend and API in separate terminals:

```sh
npm install
npm run dev
npm run dev:server
```

The API listens on port 4000 by default. Set `CLIENT_ORIGINS` to the exact frontend origin (comma-separated if needed). The browser login uses an HTTP-only cookie; production cookies require HTTPS.

Create a Gemini API key in Google AI Studio and put it in the server's root `.env` as `GEMINI_API_KEY`. Do not add the key to a `VITE_` variable or share it in chat. `GEMINI_MODEL` defaults to `gemini-3.8-flash`. This project uses the Gemini free tier: Google may use submitted prompts and responses to improve its products. Resume and job data are sent to Gemini when you analyze a job. Google's terms say not to submit sensitive, confidential, or personal information to the Gemini free tier. Remove personal information from the saved resume before analysis; the UI requires confirmation, but cannot verify the content itself.

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
| `POST` | `/api/jobs/:jobId/analyze` | Analyze a saved job against the main resume; `{ "force": true }` reruns it |
| `GET` | `/api/tailored-resumes` | List saved tailored resumes |
| `POST` | `/api/tailored-resumes/jobs/:jobId` | Save a tailored resume for a job |
| `PATCH`, `DELETE` | `/api/tailored-resumes/:resumeId` | Edit or delete a saved tailored resume |

Resume text and tailored resume text are stored without trimming their whitespace so line breaks are preserved. Updating the main resume clears its cached analysis. Deleting a job also deletes its tailored resumes.

The analysis caches a factual resume profile until the main resume changes. Requirement coverage is deterministic: required criteria weigh 5, preferred 2, and inferred 1; evidenced criteria receive full credit, partial evidence half credit, and other statuses no credit. It is not a hiring probability. Resume citations are checked against the source text, but users should still verify every AI suggestion. Never add missing skills or experience unless they are true.

## Deployment notes

The API can run as a Node service (for example on Render) and the client can be built as a static Vite site (for example on Vercel). Configure the server environment variables in the hosting dashboard; never put `APP_PASSWORD`, `SESSION_SECRET`, or the database URI in frontend variables. Set `CLIENT_ORIGINS` to the deployed frontend origin and set `VITE_API_BASE_URL` to the API's public `/api` URL when building the frontend.
