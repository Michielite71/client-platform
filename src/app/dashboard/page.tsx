import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientDashboard from '@/components/ClientDashboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // If user is authenticated, check clients table
  if (user) {
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', user.email)
      .single()

    if (client) {
      return <ClientDashboard client={client} />
    }
  }

  // If no authenticated user, try sessionStorage (for token-based access)
  // This will be handled on the client side
  return <ClientDashboard client={null} />
}