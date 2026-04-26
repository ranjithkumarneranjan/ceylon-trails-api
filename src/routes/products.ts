import { Router, Request, Response } from 'express'
import { pool } from '../db'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const { category } = req.query
  let query = `
    SELECT p.*, r.name AS region_name, r.province, r.svg_id
    FROM products p
    LEFT JOIN regions r ON p.region_id = r.id
  `
  const params: string[] = []
  if (category && (category === 'spice' || category === 'tea')) {
    query += ' WHERE p.category = $1'
    params.push(category)
  }
  query += ' ORDER BY p.name'

  const result = await pool.query(query, params)
  res.json(result.rows)
})

router.get('/:id', async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT p.*, r.name AS region_name, r.province, r.description AS region_description, r.svg_id
     FROM products p
     LEFT JOIN regions r ON p.region_id = r.id
     WHERE p.id = $1`,
    [req.params.id]
  )
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.json(result.rows[0])
})

export default router
