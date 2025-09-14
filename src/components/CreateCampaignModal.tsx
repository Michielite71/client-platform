'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Client {
  id: string
  email: string
  full_name: string
}

interface CreateCampaignModalProps {
  client: Client
  onClose: () => void
  onCampaignAdded: () => void
}

export default function CreateCampaignModal({ client, onClose, onCampaignAdded }: CreateCampaignModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [durationDays, setDurationDays] = useState('')
  const [roiPercentage, setRoiPercentage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)

  // Fetch current balance best-effort when modal opens
  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc('get_client_current_balance', { client_uuid: client.id })
        if (!rpcError && !ignore) setCurrentBalance(Number(data || 0))
      } catch (e) {
        console.warn('Unable to fetch current balance', e)
      }
    })()
    return () => { ignore = true }
  }, [client.id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const investment = parseFloat(investmentAmount)
      const duration = parseInt(durationDays)
      const roi = parseFloat(roiPercentage)

      if (!name.trim()) throw new Error('Campaign name is required')
      if (isNaN(investment) || investment <= 0) throw new Error('Enter a valid investment amount')
      if (isNaN(duration) || duration <= 0) throw new Error('Enter a valid duration (days)')
      if (isNaN(roi) || roi <= 0) throw new Error('Enter a valid ROI percentage')

      if (currentBalance !== null && investment > currentBalance) {
        throw new Error(`Insufficient balance. Available: $${currentBalance.toFixed(2)}`)
      }

      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + duration)

      // Insert campaign (RLS policy must allow client inserts)
      const { error: campaignError } = await supabase
        .from('campaigns')
        .insert([
          {
            client_id: client.id,
            name: name.trim(),
            description: description.trim() || null,
            investment_amount: investment,
            duration_days: duration,
            roi_percentage: roi,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            created_by: null,
          }
        ])

      if (campaignError) throw new Error(campaignError.message)

      // Record the investment as a negative transaction (RLS policy must allow)
      const { error: txError } = await supabase
        .from('fund_transactions')
        .insert([
          {
            client_id: client.id,
            amount: -investment,
            transaction_type: 'campaign_investment',
            description: `Investment in campaign: ${name.trim()}`,
            created_by: null,
          }
        ])

      if (txError) {
        // Not critical for campaign creation, but surface the info
        console.warn('Campaign created but transaction failed:', txError.message)
      }

      onCampaignAdded()
      onClose()
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const dailyRoi = () => {
    const inv = parseFloat(investmentAmount)
    const roi = parseFloat(roiPercentage)
    if (!isNaN(inv) && !isNaN(roi)) return (inv * (roi / 100)).toFixed(2)
    return '0.00'
  }

  const totalProjected = () => {
    const inv = parseFloat(investmentAmount)
    const roi = parseFloat(roiPercentage)
    const dur = parseInt(durationDays)
    if (!isNaN(inv) && !isNaN(roi) && !isNaN(dur)) return ((inv * (roi / 100)) * dur).toFixed(2)
    return '0.00'
  }

  const investmentNum = parseFloat(investmentAmount || '0')
  const insufficient = currentBalance !== null && !isNaN(investmentNum) && investmentNum > currentBalance

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50 w-full max-w-lg relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Create Campaign</h3>
              <p className="text-sm text-gray-400">{client.full_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {currentBalance !== null && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-300">
                Available Balance: <span className="font-semibold">${currentBalance.toFixed(2)}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Investment Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (Days) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Daily ROI Percentage *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={roiPercentage}
                  onChange={(e) => setRoiPercentage(e.target.value)}
                  className="w-full px-4 pr-8 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="1.5"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
            </div>
          </div>

          {(investmentAmount && durationDays && roiPercentage) && (
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Campaign Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Daily ROI:</span>
                  <p className="text-green-400 font-semibold">${dailyRoi()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Projected Total:</span>
                  <p className="text-blue-400 font-semibold">${totalProjected()}</p>
                </div>
              </div>
            </div>
          )}

          {(error || insufficient) && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <div className="text-red-400 text-sm">{error || `Insufficient balance. Available: $${currentBalance?.toFixed(2)}`}</div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-600 rounded-xl text-sm text-gray-300 hover:bg-gray-700/50">Cancel</button>
            <button type="submit" disabled={loading || insufficient} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-sm font-medium disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
