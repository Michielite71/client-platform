'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ClientLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    document.title = 'Client Login - WealthWise Portal'
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      if (error.message.includes('Invalid login credentials')) {
        setMessage("Invalid email or password. Contact your administrator if you don't have a password.")
      } else if (error.message.includes('Email not confirmed')) {
        setMessage('Please check your email and click the confirmation link.')
      } else {
        setMessage('Login failed. Please contact your administrator.')
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            WealthWise Client Portal
          </h2>
          <p className="mt-2 text-gray-400 text-sm sm:text-base">
            Enter your email and password to access your account
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-700/50">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-gray-500 text-sm sm:text-base"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-gray-500"
                placeholder="Enter your password"
              />
            </div>

            {message && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 sm:p-3">
                <div className="text-red-400 text-xs sm:text-sm text-center">{message}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm sm:text-base">Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 713-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign In</span>
                </div>
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
            <div className="text-blue-300 text-xs sm:text-sm">
              <div className="font-semibold mb-2">Access:</div>
              <ul className="space-y-1 text-xs">
                <li>• Use your email and password provided by your administrator.</li>
                <li>• If you don’t have a password, contact your administrator.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

