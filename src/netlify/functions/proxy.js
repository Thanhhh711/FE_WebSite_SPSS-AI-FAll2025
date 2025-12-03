import fetch from 'node-fetch'

export async function handler(event, context) {
  const { path, method, body } = JSON.parse(event.body)

  try {
    const response = await fetch(`http://spss-api-gateway.runasp.net/api/${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json()
    return { statusCode: 200, body: JSON.stringify(data) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Proxy error' }) }
  }
}
