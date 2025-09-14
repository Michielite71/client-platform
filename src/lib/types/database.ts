export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_balances: {
        Row: {
          id: string
          client_id: string | null
          balance: number
          description: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          balance?: number
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          balance?: number
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fund_transactions: {
        Row: {
          id: string
          client_id: string
          amount: number
          transaction_type: string
          description: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          amount: number
          transaction_type: string
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          amount?: number
          transaction_type?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          investment_amount: number
          duration_days: number
          roi_percentage: number
          status: string
          start_date: string
          end_date: string
          total_roi_earned: number
          last_roi_payment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          investment_amount: number
          duration_days: number
          roi_percentage: number
          status?: string
          start_date?: string
          end_date: string
          total_roi_earned?: number
          last_roi_payment?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          description?: string | null
          investment_amount?: number
          duration_days?: number
          roi_percentage?: number
          status?: string
          start_date?: string
          end_date?: string
          total_roi_earned?: number
          last_roi_payment?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}