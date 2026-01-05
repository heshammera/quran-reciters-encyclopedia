// Database Types - Auto-generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      reciters: {
        Row: {
          id: string;
          name_ar: string;
          biography_ar: string | null;
          image_url: string | null;
          birth_date: string | null;
          death_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_ar: string;
          biography_ar?: string | null;
          image_url?: string | null;
          birth_date?: string | null;
          death_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_ar?: string;
          biography_ar?: string | null;
          image_url?: string | null;
          birth_date?: string | null;
          death_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reciter_phases: {
        Row: {
          id: string;
          reciter_id: string;
          phase_name_ar: string;
          description_ar: string | null;
          approximate_start_year: number | null;
          approximate_end_year: number | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          reciter_id: string;
          phase_name_ar: string;
          description_ar?: string | null;
          approximate_start_year?: number | null;
          approximate_end_year?: number | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          reciter_id?: string;
          phase_name_ar?: string;
          description_ar?: string | null;
          approximate_start_year?: number | null;
          approximate_end_year?: number | null;
          display_order?: number;
          created_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          name_ar: string;
          slug: string;
          description_ar: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name_ar: string;
          slug: string;
          description_ar?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_ar?: string;
          slug?: string;
          description_ar?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      recordings: {
        Row: {
          id: string;
          archival_id: string;
          reciter_id: string;
          reciter_phase_id: string | null;
          section_id: string;
          surah_number: number;
          ayah_start: number;
          ayah_end: number;
          city: string;
          recording_date: RecordingDate;
          duration_seconds: number;
          source_description: string;
          quality_level: string | null;
          reliability_level: 'verified' | 'unverified' | 'rare' | 'very_rare';
          rarity_classification: 'common' | 'less_common' | 'rare' | 'very_rare';
          is_published: boolean;
          metadata_complete: boolean;
          is_featured: boolean;
          type: 'audio' | 'video';
          video_url: string | null;
          video_thumbnail: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          archival_id: string;
          reciter_id: string;
          reciter_phase_id?: string | null;
          section_id: string;
          surah_number: number;
          ayah_start: number;
          ayah_end: number;
          city: string;
          recording_date: RecordingDate;
          duration_seconds: number;
          source_description: string;
          quality_level?: string | null;
          reliability_level: 'verified' | 'unverified' | 'rare' | 'very_rare';
          rarity_classification: 'common' | 'less_common' | 'rare' | 'very_rare';
          is_published?: boolean;
          is_featured?: boolean;
          type?: 'audio' | 'video';
          video_url?: string | null;
          video_thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          archival_id?: string;
          reciter_id?: string;
          reciter_phase_id?: string | null;
          section_id?: string;
          surah_number?: number;
          ayah_start?: number;
          ayah_end?: number;
          city?: string;
          recording_date?: RecordingDate;
          duration_seconds?: number;
          source_description?: string;
          quality_level?: string | null;
          reliability_level?: 'verified' | 'unverified' | 'rare' | 'very_rare';
          rarity_classification?: 'common' | 'less_common' | 'rare' | 'very_rare';
          is_published?: boolean;
          is_featured?: boolean;
          type?: 'audio' | 'video';
          video_url?: string | null;
          video_thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      media_files: {
        Row: {
          id: string;
          recording_id: string;
          media_type: 'audio' | 'video' | 'zip';
          file_format: string;
          archive_url: string;
          file_size_bytes: number | null;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recording_id: string;
          media_type: 'audio' | 'video' | 'zip';
          file_format: string;
          archive_url: string;
          file_size_bytes?: number | null;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recording_id?: string;
          media_type?: 'audio' | 'video' | 'zip';
          file_format?: string;
          archive_url?: string;
          file_size_bytes?: number | null;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      quran_index: {
        Row: {
          id: string;
          surah_number: number;
          ayah_number: number;
          text_original: string;
          text_normalized: string;
          surah_name_ar: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          surah_number: number;
          ayah_number: number;
          text_original: string;
          text_normalized: string;
          surah_name_ar: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          surah_number?: number;
          ayah_number?: number;
          text_original?: string;
          text_normalized?: string;
          surah_name_ar?: string;
          created_at?: string;
        };
      };
      recording_coverage: {
        Row: {
          id: string;
          recording_id: string;
          start_ayah: number;
          end_ayah: number;
          full_surah: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recording_id: string;
          start_ayah: number;
          end_ayah: number;
          full_surah?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recording_id?: string;
          start_ayah?: number;
          end_ayah?: number;
          full_surah?: boolean;
          created_at?: string;
        };
      };
      reference_tracks: {
        Row: {
          id: string;
          reciter_id: string;
          section_id: string;
          surah_number: number;
          reference_recording_id: string;
          reason_ar: string;
          set_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reciter_id: string;
          section_id: string;
          surah_number: number;
          reference_recording_id: string;
          reason_ar: string;
          set_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reciter_id?: string;
          section_id?: string;
          surah_number?: number;
          reference_recording_id?: string;
          reason_ar?: string;
          set_by?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Custom types
export interface RecordingDate {
  year: number;
  month?: number;
  day?: number;
  approximate: boolean;
}

export type ReliabilityLevel = 'verified' | 'unverified' | 'rare' | 'very_rare';
export type RarityClassification = 'common' | 'less_common' | 'rare' | 'very_rare';
export type MediaType = 'audio' | 'video' | 'zip';
export type WarningType = 'illogical_date' | 'inconsistent_city' | 'unexpected_duration';
