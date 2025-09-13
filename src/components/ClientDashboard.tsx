'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Client {
  id: string
  email: string
  full_name: string
  phone?: string
  created_at: string
}

interface ClientBalance {
  id: string
  balance: number
  description?: string
  created_at: string
}

interface ClientDashboardProps {
  client: Client | null
}

export default function ClientDashboard({ client: initialClient }: ClientDashboardProps) {
  const [client, setClient] = useState<Client | null>(initialClient)
  const [balances, setBalances] = useState<ClientBalance[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchBalances = useCallback(async () => {
    if (!client) return

    const { data, error } = await supabase
      .from('client_balances')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching balances:', error)
    } else {
      setBalances(data || [])
    }
    setLoading(false)
  }, [supabase, client])

  useEffect(() => {
    document.title = client ? `${client.full_name} - WealthWise Dashboard` : "WealthWise Client Dashboard"

    // If no client from server, try to get from sessionStorage
    if (!client && typeof window !== 'undefined') {
      const storedClient = sessionStorage.getItem('clientData')
      if (storedClient) {
        setClient(JSON.parse(storedClient))
      } else {
        router.push('/login')
        return
      }
    }

    if (client) {
      fetchBalances()
    }
  }, [client, fetchBalances, router])

  async function signOut() {
    await supabase.auth.signOut()
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('clientData')
    }
    router.push('/login')
  }

  const getTotalBalance = () => {
    return balances.reduce((total, balance) => total + balance.balance, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="text-gray-300">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                WealthWise Client Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {client.full_name}
              </span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Client Info Card */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="mt-1 text-sm text-gray-900">{client.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{client.email}</p>
              </div>
              {client.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="mt-1 text-sm text-gray-900">{client.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Client Since</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(client.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Balance Summary */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-white mb-2">Current Balance</h2>
            {loading ? (
              <div className="text-white text-2xl">Loading...</div>
            ) : (
              <div className="text-4xl font-bold text-white">
                {formatCurrency(getTotalBalance())}
              </div>
            )}
          </div>

          {/* Balance History */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Balance History</h2>
            </div>
            <div className="px-6 py-4">
              {loading ? (
                <div className="text-center py-4">Loading balance history...</div>
              ) : balances.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg">No balance records found</div>
                  <p className="text-sm mt-2">Your balance history will appear here once transactions are recorded.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {balances.map((balance, index) => (
                    <div key={balance.id} className={`border rounded-lg p-4 ${
                      index === 0 ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-900">
                              {formatCurrency(balance.balance)}
                            </span>
                            {index === 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Latest
                              </span>
                            )}
                          </div>
                          {balance.description && (
                            <p className="text-sm text-gray-600 mt-2">{balance.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{formatDate(balance.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}