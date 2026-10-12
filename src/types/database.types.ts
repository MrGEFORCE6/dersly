export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'teacher' | 'student';
export type LessonStatus = 'scheduled' | 'completed' | 'cancelled';
export type HomeworkStatus = 'pending' | 'submitted' | 'reviewed' | 'revision_requested';
export type PaymentStatus = 'pending' | 'partially_paid' | 'completed' | 'cancelled';


export type FeedType = 'student_campus' | 'teachers_lounge';
export type PostTag = 'question' | 'general' | 'resource' | 'announcement';
export type ScheduleEventType = 'school' | 'private_lesson' | 'personal_study' | 'review' | 'exam';


export interface ExamStats {
  tyt_net?: number;
  ayt_net?: number;
  weekly_question_target?: number;
  weekly_questions_solved?: number;
  latest_trial_rank?: string;
  target_university?: string;
  last_exam_date?: string;
}

export type StatsVisibility = 'public' | 'followers_only' | 'only_me_and_teacher';

export interface PrivacySettings {
  stats_visibility: StatsVisibility;
  exam_stats_visibility?: StatsVisibility;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'system' | 'sapphire' | 'emerald' | 'lavender' | 'amber' | 'blue' | 'violet';

export interface ThemePreference {
  mode: ThemeMode;
  accent: AccentColor;
}

export interface RescheduleRequest {
  new_start_time: string;
  new_end_time: string;
  status: 'pending' | 'accepted' | 'rejected';
  requested_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          username: string | null;
          bio: string | null;
          role: UserRole;
          phone: string | null;
          avatar_url: string | null;
          exam_stats: ExamStats | null;
          privacy_settings: PrivacySettings | null;
          theme_preference: ThemePreference | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          username?: string | null;
          bio?: string | null;
          role?: UserRole;
          phone?: string | null;
          avatar_url?: string | null;
          exam_stats?: ExamStats | null;
          privacy_settings?: PrivacySettings | null;
          theme_preference?: ThemePreference | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          username?: string | null;
          bio?: string | null;
          role?: UserRole;
          phone?: string | null;
          avatar_url?: string | null;
          exam_stats?: ExamStats | null;
          privacy_settings?: PrivacySettings | null;
          theme_preference?: ThemePreference | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      lessons: {
        Row: {
          id: string;
          teacher_id: string;
          student_id: string;
          title: string;
          start_time: string;
          end_time: string;
          status: LessonStatus;
          notes: string | null;
          required_book?: string | null;
          reschedule_request?: RescheduleRequest | null;
          audio_note_url?: string | null;
          digital_notes_url?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          student_id: string;
          title: string;
          start_time: string;
          end_time: string;
          status?: LessonStatus;
          notes?: string | null;
          required_book?: string | null;
          reschedule_request?: RescheduleRequest | null;
          audio_note_url?: string | null;
          digital_notes_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          student_id?: string;
          title?: string;
          start_time?: string;
          end_time?: string;
          status?: LessonStatus;
          notes?: string | null;
          required_book?: string | null;
          reschedule_request?: RescheduleRequest | null;
          audio_note_url?: string | null;
          digital_notes_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_teacher_id_fkey";
            columns: ["teacher_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      homeworks: {
        Row: {
          id: string;
          lesson_id: string | null;
          student_id: string;
          teacher_id?: string | null;
          class_id?: string | null;
          title?: string | null;
          description: string;
          due_date: string | null;
          status: HomeworkStatus;
          file_url: string | null;
          resource_url?: string | null;
          estimated_minutes?: number | null;
          submission_notes: string | null;
          submitted_at: string | null;
          teacher_feedback?: string | null;
          score?: number | null;
          reviewed_at?: string | null;
          created_at: string;
          updated_at: string;
        };

        Insert: {
          id?: string;
          lesson_id?: string | null;
          student_id: string;
          teacher_id?: string | null;
          class_id?: string | null;
          title?: string | null;
          description: string;
          due_date?: string | null;
          status?: HomeworkStatus;
          file_url?: string | null;
          resource_url?: string | null;
          estimated_minutes?: number | null;
          submission_notes?: string | null;
          submitted_at?: string | null;
          teacher_feedback?: string | null;
          score?: number | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string | null;
          student_id?: string;
          teacher_id?: string | null;
          class_id?: string | null;
          title?: string | null;
          description?: string;
          due_date?: string | null;
          status?: HomeworkStatus;
          file_url?: string | null;
          resource_url?: string | null;
          estimated_minutes?: number | null;
          submission_notes?: string | null;
          submitted_at?: string | null;
          teacher_feedback?: string | null;
          score?: number | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };

        Relationships: [
          {
            foreignKeyName: "homeworks_lesson_id_fkey";
            columns: ["lesson_id"];
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "homeworks_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "homeworks_teacher_id_fkey";
            columns: ["teacher_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "homeworks_class_id_fkey";
            columns: ["class_id"];
            referencedRelation: "classes";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          student_id: string;
          teacher_id: string;
          package_hours: number;
          total_amount: number;
          paid_amount: number;
          status: PaymentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          teacher_id: string;
          package_hours: number;
          total_amount: number;
          paid_amount?: number;
          status?: PaymentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          teacher_id?: string;
          package_hours?: number;
          total_amount?: number;
          paid_amount?: number;
          status?: PaymentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_teacher_id_fkey";
            columns: ["teacher_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_receiver_id_fkey";
            columns: ["receiver_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      books: {
        Row: {
          id: string;
          student_id: string;
          title: string;
          publisher: string | null;
          subject: string | null;
          topics: string[] | null;
          cover_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          title: string;
          publisher?: string | null;
          subject?: string | null;
          topics?: string[] | null;
          cover_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          title?: string;
          publisher?: string | null;
          subject?: string | null;
          topics?: string[] | null;
          cover_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "books_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      teacher_students: {
        Row: {
          id: string;
          teacher_id: string;
          student_id: string;
          status: 'active' | 'pending';
          invite_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          student_id: string;
          status?: 'active' | 'pending';
          invite_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          student_id?: string;
          status?: 'active' | 'pending';
          invite_code?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          feed_type: FeedType;
          title: string | null;
          content: string;
          media_urls: string[] | null;
          tag: PostTag | null;
          likes_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          feed_type: FeedType;
          title?: string | null;
          content: string;
          media_urls?: string[] | null;
          tag?: PostTag | null;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          feed_type?: FeedType;
          title?: string | null;
          content?: string;
          media_urls?: string[] | null;
          tag?: PostTag | null;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          media_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          media_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          content?: string;
          media_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          teacher_id: string;
          name: string;
          grade_level: string | null;
          academic_year: string | null;
          description: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          name: string;
          grade_level?: string | null;
          academic_year?: string | null;
          description?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          name?: string;
          grade_level?: string | null;
          academic_year?: string | null;
          description?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey";
            columns: ["teacher_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      class_students: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          enrolled_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          student_id?: string;
          enrolled_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey";
            columns: ["class_id"];
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_students_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      schedule_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subject: string;
          event_type: ScheduleEventType;
          day_of_week: number;
          start_time: string;
          end_time: string;
          specific_date: string | null;
          location_or_link: string | null;
          color: string | null;
          notes: string | null;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          subject: string;
          event_type?: ScheduleEventType;
          day_of_week: number;
          start_time: string;
          end_time: string;
          specific_date?: string | null;
          location_or_link?: string | null;
          color?: string | null;
          notes?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          subject?: string;
          event_type?: ScheduleEventType;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          specific_date?: string | null;
          location_or_link?: string | null;
          color?: string | null;
          notes?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "schedule_events_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      lesson_status: LessonStatus;
      homework_status: HomeworkStatus;
      payment_status: PaymentStatus;
      feed_type: FeedType;
      post_tag: PostTag;
    };
  };
}

// Convenience Type Helpers
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type LessonInsert = Database['public']['Tables']['lessons']['Insert'];
export type LessonUpdate = Database['public']['Tables']['lessons']['Update'];

export type Homework = Database['public']['Tables']['homeworks']['Row'];
export type HomeworkInsert = Database['public']['Tables']['homeworks']['Insert'];
export type HomeworkUpdate = Database['public']['Tables']['homeworks']['Update'];

export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

export type Book = Database['public']['Tables']['books']['Row'];
export type BookInsert = Database['public']['Tables']['books']['Insert'];
export type BookUpdate = Database['public']['Tables']['books']['Update'];

export type TeacherStudent = Database['public']['Tables']['teacher_students']['Row'];
export type TeacherStudentInsert = Database['public']['Tables']['teacher_students']['Insert'];

export type Class = Database['public']['Tables']['classes']['Row'];
export type ClassInsert = Database['public']['Tables']['classes']['Insert'];
export type ClassUpdate = Database['public']['Tables']['classes']['Update'];

export type ClassStudent = Database['public']['Tables']['class_students']['Row'];
export type ClassStudentInsert = Database['public']['Tables']['class_students']['Insert'];

export type ScheduleEvent = Database['public']['Tables']['schedule_events']['Row'];
export type ScheduleEventInsert = Database['public']['Tables']['schedule_events']['Insert'];
export type ScheduleEventUpdate = Database['public']['Tables']['schedule_events']['Update'];

export interface ScheduleConflict {
  hasConflict: boolean;
  conflictingEvents: ScheduleEvent[];
  message?: string;
}

export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

export type Like = Database['public']['Tables']['likes']['Row'];
export type LikeInsert = Database['public']['Tables']['likes']['Insert'];

export type Follow = Database['public']['Tables']['follows']['Row'];
export type FollowInsert = Database['public']['Tables']['follows']['Insert'];


