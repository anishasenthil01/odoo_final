import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Coffee, ClipboardList, LogOut, User } from 'lucide-react'

function POSLayout({ user }) {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { path: '/pos', icon: Coffee, label: 'Session' },
    { path: '/pos/orders', icon: ClipboardList, label: 'Orders' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Coffee className="text-primary-600" size={28} />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Cafe POS</h1>
              <p className="text-xs text-gray-500">Point of Sale</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
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

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{user?.full_name || 'Staff'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'staff'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

export default POSLayout