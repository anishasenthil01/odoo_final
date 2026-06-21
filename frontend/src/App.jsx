import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { API } from './config'   // ← ADD THIS LINE
import React, { useState, useEffect } from 'react'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ==================== LOGIN COMPONENT ====================
function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setMessage('')
  try {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    const response = await fetch('${API}/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    })
    const data = await response.json()
    if (response.ok) {
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (!localStorage.getItem('customerPhone')) {
    localStorage.setItem('customerPhone', '')
  }
      setMessage('Login successful! Redirecting...')
      
      // Redirect based on role
      setTimeout(() => {
  if (data.user.role === 'admin' || data.user.role === 'manager') {
    window.location.href = '/admin'
  } else if (data.user.role === 'staff') {
    window.location.href = '/staff'
  } else {
    window.location.href = '/customer'
  }
}, 1000)
    } else {
      setMessage('Error: ' + (data.detail || 'Login failed'))
    }
  } catch (error) {
    setMessage('Error: Cannot connect to backend')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px', fontWeight: 'bold' }}>Cafe POS Login</h1>
        {message && (
          <div style={{ padding: '10px', marginBottom: '20px', borderRadius: '4px', backgroundColor: message.includes('successful') ? '#d4edda' : '#f8d7da', color: message.includes('successful') ? '#155724' : '#721c24' }}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '16px' }} required />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '16px' }} required />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#9ca3af' : '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/signup" style={{ color: '#4f46e5', textDecoration: 'none' }}>Create new account</a>
        </div>
      </div>
    </div>
  )
}

// ==================== SIGNUP COMPONENT ====================
function Signup() {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    full_name: '', 
    phone: '',      // ADD THIS
    password: '' 
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('${API}/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          role: 'customer'
        })
      })
      const data = await response.json()
      if (response.ok) {
        // Store phone in localStorage for later use
        localStorage.setItem('customerPhone', formData.phone)
        setMessage('Account created! Redirecting to login...')
        setTimeout(() => { window.location.href = '/login' }, 2000)
      } else {
        setMessage('Error: ' + (data.detail || 'Signup failed'))
      }
    } catch (error) {
      setMessage('Error: Cannot connect to backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px', fontWeight: 'bold' }}>Create Account</h1>
        {message && (
          <div style={{ padding: '10px', marginBottom: '20px', borderRadius: '4px', backgroundColor: message.includes('created') ? '#d4edda' : '#f8d7da', color: message.includes('created') ? '#155724' : '#721c24' }}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>👤 Full Name</label>
            <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} required />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>📧 Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} required />
          </div>
          {/* ADD PHONE FIELD HERE */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>📱 Phone Number</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Enter your phone number" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>👤 Username</label>
            <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} required />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>🔒 Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} required />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#9ca3af' : '#059669', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '500' }}>
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/login" style={{ color: '#4f46e5', textDecoration: 'none' }}>Already have an account? Login</a>
        </div>
      </div>
    </div>
  )
}

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  
  // Don't check auth immediately - use useEffect
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState([])  
  const [categories, setCategories] = useState([])
  const [employees, setEmployees] = useState([])
  const [tables, setTables] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({ total_reviews: 0, average_rating: 0, ratings: {} })
  // Session Popup State
  const [showSessionPopup, setShowSessionPopup] = useState(false)
  const [lastSession, setLastSession] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [todaySummary, setTodaySummary] = useState(null)
  const [showCloseSession, setShowCloseSession] = useState(false)
  const [endingCash, setEndingCash] = useState('')
  const [sessionLoading, setSessionLoading] = useState(false)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
const [newEmployee, setNewEmployee] = useState({ username: '', email: '', full_name: '', password: '', role: 'staff' })
  const [orders, setOrders] = useState([])
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [customers, setCustomers] = useState([])
const [customerSearch, setCustomerSearch] = useState('')
const [editingCustomer, setEditingCustomer] = useState(null)
const [showCustomerEdit, setShowCustomerEdit] = useState(false)
const [customerEditForm, setCustomerEditForm] = useState({ name: '', email: '', phone: '' })


  // Auth check in useEffect
  useEffect(() => {
    if (!token || !user || !user.role) {
      window.location.href = '/login'
      return
    }
    if (user.role !== 'admin' && user.role !== 'manager') {
      window.location.href = '/staff'
      return
    }
    // Only check session after auth is confirmed
    checkSession()
    fetchTodaySummary()
    fetchProducts()
    fetchCategories()
    fetchEmployees()
    fetchTables()
    fetchReviewStats()
  }, []) // Runs once on mount

  // Remove the other useEffects that also fetch data on mount
  // Keep only this one for tab changes:
  useEffect(() => {
    if (activeTab === 'products') fetchProducts()
    if (activeTab === 'categories') fetchCategories()
    if (activeTab === 'employees') fetchEmployees()
    if (activeTab === 'tables') fetchTables()
    if (activeTab === 'orders') fetchOrders() 
    if (activeTab === 'customers') fetchCustomers()
    if (activeTab === 'reviews') {
      fetchReviews()
      fetchReviewStats()
    }
  }, [activeTab])

  const checkSession = async () => {
    try {
      // Check for active session
      const activeRes = await fetch('${API}/api/sessions/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (activeRes.ok) {
        const activeData = await activeRes.json()
        setActiveSession(activeData)
        setShowSessionPopup(false)
      } else {
        // No active session - check last closed session
        const lastRes = await fetch('${API}/api/sessions/last-closed', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (lastRes.ok) {
          const lastData = await lastRes.json()
          if (lastData.has_previous) {
            setLastSession(lastData)
            setShowSessionPopup(true)
          }
        }
      }
    } catch (error) {
      console.error('Session check error:', error)
    }
  }

  const fetchTodaySummary = async () => {
    try {
      const response = await fetch('${API}/api/sessions/today-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setTodaySummary(await response.json())
      }
    } catch (error) { console.error(error) }
  }

  const handleStartSession = async () => {
    setSessionLoading(true)
    try {
      const response = await fetch('${API}/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ starting_cash: 0 })
      })
      if (response.ok) {
        const data = await response.json()
        setActiveSession(data)
        setShowSessionPopup(false)
        alert('Session started successfully!')
      } else {
        const err = await response.json()
        alert(err.detail || 'Failed to start session')
      }
    } catch (error) {
      alert('Failed to start session')
    } finally {
      setSessionLoading(false)
    }
  }

  const handleCloseSession = async () => {
    if (!endingCash) {
      alert('Please enter ending cash amount')
      return
    }
    setSessionLoading(true)
    try {
      const response = await fetch(`${API}/api/sessions/${activeSession.id}/end?ending_cash=${parseFloat(endingCash)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        alert(`Session closed!\nTotal Sales: ₹${data.total_sales.toFixed(2)}\nCash Difference: ₹${data.cash_difference.toFixed(2)}`)
        setActiveSession(null)
        setShowCloseSession(false)
        setEndingCash('')
        checkSession()
        fetchTodaySummary()
      }
    } catch (error) {
      alert('Failed to close session')
    } finally {
      setSessionLoading(false)
    }
  }

  // Auth check
  useEffect(() => {
    if (!token || !user || !user.role) {
      window.location.href = '/login'
    }
    if (user.role !== 'admin' && user.role !== 'manager') {
      window.location.href = '/staff'
    }
  }, [])
  const fetchOrders = async () => {
  try {
    let url = '${API}/api/orders/history?limit=200'
    if (orderSearch) url += `&search=${encodeURIComponent(orderSearch)}`
    if (orderStatusFilter) url += `&status=${orderStatusFilter}`
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setOrders(data)
  } catch (error) { console.error(error) }
}

const fetchOrderDetail = async (orderId) => {
  try {
    const response = await fetch(`${API}/api/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setSelectedOrder(data)
    setShowOrderDetail(true)
  } catch (error) { console.error(error) }
}

const handleDeleteOrder = async (orderId) => {
  if (!confirm('Are you sure you want to delete this order? This cannot be undone.')) return
  try {
    await fetch(`${API}/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    alert('Order deleted successfully!')
    fetchOrders()
    setShowOrderDetail(false)
  } catch (error) { alert('Failed to delete order') }
}
  // Fetch functions
  const fetchProducts = async (categoryId = null) => {
  try {
    const url = categoryId 
      ? `${API}/api/products/?category_id=${categoryId}`
      : '${API}/api/products/'
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setProducts(await response.json())
  } catch (error) { console.error(error) }
}

  const fetchCategories = async () => {
    try {
      const response = await fetch('${API}/api/categories/?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setCategories(await response.json())
    } catch (error) { console.error(error) }
  }

  const fetchEmployees = async () => {
  try {
    const response = await fetch('${API}/api/employees/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    // Filter out customers
    setEmployees(data.filter(emp => emp.role !== 'customer'))
  } catch (error) { console.error(error) }
}

  const fetchTables = async () => {
    try {
      const response = await fetch('${API}/api/tables/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setTables(await response.json())
    } catch (error) { console.error(error) }
  }

 const fetchCustomers = async () => {
  try {
    let url = '${API}/api/customers/?limit=200'
    if (customerSearch) url += `&search=${encodeURIComponent(customerSearch)}`
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setCustomers(data)
  } catch (error) { console.error(error) }
}

  const fetchReviews = async () => {
    try {
      const response = await fetch('${API}/api/reviews/?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setReviews(await response.json())
    } catch (error) { console.error(error) }
  }

  const fetchReviewStats = async () => {
    try {
      const response = await fetch('${API}/api/reviews/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setReviewStats(await response.json())
    } catch (error) { console.error(error) }
  }

  // Single useEffect for initial load
  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchEmployees()
    fetchTables()
    fetchReviewStats()
  }, [])

  // Single useEffect for tab changes
  useEffect(() => {
    if (activeTab === 'products') fetchProducts()
    if (activeTab === 'categories') fetchCategories()
    if (activeTab === 'employees') fetchEmployees()
    if (activeTab === 'tables') fetchTables()
    if (activeTab === 'reviews') {
      fetchReviews()
      fetchReviewStats()
    }
  }, [activeTab])

  // ========== PRODUCT CRUD ==========
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
  name: '', description: '', price: '', tax_percent: '5', category_id: '', is_available: true, is_featured: false, stock_quantity: 0
})

  const openAddProduct = () => {
  setEditingProduct(null)
  setProductForm({ name: '', description: '', price: '', tax_percent: '5', category_id: '', is_available: true, is_featured: false, stock_quantity: 0 })
  setShowProductForm(true)
}

  const openEditProduct = (product) => {
  setEditingProduct(product)
  setProductForm({
    name: product.name,
    description: product.description || '',
    price: product.price,
    tax_percent: product.tax_percent || '5',
    category_id: product.category_id || '',
    is_available: product.is_available,
    is_featured: product.is_featured || false,
    stock_quantity: product.stock_quantity || 0
  })
  setShowProductForm(true)
}

  const handleSaveProduct = async (e) => {
  e.preventDefault()
  const url = editingProduct 
    ? `${API}/api/products/${editingProduct.id}`
    : '${API}/api/products/'
  const method = editingProduct ? 'PUT' : 'POST'
  
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        ...productForm,
        price: parseFloat(productForm.price),
        tax_percent: parseFloat(productForm.tax_percent || 5),
        category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
        stock_quantity: parseInt(productForm.stock_quantity)
      })
    })
    if (response.ok) {
      alert(editingProduct ? 'Product updated!' : 'Product added!')
      setShowProductForm(false)
      fetchProducts()
    } else {
      const err = await response.json()
      alert(err.detail || 'Failed to save')
    }
  } catch (error) { alert('Failed to save product') }
}

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await fetch(`${API}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchProducts()
      alert('Product deleted!')
    } catch (error) { alert('Failed to delete') }
  }

  // ========== CATEGORY CRUD ==========
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })

  const openAddCategory = () => {
    setEditingCategory(null)
    setCategoryForm({ name: '', description: '' })
    setShowCategoryForm(true)
  }

  const openEditCategory = (cat) => {
    setEditingCategory(cat)
    setCategoryForm({ name: cat.name, description: cat.description || '' })
    setShowCategoryForm(true)
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    const url = editingCategory
      ? `${API}/api/categories/${editingCategory.id}`
      : '${API}/api/categories/'
    const method = editingCategory ? 'PUT' : 'POST'
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(categoryForm)
      })
      if (response.ok) {
        alert(editingCategory ? 'Category updated!' : 'Category added!')
        setShowCategoryForm(false)
        fetchCategories()
      } else {
        alert('Failed to save category')
      }
    } catch (error) { alert('Failed to save') }
  }

  // ========== TABLE CRUD ==========
  const [showTableForm, setShowTableForm] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [tableForm, setTableForm] = useState({ name: '', capacity: 4, floor: 1, status: 'available' })

  const openAddTable = () => {
    setEditingTable(null)
    setTableForm({ name: '', capacity: 4, floor: 1, status: 'available' })
    setShowTableForm(true)
  }

  const openEditTable = (table) => {
    setEditingTable(table)
    setTableForm({ name: table.name, capacity: table.capacity, floor: table.floor, status: table.status })
    setShowTableForm(true)
  }

  const handleSaveTable = async (e) => {
    e.preventDefault()
    const url = editingTable
      ? `${API}/api/tables/${editingTable.id}`
      : '${API}/api/tables/'
    const method = editingTable ? 'PUT' : 'POST'
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...tableForm, capacity: parseInt(tableForm.capacity), floor: parseInt(tableForm.floor) })
      })
      if (response.ok) {
        alert(editingTable ? 'Table updated!' : 'Table added!')
        setShowTableForm(false)
        fetchTables()
      } else {
        const err = await response.json()
        alert(err.detail || 'Failed to save')
      }
    } catch (error) { alert('Failed to save table') }
  }

  const handleDeleteTable = async (id) => {
    if (!confirm('Delete this table?')) return
    try {
      await fetch(`${API}/api/tables/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchTables()
      alert('Table deleted!')
    } catch (error) { alert('Failed to delete') }
  }


  

const handleAddEmployee = async (e) => {
  e.preventDefault()
  try {
    const response = await fetch('${API}/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newEmployee)
    })
    if (response.ok) {
      alert('Employee created successfully!')
      setShowAddEmployee(false)
      setNewEmployee({ username: '', email: '', full_name: '', password: '', role: 'staff' })
      fetchEmployees()
    } else {
      const err = await response.json()
      alert(err.detail || 'Failed to create employee')
    }
  } catch (error) {
    alert('Failed to create employee')
  }
}

  // ========== EMPLOYEE MANAGEMENT ==========
  
  const toggleEmployeeStatus = async (id, currentStatus) => {
    try {
      await fetch(`${API}/api/employees/${id}?is_active=${!currentStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchEmployees()
      alert(`Employee ${!currentStatus ? 'activated' : 'deactivated'}!`)
    } catch (error) { alert('Failed to update') }
  }

  const changeEmployeeRole = async (id, role) => {
    try {
      await fetch(`${API}/api/employees/${id}?role=${role}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchEmployees()
      alert('Role updated!')
    } catch (error) { alert('Failed to update role') }
  }

  const menuItems = [ 
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'products', label: '🍽️ Menu Items' },
    { id: 'categories', label: '📂 Categories' },
    { id: 'tables', label: '🪑 Tables' },
    { id: 'employees', label: '👥 Employees' },
    { id: 'orders', label: '📋 Orders' },
    { id: 'customers', label: '👤 Customers' },
    { id: 'reviews', label: '⭐ Reviews' },
  ]

  return (
    
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* ========== SESSION POPUP ========== */}
    {showSessionPopup && lastSession && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '35px', maxWidth: '450px', width: '90%' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>☕</div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>Previous Session Summary</h2>
            <p style={{ color: '#6b7280', fontSize: '13px' }}>
              Closed: {new Date(lastSession.end_time).toLocaleString('en-IN')}
            </p>
          </div>

          <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Sales</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>₹{lastSession.total_sales?.toFixed(2) || '0'}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Orders</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>{lastSession.order_count || 0}</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
              Closed by: {lastSession.closed_by || 'N/A'}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            <button onClick={handleStartSession} disabled={sessionLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              {sessionLoading ? 'Starting...' : '🔓 Start New Session'}
            </button>
            <button onClick={() => setShowSessionPopup(false)} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
              Skip & Continue
            </button>
          </div>
        </div>
      </div>
    )}
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#1f2937', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '30px', padding: '10px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#60a5fa' }}>☕ Cafe Admin</h2>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>{user.full_name} ({user.role})</p>
        </div>
        {/* Session Status */}
{activeSession ? (
  <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#065f46', borderRadius: '8px' }}>
    <div style={{ fontSize: '11px', color: '#6ee7b7', marginBottom: '5px' }}>🟢 Session Active</div>
    <div style={{ fontSize: '12px', color: 'white' }}>Sales: ₹{activeSession.total_sales?.toFixed(2) || '0.00'}</div>
    <div style={{ fontSize: '12px', color: '#d1d5db', marginBottom: '8px' }}>Orders: {activeSession.order_count || 0}</div>
    <button
      onClick={() => setShowCloseSession(true)}
      style={{ width: '100%', padding: '8px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
    >
      🔒 Close Session
    </button>
  </div>
) : (
  <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#374151', borderRadius: '8px' }}>
    <div style={{ fontSize: '11px', color: '#ef4444', marginBottom: '5px' }}>🔴 No Active Session</div>
    <button
      onClick={handleStartSession}
      style={{ width: '100%', padding: '8px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
    >
      🔓 Start Session
    </button>
  </div>
)}

{/* Today's Summary */}
{todaySummary && (
  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#374151', borderRadius: '8px' }}>
    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '5px' }}>📊 Today</div>
    <div style={{ fontSize: '12px', color: '#10b981' }}>Sales: ₹{todaySummary.total_sales?.toFixed(2)}</div>
    <div style={{ fontSize: '12px', color: '#d1d5db' }}>Orders: {todaySummary.total_orders}</div>
  </div>
)}


        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                padding: '12px 15px',
                backgroundColor: activeTab === item.id ? '#374151' : 'transparent',
                color: activeTab === item.id ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #374151', paddingTop: '20px' }}>
          <button onClick={() => window.open('/pos', '_blank')} style={{ width: '100%', padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            🛒 Open POS
          </button>
          <button onClick={() => window.open('/kds', '_blank')} style={{ width: '100%', padding: '12px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            👨‍🍳 Open KDS
          </button>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} style={{ width: '100%', padding: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
          </div>

          {/* ========== DASHBOARD ========== */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {[
                  { label: 'Menu Items', value: products.length, color: '#3b82f6', tab: 'products' },
                  { label: 'Categories', value: categories.length, color: '#8b5cf6', tab: 'categories' },
                  { label: 'Tables', value: tables.length, color: '#059669', tab: 'tables' },
                  { label: 'Employees', value: employees.length, color: '#ea580c', tab: 'employees' },
                  { label: 'Reviews', value: reviewStats.total_reviews, color: '#f59e0b', tab: 'reviews' },
                ].map((stat, i) => (
                  <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }} onClick={() => setActiveTab(stat.tab)}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>{stat.label}</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {reviewStats.total_reviews > 0 && (
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>⭐ Customer Satisfaction</h3>
                    <button onClick={() => setActiveTab('reviews')} style={{ padding: '6px 12px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#4f46e5' }}>
                      View All →
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f59e0b' }}>{reviewStats.average_rating}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>Average Rating</div>
                      <div style={{ fontSize: '20px', marginTop: '5px' }}>{'⭐'.repeat(Math.round(reviewStats.average_rating))}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#3b82f6' }}>{reviewStats.total_reviews}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Reviews</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>⚡ Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <button onClick={() => setActiveTab('products')} style={{ padding: '12px', backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>➕ Add Product</button>
                  <button onClick={() => setActiveTab('categories')} style={{ padding: '12px', backgroundColor: '#ede9fe', color: '#5b21b6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>📂 Add Category</button>
                  <button onClick={() => setActiveTab('tables')} style={{ padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🪑 Add Table</button>
                  <button onClick={() => window.open('/pos', '_blank')} style={{ padding: '12px', backgroundColor: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🛒 Open POS</button>
                  <button onClick={() => window.open('/kds', '_blank')} style={{ padding: '12px', backgroundColor: '#ffedd5', color: '#9a3412', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>👨‍🍳 Open KDS</button>
                </div>
              </div>
            </div>
          )}

          {/* ========== PRODUCTS ========== */}
{activeTab === 'products' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Menu Items ({products.length})</h3>
      <button onClick={openAddProduct} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>➕ Add New Item</button>
    </div>

    {showProductForm && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '500px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>{editingProduct ? '✏️ Edit Item' : '➕ Add New Item'}</h3>
          <form onSubmit={handleSaveProduct} style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Name *</label>
              <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Description</label>
              <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows="2" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Price (₹) *</label>
                <input type="number" step="0.01" min="0" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Tax % (GST)</label>
                <select value={productForm.tax_percent} onChange={(e) => setProductForm({ ...productForm, tax_percent: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                  <option value="0">0% (No Tax)</option>
                  <option value="5">5% (GST)</option>
                  <option value="12">12% (GST)</option>
                  <option value="18">18% (GST)</option>
                  <option value="28">28% (GST)</option>
                </select>
              </div>
              <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Price with Tax:</span>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#059669' }}>
                    ₹{productForm.price ? (parseFloat(productForm.price) * (1 + parseFloat(productForm.tax_percent || 0) / 100)).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Category</label>
                <select value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                  <option value="">None</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Stock</label>
                <input type="number" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })} min="0" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={productForm.is_available} onChange={(e) => setProductForm({ ...productForm, is_available: e.target.checked })} />
                <span style={{ fontSize: '14px' }}>Available</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={productForm.is_featured} onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })} />
                <span style={{ fontSize: '14px' }}>Featured</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{editingProduct ? '💾 Update' : '💾 Save'}</button>
              <button type="button" onClick={() => setShowProductForm(false)} style={{ padding: '12px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}

    <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Name</th>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Category</th>
            <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '13px', color: '#6b7280' }}>Price</th>
            <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>Status</th>
            <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px 20px' }}>
                <span style={{ fontWeight: '600' }}>{product.name}</span>
                {product.description && <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{product.description.substring(0, 40)}</p>}
              </td>
              <td style={{ padding: '12px 20px', color: '#6b7280', fontSize: '14px' }}>{categories.find(c => c.id === product.category_id)?.name || '-'}</td>
              <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>₹{product.price.toFixed(2)}</td>
              <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: product.is_available ? '#d1fae5' : '#fee2e2', color: product.is_available ? '#065f46' : '#991b1b' }}>{product.is_available ? 'Active' : 'Inactive'}</span>
              </td>
              <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                <button onClick={() => openEditProduct(product)} style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>✏️ Edit</button>
                <button onClick={() => handleDeleteProduct(product.id)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
          {/* ========== CATEGORIES ========== */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Categories ({categories.length})</h3>
                <button onClick={openAddCategory} style={{ padding: '10px 20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>➕ Add Category</button>
              </div>

              {showCategoryForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '450px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>{editingCategory ? '✏️ Edit Category' : '➕ Add Category'}</h3>
                    <form onSubmit={handleSaveCategory} style={{ display: 'grid', gap: '15px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Name *</label>
                        <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Description</label>
                        <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})} rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>💾 Save</button>
                        <button type="button" onClick={() => setShowCategoryForm(false)} style={{ padding: '12px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gap: '10px' }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ backgroundColor: 'white', padding: '15px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div>
                      <h4 style={{ fontWeight: '600', margin: 0 }}>{cat.name}</h4>
                      {cat.description && <p style={{ fontSize: '13px', color: '#6b7280', margin: '5px 0 0 0' }}>{cat.description}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: cat.is_active ? '#d1fae5' : '#fee2e2', color: cat.is_active ? '#065f46' : '#991b1b' }}>{cat.is_active ? 'Active' : 'Inactive'}</span>
                      <button onClick={() => openEditCategory(cat)} style={{ padding: '6px 12px', backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>✏️ Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== TABLES ========== */}
          {activeTab === 'tables' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Tables ({tables.length})</h3>
                <button onClick={openAddTable} style={{ padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>➕ Add Table</button>
              </div>

              {showTableForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '400px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>{editingTable ? '✏️ Edit Table' : '➕ Add Table'}</h3>
                    <form onSubmit={handleSaveTable} style={{ display: 'grid', gap: '15px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Table Name *</label>
                        <input type="text" value={tableForm.name} onChange={(e) => setTableForm({...tableForm, name: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} placeholder="e.g., T11" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Capacity</label>
                          <input type="number" value={tableForm.capacity} onChange={(e) => setTableForm({...tableForm, capacity: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Floor</label>
                          <select value={tableForm.floor} onChange={(e) => setTableForm({...tableForm, floor: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                            <option value="1">Floor 1</option>
                            <option value="2">Floor 2</option>
                            <option value="3">Floor 3</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Status</label>
                        <select value={tableForm.status} onChange={(e) => setTableForm({...tableForm, status: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="reserved">Reserved</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>💾 Save</button>
                        <button type="button" onClick={() => setShowTableForm(false)} style={{ padding: '12px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {tables.map(table => (
  <div key={table.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4f46e5' }}>{table.name}</div>
    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>Floor {table.floor} • Cap: {table.capacity}</div>
    <span style={{ display: 'inline-block', marginTop: '10px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', 
      backgroundColor: table.status === 'available' ? '#d1fae5' : table.status === 'occupied' ? '#fee2e2' : '#fef3c7', 
      color: table.status === 'available' ? '#065f46' : table.status === 'occupied' ? '#991b1b' : '#92400e' 
    }}>
      {table.status}
    </span>
    
    {/* Action Buttons */}
    <div style={{ marginTop: '10px', display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <button onClick={() => openEditTable(table)} style={{ padding: '6px 12px', backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
        ✏️ Edit
      </button>
      
      {/* Mark as Cleaned/Available button */}
      {table.status !== 'available' && (
        <button 
          onClick={async () => {
            try {
              await fetch(`${API}/api/tables/${table.id}/status?status=available`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
              })
              fetchTables()
              alert(`Table ${table.name} marked as Available!`)
            } catch (error) { alert('Failed to update table') }
          }}
          style={{ padding: '6px 12px', backgroundColor: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
        >
          ✅ Cleaned
        </button>
      )}
      
      {/* Quick status change buttons */}
      {table.status === 'available' && (
        <>
          <button 
            onClick={async () => {
              try {
                await fetch(`${API}/api/tables/${table.id}/status?status=reserved`, {
                  method: 'PUT',
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                fetchTables()
              } catch (error) { alert('Failed to update table') }
            }}
            style={{ padding: '6px 12px', backgroundColor: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            📌 Reserve
          </button>
          <button 
            onClick={async () => {
              try {
                await fetch(`${API}/api/tables/${table.id}/status?status=occupied`, {
                  method: 'PUT',
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                fetchTables()
              } catch (error) { alert('Failed to update table') }
            }}
            style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            🚫 Occupy
          </button>
        </>
      )}
      
      <button onClick={() => handleDeleteTable(table.id)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
        🗑️
      </button>
    </div>
  </div>
))}
              </div>
            </div>
          )}

         {/* ========== EMPLOYEES ========== */}
{activeTab === 'employees' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Employees ({employees.length})</h3>
      <button onClick={() => setShowAddEmployee(true)} style={{ padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
        ➕ Add Employee
      </button>
    </div>

    <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Employee</th>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Username</th>
            <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>Role</th>
            <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>Status</th>
            <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px 20px' }}>
                <span style={{ fontWeight: '600' }}>{emp.full_name}</span>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{emp.email}</p>
              </td>
              <td style={{ padding: '12px 20px', color: '#6b7280' }}>@{emp.username}</td>
              <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                <select value={emp.role} onChange={(e) => changeEmployeeRole(emp.id, e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </td>
              <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                <button onClick={() => toggleEmployeeStatus(emp.id, emp.is_active)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', backgroundColor: emp.is_active ? '#d1fae5' : '#fee2e2', color: emp.is_active ? '#065f46' : '#991b1b' }}>{emp.is_active ? 'Active' : 'Inactive'}</button>
              </td>
              <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(emp.created_at).toLocaleDateString()}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Add Employee Modal */}
    {showAddEmployee && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '450px', maxWidth: '90%' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>➕ Add New Employee</h3>
          <form onSubmit={handleAddEmployee} style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Full Name *</label>
              <input type="text" value={newEmployee.full_name} onChange={(e) => setNewEmployee({...newEmployee, full_name: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Username *</label>
              <input type="text" value={newEmployee.username} onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Email *</label>
              <input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Password *</label>
              <input type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Role *</label>
              <select value={newEmployee.role} onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>💾 Create Employee</button>
              <button type="button" onClick={() => setShowAddEmployee(false)} style={{ padding: '12px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
)}
          {/* ========== ORDERS ========== */}
{activeTab === 'orders' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Order History ({orders.length})</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search by Order #, Name or Phone"
          value={orderSearch}
          onChange={(e) => setOrderSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', width: '280px' }}
        />
        <select
          value={orderStatusFilter}
          onChange={(e) => setOrderStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={fetchOrders} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
          🔍 Search
        </button>
        <button onClick={() => { setOrderSearch(''); setOrderStatusFilter(''); fetchOrders(); }} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
          Clear
        </button>
      </div>
    </div>

    {orders.length === 0 ? (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '50px', marginBottom: '15px' }}>📋</div>
        <p style={{ fontSize: '18px', color: '#6b7280', fontWeight: '500' }}>No orders found</p>
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>Orders will appear here when customers place them</p>
      </div>
    ) : (
      <div style={{ display: 'grid', gap: '12px' }}>
        {orders.map(order => {
          // Parse customer details from notes
          const notesStr = order.notes || ''
  const customerMatch = notesStr.match(/Customer:\s*(.+?)(?:\s*\||$)/)
  const emailMatch = notesStr.match(/Email:\s*(.+?)(?:\s*\||$)/)        // ← ADD THIS
  const phoneMatch = notesStr.match(/Phone:\s*(.+?)(?:\s*\||$)/)
  const customerName = customerMatch ? customerMatch[1].trim() : 'Walk-in Customer'
  const customerEmail = emailMatch ? emailMatch[1].trim() : 'N/A'       // ← ADD THIS
  const customerPhone = phoneMatch ? phoneMatch[1].trim() : 'N/A'
          
          return (
            <div key={order.id} style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              borderLeft: `4px solid ${
                order.status === 'pending' ? '#f59e0b' : 
                order.status === 'preparing' ? '#3b82f6' : 
                order.status === 'ready' ? '#10b981' : 
                order.status === 'delivered' ? '#8b5cf6' : '#ef4444'
              }`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '15px' }}>
                {/* Left Side - Order Info */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  {/* Order Number & Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', color: '#4f46e5', fontSize: '16px' }}>{order.order_number}</span>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '11px', 
                      fontWeight: '600',
                      backgroundColor: order.status === 'pending' ? '#fef3c7' : 
                                      order.status === 'preparing' ? '#dbeafe' : 
                                      order.status === 'ready' ? '#d1fae5' : 
                                      order.status === 'delivered' ? '#ede9fe' : '#fee2e2',
                      color: order.status === 'pending' ? '#92400e' : 
                             order.status === 'preparing' ? '#1e40af' : 
                             order.status === 'ready' ? '#065f46' : 
                             order.status === 'delivered' ? '#5b21b6' : '#991b1b'
                    }}>{order.status.toUpperCase()}</span>
                    <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#6b7280' }}>
                      {order.order_type === 'dine_in' ? '🍽️ Dine In' : '🛍️ Takeaway'}
                    </span>
                  </div>
                  
                  {/* Customer Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>👤 Customer Name</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{customerName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>📧 Email</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#4f46e5' }}>{customerEmail}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>📱 Phone</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{customerPhone}</div>
                    </div>
                    {order.table_id && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>🪑 Table</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Table #{order.table_id}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>🕐 Date & Time</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { 
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '5px' }}>📝 Order Items</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {order.items && order.items.map((item, i) => (
                        <span key={i} style={{ 
                          padding: '4px 10px', 
                          backgroundColor: '#f3f4f6', 
                          borderRadius: '6px', 
                          fontSize: '12px', 
                          color: '#374151' 
                        }}>
                          <strong>{item.quantity}x</strong> {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Total & Actions */}
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <div style={{ marginBottom: '5px' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Total Amount</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>₹{order.total?.toFixed(2)}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{order.items?.length || 0} items</div>
                  </div>
                  
                  {order.discount > 0 && (
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', marginBottom: '8px' }}>
                      💚 Saved ₹{order.discount.toFixed(2)}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      onClick={() => {
                        if (confirm(`Delete order ${order.order_number}?\nCustomer: ${customerName}\nTotal: ₹${order.total?.toFixed(2)}`)) {
                          handleDeleteOrder(order.id)
                        }
                      }}
                      style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )}
  </div>
)}
{/* ========== CUSTOMERS ========== */}
{activeTab === 'customers' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Customers ({customers.length})</h3>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="🔍 Search by name, email or phone"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', width: '250px' }}
        />
        <button onClick={fetchCustomers} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          🔄 Refresh
        </button>
      </div>
    </div>

    {customers.length === 0 ? (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '50px', marginBottom: '15px' }}>👤</div>
        <p style={{ fontSize: '18px', color: '#6b7280', fontWeight: '500' }}>No customers yet</p>
      </div>
    ) : (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>Name</th>
              <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>Email</th>
              <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>Phone</th>
              <th style={{ padding: '10px 15px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.filter(c => {
              if (!customerSearch) return true
              const s = customerSearch.toLowerCase()
              return (c.name || '').toLowerCase().includes(s) || 
                     (c.email || '').toLowerCase().includes(s) || 
                     (c.phone || '').includes(s)
            }).map(customer => (
              <tr key={customer.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 15px', fontWeight: '600', fontSize: '13px' }}>{customer.name || 'N/A'}</td>
                <td style={{ padding: '10px 15px', fontSize: '13px', color: '#4f46e5' }}>{customer.email || 'N/A'}</td>
                <td style={{ padding: '10px 15px', fontSize: '13px' }}>{customer.phone || 'N/A'}</td>
                <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                  <button onClick={() => { 
                    setCustomerEditForm({ name: customer.name || '', email: customer.email || '', phone: customer.phone || '' }); 
                    setEditingCustomer(customer); 
                    setShowCustomerEdit(true); 
                  }} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={async () => { 
                    if (confirm(`Delete "${customer.name}"?`)) { 
                      try { 
                        await fetch(`${API}/api/customers/${customer.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
                        fetchCustomers(); 
                      } catch (e) { alert('Failed'); } 
                    } 
                  }} style={{ padding: '5px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Edit Customer Modal */}
    {showCustomerEdit && editingCustomer && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', width: '400px', maxWidth: '90%' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>✏️ Edit Customer</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Name</label>
              <input type="text" value={customerEditForm.name} onChange={(e) => setCustomerEditForm({...customerEditForm, name: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Email</label>
              <input type="email" value={customerEditForm.email} onChange={(e) => setCustomerEditForm({...customerEditForm, email: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Phone</label>
              <input type="text" value={customerEditForm.phone} onChange={(e) => setCustomerEditForm({...customerEditForm, phone: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={async () => {
              try {
                await fetch(`${API}/api/customers/${editingCustomer.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify(customerEditForm)
                })
                alert('Customer updated!')
                setShowCustomerEdit(false)
                fetchCustomers()
              } catch (error) { alert('Failed to update') }
            }} style={{ flex: 1, padding: '10px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              💾 Save
            </button>
            <button onClick={() => setShowCustomerEdit(false)} style={{ padding: '10px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}

          {/* ========== REVIEWS ========== */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Customer Reviews ({reviews.length})</h3>
                <button onClick={() => { fetchReviews(); fetchReviewStats(); }} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🔄 Refresh</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>Total Reviews</div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>{reviewStats.total_reviews}</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>Average Rating</div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>{reviewStats.average_rating} ⭐</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '15px', fontSize: '14px', color: '#6b7280' }}>Rating Distribution</h4>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviewStats.ratings?.[String(star)] || 0
                    const total = reviewStats.total_reviews || 1
                    const percentage = (count / total) * 100
                    return (
                      <div key={star} style={{ textAlign: 'center', minWidth: '80px' }}>
                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>{'⭐'.repeat(star)}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px' }}>{count} reviews</div>
                        <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', backgroundColor: '#f59e0b', borderRadius: '4px', width: `${percentage}%`, transition: 'width 0.5s' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>{percentage.toFixed(0)}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {reviews.length === 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '50px', marginBottom: '15px' }}>📝</div>
                  <p style={{ fontSize: '18px', color: '#6b7280', fontWeight: '500' }}>No reviews yet</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>Customer reviews will appear here</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{review.customer_name}</span>
                            <span style={{ fontSize: '20px' }}>{'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                            <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '600' }}>{review.rating}/5</span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>Order #{review.order_id} • {new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: review.rating >= 4 ? '#d1fae5' : review.rating >= 3 ? '#fef3c7' : '#fee2e2', color: review.rating >= 4 ? '#065f46' : review.rating >= 3 ? '#92400e' : '#991b1b' }}>{review.rating >= 4 ? '😍 Positive' : review.rating >= 3 ? '😊 Neutral' : '😞 Negative'}</span>
                      </div>
                      {review.comment && (
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px 15px', borderRadius: '8px', marginTop: '10px' }}>
                          <p style={{ fontSize: '14px', color: '#374151', fontStyle: 'italic', margin: 0 }}>"{review.comment}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* ========== CLOSE SESSION MODAL ========== */}
      {showCloseSession && activeSession && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '30px', maxWidth: '420px', width: '90%' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '5px' }}>🔒 Close Session</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
              Started: {new Date(activeSession.start_time).toLocaleTimeString()}
            </p>

            <div style={{ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Total Sales</span>
                <span style={{ fontWeight: 'bold', color: '#059669', fontSize: '16px' }}>₹{activeSession.total_sales?.toFixed(2) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Total Orders</span>
                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{activeSession.order_count || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Starting Cash</span>
                <span style={{ fontWeight: 'bold' }}>₹{activeSession.starting_cash?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Ending Cash Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={endingCash}
                onChange={(e) => setEndingCash(e.target.value)}
                placeholder="Enter ending cash amount"
                style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCloseSession}
                disabled={sessionLoading}
                style={{ flex: 1, padding: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: sessionLoading ? 'not-allowed' : 'pointer' }}
              >
                {sessionLoading ? 'Closing...' : 'Close Session'}
              </button>
              <button
                onClick={() => { setShowCloseSession(false); setEndingCash('') }}
                style={{ padding: '12px 20px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
            {/* Add Employee Modal */}
{showAddEmployee && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '450px', maxWidth: '90%' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>➕ Add New Employee</h3>
      <form onSubmit={handleAddEmployee} style={{ display: 'grid', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Full Name *</label>
          <input type="text" value={newEmployee.full_name} onChange={(e) => setNewEmployee({...newEmployee, full_name: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Username *</label>
          <input type="text" value={newEmployee.username} onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Email *</label>
          <input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Password *</label>
          <input type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Role *</label>
          <select value={newEmployee.role} onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>💾 Create Employee</button>
          <button type="button" onClick={() => setShowAddEmployee(true)} style={{ padding: '12px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}
          </div>
        </div>
      )}
    </div>
  )
}







// ==================== CUSTOMER ORDERING DASHBOARD ====================
function CustomerDashboard() {
  const [step, setStep] = useState(1)
  const [selectedTable, setSelectedTable] = useState('')
  const [tableInfo, setTableInfo] = useState(null)
  const [products, setProducts] = useState([])
  const [upiAmount, setUpiAmount] = useState('')
  const [categories, setCategories] = useState([])
  const [tables, setTables] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const savedPhone = localStorage.getItem('customerPhone') || ''
  const [customerName, setCustomerName] = useState(user.full_name || '')
  const [customerEmail, setCustomerEmail] = useState(user.email || '')
  const [customerPhone, setCustomerPhone] = useState(savedPhone)  // From signup
  const [showReview, setShowReview] = useState(false)
  const [review, setReview] = useState({ rating: 0, comment: '' })
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const token = localStorage.getItem('token')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [showCouponInput, setShowCouponInput] = useState(false)
  const [showUPIQR, setShowUPIQR] = useState(false)
  // If not logged in, redirect
  if (!token) {
    window.location.href = '/login'
    return null
  }

  const validateCoupon = async () => {
  if (!couponCode.trim()) {
    alert('Please enter a coupon code')
    return
  }
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  try {
    const response = await fetch(`${API}/api/coupons/validate/${couponCode.trim()}?order_amount=${subtotal}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    
    if (response.ok) {
      setDiscount(data.discount)
      setAppliedCoupon({ code: couponCode.trim(), discount: data.discount })
      alert(`✅ Coupon applied! You saved ₹${data.discount.toFixed(2)}`)
    } else {
      alert(data.detail || 'Invalid or expired coupon')
      setCouponCode('')
    }
  } catch (error) {
    alert('Failed to validate coupon')
  }
}

const removeCoupon = () => {
  setDiscount(0)
  setAppliedCoupon(null)
  setCouponCode('')
}

  useEffect(() => {
    fetchTables()
    fetchPaymentMethods()
  }, [])

  useEffect(() => {
    if (step === 2) {
      fetchCategories()
      fetchProducts()
    }
    if (step === 5 && currentOrder) {
      const interval = setInterval(() => {
        checkOrderStatus(currentOrder.id)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [step, currentOrder])

  const fetchTables = async () => {
  try {
    const response = await fetch('${API}/api/tables/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setTables(data.filter(t => t.status === 'available'))
  } catch (error) { console.error(error) }
}

 const fetchProducts = async (categoryId = null) => {
  try {
    const url = categoryId 
      ? `${API}/api/products/?category_id=${categoryId}`
      : '${API}/api/products/'
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setProducts(data)  // ← Show ALL products, not just available ones
  } catch (error) { console.error(error) }
}

  const fetchCategories = async () => {
    try {
      const response = await fetch('${API}/api/categories/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setCategories(await response.json())
    } catch (error) { console.error(error) }
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('${API}/api/payments/methods', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setPaymentMethods(await response.json())
    } catch (error) { console.error(error) }
  }

  const checkOrderStatus = async (orderId) => {
    try {
      const response = await fetch(`${API}/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setCurrentOrder(data)
      
      // Show review prompt when order is delivered
      if (data.status === 'delivered' && !reviewSubmitted) {
        setShowReview(true)
      }
    } catch (error) { console.error(error) }
  }

  const handleTableSelect = () => {
    if (!selectedTable) {
      alert('Please select your table')
      return
    }
    if (!customerName) {
      alert('Please enter your name')
      return
    }
    if (!customerEmail) {  // ← ADD THIS
    alert('Please enter your email')
    return
  }
    const table = tables.find(t => t.id === parseInt(selectedTable))
    setTableInfo(table)
    setStep(2)
  }

  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product_id === product.id)
      if (existing) {
        return prevCart.map(item =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
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
    setCart(prev => prev.filter(item => item.product_id !== productId))
  }

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product_id === productId) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : item
        }
        return item
      }).filter(item => item.quantity > 0)
    })
  }

  const proceedToPayment = () => {
    if (cart.length === 0) {
      alert('Please add items to your order')
      return
    }
    setStep(4)
  }

  const placeOrderAndPay = async (paymentMethodId) => {
  setLoading(true)
  try {
    // Save phone for future use
    localStorage.setItem('customerPhone', customerPhone)
    
    const orderData = {
      table_id: parseInt(selectedTable),
      order_type: 'dine_in',
      items: cart,
      notes: `Customer: ${customerName} | Email: ${customerEmail} | Phone: ${customerPhone || 'N/A'}`
    }

    const orderResponse = await fetch('${API}/api/orders/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(orderData)
    })
    const order = await orderResponse.json()

    if (orderResponse.ok) {
      const paymentResponse = await fetch('${API}/api/payments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          order_id: order.id,
          payment_method_id: paymentMethodId,
          amount: order.total
        })
      })

      if (paymentResponse.ok) {
        setCurrentOrder(order)
        setStep(5)
        // Reset coupon after successful order
        setCouponCode('')
        setDiscount(0)
        setAppliedCoupon(null)

        try {
          await fetch('${API}/api/customers/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              name: customerName,
              email: customerEmail,
              phone: customerPhone
            })
          })
          console.log('Customer saved to database')
        } catch (error) {
          console.log('Customer save error (non-critical):', error)
        }
      } else {
        alert('Payment failed. Please try again.')
      }
    } else {
      alert(order.detail || 'Failed to place order')
    }
  } catch (error) {
    alert('Failed to process order')
  } finally {
    setLoading(false)
  }
}

  const submitReview = async () => {
    if (review.rating === 0) {
      alert('Please select a rating')
      return
    }
    try {
      const response = await fetch('${API}/api/reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          order_id: currentOrder.id,
          customer_name: customerName,
          rating: review.rating,
          comment: review.comment
        })
      })
      if (response.ok) {
        setReviewSubmitted(true)
        setShowReview(false)
        alert('Thank you for your review! 🙏')
      }
    } catch (error) {
      alert('Failed to submit review')
    }
  }

  const skipReview = () => {
    setShowReview(false)
  }

  const resetOrder = () => {
    setStep(1)
    setCart([])
    setCurrentOrder(null)
    setSelectedTable('')
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setShowReview(false)
    setReview({ rating: 0, comment: '' })
    setReviewSubmitted(false)
    fetchTables()
  }
const validateCustomerCoupon = async () => {
  if (!couponCode.trim()) {
    alert('Please enter a coupon code')
    return
  }
  
  // Quick validation for known coupons
  const code = couponCode.trim().toUpperCase()
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  if (code === 'COUPON2000' && subtotal < 2000) {
    alert('COUPON2000 requires minimum order of ₹2000!')
    return
  }
  if (code === 'COUPON1000' && subtotal < 1000) {
    alert('COUPON1000 requires minimum order of ₹1000!')
    return
  }
  if (code === 'WEDNESDAY' && new Date().getDay() !== 3) {
    alert('WEDNESDAY coupon is only valid on Wednesdays!')
    return
  }
  
  try {
    const response = await fetch(`${API}/api/coupons/validate/${code}?order_amount=${subtotal}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    
    if (response.ok) {
      setDiscount(data.discount)
      setAppliedCoupon({ code: code, discount: data.discount })
      alert(`✅ Coupon applied! You saved ₹${data.discount.toFixed(2)}`)
    } else {
      alert(data.detail || 'Invalid or expired coupon')
      setCouponCode('')
    }
  } catch (error) {
    alert('Failed to validate coupon')
  }
}

const removeCustomerCoupon = () => {
  setDiscount(0)
  setAppliedCoupon(null)
  setCouponCode('')
}
const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
const tax = subtotal * 0.05
const total = Math.max(0, subtotal + tax - discount)  // Ensure total doesn't go below 0
const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'preparing': return '#3b82f6'
      case 'ready': return '#10b981'
      case 'delivered': return '#8b5cf6'
      default: return '#9ca3af'
    }
  }

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'preparing': return '👨‍🍳'
      case 'ready': return '✅'
      case 'delivered': return '🎉'
      default: return '📋'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Order Received'
      case 'preparing': return 'Preparing Your Order'
      case 'ready': return 'Order Ready!'
      case 'delivered': return 'Enjoy Your Meal! 🍽️'
      default: return status
    }
  }

  // Step 1: Table Selection
  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', maxWidth: '450px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>🍽️</div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>Welcome!</h1>
            <p style={{ color: '#6b7280' }}>Please select your table to start ordering</p>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                👤 Your Name *
              </label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter your name" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                📧 Email Address *
              </label>
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Enter your email" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                📱 Phone Number
              </label>
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Enter phone number (optional)" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                🪑 Select Your Table *
              </label>
              <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '16px', backgroundColor: 'white' }}>
                <option value="">Choose your table...</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>Table {table.name} - Floor {table.floor} (Seats: {table.capacity})</option>
                ))}
              </select>
            </div>
            <button onClick={handleTableSelect} style={{ width: '100%', padding: '15px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              📋 View Menu →
            </button>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button onClick={() => window.location.href = '/login'} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Staff Login</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 2 & 3: Menu Browsing & Cart
  if (step === 2 || step === 3) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
         {/* ADD THESE STYLES HERE */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '15px 20px', color: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>Table {tableInfo?.name} • Floor {tableInfo?.floor}</div>
              <div style={{ fontWeight: '600' }}>Welcome, {customerName}! 👋</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(3)} style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '25px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', position: 'relative' }}>
                🛒 Cart {cart.length > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{itemCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div style={{ backgroundColor: 'white', padding: '12px 0', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '8px' }}>
            <button onClick={() => { setSelectedCategory(null); fetchProducts() }} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: !selectedCategory ? '#4f46e5' : '#f3f4f6', color: !selectedCategory ? 'white' : '#374151', cursor: 'pointer', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' }}>🍽️ All</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); fetchProducts(cat.id) }} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: selectedCategory === cat.id ? '#4f46e5' : '#f3f4f6', color: selectedCategory === cat.id ? 'white' : '#374151', cursor: 'pointer', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' }}>{cat.name}</button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', paddingBottom: '100px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {products.map(product => (
  <div
    key={product.id}
    onClick={() => product.is_available ? addToCart(product) : null}
    style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '20px',
      cursor: product.is_available ? 'pointer' : 'not-allowed',
      border: '2px solid #e5e7eb',
      transition: 'all 0.2s',
      textAlign: 'center',
      opacity: product.is_available ? 1 : 0.6,
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      if (product.is_available) {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'
        e.currentTarget.style.borderColor = '#4f46e5'
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.borderColor = '#e5e7eb'
    }}
  >
    {/* Availability Indicator */}
    <div style={{
      position: 'absolute',
      top: '12px',
      right: '12px',
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      backgroundColor: product.is_available ? '#10b981' : '#ef4444',
      border: '2px solid white',
      boxShadow: '0 0 0 2px ' + (product.is_available ? '#10b981' : '#ef4444'),
      animation: product.is_available ? 'pulse 2s infinite' : 'none'
    }} title={product.is_available ? 'Available' : 'Out of Stock'} />
    
    {/* Stock Info */}
    {product.is_available && product.stock_quantity > 0 && product.stock_quantity <= 5 && (
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: '#fef3c7',
        color: '#92400e',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: '600'
      }}>
        Only {product.stock_quantity} left
      </div>
    )}

    <div style={{ fontSize: '50px', marginBottom: '10px' }}>
      {product.is_available ? '🍽️' : '🚫'}
    </div>
    <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '5px' }}>{product.name}</h3>
    {product.description && (
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '15px' }}>
        {product.description.substring(0, 50)}...
      </p>
    )}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '22px', fontWeight: 'bold', color: product.is_available ? '#059669' : '#9ca3af' }}>
        ₹{product.price.toFixed(2)}
      </span>
      <span style={{
        backgroundColor: product.is_available ? '#4f46e5' : '#9ca3af',
        color: 'white',
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600'
      }}>
        {product.is_available ? '+ Add' : 'Unavailable'}
      </span>
    </div>
  </div>
))}
          </div>
        </div>

        {/* Cart Bottom Bar */}
        {cart.length > 0 && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '3px solid #4f46e5', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', padding: '15px 20px', zIndex: 100 }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{itemCount} items in cart</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Table {tableInfo?.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => setStep(3)} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>View Cart</button>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'right' }}>Total</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>₹{total.toFixed(2)}</div>
                </div>
                <button onClick={proceedToPayment} style={{ padding: '12px 24px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Pay Now →</button>
              </div>
            </div>
          </div>
        )}

        {/* Full Cart View (Step 3) - WITH REMOVE BUTTONS */}
{step === 3 && cart.length > 0 && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
    <div style={{ backgroundColor: 'white', borderRadius: '20px 20px 0 0', padding: '30px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>🛒 Your Order</h3>
        <button onClick={() => setStep(2)} style={{ fontSize: '24px', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
      </div>

      {cart.map(item => (
        <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>{item.name}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>₹{item.price.toFixed(2)} each</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => updateQuantity(item.product_id, -1)} style={{ width: '30px', height: '30px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <span style={{ fontWeight: '600', minWidth: '25px', textAlign: 'center', fontSize: '15px' }}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.product_id, 1)} style={{ width: '30px', height: '30px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          <span style={{ fontWeight: 'bold', minWidth: '70px', textAlign: 'right', fontSize: '15px', marginLeft: '15px' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
          <button
            onClick={() => removeFromCart(item.product_id)}
            style={{ marginLeft: '10px', padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
            title="Remove item"
          >
            🗑️
          </button>
        </div>
      ))}

      {/* Coupon Tips */}
{!appliedCoupon && (
  <div style={{ 
    marginTop: '15px',
    padding: '12px', 
    backgroundColor: '#fef3c7', 
    borderRadius: '8px',
    border: '1px dashed #f59e0b'
  }}>
    <p style={{ fontSize: '12px', color: '#92400e', margin: 0, fontWeight: '600' }}>
      🎫 Available Coupons:
    </p>
    <p style={{ fontSize: '11px', color: '#92400e', margin: '5px 0 0 0' }}>
      {subtotal >= 2000 ? '✅ Use COUPON2000 for 20% OFF!' : 
       subtotal >= 1000 ? '✅ Use COUPON1000 for 10% OFF!' : 
       'Add items worth ₹1000+ to unlock COUPON1000 (10% OFF)'}
    </p>
    {new Date().getDay() === 3 && (
      <p style={{ fontSize: '11px', color: '#059669', margin: '5px 0 0 0' }}>
        🎉 Wednesday Special: Use WEDNESDAY for 5% OFF!
      </p>
    )}
  </div>
)}

      {/* ========== COUPON SECTION - ADD THIS ========== */}
      <div style={{ 
        marginTop: '15px',
        marginBottom: '5px', 
        padding: '15px', 
        backgroundColor: appliedCoupon ? '#d1fae5' : '#f9fafb', 
        borderRadius: '10px',
        border: appliedCoupon ? '1px solid #10b981' : '1px dashed #d1d5db'
      }}>
        {appliedCoupon ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ fontWeight: '600', color: '#065f46', fontSize: '14px' }}>
                🎫 Coupon: {appliedCoupon.code}
              </span>
              <button onClick={removeCustomerCoupon} style={{ 
                padding: '4px 10px', 
                backgroundColor: '#fee2e2', 
                color: '#dc2626', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                ✕ Remove
              </button>
            </div>
            <div style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>
              Discount: -₹{appliedCoupon.discount.toFixed(2)}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px', 
                  fontSize: '14px' 
                }}
              />
              <button 
                onClick={validateCustomerCoupon}
                style={{ 
                  padding: '10px 16px', 
                  backgroundColor: '#8b5cf6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
              >
                Apply
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '5px', marginBottom: 0 }}>
              🎫 Have a coupon code? Apply it here!
            </p>
          </div>
        )}
      </div>

      {/* Totals Section */}
      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '15px', marginTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
          <span>GST (5%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#059669', fontWeight: '600' }}>
            <span>💚 Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}>
          <span>Total</span>
          <span style={{ color: '#059669' }}>₹{total.toFixed(2)}</span>
        </div>
        <button onClick={proceedToPayment} style={{ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
          💳 Proceed to Payment
        </button>
        <button onClick={() => setCart([])} style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: 'transparent', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>
          Clear All Items
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    )
  }

// Step 4: Payment
if (step === 4) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', maxWidth: '450px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
        <button onClick={() => setStep(3)} style={{ fontSize: '20px', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '20px' }}>← Back</button>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>💳 Payment</h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>Table {tableInfo?.name} • {itemCount} items</p>

        {/* Applied Coupon Info */}
        {appliedCoupon && (
          <div style={{ 
            backgroundColor: '#d1fae5', 
            borderRadius: '10px', 
            padding: '12px 15px', 
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #10b981'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#065f46' }}>
                🎫 Coupon Applied: {appliedCoupon.code}
              </div>
              <div style={{ fontSize: '12px', color: '#059669' }}>
                You saved ₹{appliedCoupon.discount.toFixed(2)}!
              </div>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
              -₹{appliedCoupon.discount.toFixed(2)}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>GST (5%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#059669', fontWeight: '600' }}>
              <span>Discount</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ borderTop: '1px dashed #d1d5db', paddingTop: '12px', marginTop: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Total Amount</div>
              <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#059669' }}>₹{total.toFixed(2)}</div>
              {discount > 0 && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  You saved ₹{discount.toFixed(2)} with coupon!
                </div>
              )}
            </div>
          </div>
        </div>

        <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
          Select Payment Method:
        </p>
        <div style={{ display: 'grid', gap: '12px' }}>
          {paymentMethods.map(method => (
  method.name === 'UPI' || method.type === 'digital_wallet' ? (
    <button 
      key={method.id} 
      onClick={() => {
        setShowUPIQR(true)
        setUpiAmount(total.toFixed(2))
      }} 
      disabled={loading}
      style={{ padding: '15px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
    >
      📱 Pay with UPI
    </button>
  ) : (
    <button key={method.id} onClick={() => placeOrderAndPay(method.id)} disabled={loading}
      style={{ padding: '15px', backgroundColor: method.type === 'cash' ? '#059669' : '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
    >
      {method.type === 'cash' ? '💵' : '💳'} Pay {method.name}
    </button>
  )
))}
        </div>
      </div>

      {/* UPI QR Code Modal — shown on top of the payment screen when showUPIQR is true */}
      {showUPIQR && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '380px', maxWidth: '90%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>📱 Scan UPI QR</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
              Amount: ₹{upiAmount}
            </p>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '3px solid #7c3aed',
              marginBottom: '20px',
              display: 'inline-block'
            }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=cafepos@upi&pn=CafePOS&am=${upiAmount}&cu=INR&tn=Order`}
                alt="UPI QR Code"
                style={{ width: '200px', height: '200px' }}
                crossOrigin="anonymous"
              />
            </div>

            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>UPI ID: cafepos@upi</p>

            <div style={{ display: 'grid', gap: '10px' }}>
              <button
                onClick={async () => {
                  const upiMethod = paymentMethods.find(m => m.type === 'digital_wallet' || m.name === 'UPI')
                  if (upiMethod) {
                    await placeOrderAndPay(upiMethod.id)
                    setShowUPIQR(false)
                  }
                }}
                style={{ padding: '12px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
              >
                ✅ Payment Done
              </button>
              <button
                onClick={() => setShowUPIQR(false)}
                style={{ padding: '10px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
  // Step 5: Order Status Tracking with Review
  if (step === 5 && currentOrder) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          
          {/* Review Modal */}
          {showReview && currentOrder.status === 'delivered' && !reviewSubmitted && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '30px', maxWidth: '400px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>⭐</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>How was your experience?</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>Rate your order #{currentOrder.order_number}</p>
                </div>

                {/* Star Rating */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setReview({...review, rating: star})}
                      style={{
                        fontSize: '36px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        filter: star <= review.rating ? 'none' : 'grayscale(100%)',
                        transition: 'transform 0.2s',
                        transform: star <= review.rating ? 'scale(1.2)' : 'scale(1)'
                      }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                {review.rating > 0 && (
                  <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>
                    {review.rating === 5 ? 'Excellent! 🌟' : review.rating === 4 ? 'Very Good! 👍' : review.rating === 3 ? 'Good! 😊' : review.rating === 2 ? 'Could be better 🤔' : 'Not satisfied 😞'}
                  </div>
                )}

                {/* Comment */}
                <div style={{ marginBottom: '20px' }}>
                  <textarea
                    value={review.comment}
                    onChange={(e) => setReview({...review, comment: e.target.value})}
                    placeholder="Share your feedback (optional)..."
                    rows="3"
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  <button onClick={submitReview} style={{ padding: '12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Submit Review ⭐
                  </button>
                  <button onClick={skipReview} style={{ padding: '10px', backgroundColor: 'transparent', color: '#6b7280', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
                    Skip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Status */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>{getStatusEmoji(currentOrder.status)}</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: getStatusColor(currentOrder.status) }}>{getStatusText(currentOrder.status)}</h2>
            <p style={{ color: '#6b7280', marginTop: '5px' }}>Order #{currentOrder.order_number}</p>
          </div>

          {/* Progress Steps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '15px', left: '30px', right: '30px', height: '3px', backgroundColor: '#e5e7eb', zIndex: 1 }}>
              <div style={{ height: '100%', backgroundColor: '#4f46e5', width: currentOrder.status === 'pending' ? '0%' : currentOrder.status === 'preparing' ? '33%' : currentOrder.status === 'ready' ? '66%' : '100%', transition: 'width 0.5s' }} />
            </div>
            {['pending', 'preparing', 'ready', 'delivered'].map((status, i) => (
              <div key={status} style={{ textAlign: 'center', zIndex: 2 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: ['pending', 'preparing', 'ready', 'delivered'].indexOf(currentOrder.status) >= i ? '#4f46e5' : '#e5e7eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 5px', fontSize: '14px', fontWeight: 'bold' }}>{i + 1}</div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>{status === 'pending' ? 'Ordered' : status === 'preparing' ? 'Preparing' : status === 'ready' ? 'Ready' : 'Served'}</div>
              </div>
            ))}
          </div>

          {/* Order Details */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '15px' }}>📋 Order Details</h4>
            {currentOrder.items && currentOrder.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < currentOrder.items.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <span>{item.quantity}x {item.name}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '10px', marginTop: '10px', textAlign: 'right' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>₹{currentOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#ede9fe', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#5b21b6', fontWeight: '600', margin: 0 }}>🪑 Table {tableInfo?.name} • Floor {tableInfo?.floor}</p>
          </div>

          <button onClick={resetOrder} style={{ width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
            Place New Order
          </button>
        </div>
      </div>
    )
  }

  return null
}
// ==================== STAFF DASHBOARD (POS-focused) ====================
function StaffDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  const [tables, setTables] = useState([])
  const [showTableManagement, setShowTableManagement] = useState(false)
  const [customers, setCustomers] = useState([])
  const [showCustomers, setShowCustomers] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [showCustomerEdit, setShowCustomerEdit] = useState(false)
  const [customerEditForm, setCustomerEditForm] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    if (showTableManagement) fetchTables()
    if (showCustomers) fetchCustomers()
  }, [showTableManagement, showCustomers])

  const fetchTables = async () => {
    try {
      const response = await fetch('${API}/api/tables/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setTables(await response.json())
    } catch (error) { console.error(error) }
  }

  const updateTableStatus = async (tableId, status) => {
    try {
      await fetch(`${API}/api/tables/${tableId}/status?status=${status}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchTables()
    } catch (error) { alert('Failed to update table') }
  }
const fetchCustomers = async () => {
  try {
    let url = '${API}/api/customers/?limit=200'
    if (customerSearch) url += `&search=${encodeURIComponent(customerSearch)}`
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setCustomers(data)
  } catch (error) { console.error(error) }
}

  return (
    <div style={{ padding: '40px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Welcome Card */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>☕</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>Welcome, {user.full_name}!</h1>
          <p style={{ color: '#6b7280' }}>Staff Dashboard</p>
        </div>

        {/* Main Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
          {/* POS */}
          <a href="/pos" style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '40px' }}>🛒</span>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#059669' }}>Point of Sale</h2>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>Take orders and process payments</p>
            </div>
          </a>

          {/* KDS */}
          <a href="/kds" style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '40px' }}>👨‍🍳</span>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#ea580c' }}>Kitchen Display</h2>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>View and manage kitchen orders</p>
            </div>
          </a>

          {/* Table Management */}
          <button onClick={() => { setShowTableManagement(!showTableManagement); setShowCustomers(false); if (!showTableManagement) fetchTables(); }} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', width: '100%', textAlign: 'left' }}>
            <span style={{ fontSize: '40px' }}>🪑</span>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#4f46e5' }}>Table Management</h2>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>Manage table status and availability</p>
            </div>
            <span style={{ fontSize: '24px', color: '#6b7280' }}>{showTableManagement ? '▲' : '▼'}</span>
          </button>

          {/* Customers */}
          <button onClick={() => { setShowCustomers(!showCustomers); setShowTableManagement(false); if (!showCustomers) fetchCustomers(); }} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', width: '100%', textAlign: 'left' }}>
            <span style={{ fontSize: '40px' }}>👤</span>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#7c3aed' }}>Customers</h2>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>View and manage customer details</p>
            </div>
            <span style={{ fontSize: '24px', color: '#6b7280' }}>{showCustomers ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Table Management Section */}
        {showTableManagement && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>🪑 Table Status ({tables.length} tables)</h3>
              <button onClick={fetchTables} style={{ padding: '6px 12px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>🔄 Refresh</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#065f46' }}>{tables.filter(t => t.status === 'available').length}</div>
                <div style={{ fontSize: '11px', color: '#065f46' }}>Available</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#991b1b' }}>{tables.filter(t => t.status === 'occupied').length}</div>
                <div style={{ fontSize: '11px', color: '#991b1b' }}>Occupied</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e' }}>{tables.filter(t => t.status === 'reserved').length}</div>
                <div style={{ fontSize: '11px', color: '#92400e' }}>Reserved</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {tables.map(table => (
                <div key={table.id} style={{ padding: '15px', borderRadius: '10px', textAlign: 'center', backgroundColor: table.status === 'available' ? '#f0fdf4' : table.status === 'occupied' ? '#fef2f2' : '#fffbeb', border: `2px solid ${table.status === 'available' ? '#10b981' : table.status === 'occupied' ? '#ef4444' : '#f59e0b'}` }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '5px' }}>{table.name}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>Floor {table.floor} • Cap: {table.capacity}</div>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', backgroundColor: table.status === 'available' ? '#d1fae5' : table.status === 'occupied' ? '#fee2e2' : '#fef3c7', color: table.status === 'available' ? '#065f46' : table.status === 'occupied' ? '#991b1b' : '#92400e', marginBottom: '10px' }}>{table.status.toUpperCase()}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {table.status !== 'available' && (
                      <button onClick={() => updateTableStatus(table.id, 'available')} style={{ padding: '6px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', width: '100%' }}>✅ Mark Cleaned</button>
                    )}
                    {table.status === 'available' && (
                      <>
                        <button onClick={() => updateTableStatus(table.id, 'occupied')} style={{ padding: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', width: '100%' }}>🚫 Occupy</button>
                        <button onClick={() => updateTableStatus(table.id, 'reserved')} style={{ padding: '6px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', width: '100%' }}>📌 Reserve</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customers Section */}
        {showCustomers && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>👤 Customers ({customers.length})</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="🔍 Search name, email or phone" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', width: '250px' }} />
                <button onClick={fetchCustomers} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>🔄</button>
              </div>
            </div>

            {customers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>👤</div>
                <p>No customers yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>Name</th>
    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>Email</th>
    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>Phone</th>
    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>Visits</th>
    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>Spent</th>
    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>Points</th>
    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>Since</th>
    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>Actions</th>
  </tr>
</thead>
                  <tbody>
                    {customers.filter(c => {
  if (!customerSearch) return true
  const s = customerSearch.toLowerCase()
  return c.name?.toLowerCase().includes(s) || 
         c.email?.toLowerCase().includes(s) || 
         c.phone?.includes(s)
}).map((customer) => (
  <tr key={customer.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
    <td style={{ padding: '10px 12px', fontWeight: '600' }}>{customer.name}</td>
    <td style={{ padding: '10px 12px', color: '#4f46e5' }}>{customer.email}</td>
    <td style={{ padding: '10px 12px' }}>{customer.phone || 'N/A'}</td>
    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600' }}>{customer.visit_count || 0}</td>
    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>₹{(customer.total_spent || 0).toFixed(2)}</td>
    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#f59e0b' }}>⭐ {customer.loyalty_points || 0}</td>
    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6b7280' }}>
      {customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
    </td>
    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        <button onClick={() => { setCustomerEditForm({ name: customer.name, email: customer.email, phone: customer.phone || '' }); setEditingCustomer(customer); setShowCustomerEdit(true); }} style={{ padding: '4px 8px', backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>✏️</button>
        <button onClick={async () => { 
  if (confirm(`Delete "${customer.name}"?`)) { 
    try { 
      await fetch(`${API}/api/customers/${customer.id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      }); 
      fetchCustomers(); 
    } catch (e) { alert('Failed'); } 
  } 
}} style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
  🗑️
</button>
      </div>
    </td>
  </tr>
))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Customer Edit Modal */}
        {showCustomerEdit && editingCustomer && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', width: '400px', maxWidth: '90%' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>✏️ Edit Customer</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Name</label>
                  <input type="text" value={customerEditForm.name} onChange={(e) => setCustomerEditForm({...customerEditForm, name: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Email</label>
                  <input type="email" value={customerEditForm.email} onChange={(e) => setCustomerEditForm({...customerEditForm, email: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Phone</label>
                  <input type="text" value={customerEditForm.phone} onChange={(e) => setCustomerEditForm({...customerEditForm, phone: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={async () => {
  try {
    await fetch(`${API}/api/customers/${editingCustomer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(customerEditForm)
    })
    alert('Customer updated!')
    setShowCustomerEdit(false)
    fetchCustomers()
  } catch (error) { alert('Failed to update') }
}} style={{ flex: 1, padding: '10px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
  💾 Save
</button>
                <button onClick={() => setShowCustomerEdit(false)} style={{ padding: '10px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} style={{ padding: '15px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', width: '100%' }}>
          🚪 Logout
        </button>
      </div>
    </div>
  )
}
// ==================== FULL POS SYSTEM (INDIAN RUPEES) ====================
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
  const [showUPIQR, setShowUPIQR] = useState(false)
const [upiAmount, setUpiAmount] = useState('')

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
    const url = categoryId ? `${API}/api/products/?category_id=${categoryId}` : '${API}/api/products/'
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
    const data = await response.json()
    setProducts(data)  // ← Should show all products
  } catch (error) { console.error('Failed to fetch products:', error) }
}

  const fetchCategories = async () => {
    try {
      const response = await fetch('${API}/api/categories/', { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json()
      setCategories(data)
    } catch (error) { console.error('Failed to fetch categories:', error) }
  }

  const fetchTables = async () => {
  try {
    const response = await fetch('${API}/api/tables/', { 
      headers: { 'Authorization': `Bearer ${token}` } 
    })
    const data = await response.json()
    setTables(data)
  } catch (error) { console.error('Failed to fetch tables:', error) }
}
  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('${API}/api/payments/methods', { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json()
      setPaymentMethods(data)
    } catch (error) { console.error('Failed to fetch payment methods:', error) }
  }

  const fetchActiveOrders = async () => {
    try {
      const response = await fetch('${API}/api/orders/active', { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json()
      setActiveOrders(data)
    } catch (error) { console.error('Failed to fetch active orders:', error) }
  }

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === product.id)
      if (existingItem) {
        return prevCart.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prevCart, { product_id: product.id, name: product.name, price: product.price, quantity: 1, notes: '' }]
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
      const response = await fetch(`${API}/api/coupons/validate/${couponCode}?order_amount=${subtotal}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setDiscount(data.discount)
        alert(`Coupon applied! Discount: ₹${data.discount.toFixed(2)}`)
      } else {
        alert(data.detail || 'Invalid coupon')
      }
    } catch (error) { alert('Failed to validate coupon') }
  }

  const placeOrder = async () => {
    if (cart.length === 0) { alert('Cart is empty'); return }
    setLoading(true)
    try {
      const orderData = { table_id: selectedTable, order_type: selectedTable ? 'dine_in' : 'takeaway', items: cart, coupon_code: couponCode || null }
      const response = await fetch('${API}/api/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
    } catch (error) { alert('Failed to place order') }
    finally { setLoading(false) }
  }

  const processPayment = async (paymentMethodId) => {
    setLoading(true)
    try {
      const response = await fetch('${API}/api/payments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ order_id: currentOrder.id, payment_method_id: paymentMethodId, amount: currentOrder.total })
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
      } else { alert('Payment failed') }
    } catch (error) { alert('Payment failed') }
    finally { setLoading(false) }
  }

  const voidOrder = () => {
    setCart([])
    setCurrentOrder(null)
    setShowPayment(false)
    setCouponCode('')
    setDiscount(0)
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.05 // 5% GST
  const total = subtotal + tax - discount
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const getPaymentColor = (type) => {
    switch (type) {
      case 'cash': return '#059669'
      case 'card': return '#4f46e5'
      case 'digital_wallet': return '#7c3aed'
      default: return '#6b7280'
    }
  }

  
   // Payment Modal
  if (showPayment && currentOrder) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', width: '400px', maxWidth: '90%' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Process Payment</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>Order: {currentOrder.order_number}</p>
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', color: '#059669' }}>₹{currentOrder.total.toFixed(2)}</div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '10px' }}>Select Payment Method:</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {paymentMethods.map(method => (
                method.name === 'UPI' || method.type === 'digital_wallet' ? (
                  <button key={method.id} onClick={() => setShowUPIQR(true)} disabled={loading}
                    style={{ padding: '15px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                    📱 Pay with UPI
                  </button>
                ) : (
                  <button key={method.id} onClick={() => processPayment(method.id)} disabled={loading}
                    style={{ padding: '15px', backgroundColor: method.type === 'cash' ? '#059669' : method.type === 'card' ? '#4f46e5' : '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                    {method.type === 'cash' ? '💵' : method.type === 'card' ? '💳' : '💰'} {method.name}
                  </button>
                )
              ))}
            </div>
          </div>
          <button onClick={voidOrder} style={{ width: '100%', padding: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>Cancel Order</button>
        </div>

        {/* UPI QR Code Modal - MOVED INSIDE */}
        {showUPIQR && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '380px', maxWidth: '90%', textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>📱 Scan UPI QR</h3>
              <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Amount: ₹{currentOrder.total.toFixed(2)}</p>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid #7c3aed', marginBottom: '20px', display: 'inline-block' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=cafepos@upi&pn=CafePOS&am=${currentOrder.total.toFixed(2)}&cu=INR&tn=Order${currentOrder.order_number}`} alt="UPI QR Code" style={{ width: '200px', height: '200px' }} crossOrigin="anonymous" />
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>UPI ID: cafepos@upi</p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>Order: {currentOrder.order_number}</p>
              <div style={{ display: 'grid', gap: '10px' }}>
                <button onClick={async () => {
                  const upiMethod = paymentMethods.find(m => m.type === 'digital_wallet' || m.name === 'UPI')
                  if (upiMethod) { await processPayment(upiMethod.id); setShowUPIQR(false) }
                }} style={{ padding: '12px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                  ✅ Payment Done
                </button>
                <button onClick={() => setShowUPIQR(false)} style={{ padding: '10px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Left Panel - Products */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Point of Sale</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowActiveOrders(!showActiveOrders)} style={{ padding: '8px 16px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Orders ({activeOrders.length})
            </button>
            <button onClick={() => window.location.href = '/dashboard'} style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              ← Back
            </button>
          </div>
        </div>

        {/* Active Orders Panel */}
        {showActiveOrders && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '10px' }}>Active Orders</h3>
            {activeOrders.length === 0 ? <p style={{ color: '#6b7280' }}>No active orders</p> : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {activeOrders.map(order => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div>
                      <strong>{order.order_number}</strong>
                      <span style={{ marginLeft: '10px', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: order.status === 'pending' ? '#fef3c7' : '#dbeafe', color: order.status === 'pending' ? '#92400e' : '#1e40af' }}>{order.status}</span>
                    </div>
                    <div>
                      <strong>₹{order.total.toFixed(2)}</strong>
                      <span style={{ marginLeft: '10px', color: '#6b7280', fontSize: '14px' }}>{order.items?.length || 0} items</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', padding: '5px 0' }}>
          <button onClick={() => { setSelectedCategory(null); fetchProducts() }} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: !selectedCategory ? '#4f46e5' : '#e5e7eb', color: !selectedCategory ? 'white' : '#374151', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap' }}>All Items</button>
          {categories.map(category => (
            <button key={category.id} onClick={() => { setSelectedCategory(category.id); fetchProducts(category.id) }} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: selectedCategory === category.id ? '#4f46e5' : '#e5e7eb', color: selectedCategory === category.id ? 'white' : '#374151', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap' }}>{category.name}</button>
          ))}
        </div>

        {/* Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
          {products.map(product => (
            <div key={product.id} onClick={() => addToCart(product)} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid #e5e7eb', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}>
              <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>{product.name}</h3>
              {product.description && <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>{product.description.substring(0, 50)}...</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>₹{product.price.toFixed(2)}</span>
                <span style={{ backgroundColor: '#4f46e5', color: 'white', padding: '5px 10px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }}>+ Add</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div style={{ width: '400px', backgroundColor: 'white', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Current Order</h2>
          <select value={selectedTable || ''} onChange={(e) => setSelectedTable(e.target.value ? parseInt(e.target.value) : null)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', marginBottom: '10px' }}>
            <option value="">Takeaway (No Table)</option>
            {tables.filter(t => t.status === 'available').map(table => (
              <option key={table.id} value={table.id}>{table.name} - Floor {table.floor} (Cap: {table.capacity})</option>
            ))}
          </select>
        </div>

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
                <div key={item.product_id} style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontWeight: '600' }}>{item.name}</h4>
                      <p style={{ color: '#059669', fontSize: '14px' }}>₹{item.price.toFixed(2)} each</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id)} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => updateQuantity(item.product_id, -1)} style={{ width: '30px', height: '30px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '18px' }}>-</button>
                      <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, 1)} style={{ width: '30px', height: '30px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '18px' }}>+</button>
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input type="text" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
              <button onClick={validateCoupon} style={{ padding: '10px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Apply</button>
            </div>
          </div>
        )}

        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Subtotal ({itemCount} items)</span>
            <span style={{ fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>GST (5%)</span>
            <span style={{ fontWeight: '600' }}>₹{tax.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#059669' }}>
              <span>Discount</span>
              <span style={{ fontWeight: '600' }}>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #e5e7eb' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Total</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>₹{total.toFixed(2)}</span>
          </div>
          <button onClick={placeOrder} disabled={loading || cart.length === 0} style={{ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: cart.length === 0 ? '#d1d5db' : '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Processing...' : `Place Order - ₹${total.toFixed(2)}`}
          </button>
          {cart.length > 0 && (
            <button onClick={voidOrder} style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: 'transparent', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Clear Cart</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== KITCHEN DISPLAY SYSTEM ====================
function KDSPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('${API}/api/orders/active', {
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
      fetchOrders()
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' }
      case 'preparing': return { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' }
      case 'ready': return { bg: '#d1fae5', text: '#065f46', border: '#10b981' }
      case 'delivered': return { bg: '#ede9fe', text: '#5b21b6', border: '#8b5cf6' }
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

        {/* Empty State */}
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>No Active Orders</p>
            <p style={{ fontSize: '16px' }}>All orders have been completed</p>
          </div>
        ) : (
          /* Orders Grid */
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

                  {/* Order Type */}
                  <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                    <span style={{ padding: '4px 10px', backgroundColor: '#1f2937', color: '#d1d5db', borderRadius: '6px', fontSize: '12px' }}>
                      {order.order_type === 'dine_in' ? '🍽️ Dine In' : '🛍️ Takeaway'}
                    </span>
                    {order.table_id && (
                      <span style={{ padding: '4px 10px', backgroundColor: '#1f2937', color: '#d1d5db', borderRadius: '6px', fontSize: '12px' }}>
                        Table #{order.table_id}
                      </span>
                    )}
                    <span style={{ padding: '4px 10px', backgroundColor: '#1f2937', color: '#10b981', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div style={{ marginBottom: '15px', backgroundColor: '#1f2937', borderRadius: '8px', padding: '15px' }}>
                    <h4 style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase' }}>Order Items</h4>
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

                  {/* Order Notes */}
                  {order.notes && (
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#1f2937', borderRadius: '8px', color: '#fbbf24', fontSize: '14px' }}>
                      📝 {order.notes}
                    </div>
                  )}

                  {/* Action Buttons - ALL THREE STATUSES */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'preparing')} 
                        style={{ flex: 1, padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        🔧 Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'ready')} 
                        style={{ flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        ✅ Mark as Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'delivered')} 
                        style={{ flex: 1, padding: '12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        🚀 Mark Delivered
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
// ==================== CUSTOMER DISPLAY ====================
function CustomerDisplayPage() {
  const [orders, setOrders] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(orders.length, 1))
    }, 5000)
    return () => clearInterval(rotateInterval)
  }, [orders])

  const fetchOrders = async () => {
    try {
      const response = await fetch('${API}/api/orders/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
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
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>📺 Order Status</h1>
        <p style={{ fontSize: '18px', color: '#94a3b8' }}>Active Orders: {orders.length}</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '40px',
          border: `3px solid ${getStatusColor(currentOrder.status)}`,
          marginBottom: '30px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: getStatusColor(currentOrder.status) }}>
              Order #{currentOrder.order_number}
            </h2>
            <p style={{ fontSize: '20px', color: '#94a3b8', marginTop: '10px', textTransform: 'uppercase' }}>
              Status: {currentOrder.status}
            </p>
          </div>

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
                  <span style={{ backgroundColor: '#334155', padding: '5px 12px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold' }}>
                    {item.quantity}x
                  </span>
                  <span style={{ fontSize: '20px' }}>{item.name}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', color: '#94a3b8' }}>Total Amount</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981', marginTop: '10px' }}>
              ₹{currentOrder.total.toFixed(2)}
            </p>
          </div>
        </div>

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
      </div>
    </div>
  )
}

// Placeholder for Self Order
function SelfOrderPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [tables, setTables] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTable, setSelectedTable] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [orderTotal, setOrderTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    fetchTables()
  }, [])

  const fetchProducts = async (categoryId = null) => {
    try {
      const url = categoryId 
        ? `${API}/api/products/?category_id=${categoryId}`
        : '${API}/api/products/'
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setProducts(data.filter(p => p.is_available))
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('${API}/api/categories/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setCategories(data.filter(c => c.is_active))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchTables = async () => {
  try {
    const response = await fetch('${API}/api/tables/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setTables(data.filter(t => t.status === 'available'))  // ← Only available tables
  } catch (error) { console.error(error) }
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

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('Please add items to your order')
      return
    }
    if (!selectedTable) {
      alert('Please select your table number')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        table_id: parseInt(selectedTable),
        order_type: 'dine_in',
        items: cart,
        notes: `Self-order from Table ${selectedTable}`
      }

      const response = await fetch('${API}/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (response.ok) {
        setOrderNumber(data.order_number)
        setOrderTotal(data.total)
        setOrderPlaced(true)
        setCart([])
      } else {
        alert(data.detail || 'Failed to place order')
      }
    } catch (error) {
      alert('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.05
  const total = subtotal + tax
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Order Confirmation Screen
  if (orderPlaced) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669', marginBottom: '10px' }}>
            Order Placed Successfully!
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '30px' }}>
            Your order has been sent to the kitchen
          </p>
          
          <div style={{ backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Order Number</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '15px' }}>
              {orderNumber}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Total Amount</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#059669' }}>
              ₹{orderTotal.toFixed(2)}
            </div>
          </div>

          <div style={{ backgroundColor: '#fef3c7', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#92400e' }}>
              🍽️ Table: <strong>{selectedTable}</strong>
            </p>
            <p style={{ fontSize: '14px', color: '#92400e', marginTop: '5px' }}>
              Please wait at your table. Our staff will serve you shortly.
            </p>
          </div>

          <button
            onClick={() => {
              setOrderPlaced(false)
              setSelectedTable('')
            }}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Place Another Order
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>📱 Self Order Kiosk</h1>
              <p style={{ marginTop: '5px', opacity: 0.9 }}>Browse menu & order from your table</p>
            </div>
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
            >
              ← Staff Login
            </button>
          </div>

          {/* Table Selection */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '15px', backdropFilter: 'blur(10px)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              🍽️ Select Your Table Number
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <option value="" style={{ color: '#374151' }}>Choose your table...</option>
              {tables.map(table => (
                <option key={table.id} value={table.id} style={{ color: '#374151' }}>
                  Table {table.name} - Floor {table.floor} (Capacity: {table.capacity})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '15px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
          <button
            onClick={() => { setSelectedCategory(null); fetchProducts() }}
            style={{
              padding: '10px 20px',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: !selectedCategory ? '#4f46e5' : '#f3f4f6',
              color: !selectedCategory ? 'white' : '#374151',
              cursor: 'pointer',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              fontSize: '14px'
            }}
          >
            🍽️ All Items
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => { setSelectedCategory(category.id); fetchProducts(category.id) }}
              style={{
                padding: '10px 20px',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: selectedCategory === category.id ? '#4f46e5' : '#f3f4f6',
                color: selectedCategory === category.id ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                fontSize: '14px'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', paddingBottom: '200px' }}>
        {/* Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {products.map(product => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'
                e.currentTarget.style.borderColor = '#4f46e5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              {/* Product Image Placeholder */}
              <div style={{
                width: '100%',
                height: '120px',
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                🍽️
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: '#1f2937' }}>
                {product.name}
              </h3>
              {product.description && (
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '15px', lineHeight: '1.4' }}>
                  {product.description.substring(0, 60)}...
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                  ₹{product.price.toFixed(2)}
                </span>
                <span style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  + Add
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Bottom Sheet */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '3px solid #4f46e5',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          padding: '20px',
          zIndex: 100,
          maxHeight: '50vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {/* Cart Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  🛒 Your Order ({itemCount} items)
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Table: {selectedTable || 'Not selected'}
                </p>
              </div>
              <button
                onClick={() => setCart([])}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Clear All
              </button>
            </div>

            {/* Cart Items */}
            <div style={{ overflowY: 'auto', maxHeight: '200px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cart.map(item => (
                  <div key={item.product_id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</p>
                      <p style={{ color: '#059669', fontSize: '12px' }}>₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateQuantity(item.product_id, -1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
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
                            width: '28px',
                            height: '28px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <span style={{ fontWeight: 'bold', fontSize: '16px', minWidth: '60px', textAlign: 'right' }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        style={{
                          color: '#dc2626',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          padding: '0 5px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Place Order */}
            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>GST (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Total</span>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>
                  ₹{total.toFixed(2)}
                </span>
              </div>
              <button
                onClick={placeOrder}
                disabled={loading || !selectedTable}
                style={{
                  width: '100%',
                  padding: '15px',
                  marginTop: '15px',
                  backgroundColor: !selectedTable ? '#d1d5db' : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: !selectedTable ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {!selectedTable 
                  ? '⚠️ Please Select Your Table' 
                  : loading 
                    ? 'Placing Order...' 
                    : `📱 Place Order - ₹${total.toFixed(2)}`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== APP ROUTER ====================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/kds" element={<KDSPage />} />
        <Route path="/self-order" element={<SelfOrderPage />} />
        <Route path="/customer" element={<CustomerDashboard />} />  {/* NEW */}
        <Route path="/customer-display" element={<CustomerDisplayPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App