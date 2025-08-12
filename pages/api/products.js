// Server-side proxy to fetch product list from GAS

export default async function handler(req, res) {
    const GAS_URL = process.env.GAS_URL
    if (!GAS_URL) {
      return res.status(500).json({ error: 'GAS_URL not configured' })
    }
  
    try {
      const r = await fetch(GAS_URL)
      let text = await r.text()
  
      // Try to parse JSON or JSONP
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        // strip JSONP callback if present: callback(...)
        const match = text.match(/^[^(]*\((.*)\)[^)]*$/s)
        if (match && match[1]) {
          data = JSON.parse(match[1])
        } else {
          throw e
        }
      }
  
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.status(200).json(data)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to fetch products' })
    }
  }