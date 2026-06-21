import React, { useState, useEffect } from 'react'

function POSPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [tables, setTables] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [showPayment, setShowPayment] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [activeOrders, setActiveOrders] = useState([])
  const [showActiveOrders, setShowActiveOrders] = useState(false)

  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchTables()
    fetchPaymentMethods()
    fetchActiveOrders()
  }, [])

  const fetchProducts = async (categoryId = null) => {
    try {
      const url = categoryId 
        ? `http://localhost:8000/api/products/?category_id=${categoryId}`
        : 'http://localhost:8000/api/products/'
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchTables = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tables/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setTables(data)
    } catch (error) {
      console.error('Failed to fetch tables:', error)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/payments/methods', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setPaymentMethods(data)
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
    }
  }

  const fetchActiveOrders = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/orders/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setActiveOrders(data)
    } catch (error) {
      console.error('Failed to fetch active orders:', error)
    }
  }

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        notes: ''
      }]
    })
  }

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId))
  }

  const updateQuantity = (productId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity + delta
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
        }
        return item
      }).filter(item => item.quantity > 0)
    })
  }

  const validateCoupon = async () => {
    if (!couponCode) return
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    try {
      const response = await fetch(
        `http://localhost:8000/api/coupons/validate/${couponCode}?order_amount=${subtotal}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      const data = await response.json()
      if (response.ok) {
        setDiscount(data.discount)
        alert(`Coupon applied! Discount: $${data.discount.toFixed(2)}`)
      } else {
        alert(data.detail || 'Invalid coupon')
      }
    } catch (error) {
      alert('Failed to validate coupon')
    }
  }

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        table_id: selectedTable,
        order_type: selectedTable ? 'dine_in' : 'takeaway',
        items: cart,
        coupon_code: couponCode || null
      }

      const response = await fetch('http://localhost:8000/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentOrder(data)
        setShowPayment(true)
        fetchTables()
        fetchActiveOrders()
      } else {
        alert(data.detail || 'Failed to place order')
      }
    } catch (error) {
      alert('Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async (paymentMethodId) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/payments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: currentOrder.id,
          payment_method_id: paymentMethodId,
          amount: currentOrder.total
        })
      })

      if (response.ok) {
        alert('Payment successful!')
        setCart([])
        setCurrentOrder(null)
        setShowPayment(false)
        setSelectedTable(null)
        setCouponCode('')
        setDiscount(0)
        fetchTables()
        fetchActiveOrders()
      } else {
        alert('Payment failed')
      }
    } catch (error) {
      alert('Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const voidOrder = () => {
    setCart([])
    setCurrentOrder(null)
    setShowPayment(false)
    setCouponCode('')
    setDiscount(0)
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax - discount
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Payment Modal
  if (showPayment && currentOrder) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          width: '400px',
          maxWidth: '90%'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            Process Payment
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Order: {currentOrder.order_number}
          </p>
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', color: '#059669' }}>
              ${currentOrder.total.toFixed(2)}
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '10px' }}>Select Payment Method:</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => processPayment(method.id)}
                  disabled={loading}
                  style={{
                    padding: '15px',
                    backgroundColor: loading ? '#e5e7eb' : getPaymentColor(method.type),
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {method.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={voidOrder}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Cancel Order
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Left Panel - Products */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Point of Sale</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowActiveOrders(!showActiveOrders)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Active Orders ({activeOrders.length})
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Active Orders Panel */}
        {showActiveOrders && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontWeight: '600', marginBottom: '10px' }}>Active Orders</h3>
            {activeOrders.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No active orders</p>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {activeOrders.map(order => (
                  <div key={order.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px'
                  }}>
                    <div>
                      <strong>{order.order_number}</strong>
                      <span style={{
                        marginLeft: '10px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: order.status === 'pending' ? '#fef3c7' : '#dbeafe',
                        color: order.status === 'pending' ? '#92400e' : '#1e40af'
                      }}>
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <strong>${order.total.toFixed(2)}</strong>
                      <span style={{ marginLeft: '10px', color: '#6b7280', fontSize: '14px' }}>
                        {order.items?.length || 0} items
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', padding: '5px 0' }}>
          <button
            onClick={() => {
              setSelectedCategory(null)
              fetchProducts()
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: !selectedCategory ? '#4f46e5' : '#e5e7eb',
              color: !selectedCategory ? 'white' : '#374151',
              cursor: 'pointer',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id)
                fetchProducts(category.id)
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: selectedCategory === category.id ? '#4f46e5' : '#e5e7eb',
                color: selectedCategory === category.id ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '15px'
        }}>
          {products.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
                {product.name}
              </h3>
              {product.description && (
                <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
                  {product.description.substring(0, 50)}...
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                  ${product.price.toFixed(2)}
                </span>
                <span style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  + Add
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div style={{
        width: '400px',
        backgroundColor: 'white',
        borderLeft: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
            Current Order
          </h2>
          
          {/* Table Selection */}
          <select
            value={selectedTable || ''}
            onChange={(e) => setSelectedTable(e.target.value ? parseInt(e.target.value) : null)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '10px'
            }}
          >
            <option value="">Takeaway (No Table)</option>
            {tables.filter(t => t.status === 'available').map(table => (
              <option key={table.id} value={table.id}>
                {table.name} - Floor {table.floor} (Cap: {table.capacity})
              </option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🛒</div>
              <p>Cart is empty</p>
              <p style={{ fontSize: '14px' }}>Tap products to add them</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.map(item => (
                <div key={item.product_id} style={{
                  backgroundColor: '#f9fafb',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontWeight: '600' }}>{item.name}</h4>
                      <p style={{ color: '#059669', fontSize: '14px' }}>
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      style={{
                        color: '#dc2626',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '20px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => updateQuantity(item.product_id, -1)}
                        style={{
                          width: '30px',
                          height: '30px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, 1)}
                        style={{
                          width: '30px',
                          height: '30px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coupon Section */}
        {cart.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={validateCoupon}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Totals & Checkout */}
        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Subtotal ({itemCount} items)</span>
            <span style={{ fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Tax (10%)</span>
            <span style={{ fontWeight: '600' }}>${tax.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#059669' }}>
              <span>Discount</span>
              <span style={{ fontWeight: '600' }}>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Total</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
              ${total.toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={placeOrder}
            disabled={loading || cart.length === 0}
            style={{
              width: '100%',
              padding: '15px',
              marginTop: '20px',
              backgroundColor: cart.length === 0 ? '#d1d5db' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
          </button>
          
          {cart.length > 0 && (
            <button
              onClick={voidOrder}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '10px',
                backgroundColor: 'transparent',
                color: '#dc2626',
                border: '1px solid #dc2626',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function getPaymentColor(type) {
  switch (type) {
    case 'cash': return '#059669'
    case 'card': return '#4f46e5'
    case 'digital_wallet': return '#7c3aed'
    default: return '#6b7280'
  }
}

export default POSPage