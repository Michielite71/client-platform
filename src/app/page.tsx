import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check if user is a valid client
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', user.email)
      .single()

    if (!error && client) {
      redirect('/dashboard')
    }
  }

  redirect('/login')
}
