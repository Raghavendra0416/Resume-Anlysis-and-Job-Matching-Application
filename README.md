# Resume Studio

Single-user resume analysis and job matching MVP built with React, TypeScript, Express, and MongoDB.

## Current stage

The MVP supports a protected single-user workspace, a saved main resume, saved job comparisons, local Ollama analysis by default, explainable requirement coverage, and job-search skill insights. Gemini is an optional hosted provider.

## Project structure

```text
client/  React, TypeScript, Vite, Tailwind CSS
server/  Express, TypeScript, Mongoose, auth, REST routes
```

## Local setup

1. Install Node.js and run MongoDB locally, or create a MongoDB Atlas database.
2. Copy `.env.example` to `.env` and set a private `APP_PASSWORD`, a random `SESSION_SECRET` with at least 32 characters, and `MONGODB_URI`.
3. Install Ollama, start it on the same machine as the API, and download the configured model:

```sh
ollama pull qwen3:4b
```

The default model uses Ollama at `http://127.0.0.1:11434`. Set `AI_PROVIDER=gemini` only if you choose to send resume data to Google's API; then configure `GEMINI_API_KEY` and `GEMINI_MODEL`.
4. Install packages and run the frontend and API in separate terminals:

```sh
npm install
npm run dev
npm run dev:server
```

The API listens on port 4000 by default. Set `CLIENT_ORIGINS` to the exact frontend origin (comma-separated if needed). The browser login uses an HTTP-only cookie; production cookies require HTTPS.

By default, resume and job data are sent only to the local Ollama service running on the same machine as the API. This prevents sending analysis prompts to an AI provider, but resume/job records are still stored in the configured MongoDB database. Do not expose the Ollama port publicly. A deployed backend cannot reach Ollama on your laptop at `127.0.0.1`; production needs a private model host reachable by the backend or a different provider.

Optional Gemini mode: create a Gemini API key in Google AI Studio, configure billing if choosing its paid tier, and put the key in the server's root `.env` as `GEMINI_API_KEY`. Never place it in a `VITE_` variable. The free API tier may use submitted prompts to improve Google products; the paid tier says prompts are not used for product improvement. API usage is billed separately from Google AI Pro.

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
