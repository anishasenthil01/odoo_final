import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/client'

function Session() {
  const [activeSession, setActiveSession] = useState(null)
  const [startingCash, setStartingCash] = useState('')
  const [endingCash, setEndingCash] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkActiveSession()
  }, [])

  const checkActiveSession = async () => {
    try {
      const response = await api.get('/sessions/active')
      setActiveSession(response.data)
    } catch (error) {
      // No active session
    }
  }

  const startSession = async () => {
    if (!startingCash) {
      toast.error('Please enter starting cash amount')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/sessions/start', {
        starting_cash: parseFloat(startingCash)
      })
      setActiveSession(response.data)
      toast.success('Session started successfully')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to start session')
    } finally {
      setLoading(false)
    }
  }

  const endSession = async () => {
    if (!endingCash) {
      toast.error('Please enter ending cash amount')
      return
    }

    setLoading(true)
    try {
      const response = await api.post(`/sessions/${activeSession.id}/end?ending_cash=${parseFloat(endingCash)}`)
      toast.success('Session ended successfully')
      setActiveSession(null)
      setEndingCash('')
      
      // Show session summary
      if (response.data) {
        toast(
          `Total Sales: $${response.data.total_sales.toFixed(2)}\n` +
          `Cash Difference: $${response.data.cash_difference.toFixed(2)}`,
          { duration: 5000 }
        )
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to end session')
    } finally {
      setLoading(false)
    }
  }

  if (!activeSession) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Start New Session</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Cash Amount
              </label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
                placeholder="Enter starting cash"
              />
            </div>
            <button
              onClick={startSession}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Starting...' : 'Start Session'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Active Session</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-green-600">
                ${activeSession.total_sales?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {activeSession.order_count || 0}
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ending Cash Amount
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={endingCash}
              onChange={(e) => setEndingCash(e.target.value)}
              placeholder="Enter ending cash"
            />
          </div>
          
          <button
            onClick={endSession}
            disabled={loading}
            className="btn-danger w-full"
          >
            {loading ? 'Ending Session...' : 'End Session'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Session