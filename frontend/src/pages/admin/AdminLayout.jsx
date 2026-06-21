import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, Package, Grid, Table, CreditCard, 
  Ticket, Users, BarChart, LogOut 
} from 'lucide-react'

function AdminLayout({ user }) {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { path: '/admin', icon: BarChart, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/categories', icon: Grid, label: 'Categories' },
    { path: '/admin/tables', icon: Table, label: 'Tables' },
    { path: '/admin/payment-methods', icon: CreditCard, label: 'Payments' },
    { path: '/admin/coupons', icon: Ticket, label: 'Coupons' },
    { path: '/admin/employees', icon: Users, label: 'Employees' },
    { path: '/admin/reports', icon: BarChart, label: 'Reports' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">Cafe POS</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>
        
        <nav className="px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="mb-2 px-4">
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout