// pages/index.js
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/products')
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        setProducts(data || [])
      } catch (e) {
        console.error(e)
        setErr(e.message || 'Lỗi')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="container">
      <h1>Danh sách xôi</h1>

      {loading && <p>Đang tải sản phẩm...</p>}
      {err && <p style={{ color: 'red' }}>Lỗi: {err}</p>}

      <div className="grid">
        {products.map(p => (
          <div className="card" key={p.id}>
            <img src={p.hinh_anh || ''} alt={p.ten_san_pham} />
            <h3>{p.ten_san_pham}</h3>
            <p className="desc">{p.mo_ta}</p>

            <div className="prices">
              <span className="price">10k</span>
              <span className="price">15k</span>
              <span className="price">20k</span>
            </div>

            <Link
              href={`/order?id${p.id}`}
            >
              <a className="btn">Đặt mua</a>
            </Link>
          </div>
        ))}
      </div>

      <style jsx>{`
        .container { max-width: 1000px; margin: 24px auto; padding: 0 16px; font-family: system-ui, sans-serif; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 16px; }
        .card { border: 1px solid #eee; padding: 12px; border-radius: 8px; text-align: center; background: #fff; }
        img { width: 100%; height: 150px; object-fit: cover; border-radius: 6px; }
        .desc { font-size: 0.9rem; color: #555; height: 40px; overflow: hidden; margin: 8px 0; }
        .prices { display:flex; gap:8px; justify-content:center; margin-bottom:8px; }
        .price { padding:4px 8px; border-radius:4px; background:#f3f3f3; font-weight:600; }
        .btn { display:inline-block; margin-top:6px; padding:8px 12px; background:#ff8a00; color:#fff; border-radius:6px; text-decoration:none; }
      `}</style>
    </div>
  )
}
