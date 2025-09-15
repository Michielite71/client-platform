'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LeadsModal from '@/components/LeadsModal'
import CreateCampaignModal from '@/components/CreateCampaignModal'

interface Client {
  id: string
  uid?: string
  email: string
  full_name: string
  phone?: string
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
  cpc: number
  epc: number
  created_at: string
}

interface ClientDashboardProps {
  client: Client | null
}

export default function ClientDashboard({ client: initialClient }: ClientDashboardProps) {
  const [client, setClient] = useState<Client | null>(initialClient)
  const [transactions, setTransactions] = useState<FundTransaction[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [currentBalance, setCurrentBalance] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'transactions'>('overview')
  const [showLeadsFor, setShowLeadsFor] = useState<Campaign | null>(null)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('UID copied to clipboard')
    } catch (e) {
      console.error('Copy failed', e)
    }
  }


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
      fetchTransactions()
      fetchCampaigns()
    }
  }, [client, fetchTransactions, fetchCampaigns, router])

  async function signOut() {
    await supabase.auth.signOut()
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('clientData')
    }
    router.push('/login')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
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
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-16">
            <div className="flex items-center min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-semibold text-white truncate">
                <span className="hidden sm:inline">WealthWise Client Portal</span>
                <span className="sm:hidden">WealthWise</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <span className="text-xs sm:text-sm text-gray-300 hidden md:inline truncate max-w-[120px] lg:max-w-none">
                Welcome, {client.full_name}
              </span>
              <span className="text-xs text-gray-300 md:hidden">
                {client.full_name.split(' ')[0]}
              </span>
              <button
                onClick={signOut}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
              >
                <span className="hidden sm:inline">Sign out</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-3 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Client Info Card */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-gray-700/50">
            <h2 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Account Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-400">Full Name</p>
                <p className="mt-1 text-sm sm:text-base text-white break-words">{client.full_name}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-400">Email</p>
                <p className="mt-1 text-sm sm:text-base text-white break-all">{client.email}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs sm:text-sm font-medium text-gray-400">UID</p>
                <div className="mt-1 flex items-center space-x-2">
                  <code className="text-xs sm:text-sm text-gray-300 break-all">{client.uid || client.id}</code>
                  <button
                    onClick={() => copyToClipboard(client.uid || client.id)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                    title="Copy UID"
                  >
                    Copy
                  </button>
                </div>
              </div>
              {client.phone && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">Phone</p>
                  <p className="mt-1 text-sm sm:text-base text-white">{client.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Balance Summary */}
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 shadow rounded-lg p-4 sm:p-6">
              <h2 className="text-sm sm:text-lg font-medium text-white mb-1 sm:mb-2">Current Balance</h2>
              {loading ? (
                <div className="text-white text-lg sm:text-2xl">Loading...</div>
              ) : (
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">
                  {formatCurrency(currentBalance)}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow rounded-lg p-4 sm:p-6">
              <h2 className="text-sm sm:text-lg font-medium text-white mb-1 sm:mb-2">Active Campaigns</h2>
              {loading ? (
                <div className="text-white text-lg sm:text-2xl">Loading...</div>
              ) : (
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  {campaigns.filter(c => c.status === 'active').length}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-700 to-blue-800 shadow rounded-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <h2 className="text-sm sm:text-lg font-medium text-white mb-1 sm:mb-2">Total ROI Earned</h2>
              {loading ? (
                <div className="text-white text-lg sm:text-2xl">Loading...</div>
              ) : (
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">
                  {formatCurrency(campaigns.reduce((sum, c) => sum + c.total_roi_earned, 0))}
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <div className="border-b border-gray-700/50">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 px-3 sm:px-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`relative z-10 cursor-pointer py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`relative z-10 cursor-pointer py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'campaigns'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  🎯 Campaigns
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`relative z-10 cursor-pointer py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'transactions'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  💰 Transactions
                </button>
              </nav>
            </div>
          </div>

          {/* Debug box removed for production aesthetics */}

          {/* Tab Content */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50">
            {activeTab === 'overview' && (
              <>
                <div className="px-6 py-4 border-b border-gray-700/50">
                  <h2 className="text-lg font-medium text-white">Recent Activity</h2>
                </div>
                <div className="px-6 py-4">
                  {loading ? (
                    <div className="text-center py-4">Loading recent activity...</div>
                  ) : (
                    <div className="space-y-4">
                      {/* Recent Transactions */}
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-b-0">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              transaction.amount > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-600/20 text-blue-300'
                            }`}>
                              {transaction.amount > 0 ? '+' : '-'}
                            </div>
                            <div>
                              <p className="font-medium text-white">{transaction.description || transaction.transaction_type}</p>
                              <p className="text-sm text-gray-400">{new Date(transaction.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className={`font-semibold ${transaction.amount > 0 ? 'text-blue-400' : 'text-blue-300'}`}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </div>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
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
                <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-white">My Campaigns</h2>
                  <button
                    onClick={() => setShowCreateCampaign(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  >
                    Create Campaign
                  </button>
                </div>
                <div className="px-6 py-4">
                  {loading ? (
                    <div className="text-center py-4">Loading campaigns...</div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-lg">No campaigns found</div>
                      <p className="text-sm mt-2">Your campaigns will appear here once they are created.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {campaigns.map((campaign) => (
                        <div key={campaign.id} className="border border-gray-700/50 rounded-2xl p-6 bg-gray-800/40">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              campaign.status === 'active' ? 'bg-blue-500/20 text-blue-300' :
                              campaign.status === 'completed' ? 'bg-blue-600/20 text-blue-400' :
                              'bg-gray-700 text-gray-300'
                            }`}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </span>
                          </div>
                          
                          {campaign.description && (
                            <p className="text-gray-300 mb-4">{campaign.description}</p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-400">Investment</p>
                              <p className="font-semibold text-white">{formatCurrency(campaign.investment_amount)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Daily ROI</p>
                              <p className="font-semibold text-white">{campaign.roi_percentage}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Duration</p>
                              <p className="font-semibold text-white">{campaign.duration_days} days</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Total Earned</p>
                              <p className="font-semibold text-blue-400">{formatCurrency(campaign.total_roi_earned)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">CPC</p>
                              <p className="font-semibold text-white">{formatCurrency(campaign.cpc || Math.random() * 3 + 3)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">EPC</p>
                              <p className="font-semibold text-white">{formatCurrency(campaign.epc || Math.random() * 3 + 2)}</p>
                            </div>
                          </div>

                          <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-700/50">
                            <div className="flex justify-between text-sm text-gray-300">
                              <span>Start Date: {new Date(campaign.start_date).toLocaleDateString()}</span>
                              <span>End Date: {new Date(campaign.end_date).toLocaleDateString()}</span>
                            </div>
                            {campaign.last_roi_payment && (
                              <div className="text-sm text-gray-400 mt-2">
                                Last ROI Payment: {new Date(campaign.last_roi_payment).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex items-center justify-end">
                            <button
                              onClick={() => setShowLeadsFor(campaign)}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl text-sm font-medium"
                            >
                              View Campaign Details
                            </button>
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
                <div className="px-6 py-4 border-b border-gray-700/50">
                  <h2 className="text-lg font-medium text-white">Transaction History</h2>
                </div>
                <div className="px-6 py-4">
                  {loading ? (
                    <div className="text-center py-4">Loading transactions...</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-lg">No transactions found</div>
                      <p className="text-sm mt-2">Your transaction history will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between py-4 border-b border-gray-700/50 last:border-b-0">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                              transaction.amount > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-600/20 text-blue-300'
                            }`}>
                              {transaction.transaction_type === 'deposit' && '↑'}
                              {transaction.transaction_type === 'withdrawal' && '↓'}
                              {transaction.transaction_type === 'roi_payment' && '💰'}
                              {transaction.transaction_type === 'campaign_investment' && '📈'}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {transaction.description || transaction.transaction_type.replace('_', ' ').toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-400">
                                {new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className={`font-semibold ${transaction.amount > 0 ? 'text-blue-400' : 'text-blue-300'}`}>
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
      {showCreateCampaign && client && (
        // lazy import not necessary here
        <CreateCampaignModal
          client={client}
          onClose={() => setShowCreateCampaign(false)}
          onCampaignAdded={() => {
            setShowCreateCampaign(false)
            // refresh lists
            fetchCampaigns()
            fetchTransactions()
          }}
        />
      )}
      {showLeadsFor && (
        <LeadsModal
          campaign={showLeadsFor}
          onClose={() => setShowLeadsFor(null)}
        />
      )}
    </div>
  )
}
