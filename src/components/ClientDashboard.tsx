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

interface FundTransaction {
  id: string
  amount: number
  transaction_type: string
  description?: string
  created_at: string
}

interface Campaign {
  id: string
  name: string
  description?: string
  investment_amount: number
  duration_days: number
  roi_percentage: number
  status: string
  start_date: string
  end_date: string
  total_roi_earned: number
  last_roi_payment?: string
  created_at: string
}

interface ClientDashboardProps {
  client: Client | null
}

export default function ClientDashboard({ client: initialClient }: ClientDashboardProps) {
  const [client, setClient] = useState<Client | null>(initialClient)
  const [balances, setBalances] = useState<ClientBalance[]>([])
  const [transactions, setTransactions] = useState<FundTransaction[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [currentBalance, setCurrentBalance] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'transactions'>('overview')
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
      fetchTransactions()
      fetchCampaigns()
    }
  }, [client, fetchBalances, fetchTransactions, fetchCampaigns, router])

  const fetchTransactions = useCallback(async () => {
    if (!client) return

    const { data, error } = await supabase
      .from('fund_transactions')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      setTransactions(data || [])
      // Calculate current balance from transactions
      const balance = data?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0
      setCurrentBalance(balance)
    }
  }, [client, supabase])

  const fetchCampaigns = useCallback(async () => {
    if (!client) return

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
    } else {
      setCampaigns(data || [])
    }
  }, [client, supabase])

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
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-2">Current Balance</h2>
              {loading ? (
                <div className="text-white text-2xl">Loading...</div>
              ) : (
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(currentBalance)}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-2">Active Campaigns</h2>
              {loading ? (
                <div className="text-white text-2xl">Loading...</div>
              ) : (
                <div className="text-3xl font-bold text-white">
                  {campaigns.filter(c => c.status === 'active').length}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-2">Total ROI Earned</h2>
              {loading ? (
                <div className="text-white text-2xl">Loading...</div>
              ) : (
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(campaigns.reduce((sum, c) => sum + c.total_roi_earned, 0))}
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Overview tab clicked - event:', e)
                    setActiveTab('overview')
                    alert('Overview clicked!')
                  }}
                  className={`relative z-10 cursor-pointer py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === 'overview'
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  📊 Overview
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Campaigns tab clicked - event:', e)
                    setActiveTab('campaigns')
                    alert('Campaigns clicked!')
                  }}
                  className={`relative z-10 cursor-pointer py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === 'campaigns'
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  🎯 Campaigns
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Transactions tab clicked - event:', e)
                    setActiveTab('transactions')
                    alert('Transactions clicked!')
                  }}
                  className={`relative z-10 cursor-pointer py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === 'transactions'
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  💰 Transactions
                </button>
              </nav>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-red-100 border border-red-300 p-3 mb-4 rounded text-sm text-red-800">
            <strong>DEBUG:</strong> Current Active Tab: {activeTab}
            <br />
            <button 
              onClick={() => {
                console.log('Debug button clicked! Active tab is:', activeTab)
                alert('Debug button works! Current tab: ' + activeTab)
                setActiveTab('campaigns')
              }}
              className="bg-red-500 text-white px-2 py-1 rounded mt-2 text-xs"
            >
              Test Click (Should switch to campaigns)
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white shadow rounded-lg">
            {activeTab === 'overview' && (
              <>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                </div>
                <div className="px-6 py-4">
                  {loading ? (
                    <div className="text-center py-4">Loading recent activity...</div>
                  ) : (
                    <div className="space-y-4">
                      {/* Recent Transactions */}
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {transaction.amount > 0 ? '+' : '-'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description || transaction.transaction_type}</p>
                              <p className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </div>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-lg">No transactions found</div>
                          <p className="text-sm mt-2">Your transaction history will appear here.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'campaigns' && (
              <>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">My Campaigns</h2>
                </div>
                <div className="px-6 py-4">
                  {loading ? (
                    <div className="text-center py-4">Loading campaigns...</div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-lg">No campaigns found</div>
                      <p className="text-sm mt-2">Your campaigns will appear here once they are created.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {campaigns.map((campaign) => (
                        <div key={campaign.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </span>
                          </div>
                          
                          {campaign.description && (
                            <p className="text-gray-600 mb-4">{campaign.description}</p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Investment</p>
                              <p className="font-semibold">{formatCurrency(campaign.investment_amount)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Daily ROI</p>
                              <p className="font-semibold">{campaign.roi_percentage}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Duration</p>
                              <p className="font-semibold">{campaign.duration_days} days</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total Earned</p>
                              <p className="font-semibold text-green-600">{formatCurrency(campaign.total_roi_earned)}</p>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between text-sm">
                              <span>Start Date: {new Date(campaign.start_date).toLocaleDateString()}</span>
                              <span>End Date: {new Date(campaign.end_date).toLocaleDateString()}</span>
                            </div>
                            {campaign.last_roi_payment && (
                              <div className="text-sm text-gray-600 mt-2">
                                Last ROI Payment: {new Date(campaign.last_roi_payment).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'transactions' && (
              <>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
                </div>
                <div className="px-6 py-4">
                  {loading ? (
                    <div className="text-center py-4">Loading transactions...</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-lg">No transactions found</div>
                      <p className="text-sm mt-2">Your transaction history will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                              transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {transaction.transaction_type === 'deposit' && '↑'}
                              {transaction.transaction_type === 'withdrawal' && '↓'}
                              {transaction.transaction_type === 'roi_payment' && '💰'}
                              {transaction.transaction_type === 'campaign_investment' && '📈'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {transaction.description || transaction.transaction_type.replace('_', ' ').toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}