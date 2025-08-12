// Server-side proxy to post an order to GAS

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  
    const GAS_URL = process.env.GAS_URL
    if (!GAS_URL) {
      return res.status(500).json({ error: 'GAS_URL not configured' })
    }
  
    try {
      // Forward request body to GAS using POST
      const r = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      })
  
      // GAS may return JSON or JSONP; handle both
      const text = await r.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        const match = text.match(/^[^(]*\((.*)\)[^)]*$/s)
        if (match && match[1]) data = JSON.parse(match[1])
        else data = { raw: text }
      }
  
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.status(200).json(data)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to send order' })
    }
  }