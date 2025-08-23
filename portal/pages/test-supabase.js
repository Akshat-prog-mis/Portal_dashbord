import { useState } from 'react'

export default function AdminSetup() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const createAdmin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to create admin: ' + error.message
      })
    }
    setLoading(false)
  }

  const checkEnv = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/check-env')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to check environment: ' + error.message
      })
    }
    setLoading(false)
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-direct')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to test connection: ' + error.message
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Supabase Setup & Testing
          </h1>
          
          <div className="space-y-4 mb-8">
            <button
              onClick={checkEnv}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              1. Check Environment Variables
            </button>
            
            <button
              onClick={testConnection}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              2. Test Supabase Connection
            </button>
            
            <button
              onClick={createAdmin}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              3. Create Admin User
            </button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Processing...</p>
            </div>
          )}

          {result && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Result: {result.success ? '✅ Success' : '❌ Error'}
              </h3>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Run "Check Environment Variables" to verify your .env.local</li>
              <li>2. Run "Test Supabase Connection" to verify database access</li>
              <li>3. Run "Create Admin User" to set up the default admin</li>
              <li>4. Once successful, you can login with: admin / admin123</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}