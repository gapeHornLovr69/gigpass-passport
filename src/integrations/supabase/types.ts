export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      credentials: {
        Row: {
          algorithm: string
          created_at: string
          credential_id: string
          expires_at: string
          id: string
          issued_at: string
          payload: Json
          revoked: boolean
          signature: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          algorithm?: string
          created_at?: string
          credential_id: string
          expires_at?: string
          id?: string
          issued_at?: string
          payload: Json
          revoked?: boolean
          signature: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          algorithm?: string
          created_at?: string
          credential_id?: string
          expires_at?: string
          id?: string
          issued_at?: string
          payload?: Json
          revoked?: boolean
          signature?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credentials_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_records: {
        Row: {
          acceptance_rate: number
          completion_rate: number
          connection_id: string | null
          created_at: string
          id: string
          is_simulated: boolean
          jobs_completed: number
          on_time_rate: number
          platform_id: string
          rating: number
          synced_at: string
          tenure_months: number
          updated_at: string
          worker_id: string
        }
        Insert: {
          acceptance_rate?: number
          completion_rate?: number
          connection_id?: string | null
          created_at?: string
          id?: string
          is_simulated?: boolean
          jobs_completed?: number
          on_time_rate?: number
          platform_id: string
          rating?: number
          synced_at?: string
          tenure_months?: number
          updated_at?: string
          worker_id: string
        }
        Update: {
          acceptance_rate?: number
          completion_rate?: number
          connection_id?: string | null
          created_at?: string
          id?: string
          is_simulated?: boolean
          jobs_completed?: number
          on_time_rate?: number
          platform_id?: string
          rating?: number
          synced_at?: string
          tenure_months?: number
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_records_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "platform_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_records_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_records_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_connections: {
        Row: {
          consent_share_rating: boolean
          consent_share_reliability: boolean
          consent_share_volume: boolean
          consented_at: string
          created_at: string
          id: string
          platform_id: string
          status: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          consent_share_rating?: boolean
          consent_share_reliability?: boolean
          consent_share_volume?: boolean
          consented_at?: string
          created_at?: string
          id?: string
          platform_id: string
          status?: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          consent_share_rating?: boolean
          consent_share_reliability?: boolean
          consent_share_volume?: boolean
          consented_at?: string
          created_at?: string
          id?: string
          platform_id?: string
          status?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_connections_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_connections_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          accent: string
          blurb: string
          category: string
          created_at: string
          id: string
          is_simulated: boolean
          name: string
          seed_acceptance_rate: number
          seed_completion_rate: number
          seed_jobs: number
          seed_on_time_rate: number
          seed_rating: number
          seed_tenure_months: number
          slug: string
          updated_at: string
        }
        Insert: {
          accent?: string
          blurb?: string
          category: string
          created_at?: string
          id?: string
          is_simulated?: boolean
          name: string
          seed_acceptance_rate?: number
          seed_completion_rate?: number
          seed_jobs?: number
          seed_on_time_rate?: number
          seed_rating?: number
          seed_tenure_months?: number
          slug: string
          updated_at?: string
        }
        Update: {
          accent?: string
          blurb?: string
          category?: string
          created_at?: string
          id?: string
          is_simulated?: boolean
          name?: string
          seed_acceptance_rate?: number
          seed_completion_rate?: number
          seed_jobs?: number
          seed_on_time_rate?: number
          seed_rating?: number
          seed_tenure_months?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      workers: {
        Row: {
          city: string
          created_at: string
          display_name: string
          handle: string
          id: string
          updated_at: string
        }
        Insert: {
          city?: string
          created_at?: string
          display_name?: string
          handle?: string
          id: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          display_name?: string
          handle?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
