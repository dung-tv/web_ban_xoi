// pages/order/[id].js
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

export default function OrderPage() {
  const router = useRouter()
  const { id } = router.query

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  // form state
  const [selectedPrice, setSelectedPrice] = useState('10000') // string for radio values
  const [toppings, setToppings] = useState([]) // array of {name, price}
  const [selectedToppings, setSelectedToppings] = useState([])
  const [tenKhach, setTenKhach] = useState('')
  const [sdt, setSdt] = useState('')
  const [soLuong, setSoLuong] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch('/api/products')
      .then(r => {
        if (!r.ok) throw new Error('Không thể tải sản phẩm')
        return r.json()
      })
      .then(list => {
        const p = (list || []).find(x => String(x.id) === String(id))
        if (!p) throw new Error('Sản phẩm không tồn tại')
        setProduct(p)

        // default selected price to 10k if exists
        setSelectedPrice(String(p.gia_10k || 10000))
        // parse toppings from p.topping_15k_20k if present
        const raw = p.topping_15k_20k || p.topping || ''
        const parsed = parseToppingString(raw)
        setToppings(parsed) // [{name, price}]
      })
      .catch(e => {
        console.error(e)
        setErr(e.message || 'Lỗi')
      })
      .finally(() => setLoading(false))
  }, [id])

  // parse topping string e.g. "Hành:3000,Chả:5000,Ruốc:4000"
  function parseToppingString(str) {
    if (!str) return []
    return str.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(item => {
        const [name, price] = item.split(':').map(x => x && x.trim())
        return { name: name || item, price: Number(price) || 0 }
      })
  }

  // computed total
  const total = useMemo(() => {
    const base = Number(selectedPrice) || 0
    const toppingsSum = selectedToppings.reduce((acc, tName) => {
      const t = toppings.find(x => x.name === tName)
      return acc + (t ? t.price : 0)
    }, 0)
    return (base + toppingsSum) * (Number(soLuong) || 0)
  }, [selectedPrice, selectedToppings, toppings, soLuong])

  function toggleTopping(name) {
    setSelectedToppings(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!tenKhach || !sdt) {
      alert('Vui lòng nhập tên và số điện thoại')
      return
    }
    if (!product) {
      alert('Sản phẩm không hợp lệ')
      return
    }

    // rule: nếu chọn giá 10000 (10k) thì không cho topping
    if (Number(selectedPrice) === Number(product.gia_10k || 10000) && selectedToppings.length > 0) {
      alert('Giá 10k không được chọn topping')
      return
    }

    const payload = {
      ten_khach: tenKhach,
      sdt,
      san_pham: product.ten_san_pham,
      gia_chon: Number(selectedPrice),
      toppings: selectedToppings,
      so_luong: Number(soLuong),
      tong_tien: Number(total),
      product_id: product.id,
      thoi_gian: new Date().toISOString()
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        console.error('Order error', data)
        alert('Gửi đơn hàng thất bại')
      } else {
        alert('Đặt hàng thành công!\nTổng: ' + total.toLocaleString() + ' đ')
        router.push('/')
      }
    } catch (e) {
      console.error(e)
      alert('Lỗi kết nối khi gửi đơn hàng')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="container"><p>Đang tải...</p></div>
  if (err) return <div className="container"><p style={{ color: 'red' }}>Lỗi: {err}</p></div>
  if (!product) return <div className="container"><p>Sản phẩm không tìm thấy</p></div>

  // determine if topping UI should be enabled for selected price
  const enableTopping = Number(selectedPrice) !== Number(product.gia_10k || 10000)

  return (
    <div className="container">
      <Link href="/"><a>← Quay về danh sách</a></Link>
      <h1>Đặt hàng: {product.ten_san_pham}</h1>

      <div className="layout">
        <div className="left">
          <img src={product.hinh_anh} alt={product.ten_san_pham} />
          <p>{product.mo_ta}</p>
        </div>

        <form className="right" onSubmit={handleSubmit}>
          <div className="field">
            <label>Chọn giá:</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="price"
                  value={product.gia_10k}
                  checked={String(selectedPrice) === String(product.gia_10k)}
                  onChange={() => { setSelectedPrice(String(product.gia_10k)); setSelectedToppings([]) }}
                /> 10k ({Number(product.gia_10k).toLocaleString()} đ)
              </label>
            </div>

            <div>
              <label>
                <input
                  type="radio"
                  name="price"
                  value={product.gia_15k}
                  checked={String(selectedPrice) === String(product.gia_15k)}
                  onChange={() => setSelectedPrice(String(product.gia_15k))}
                /> 15k ({Number(product.gia_15k).toLocaleString()} đ)
              </label>
            </div>

            <div>
              <label>
                <input
                  type="radio"
                  name="price"
                  value={product.gia_20k}
                  checked={String(selectedPrice) === String(product.gia_20k)}
                  onChange={() => setSelectedPrice(String(product.gia_20k))}
                /> 20k ({Number(product.gia_20k).toLocaleString()} đ)
              </label>
            </div>
          </div>

          <div className="field">
            <label>Chọn topping:</label>
            {!enableTopping && <p style={{ fontStyle: 'italic' }}>Topping không có sẵn với mức giá 10k.</p>}
            {enableTopping && toppings.length === 0 && <p>Không có topping.</p>}
            {enableTopping && toppings.map(t => (
              <div key={t.name}>
                <label>
                  <input
                    type="checkbox"
                    value={t.name}
                    checked={selectedToppings.includes(t.name)}
                    onChange={() => toggleTopping(t.name)}
                  /> {t.name} (+{t.price.toLocaleString()} đ)
                </label>
              </div>
            ))}
          </div>

          <div className="field">
            <label>Tên khách</label>
            <input value={tenKhach} onChange={e => setTenKhach(e.target.value)} required />
          </div>

          <div className="field">
            <label>Số điện thoại</label>
            <input value={sdt} onChange={e => setSdt(e.target.value)} required />
          </div>

          <div className="field">
            <label>Số lượng</label>
            <input type="number" min="1" value={soLuong} onChange={e => setSoLuong(e.target.value)} />
          </div>

          <div className="field">
            <strong>Tổng tiền: {Number(total).toLocaleString()} đ</strong>
          </div>

          <div className="actions">
            <button type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Xác nhận đặt'}</button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .container { max-width: 900px; margin: 20px auto; padding: 0 16px; font-family: system-ui, sans-serif; }
        .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 12px; }
        .left img { width: 100%; height: 260px; object-fit: cover; border-radius: 8px; }
        .field { margin-bottom: 12px; }
        label { display: block; margin-bottom: 6px; font-weight: 600; }
        input[type="text"], input[type="tel"], input[type="number"] { width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ccc; }
        .actions { margin-top: 10px; }
        button { padding: 10px 14px; background: #ff8a00; color: white; border: none; border-radius: 6px; cursor: pointer; }
        @media (max-width: 760px) {
          .layout { grid-template-columns: 1fr; }
          .left img { height: 200px; }
        }
      `}</style>
    </div>
  )
}
