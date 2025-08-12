import { useEffect, useState } from 'react'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data || [])
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const orderProduct = async (product) => {
    const ten_khach = prompt('Nhập tên khách:')
    if (!ten_khach) return
    const sdt = prompt('Nhập số điện thoại:')
    if (!sdt) return
    const so_luong = parseInt(prompt('Số lượng:'), 10) || 1

    const payload = {
      ten_khach,
      sdt,
      san_pham: product.ten_san_pham || product.ten_sanpham || product.name,
      so_luong,
      tong_tien: (Number(product.gia) || 0) * so_luong
    }

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      if (res.ok) {
        alert('Đặt hàng thành công!')
      } else {
        console.error(json)
        alert('Lỗi khi gửi đơn hàng')
      }
    } catch (err) {
      console.error(err)
      alert('Lỗi kết nối')
    }
  }

  return (
    <div className="container">
      <h1>Quán Xôi - Demo</h1>
      {loading ? <p>Đang tải...</p> : null}
      <div className="grid">
        {products.length === 0 && !loading && <p>Không có sản phẩm.</p>}
        {products.map((p, idx) => (
          <div key={idx} className="card">
            <img src={p.hinh_anh || p.image || ''} alt={p.ten_san_pham} />
            <h3>{p.ten_san_pham}</h3>
            <p>Giá: {p.gia} đ</p>
            <button onClick={() => orderProduct(p)}>Đặt mua</button>
          </div>
        ))}
      </div>
      <style jsx>{`
        .container { max-width: 900px; margin: 24px auto; padding: 0 16px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 16px; }
        .card { border: 1px solid #eee; padding: 12px; border-radius: 8px; text-align: center; }
        img { width: 100%; height: 140px; object-fit: cover; border-radius: 6px; }
        button { margin-top: 8px; padding: 8px 12px; cursor: pointer; }
      `}</style>
    </div>
  )
}