/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node'

const url = 'http://spss-api-gateway.runasp.net/api/'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const path = req.query.path || ''
    const apiUrl = `${url}${path}`

    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
