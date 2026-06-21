import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/client'

function OrderView() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [tables, setTables] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchTables()
  }, [])

  const fetchProducts = async (categoryId = null) => {
    try {
      const url = categoryId ? `/products/?category_id=${categoryId}` : '/products/'
      const response = await api.get(url)
      setProducts(response.data)
    } catch (error) {
      toast.error('Failed to fetch products')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/')
      setCategories(response.data)
    } catch (error) {
      toast.error('Failed to fetch categories')
    }
  }

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables/')
      setTables(response.data.filter(t => t.status === 'available'))
    } catch (error) {
      toast.error('Failed to fetch tables')
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        notes: ''
      }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity }
        : item
    ))
  }

  const applyCoupon = async () => {
    if (!couponCode) return
    
    try {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const response = await api.post(`/coupons/validate/${couponCode}?order_amount=${subtotal}`)
      setDiscount(response.data.discount)
      toast.success(`Coupon applied! Discount: $${response.data.discount.toFixed(2)}`)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid coupon')
    }
  }

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
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

      const response = await api.post('/orders/', orderData)
      toast.success(`Order placed! Order #: ${response.data.order_number}`)
      
      // Clear cart
      setCart([])
      setCouponCode('')
      setDiscount(0)
      
      // Refresh tables if a table was selected
      if (selectedTable) {
        fetchTables()
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax - discount

  return (
    <div className="flex h-full">
      {/* Left Panel - Products */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4 flex gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setSelectedCategory(null)
              fetchProducts()
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              !selectedCategory ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id)
                fetchProducts(category.id)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedCategory === category.id ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="card hover:shadow-md transition-shadow text-left"
            >
              <h3 className="font-semibold text-sm">{product.name}</h3>
              <p className="text-primary-600 font-bold mt-1">${product.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-gray-50 border-l p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Current Order</h2>
        
        {/* Table Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Table
          </label>
          <select
            className="input-field"
            value={selectedTable || ''}
            onChange={(e) => setSelectedTable(e.target.value || null)}
          >
            <option value="">No table (Takeaway)</option>
            {tables.map(table => (
              <option key={table.id} value={table.id}>
                {table.name} (Floor {table.floor})
              </option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Cart is empty</p>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.product_id} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-primary-600 text-sm">${item.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span className="font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                    <span className="ml-auto font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coupon */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Coupon code"
            className="input-field flex-1"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button onClick={applyCoupon} className="btn-secondary">
            Apply
          </button>
        </div>

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={placeOrder}
          disabled={loading || cart.length === 0}
          className="btn-primary w-full mt-4 py-3 text-lg disabled:opacity-50"
        >
          {loading ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}

export default OrderView