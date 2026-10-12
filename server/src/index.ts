import { app } from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'

await connectDatabase()
app.listen(env.PORT, () => {
  console.info(`Resume Studio API listening on port ${env.PORT}`)
})
