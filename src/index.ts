import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import productsRouter from './routes/products'
import regionsRouter from './routes/regions'
import notesRouter from './routes/notes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/v1/products', productsRouter)
app.use('/api/v1/regions', regionsRouter)
app.use('/api/v1/notes', notesRouter)

app.listen(PORT, () => {
  console.log(`Ceylon Trails API running on port ${PORT}`)
})

export default app
