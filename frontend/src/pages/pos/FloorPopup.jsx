import React, { useState, useEffect } from 'react'
import api from '../../api/client'
import toast from 'react-hot-toast'

function FloorPopup({ onClose, onSelectTable }) {
  const [tables, setTables] = useState([])
  const [selectedFloor, setSelectedFloor] = useState(1)

  useEffect(() => {
    fetchTables()
  }, [selectedFloor])

  const fetchTables = async () => {
    try {
      const response = await api.get(`/tables/?floor=${selectedFloor}`)
      setTables(response.data)
    } catch (error) {
      toast.error('Failed to fetch tables')
    }
  }

  const getTableColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-500 text-green-700'
      case 'occupied': return 'bg-red-100 border-red-500 text-red-700'
      case 'reserved': return 'bg-yellow-100 border-yellow-500 text-yellow-700'
      default: return 'bg-gray-100 border-gray-500 text-gray-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Select Table</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Floor Selection */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(floor => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedFloor === floor
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Floor {floor}
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-4 gap-4 min-h-[400px] relative bg-gray-50 rounded-lg p-4">
          {/* Floor Plan Visualization */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl font-bold pointer-events-none">
            FLOOR {selectedFloor}
          </div>
          
          {tables.map(table => (
            <button
              key={table.id}
              onClick={() => {
                if (table.status === 'available') {
                  onSelectTable(table)
                  onClose()
                }
              }}
              disabled={table.status !== 'available'}
              className={`p-4 rounded-lg border-2 ${getTableColor(table.status)} 
                hover:shadow-lg transition-shadow relative z-10
                ${table.status !== 'available' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                gridColumn: table.position_x ? Math.ceil(table.position_x / 100) : 'auto',
                gridRow: table.position_y ? Math.ceil(table.position_y / 100) : 'auto',
              }}
            >
              <div className="text-center">
                <p className="font-bold text-lg">{table.name}</p>
                <p className="text-sm capitalize">{table.status}</p>
                <p className="text-xs mt-1">Capacity: {table.capacity}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
            <span className="text-sm">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
            <span className="text-sm">Reserved</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloorPopup