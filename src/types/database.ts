export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      gachas: {
        Row: {
          id: string;
          name: string;
          ticket_type_id: string;
          color: string | null;
          min_rarity: number;
          max_rarity: number;
          is_active: boolean | null;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          ticket_type_id: string;
          color?: string | null;
          min_rarity: number;
          max_rarity: number;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          ticket_type_id?: string;
          color?: string | null;
          min_rarity?: number;
          max_rarity?: number;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "gachas_ticket_type_id_fkey";
            columns: ["ticket_type_id"];
            isOneToOne: false;
            referencedRelation: "ticket_types";
            referencedColumns: ["id"];
          }
        ];
      };
      gacha_rates: {
        Row: {
          id: string;
          gacha_id: string;
          horse_id: string;
          rate: number;
        };
        Insert: {
          id?: string;
          gacha_id: string;
          horse_id: string;
          rate: number;
        };
        Update: {
          id?: string;
          gacha_id?: string;
          horse_id?: string;
          rate?: number;
        };
        Relationships: [
          {
            foreignKeyName: "gacha_rates_gacha_id_fkey";
            columns: ["gacha_id"];
            isOneToOne: false;
            referencedRelation: "gachas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gacha_rates_horse_id_fkey";
            columns: ["horse_id"];
            isOneToOne: false;
            referencedRelation: "horses";
            referencedColumns: ["id"];
          }
        ];
      };
      horses: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          rarity: number;
          description: string | null;
          card_image_url: string | null;
          silhouette_image_url: string | null;
          created_at: string | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          rarity: number;
          description?: string | null;
          card_image_url?: string | null;
          silhouette_image_url?: string | null;
          created_at?: string | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          rarity?: number;
          description?: string | null;
          card_image_url?: string | null;
          silhouette_image_url?: string | null;
          created_at?: string | null;
          is_active?: boolean | null;
        };
        Relationships: [];
      };
      user_collections: {
        Row: {
          id: string;
          user_id: string;
          horse_id: string;
          quantity: number;
          first_acquired_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          horse_id: string;
          quantity?: number;
          first_acquired_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          horse_id?: string;
          quantity?: number;
          first_acquired_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_collections_horse_id_fkey";
            columns: ["horse_id"];
            isOneToOne: false;
            referencedRelation: "horses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_collections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      gacha_history: {
        Row: {
          id: string;
          user_id: string;
          gacha_id: string;
          horse_id: string;
          animation_type: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          gacha_id: string;
          horse_id: string;
          animation_type?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          gacha_id?: string;
          horse_id?: string;
          animation_type?: number | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "gacha_history_gacha_id_fkey";
            columns: ["gacha_id"];
            isOneToOne: false;
            referencedRelation: "gachas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gacha_history_horse_id_fkey";
            columns: ["horse_id"];
            isOneToOne: false;
            referencedRelation: "horses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gacha_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      ticket_types: {
        Row: {
          id: string;
          name: string;
          code: string;
          color: string | null;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          color?: string | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          color?: string | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      user_tickets: {
        Row: {
          id: string;
          user_id: string;
          ticket_type_id: string;
          quantity: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticket_type_id: string;
          quantity?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          ticket_type_id?: string;
          quantity?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_tickets_ticket_type_id_fkey";
            columns: ["ticket_type_id"];
            isOneToOne: false;
            referencedRelation: "ticket_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_tickets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
