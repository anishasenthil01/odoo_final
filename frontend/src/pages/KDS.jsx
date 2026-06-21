import React, { useState, useEffect } from 'react'

function KDS() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000) // Auto-refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API}/api/orders/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, status) => {
    try {
      await fetch(`${API}/api/orders/${orderId}/status?status=${status}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchOrders() // Refresh after update
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' }
      case 'preparing': return { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' }
      case 'ready': return { bg: '#d1fae5', text: '#065f46', border: '#10b981' }
      default: return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' }
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>👨‍🍳</div>
          <div style={{ fontSize: '24px' }}>Loading orders...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1f2937', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '20px', backgroundColor: '#111827', borderRadius: '12px' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>👨‍🍳 Kitchen Display System</h1>
            <p style={{ color: '#9ca3af', marginTop: '5px' }}>Active Orders: {orders.length}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchOrders} style={{ padding: '10px 20px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
              🔄 Refresh
            </button>
            <button onClick={() => window.location.href = '/dashboard'} style={{ padding: '10px 20px', backgroundColor: '#4b5563', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
              ← Back
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>No Active Orders</p>
            <p style={{ fontSize: '16px' }}>All orders have been completed</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {orders.map(order => {
              const statusColors = getStatusColor(order.status)
              return (
                <div key={order.id} style={{
                  backgroundColor: '#374151',
                  borderRadius: '12px',
                  padding: '20px',
                  borderLeft: `5px solid ${statusColors.border}`,
                  transition: 'all 0.3s'
                }}>
                  {/* Order Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                        {order.order_number}
                      </h3>
                      <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      backgroundColor: statusColors.bg,
                      color: statusColors.text
                    }}>
                      {order.status}
                    </span>
                  </div>

                  {/* Order Type & Table */}
                  <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                    <span style={{ padding: '4px 10px', backgroundColor: '#1f2937', color: '#d1d5db', borderRadius: '6px', fontSize: '12px' }}>
                      {order.order_type === 'dine_in' ? '🍽️ Dine In' : '🛍️ Takeaway'}
                    </span>
                    {order.table_id && (
                      <span style={{ padding: '4px 10px', backgroundColor: '#1f2937', color: '#d1d5db', borderRadius: '6px', fontSize: '12px' }}>
                        Table #{order.table_id}
                      </span>
                    )}
                  </div>

                  {/* Order Items */}
                  <div style={{ marginBottom: '15px', backgroundColor: '#1f2937', borderRadius: '8px', padding: '15px' }}>
                    <h4 style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase' }}>Items</h4>
                    {order.items && order.items.map((item, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: index < order.items.length - 1 ? '1px solid #374151' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ backgroundColor: '#374151', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                            {item.quantity}x
                          </span>
                          <span style={{ color: 'white', fontSize: '16px' }}>{item.name}</span>
                        </div>
                        {item.notes && (
                          <span style={{ color: '#fbbf24', fontSize: '12px', fontStyle: 'italic' }}>
                            📝 {item.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#1f2937', borderRadius: '8px', color: '#fbbf24', fontSize: '14px' }}>
                      📝 {order.notes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(order.id, 'preparing')}
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateStatus(order.id, 'ready')}
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Mark as Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateStatus(order.id, 'delivered')}
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default KDS