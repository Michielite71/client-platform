'use client'

import { useMemo } from 'react'

interface Campaign {
  id: string
  name: string
}

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost'
  source: 'facebook' | 'google' | 'tiktok' | 'organic'
  cost: number
  created_at: string
}

function generateMockLeads(campaignId: string): Lead[] {
  const base = campaignId.slice(0, 8)
  const names = ['Alex Johnson', 'Maria Gomez', 'John Smith', 'Sofia Lee', 'Carlos Diaz', 'Emma Wilson']
  const sources: Lead['source'][] = ['facebook', 'google', 'tiktok', 'organic']
  const statuses: Lead['status'][] = ['new', 'contacted', 'qualified', 'won', 'lost']
  const leads: Lead[] = []
  for (let i = 0; i < 12; i++) {
    const name = names[i % names.length]
    const source = sources[i % sources.length]
    const status = statuses[i % statuses.length]
    const cost = [8.5, 12.0, 14.5, 18.75, 9.99, 22.3][i % 6]
    const email = name.toLowerCase().replace(/\s+/g, '.') + i + '@example.com'
    const created = new Date(Date.now() - i * 86400000).toISOString()
    leads.push({
      id: `${base}-${i}`,
      name,
      email,
      phone: `+1 (555) 01${(i + 10).toString().padStart(2, '0')}-${(100 + i).toString()}`,
      status,
      source,
      cost,
      created_at: created,
    })
  }
  return leads
}

function toCSV(leads: Lead[]): string {
  const header = 'id,name,email,phone,status,source,cost,created_at'
  const rows = leads.map(l => [l.id, l.name, l.email, l.phone || '', l.status, l.source, l.cost.toFixed(2), l.created_at]
    .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  return [header, ...rows].join('\n')
}

export default function LeadsModal({ campaign, onClose }: { campaign: Campaign, onClose: () => void }) {
  const leads = useMemo(() => generateMockLeads(campaign.id), [campaign.id])

  const totals = useMemo(() => {
    const total = leads.length
    const won = leads.filter(l => l.status === 'won').length
    const qualified = leads.filter(l => l.status === 'qualified').length
    const spend = leads.reduce((s, l) => s + l.cost, 0)
    const cpl = total ? spend / total : 0
    return { total, won, qualified, spend, cpl }
  }, [leads])

  const downloadCSV = () => {
    const csv = toCSV(leads)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${campaign.name.replace(/\s+/g, '_')}_leads.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50 w-full max-w-4xl relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Leads - {campaign.name}</h3>
            <p className="text-sm text-gray-400">Preview data (hardcoded) — API integration coming soon</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadCSV} className="px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl text-sm">Export CSV</button>
            <button onClick={onClose} className="p-2 hover:bg-gray-700/50 rounded-xl">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4">
            <p className="text-gray-400 text-xs">Total</p>
            <p className="text-white text-xl font-semibold">{totals.total}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4">
            <p className="text-gray-400 text-xs">Qualified</p>
            <p className="text-white text-xl font-semibold">{totals.qualified}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4">
            <p className="text-gray-400 text-xs">Won</p>
            <p className="text-white text-xl font-semibold">{totals.won}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4">
            <p className="text-gray-400 text-xs">Avg CPL</p>
            <p className="text-white text-xl font-semibold">${totals.cpl.toFixed(2)}</p>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-700/50">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Source</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-300">CPL</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-300">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-900/30">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-2 text-sm text-white">{lead.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-300 break-all">{lead.email}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lead.status === 'won' ? 'bg-green-500/20 text-green-300' :
                      lead.status === 'qualified' ? 'bg-blue-500/20 text-blue-300' :
                      lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-300' :
                      lead.status === 'lost' ? 'bg-red-500/20 text-red-300' : 'bg-gray-700/50 text-gray-300'
                    }`}>{lead.status}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 capitalize">{lead.source}</td>
                  <td className="px-4 py-2 text-sm text-right text-gray-200">${lead.cost.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-right text-gray-300">{new Date(lead.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

