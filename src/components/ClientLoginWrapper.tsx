'use client'

import { Suspense } from 'react'
import ClientLogin from './ClientLogin'

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="text-gray-300">Loading...</span>
      </div>
    </div>
  )
}

export default function ClientLoginWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientLogin />
    </Suspense>
  )
}