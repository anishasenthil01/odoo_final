import React, { useState, useEffect } from 'react'

function CustomerDisplay() {
  const [orders, setOrders] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Auto-rotate through orders
    const rotateInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(orders.length, 1))
    }, 5000)
    return () => clearInterval(rotateInterval)
  }, [orders])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API}/api/orders/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'preparing': return '👨‍🍳'
      case 'ready': return '✅'
      default: return '📋'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'preparing': return '#3b82f6'
      case 'ready': return '#10b981'
      default: return '#9ca3af'
    }
  }

  if (orders.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>☕</div>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Welcome!</h1>
          <p style={{ fontSize: '20px', color: '#94a3b8' }}>Waiting for orders...</p>
        </div>
      </div>
    )
  }

  const currentOrder = orders[currentIndex] || orders[0]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '40px', color: 'white' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>📺 Order Status</h1>
        <p style={{ fontSize: '18px', color: '#94a3b8' }}>Active Orders: {orders.length}</p>
      </div>

      {/* Current Order Display */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '40px',
          border: `3px solid ${getStatusColor(currentOrder.status)}`,
          marginBottom: '30px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {getStatusEmoji(currentOrder.status)}
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: getStatusColor(currentOrder.status) }}>
              Order #{currentOrder.order_number}
            </h2>
            <p style={{ fontSize: '20px', color: '#94a3b8', marginTop: '10px', textTransform: 'uppercase' }}>
              Status: {currentOrder.status}
            </p>
          </div>

          {/* Items */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '30px', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '20px', color: '#94a3b8', marginBottom: '20px' }}>Items:</h3>
            {currentOrder.items && currentOrder.items.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 0',
                borderBottom: index < currentOrder.items.length - 1 ? '1px solid #334155' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{
                    backgroundColor: '#334155',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    {item.quantity}x
                  </span>
                  <span style={{ fontSize: '20px' }}>{item.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', color: '#94a3b8' }}>Total Amount</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981', marginTop: '10px' }}>
              ₹{currentOrder.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Order Dots Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          {orders.map((order, index) => (
            <button
              key={order.id}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: index === currentIndex ? '40px' : '12px',
                height: '12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: index === currentIndex ? getStatusColor(order.status) : '#334155',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>

        {/* Orders Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {orders.map(order => (
            <div
              key={order.id}
              onClick={() => setCurrentIndex(orders.indexOf(order))}
              style={{
                backgroundColor: order.id === currentOrder.id ? '#1e293b' : '#0f172a',
                borderRadius: '12px',
                padding: '20px',
                border: `2px solid ${order.id === currentOrder.id ? getStatusColor(order.status) : '#334155'}`,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>#{order.order_number}</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: getStatusColor(order.status),
                  color: 'white'
                }}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <p style={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold', marginTop: '10px' }}>
                ₹{order.total.toFixed(2)}
              </p>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>
                {order.items?.length || 0} items
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomerDisplay