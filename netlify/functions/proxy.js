export async function handler(event, context) {
  const backendBase = 'http://spss-api-gateway.runasp.net/api'

  // Lấy đường dẫn phía sau /proxy/
  const subPath = event.path.replace('/.netlify/functions/proxy/', '')

  const url = `${backendBase}/${subPath}`

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...event.headers // copy header FE (Authorization cũng đi theo)
      },
      body: event.body // body gửi thẳng vào backend
    })

    const data = await response.text() // backend có thể trả text hoặc json
    return {
      statusCode: response.status,
      body: data
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy error', detail: err.message })
    }
  }
}
