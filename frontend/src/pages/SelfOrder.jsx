import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../api/client'

function SelfOrder() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [tableNumber, setTableNumber] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchProducts = async (categoryId = null) => {
    try {
      const url = categoryId 
        ? `/self-order/products?category_id=${categoryId}` 
        : '/self-order/products'
      const response = await api.get(url)
      setProducts(response.data)
    } catch (error) {
      toast.error('Failed to fetch products')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/self-order/categories')
      setCategories(response.data)
    } catch (error) {
      toast.error('Failed to fetch categories')
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

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to your order')
      return
    }

    try {
      const orderData = {
        items: cart,
        notes: tableNumber ? `Table: ${tableNumber}` : null
      }

      const response = await api.post('/self-order/orders', orderData)
      toast.success('Order placed successfully!')
      setOrderPlaced(true)
      setCart([])
    } catch (error) {
      toast.error('Failed to place order')
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been sent to the kitchen. Please wait at your table.
          </p>
          <button
            onClick={() => setOrderPlaced(false)}
            className="btn-primary w-full"
          >
            Place Another Order
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-600 text-white p-6">
        <h1 className="text-3xl font-bold">Self Order</h1>
        <p className="text-primary-100">Browse our menu and place your order</p>
      </div>

      {/* Table Number Input */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="card mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Table Number
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter table number (optional)"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 mb-6 flex gap-2 overflow-x-auto">
        <button
          onClick={() => {
            setSelectedCategory(null)
            fetchProducts()
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            !selectedCategory ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
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
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === category.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="card hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  )}
                </div>
                <p className="text-primary-600 font-bold text-lg ml-4">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <div className="mt-3 text-primary-600 font-medium text-sm">
                + Add to order
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Bottom Sheet */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                Your Order ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
              </h3>
              <p className="text-xl font-bold text-primary-600">
                ${total.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {cart.map(item => (
                <div key={item.product_id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.quantity}x</span>
                    <span className="ml-2">{item.name}</span>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={placeOrder}
              className="btn-primary w-full py-3 text-lg"
            >
              Place Order - ${total.toFixed(2)}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SelfOrder