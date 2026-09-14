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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brand: {
        Row: {
          brand_description: string | null
          brand_id: string
          brand_logo: string | null
          brand_name: string
          is_active: boolean
          last_updated: string
          offer_ids: Json
        }
        Insert: {
          brand_description?: string | null
          brand_id: string
          brand_logo?: string | null
          brand_name: string
          is_active?: boolean
          last_updated?: string
          offer_ids?: Json
        }
        Update: {
          brand_description?: string | null
          brand_id?: string
          brand_logo?: string | null
          brand_name?: string
          is_active?: boolean
          last_updated?: string
          offer_ids?: Json
        }
        Relationships: []
      }
      domain_publisher: {
        Row: {
          assignments: Json
          domain: string | null
          faq_selection: Json
          header_footer_text: Json
          id: string
          is_active: boolean
          is_default: boolean
          last_updated: string
          logo_url: string | null
          promo_post_selection: Json
          publisher_id: string
          publisher_name: string
          site_name: string
          theme: Json
        }
        Insert: {
          assignments?: Json
          domain?: string | null
          faq_selection?: Json
          header_footer_text?: Json
          id?: string
          is_active?: boolean
          is_default?: boolean
          last_updated?: string
          logo_url?: string | null
          promo_post_selection?: Json
          publisher_id: string
          publisher_name: string
          site_name?: string
          theme?: Json
        }
        Update: {
          assignments?: Json
          domain?: string | null
          faq_selection?: Json
          header_footer_text?: Json
          id?: string
          is_active?: boolean
          is_default?: boolean
          last_updated?: string
          logo_url?: string | null
          promo_post_selection?: Json
          publisher_id?: string
          publisher_name?: string
          site_name?: string
          theme?: Json
        }
        Relationships: []
      }
      promo_content: {
        Row: {
          description: string
          id: string
          is_active: boolean
          last_updated: string
          thumbnail_url: string | null
          title: string
          type: string
        }
        Insert: {
          description: string
          id: string
          is_active?: boolean
          last_updated?: string
          thumbnail_url?: string | null
          title: string
          type: string
        }
        Update: {
          description?: string
          id?: string
          is_active?: boolean
          last_updated?: string
          thumbnail_url?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      update_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          changed_data: Json | null
          id: number
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          changed_data?: Json | null
          id?: never
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          changed_data?: Json | null
          id?: never
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      voucher: {
        Row: {
          brand_id: string
          description: string | null
          discount_label: string | null
          discount_percent: number | null
          expired_date: string | null
          id: string
          last_updated: string
          status: number
          title: string
          type: string
          voucher_code: string | null
        }
        Insert: {
          brand_id: string
          description?: string | null
          discount_label?: string | null
          discount_percent?: number | null
          expired_date?: string | null
          id: string
          last_updated?: string
          status?: number
          title: string
          type?: string
          voucher_code?: string | null
        }
        Update: {
          brand_id?: string
          description?: string | null
          discount_label?: string | null
          discount_percent?: number | null
          expired_date?: string | null
          id?: string
          last_updated?: string
          status?: number
          title?: string
          type?: string
          voucher_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voucher_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand"
            referencedColumns: ["brand_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_publisher_config: { Args: { p_domain: string }; Returns: Json }
      get_publisher_vouchers: {
        Args: {
          p_brand_id?: string
          p_domain: string
          p_limit?: number
          p_page?: number
          p_sort?: string
        }
        Returns: Json
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
