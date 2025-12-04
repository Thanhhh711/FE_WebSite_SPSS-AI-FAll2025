export async function handler(event, context) {
  const backendBase = 'http://spss-api-gateway.runasp.net/api'

  // Lấy phần đường dẫn sau "/.netlify/functions/proxy"
  let subPath = event.path.replace('/.netlify/functions/proxy', '')
  if (subPath.startsWith('/')) subPath = subPath.slice(1)

  const targetUrl = `${backendBase}/${subPath}`

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...event.headers
      },
      body: event.httpMethod !== 'GET' ? event.body : undefined
    })

    const text = await response.text()

    return {
      statusCode: response.status,
      body: text
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Proxy error',
        detail: err.message
      })
    }
  }
}
