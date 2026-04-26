import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

type AuthRequest = Request & { userId: string }

router.use(requireAuth)

router.get('/', async (req: Request, res: Response) => {
  const { userId } = req as AuthRequest
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10))
  const limit = 10
  const offset = (page - 1) * limit

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM tasting_notes WHERE user_id = $1',
    [userId]
  )
  const total = parseInt(countResult.rows[0].count, 10)

  const result = await pool.query(
    `SELECT n.*, p.name AS product_name, p.category, p.image_url
     FROM tasting_notes n
     JOIN products p ON n.product_id = p.id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  )

  res.json({ notes: result.rows, total, page, pages: Math.ceil(total / limit) })
})

router.post('/', async (req: Request, res: Response) => {
  const { userId } = req as AuthRequest
  const { product_id, note, rating } = req.body

  if (!product_id || !note) {
    res.status(400).json({ error: 'product_id and note are required' })
    return
  }
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    res.status(400).json({ error: 'rating must be between 1 and 5' })
    return
  }

  const result = await pool.query(
    `INSERT INTO tasting_notes (user_id, product_id, note, rating)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, product_id, note, rating ?? null]
  )
  res.status(201).json(result.rows[0])
})

router.put('/:id', async (req: Request, res: Response) => {
  const { userId } = req as AuthRequest
  const { note, rating } = req.body

  if (!note) {
    res.status(400).json({ error: 'note is required' })
    return
  }
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    res.status(400).json({ error: 'rating must be between 1 and 5' })
    return
  }

  const result = await pool.query(
    `UPDATE tasting_notes
     SET note = $1, rating = $2, updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [note, rating ?? null, req.params.id, userId]
  )
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Note not found or not authorized' })
    return
  }
  res.json(result.rows[0])
})

router.delete('/:id', async (req: Request, res: Response) => {
  const { userId } = req as AuthRequest
  const result = await pool.query(
    'DELETE FROM tasting_notes WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, userId]
  )
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Note not found or not authorized' })
    return
  }
  res.status(204).send()
})

export default router
