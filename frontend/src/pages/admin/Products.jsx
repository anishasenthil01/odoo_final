import React, { useState, useEffect } from 'react'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2 } from 'lucide-react'

function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost_price: '',
    category_id: '',
    is_available: true,
    is_featured: false,
    stock_quantity: 0
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data)
        toast.success('Product updated successfully')
      } else {
        await api.post('/products/', data)
        toast.success('Product created successfully')
      }

      setShowForm(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      cost_price: product.cost_price || '',
      category_id: product.category_id || '',
      is_available: product.is_available,
      is_featured: product.is_featured,
      stock_quantity: product.stock_quantity
    })
    setShowForm(true)
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await api.delete(`/products/${productId}`)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      cost_price: '',
      category_id: '',
      is_available: true,
      is_featured: false,
      stock_quantity: 0
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <button
          onClick={() => {
            setEditingProduct(null)
            resetForm()
            setShowForm(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'New Product'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="input-field"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input-field"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="input-field"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                />
                <span className="text-sm">Available</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <span className="text-sm">Featured</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                {editingProduct ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingProduct(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Category</th>
                <th className="text-right p-4">Price</th>
                <th className="text-center p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium">{product.name}</p>
                    {product.description && (
                      <p className="text-sm text-gray-500">{product.description}</p>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">
                    {categories.find(c => c.id === product.category_id)?.name || '-'}
                  </td>
                  <td className="p-4 text-right font-medium">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Products