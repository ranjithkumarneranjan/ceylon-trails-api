import { Router, Request, Response } from 'express'
import { pool } from '../db'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM regions ORDER BY name')
  res.json(result.rows)
})

router.get('/:id/products', async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT p.*, r.name AS region_name, r.province, r.svg_id
     FROM products p
     LEFT JOIN regions r ON p.region_id = r.id
     WHERE p.region_id = $1
     ORDER BY p.name`,
    [req.params.id]
  )
  res.json(result.rows)
})

export default router
