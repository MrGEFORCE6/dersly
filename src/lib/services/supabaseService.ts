import { createClient } from '@/lib/supabase/client';
import type { 
  Profile, 
  ProfileUpdate, 
  Lesson, 
  LessonInsert, 
  LessonUpdate, 
  Homework, 
  HomeworkInsert, 
  HomeworkUpdate, 
  Payment,
  Message,
  MessageInsert,
  Book,
  BookInsert,
  BookUpdate,
  Post,
  PostInsert,
  PostUpdate,
  Comment,
  CommentInsert,
  Like,
  Follow,
  TeacherStudent,
  FeedType,
  Class,
  ClassInsert,
  ClassUpdate,
  ClassStudent,
  ClassStudentInsert,
  ScheduleEvent,
  ScheduleEventInsert,
  ScheduleEventUpdate,
  ScheduleConflict
} from '@/types/database.types';
import { initialStudents, initialLessons, initialHomeworks, currentTeacher } from '@/data/mockData';

const STORAGE_KEYS = {
  PROFILES: 'derspompa_profiles_v3',
  LESSONS: 'derspompa_lessons_v3',
  HOMEWORKS: 'derspompa_homeworks_v3',
  PAYMENTS: 'derspompa_payments_v3',
  MESSAGES: 'derspompa_messages_v3',
  BOOKS: 'derspompa_books_v3',
  POSTS: 'derspompa_posts_v3',
  COMMENTS: 'derspompa_comments_v3',
  LIKES: 'derspompa_likes_v3',
  FOLLOWS: 'derspompa_follows_v3',
  TEACHER_STUDENTS: 'derspompa_teacher_students_v3',
  CLASSES: 'dersly_classes_v1',
  CLASS_STUDENTS: 'dersly_class_students_v1',
  SCHEDULE_EVENTS: 'dersly_schedule_events_v1',
};

// Initialize Local Storage with clean empty state (no hardcoded mock users)
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LESSONS)) {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HOMEWORKS)) {
    localStorage.setItem(STORAGE_KEYS.HOMEWORKS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify([]));
  }
}

// Optional helper for users who explicitly want to seed demo items
export function seedDemoData() {
  if (typeof window === 'undefined') return;
  const seedProfiles: Profile[] = [
    currentTeacher,
    ...initialStudents.map((s) => s.profile),
  ];
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(seedProfiles));
  localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(initialLessons));
  localStorage.setItem(STORAGE_KEYS.HOMEWORKS, JSON.stringify(initialHomeworks));
  const seedPayments: Payment[] = initialStudents
    .map((s) => s.payment)
    .filter(Boolean) as Payment[];
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(seedPayments));
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(initialSeedMessages));
}

export const initialSeedMessages: Message[] = [
  {
    id: 'msg-1',
    sender_id: 's-002', // Emre Demir
    receiver_id: 's-001', // Zeynep Kaya
    content: 'Selam Zeynep! Bugünkü Fizik ödevindeki 4. soruyu çözebildin mi?',
    is_read: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'msg-2',
    sender_id: 's-001', // Zeynep Kaya
    receiver_id: 's-002', // Emre Demir
    content: 'Selam Emre! Evet, orada eylemsizlik momenti formülünü açısal ivmeyle bağlayınca hemen çıkıyor. PDF çözümümü birazdan atarım!',
    is_read: true,
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 'msg-3',
    sender_id: 's-002',
    receiver_id: 's-001',
    content: 'Süpersin çok teşekkürler! Akşam deneme analizinde görüşürüz 🚀',
    is_read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

function getLocalData<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalData<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage save error:', err);
  }
}

// Check if Supabase keys are real (not placeholder)
export function isRealSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    !key.includes('placeholder')
  );
}

/* ==============================================================================
   PROFILES SERVICE
   ============================================================================== */
export async function fetchProfiles(): Promise<Profile[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setLocalData(STORAGE_KEYS.PROFILES, data);
        return data as Profile[];
      }
    } catch (e) {
      console.warn('Supabase fetchProfiles fallback to local cache:', e);
    }
  }

  return getLocalData<Profile>(STORAGE_KEYS.PROFILES, []);
}

export async function updateProfile(id: string, updates: ProfileUpdate): Promise<Profile | null> {
  initializeLocalStorage();
  const supabase = createClient();
  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase
        .from('profiles') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const local = getLocalData<Profile>(STORAGE_KEYS.PROFILES, []);
        const updatedLocal = local.map((p) => (p.id === id ? { ...p, ...data } : p));
        setLocalData(STORAGE_KEYS.PROFILES, updatedLocal);
        return data as Profile;
      }
    } catch (e) {
      console.warn('Supabase updateProfile error, persisting locally:', e);
    }
  }

  // Local storage mutation
  const local = getLocalData<Profile>(STORAGE_KEYS.PROFILES, []);
  let updatedProfile: Profile | null = null;
  const updatedList = local.map((p) => {
    if (p.id === id) {
      updatedProfile = {
        ...p,
        ...updates,
        updated_at: new Date().toISOString(),
      } as Profile;
      return updatedProfile;
    }
    return p;
  });
  setLocalData(STORAGE_KEYS.PROFILES, updatedList);
  return updatedProfile;
}

/* ==============================================================================
   LESSONS SERVICE
   ============================================================================== */
export async function fetchLessons(): Promise<Lesson[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('start_time', { ascending: true });

      if (!error && data) {
        setLocalData(STORAGE_KEYS.LESSONS, data);
        return data as Lesson[];
      }
    } catch (e) {
      console.warn('Supabase fetchLessons fallback to local cache:', e);
    }
  }

  return getLocalData<Lesson>(STORAGE_KEYS.LESSONS, []);
}

export async function createLesson(newLesson: LessonInsert): Promise<Lesson> {
  initializeLocalStorage();
  const supabase = createClient();
  const lessonToSave: Lesson = {
    id: newLesson.id || `les-${Date.now()}`,
    teacher_id: newLesson.teacher_id,
    student_id: newLesson.student_id,
    title: newLesson.title,
    start_time: newLesson.start_time,
    end_time: newLesson.end_time,
    status: newLesson.status || 'scheduled',
    notes: newLesson.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase
        .from('lessons') as any)
        .insert(lessonToSave)
        .select()
        .single();

      if (!error && data) {
        const local = getLocalData<Lesson>(STORAGE_KEYS.LESSONS, []);
        setLocalData(STORAGE_KEYS.LESSONS, [data as Lesson, ...local]);
        return data as Lesson;
      }
    } catch (e) {
      console.warn('Supabase createLesson error, persisting locally:', e);
    }
  }

  const local = getLocalData<Lesson>(STORAGE_KEYS.LESSONS, []);
  setLocalData(STORAGE_KEYS.LESSONS, [lessonToSave, ...local]);
  return lessonToSave;
}

export async function updateLesson(id: string, updates: LessonUpdate): Promise<Lesson | null> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase
        .from('lessons') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const local = getLocalData<Lesson>(STORAGE_KEYS.LESSONS, []);
        const updatedList = local.map((l) => (l.id === id ? (data as Lesson) : l));
        setLocalData(STORAGE_KEYS.LESSONS, updatedList);
        return data as Lesson;
      }
    } catch (e) {
      console.warn('Supabase updateLesson error, persisting locally:', e);
    }
  }

  const local = getLocalData<Lesson>(STORAGE_KEYS.LESSONS, []);
  let updatedLesson: Lesson | null = null;
  const updatedList = local.map((l) => {
    if (l.id === id) {
      updatedLesson = {
        ...l,
        ...updates,
        updated_at: new Date().toISOString(),
      } as Lesson;
      return updatedLesson;
    }
    return l;
  });
  setLocalData(STORAGE_KEYS.LESSONS, updatedList);
  return updatedLesson;
}

export async function deleteLesson(id: string): Promise<boolean> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (!error) {
        const local = getLocalData<Lesson>(STORAGE_KEYS.LESSONS, []);
        setLocalData(STORAGE_KEYS.LESSONS, local.filter((l) => l.id !== id));
        return true;
      }
    } catch (e) {
      console.warn('Supabase deleteLesson error, persisting locally:', e);
    }
  }

  const local = getLocalData<Lesson>(STORAGE_KEYS.LESSONS, []);
  setLocalData(STORAGE_KEYS.LESSONS, local.filter((l) => l.id !== id));
  return true;
}

/* ==============================================================================
   HOMEWORKS SERVICE & SUPABASE STORAGE
   ============================================================================== */
export async function fetchHomeworks(): Promise<Homework[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('homeworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLocalData(STORAGE_KEYS.HOMEWORKS, data);
        return data as Homework[];
      }
    } catch (e) {
      console.warn('Supabase fetchHomeworks fallback to local cache:', e);
    }
  }

  return getLocalData<Homework>(STORAGE_KEYS.HOMEWORKS, []);
}

export async function createHomework(hw: HomeworkInsert): Promise<Homework> {
  initializeLocalStorage();
  const supabase = createClient();
  const hwToSave: Homework = {
    id: hw.id || `hw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    lesson_id: hw.lesson_id || null,
    student_id: hw.student_id,
    teacher_id: hw.teacher_id || 't-001',
    class_id: hw.class_id || null,
    title: hw.title || null,
    description: hw.description,
    due_date: hw.due_date || null,
    status: hw.status || 'pending',
    file_url: hw.file_url || null,
    resource_url: hw.resource_url || null,
    estimated_minutes: hw.estimated_minutes !== undefined ? hw.estimated_minutes : 45,
    submission_notes: hw.submission_notes || null,
    submitted_at: hw.submitted_at || null,
    teacher_feedback: hw.teacher_feedback || null,
    score: hw.score !== undefined ? hw.score : null,
    reviewed_at: hw.reviewed_at || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase
        .from('homeworks') as any)
        .insert(hwToSave)
        .select()
        .single();

      if (!error && data) {
        const local = getLocalData<Homework>(STORAGE_KEYS.HOMEWORKS, initialHomeworks);
        setLocalData(STORAGE_KEYS.HOMEWORKS, [data as Homework, ...local]);
        return data as Homework;
      }
    } catch (e) {
      console.warn('Supabase createHomework error, persisting locally:', e);
    }
  }

  const local = getLocalData<Homework>(STORAGE_KEYS.HOMEWORKS, initialHomeworks);
  setLocalData(STORAGE_KEYS.HOMEWORKS, [hwToSave, ...local]);
  return hwToSave;
}

export async function createBulkClassHomework(
  classId: string,
  template: Omit<HomeworkInsert, 'student_id'>
): Promise<Homework[]> {
  const classStudents = await fetchClassStudents(classId);
  const createdHomeworks: Homework[] = [];

  for (const item of classStudents) {
    const studentHw = await createHomework({
      ...template,
      student_id: item.student.id,
      class_id: classId,
    });
    createdHomeworks.push(studentHw);
  }

  return createdHomeworks;
}

export async function reviewHomework(
  id: string,
  evaluation: {
    status: 'reviewed' | 'revision_requested';
    teacher_feedback?: string | null;
    score?: number | null;
  }
): Promise<Homework | null> {
  return updateHomework(id, {
    status: evaluation.status,
    teacher_feedback: evaluation.teacher_feedback || null,
    score: evaluation.score !== undefined ? evaluation.score : null,
    reviewed_at: new Date().toISOString(),
  });
}

export async function deleteHomework(id: string): Promise<boolean> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      await supabase.from('homeworks').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteHomework error, persisting locally:', e);
    }
  }

  const local = getLocalData<Homework>(STORAGE_KEYS.HOMEWORKS, initialHomeworks);
  setLocalData(
    STORAGE_KEYS.HOMEWORKS,
    local.filter((h) => h.id !== id)
  );
  return true;
}

export async function updateHomework(id: string, updates: HomeworkUpdate): Promise<Homework | null> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase
        .from('homeworks') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const local = getLocalData<Homework>(STORAGE_KEYS.HOMEWORKS, initialHomeworks);
        const updatedList = local.map((h) => (h.id === id ? (data as Homework) : h));
        setLocalData(STORAGE_KEYS.HOMEWORKS, updatedList);
        return data as Homework;
      }
    } catch (e) {
      console.warn('Supabase updateHomework error, persisting locally:', e);
    }
  }

  const local = getLocalData<Homework>(STORAGE_KEYS.HOMEWORKS, initialHomeworks);
  let updatedHw: Homework | null = null;
  const updatedList = local.map((h) => {
    if (h.id === id) {
      updatedHw = {
        ...h,
        ...updates,
        updated_at: new Date().toISOString(),
      } as Homework;
      return updatedHw;
    }
    return h;
  });
  setLocalData(STORAGE_KEYS.HOMEWORKS, updatedList);
  return updatedHw;
}


/**
 * Upload file to Supabase Storage Bucket ('homework-files' or 'avatars')
 */
export async function uploadFileToStorage(
  bucketName: 'homework-files' | 'avatars',
  file: File | Blob,
  fileName: string
): Promise<string> {
  const supabase = createClient();
  const fileExt = fileName.split('.').pop() || 'pdf';
  const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(cleanFileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, generating local object URL:', err);
    }
  }

  // Local fallback: create object URL if in browser or simulated hosted path
  if (typeof window !== 'undefined' && file instanceof Blob) {
    try {
      return URL.createObjectURL(file);
    } catch {
      // ignore
    }
  }

  return `https://storage.dersly.app/${bucketName}/${cleanFileName}`;
}

/* ==============================================================================
   PAYMENTS SERVICE
   ============================================================================== */
export async function fetchPayments(): Promise<Payment[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLocalData(STORAGE_KEYS.PAYMENTS, data);
        return data as Payment[];
      }
    } catch (e) {
      console.warn('Supabase fetchPayments fallback to local cache:', e);
    }
  }

  return getLocalData<Payment>(STORAGE_KEYS.PAYMENTS, []);
}

/* ==============================================================================
   MESSAGES SERVICE (STUDENT-TO-STUDENT & PEER CHAT)
   ============================================================================== */
export async function fetchMessages(user1Id: string, user2Id: string): Promise<Message[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data as Message[];
      }
    } catch (e) {
      console.warn('Supabase fetchMessages fallback to local cache:', e);
    }
  }

  const allMessages = getLocalData<Message>(STORAGE_KEYS.MESSAGES, []);
  return allMessages.filter(
    (m) =>
      (m.sender_id === user1Id && m.receiver_id === user2Id) ||
      (m.sender_id === user2Id && m.receiver_id === user1Id)
  );
}

export async function sendMessage(newMsg: MessageInsert): Promise<Message | null> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(newMsg)
        .select()
        .single();

      if (!error && data) {
        const current = getLocalData<Message>(STORAGE_KEYS.MESSAGES, initialSeedMessages);
        setLocalData(STORAGE_KEYS.MESSAGES, [...current, data as Message]);
        return data as Message;
      }
    } catch (e) {
      console.warn('Supabase sendMessage fallback to local cache:', e);
    }
  }

  const localMessage: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sender_id: newMsg.sender_id,
    receiver_id: newMsg.receiver_id,
    content: newMsg.content,
    is_read: newMsg.is_read || false,
    created_at: new Date().toISOString(),
  };

  const current = getLocalData<Message>(STORAGE_KEYS.MESSAGES, initialSeedMessages);
  setLocalData(STORAGE_KEYS.MESSAGES, [...current, localMessage]);
  return localMessage;
}

export function subscribeToMessages(callback: (msg: Message) => void) {
  const supabase = createClient();
  if (isRealSupabaseConfigured()) {
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new) {
            callback(payload.new as Message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Window event listener for local storage sync across tabs
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.MESSAGES && e.newValue) {
      try {
        const msgs = JSON.parse(e.newValue) as Message[];
        const latest = msgs[msgs.length - 1];
        if (latest) callback(latest);
      } catch {}
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }

  return () => {};
}

/* ==============================================================================
   LESSON RESCHEDULE SERVICE (TEACHER PROPOSES, STUDENT APPROVES)
   ============================================================================== */
export async function rescheduleLesson(
  id: string,
  newStartTime: string,
  newEndTime: string
): Promise<Lesson | null> {
  const reschedule_request = {
    new_start_time: newStartTime,
    new_end_time: newEndTime,
    status: 'pending' as const,
    requested_at: new Date().toISOString(),
  };

  return updateLesson(id, { reschedule_request });
}

export async function respondToReschedule(
  id: string,
  accept: boolean
): Promise<Lesson | null> {
  initializeLocalStorage();
  const local = getLocalData<Lesson>(STORAGE_KEYS.LESSONS, []);
  const lesson = local.find((l) => l.id === id);
  if (!lesson || !lesson.reschedule_request) return null;

  if (accept) {
    return updateLesson(id, {
      start_time: lesson.reschedule_request.new_start_time,
      end_time: lesson.reschedule_request.new_end_time,
      reschedule_request: {
        ...lesson.reschedule_request,
        status: 'accepted',
      },
    });
  } else {
    return updateLesson(id, {
      reschedule_request: {
        ...lesson.reschedule_request,
        status: 'rejected',
      },
    });
  }
}

/* ==============================================================================
   BOOKS SERVICE (STUDENT SMART BOOKSHELF & GEMINI SCAN)
   ============================================================================== */
export async function fetchBooks(studentId?: string): Promise<Book[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      let query = supabase.from('books').select('*').order('created_at', { ascending: false });
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      const { data, error } = await query;
      if (!error && data) {
        setLocalData(STORAGE_KEYS.BOOKS, data);
        return data as Book[];
      }
    } catch (e) {
      console.warn('Supabase fetchBooks fallback:', e);
    }
  }

  const all = getLocalData<Book>(STORAGE_KEYS.BOOKS, []);
  if (studentId) {
    return all.filter((b) => b.student_id === studentId);
  }
  return all;
}

export async function createBook(newBook: BookInsert): Promise<Book> {
  initializeLocalStorage();
  const supabase = createClient();
  const toSave: Book = {
    id: newBook.id || `book-${Date.now()}`,
    student_id: newBook.student_id,
    title: newBook.title,
    publisher: newBook.publisher || null,
    subject: newBook.subject || null,
    topics: newBook.topics || [],
    cover_image_url: newBook.cover_image_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase
        .from('books') as any)
        .insert(toSave)
        .select()
        .single();
      if (!error && data) {
        const local = getLocalData<Book>(STORAGE_KEYS.BOOKS, []);
        setLocalData(STORAGE_KEYS.BOOKS, [data as Book, ...local]);
        return data as Book;
      }
    } catch (e) {
      console.warn('Supabase createBook fallback:', e);
    }
  }

  const local = getLocalData<Book>(STORAGE_KEYS.BOOKS, []);
  setLocalData(STORAGE_KEYS.BOOKS, [toSave, ...local]);
  return toSave;
}

export async function deleteBook(id: string): Promise<boolean> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      await supabase.from('books').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteBook fallback:', e);
    }
  }

  const local = getLocalData<Book>(STORAGE_KEYS.BOOKS, []);
  setLocalData(STORAGE_KEYS.BOOKS, local.filter((b) => b.id !== id));
  return true;
}

// ==========================================
// 6. POSTS & SOCIAL FEEDS (Campus & Teachers)
// ==========================================
export async function fetchPosts(feedType?: FeedType): Promise<Post[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (feedType) {
        query = query.eq('feed_type', feedType);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Post[];
      }
    } catch (e) {
      console.warn('Supabase fetchPosts fallback:', e);
    }
  }

  const local = getLocalData<Post>(STORAGE_KEYS.POSTS, []);
  if (feedType) {
    return local.filter((p) => p.feed_type === feedType);
  }
  return local;
}

export async function fetchPostById(id: string): Promise<Post | null> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase.from('posts') as any)
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) {
        return data as Post;
      }
    } catch (e) {
      console.warn('Supabase fetchPostById fallback:', e);
    }
  }

  const local = getLocalData<Post>(STORAGE_KEYS.POSTS, []);
  return local.find((p) => p.id === id) || null;
}

export async function createPost(newPost: PostInsert): Promise<Post> {
  initializeLocalStorage();
  const supabase = createClient();
  const toSave: Post = {
    id: newPost.id || `post-${Date.now()}`,
    author_id: newPost.author_id,
    feed_type: newPost.feed_type,
    title: newPost.title || null,
    content: newPost.content,
    media_urls: newPost.media_urls || [],
    tag: newPost.tag || 'general',
    likes_count: 0,
    comments_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase.from('posts') as any)
        .insert(toSave)
        .select()
        .single();
      if (!error && data) {
        const local = getLocalData<Post>(STORAGE_KEYS.POSTS, []);
        setLocalData(STORAGE_KEYS.POSTS, [data as Post, ...local]);
        return data as Post;
      }
    } catch (e) {
      console.warn('Supabase createPost fallback:', e);
    }
  }

  const local = getLocalData<Post>(STORAGE_KEYS.POSTS, []);
  setLocalData(STORAGE_KEYS.POSTS, [toSave, ...local]);
  return toSave;
}

// ==========================================
// 7. COMMENTS & DISCUSSIONS
// ==========================================
export async function fetchComments(postId: string): Promise<Comment[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase.from('comments') as any)
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (!error && data) {
        return data as Comment[];
      }
    } catch (e) {
      console.warn('Supabase fetchComments fallback:', e);
    }
  }

  const local = getLocalData<Comment>(STORAGE_KEYS.COMMENTS, []);
  return local.filter((c) => c.post_id === postId);
}

export async function createComment(newComment: CommentInsert): Promise<Comment> {
  initializeLocalStorage();
  const supabase = createClient();
  const toSave: Comment = {
    id: newComment.id || `comment-${Date.now()}`,
    post_id: newComment.post_id,
    author_id: newComment.author_id,
    content: newComment.content,
    media_url: newComment.media_url || null,
    created_at: new Date().toISOString(),
  };

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase.from('comments') as any)
        .insert(toSave)
        .select()
        .single();
      if (!error && data) {
        const local = getLocalData<Comment>(STORAGE_KEYS.COMMENTS, []);
        setLocalData(STORAGE_KEYS.COMMENTS, [...local, data as Comment]);
        return data as Comment;
      }
    } catch (e) {
      console.warn('Supabase createComment fallback:', e);
    }
  }

  const local = getLocalData<Comment>(STORAGE_KEYS.COMMENTS, []);
  setLocalData(STORAGE_KEYS.COMMENTS, [...local, toSave]);

  // Update post comments_count
  const posts = getLocalData<Post>(STORAGE_KEYS.POSTS, []);
  setLocalData(
    STORAGE_KEYS.POSTS,
    posts.map((p) =>
      p.id === newComment.post_id ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
    )
  );

  return toSave;
}

// ==========================================
// 8. LIKES & FOLLOWS
// ==========================================
export async function toggleLike(postId: string, userId: string): Promise<{ liked: boolean; count: number }> {
  initializeLocalStorage();
  const allLikes = getLocalData<Like>(STORAGE_KEYS.LIKES, []);
  const existingIndex = allLikes.findIndex((l) => l.post_id === postId && l.user_id === userId);

  let newLikes: Like[];
  let liked: boolean;

  if (existingIndex > -1) {
    newLikes = allLikes.filter((_, i) => i !== existingIndex);
    liked = false;
  } else {
    newLikes = [...allLikes, { id: `like-${Date.now()}`, post_id: postId, user_id: userId, created_at: new Date().toISOString() }];
    liked = true;
  }
  setLocalData(STORAGE_KEYS.LIKES, newLikes);

  // Update count in post
  const posts = getLocalData<Post>(STORAGE_KEYS.POSTS, []);
  const currentPost = posts.find((p) => p.id === postId);
  const currentCount = currentPost ? currentPost.likes_count : 0;
  const newCount = liked ? currentCount + 1 : Math.max(0, currentCount - 1);

  setLocalData(
    STORAGE_KEYS.POSTS,
    posts.map((p) => (p.id === postId ? { ...p, likes_count: newCount } : p))
  );

  return { liked, count: newCount };
}

export function checkUserLiked(postId: string, userId: string): boolean {
  if (typeof window === 'undefined') return false;
  const allLikes = getLocalData<Like>(STORAGE_KEYS.LIKES, []);
  return allLikes.some((l) => l.post_id === postId && l.user_id === userId);
}

export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  initializeLocalStorage();
  const allFollows = getLocalData<Follow>(STORAGE_KEYS.FOLLOWS, []);
  const exists = allFollows.some((f) => f.follower_id === followerId && f.following_id === followingId);

  if (exists) {
    setLocalData(
      STORAGE_KEYS.FOLLOWS,
      allFollows.filter((f) => !(f.follower_id === followerId && f.following_id === followingId))
    );
    return false;
  } else {
    const toSave: Follow = {
      id: `follow-${Date.now()}`,
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date().toISOString(),
    };
    setLocalData(STORAGE_KEYS.FOLLOWS, [...allFollows, toSave]);
    return true;
  }
}

export function checkUserFollowing(followerId: string, followingId: string): boolean {
  if (typeof window === 'undefined') return false;
  const allFollows = getLocalData<Follow>(STORAGE_KEYS.FOLLOWS, []);
  return allFollows.some((f) => f.follower_id === followerId && f.following_id === followingId);
}

// ==========================================
// 9. TEACHER-STUDENT INVITES & MATCHING
// ==========================================
export async function createTeacherInvite(teacherId: string, customCode?: string): Promise<string> {
  initializeLocalStorage();
  const code = customCode || `HOCA-${teacherId.slice(0, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const matches = getLocalData<TeacherStudent>(STORAGE_KEYS.TEACHER_STUDENTS, []);

  // Save invite code template
  const pendingInvite: TeacherStudent = {
    id: `ts-inv-${Date.now()}`,
    teacher_id: teacherId,
    student_id: '',
    status: 'pending',
    invite_code: code,
    created_at: new Date().toISOString(),
  };
  setLocalData(STORAGE_KEYS.TEACHER_STUDENTS, [...matches, pendingInvite]);
  return code;
}

export async function acceptTeacherInvite(inviteCode: string, studentId: string): Promise<{ success: boolean; teacher?: Profile }> {
  initializeLocalStorage();
  const matches = getLocalData<TeacherStudent>(STORAGE_KEYS.TEACHER_STUDENTS, []);
  const profiles = getLocalData<Profile>(STORAGE_KEYS.PROFILES, []);

  const invite = matches.find((m) => m.invite_code?.toLowerCase() === inviteCode.toLowerCase());
  if (!invite) {
    // If not found in dynamic storage, accept default teacher invite code format
    const teacher = profiles.find((p) => p.role === 'teacher') || currentTeacher;
    const newMatch: TeacherStudent = {
      id: `ts-${Date.now()}`,
      teacher_id: teacher.id,
      student_id: studentId,
      status: 'active',
      invite_code: inviteCode,
      created_at: new Date().toISOString(),
    };
    setLocalData(STORAGE_KEYS.TEACHER_STUDENTS, [...matches, newMatch]);
    return { success: true, teacher };
  }

  // Bind student
  const updatedMatches = matches.map((m) =>
    m.id === invite.id ? { ...m, student_id: studentId, status: 'active' as const } : m
  );
  setLocalData(STORAGE_KEYS.TEACHER_STUDENTS, updatedMatches);

  const teacher = profiles.find((p) => p.id === invite.teacher_id) || currentTeacher;
  return { success: true, teacher };
}

export async function matchStudentDirect(teacherId: string, studentIdOrQuery: string): Promise<{ success: boolean; student?: Profile }> {
  initializeLocalStorage();
  const profiles = getLocalData<Profile>(STORAGE_KEYS.PROFILES, []);
  const student = profiles.find(
    (p) =>
      p.role === 'student' &&
      (p.id === studentIdOrQuery ||
        p.username?.toLowerCase() === studentIdOrQuery.toLowerCase().replace('@', '') ||
        p.phone === studentIdOrQuery)
  );

  const targetId = student ? student.id : studentIdOrQuery;
  const matches = getLocalData<TeacherStudent>(STORAGE_KEYS.TEACHER_STUDENTS, []);
  const newMatch: TeacherStudent = {
    id: `ts-${Date.now()}`,
    teacher_id: teacherId,
    student_id: targetId,
    status: 'active',
    invite_code: null,
    created_at: new Date().toISOString(),
  };

  setLocalData(STORAGE_KEYS.TEACHER_STUDENTS, [...matches, newMatch]);
  return { success: true, student };
}

// ==========================================
// 10. LESSON AUDIO NOTE & DIGITAL WHITEBOARD
// ==========================================
export async function updateLessonVoiceAndNotes(
  lessonId: string,
  audioNoteUrl?: string | null,
  digitalNotesUrl?: string | null,
  writtenNotes?: string | null
): Promise<Lesson | null> {
  initializeLocalStorage();
  const lessons = getLocalData<Lesson>(STORAGE_KEYS.LESSONS, []);
  const target = lessons.find((l) => l.id === lessonId);
  if (!target) return null;

  const updated: Lesson = {
    ...target,
    audio_note_url: audioNoteUrl !== undefined ? audioNoteUrl : target.audio_note_url,
    digital_notes_url: digitalNotesUrl !== undefined ? digitalNotesUrl : target.digital_notes_url,
    notes: writtenNotes !== undefined ? writtenNotes : target.notes,
    updated_at: new Date().toISOString(),
  };

  const newLessons = lessons.map((l) => (l.id === lessonId ? updated : l));
  setLocalData(STORAGE_KEYS.LESSONS, newLessons);

  const supabase = createClient();
  if (isRealSupabaseConfigured()) {
    try {
      await (supabase.from('lessons') as any)
        .update({
          audio_note_url: updated.audio_note_url,
          digital_notes_url: updated.digital_notes_url,
          notes: updated.notes,
          updated_at: updated.updated_at,
        })
        .eq('id', lessonId);
    } catch (e) {
      console.warn('Supabase updateLessonVoiceAndNotes fallback:', e);
    }
  }

  return updated;
}

// ==========================================
// 10. CLASSES & CLASS_STUDENTS (Öğretmen Sınıfları & Toplu Yönetim)
// ==========================================
const initialSeedClasses: Class[] = [
  {
    id: 'cls-101',
    teacher_id: 't-001',
    name: '12-A YKS Sayısal Grubu',
    grade_level: '12. Sınıf',
    academic_year: '2026-2027',
    description: 'Haftalık 15 saat yoğun soru çözümü ve TYT/AYT matematik maratonu',
    color: 'indigo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cls-102',
    teacher_id: 't-001',
    name: 'Mezun Derece Kampı',
    grade_level: 'Mezun',
    academic_year: '2026-2027',
    description: 'İlk 10.000 hedefli deneme sınavı analizleri ve konu eksik tamamlama',
    color: 'emerald',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialSeedClassStudents: ClassStudent[] = [
  {
    id: 'cs-001',
    class_id: 'cls-101',
    student_id: 's-001', // Zeynep Kaya
    enrolled_at: new Date().toISOString(),
  },
];

export async function fetchClasses(teacherId?: string): Promise<Class[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      let query = supabase.from('classes').select('*').order('created_at', { ascending: false });
      if (teacherId) {
        query = query.eq('teacher_id', teacherId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Class[];
      }
    } catch (e) {
      console.warn('Supabase fetchClasses fallback:', e);
    }
  }

  const local = getLocalData<Class>(STORAGE_KEYS.CLASSES, initialSeedClasses);
  if (teacherId) {
    return local.filter((c) => c.teacher_id === teacherId);
  }
  return local;
}

export async function createClass(newClass: ClassInsert): Promise<Class> {
  initializeLocalStorage();
  const supabase = createClient();
  const toSave: Class = {
    id: newClass.id || `cls-${Date.now()}`,
    teacher_id: newClass.teacher_id,
    name: newClass.name,
    grade_level: newClass.grade_level || '12. Sınıf',
    academic_year: newClass.academic_year || '2026-2027',
    description: newClass.description || null,
    color: newClass.color || 'indigo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase
        .from('classes') as any)
        .insert(toSave)
        .select()
        .single();
      if (!error && data) {
        const local = getLocalData<Class>(STORAGE_KEYS.CLASSES, initialSeedClasses);
        setLocalData(STORAGE_KEYS.CLASSES, [data as Class, ...local]);
        return data as Class;
      }
    } catch (e) {
      console.warn('Supabase createClass fallback:', e);
    }
  }

  const local = getLocalData<Class>(STORAGE_KEYS.CLASSES, initialSeedClasses);
  setLocalData(STORAGE_KEYS.CLASSES, [toSave, ...local]);
  return toSave;
}

export async function updateClass(id: string, updates: ClassUpdate): Promise<Class | null> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase
        .from('classes') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const local = getLocalData<Class>(STORAGE_KEYS.CLASSES, initialSeedClasses);
        setLocalData(
          STORAGE_KEYS.CLASSES,
          local.map((c) => (c.id === id ? (data as Class) : c))
        );
        return data as Class;
      }
    } catch (e) {
      console.warn('Supabase updateClass fallback:', e);
    }
  }

  const local = getLocalData<Class>(STORAGE_KEYS.CLASSES, initialSeedClasses);
  let updatedClass: Class | null = null;
  const updatedList = local.map((c) => {
    if (c.id === id) {
      updatedClass = {
        ...c,
        ...updates,
        updated_at: new Date().toISOString(),
      } as Class;
      return updatedClass;
    }
    return c;
  });
  setLocalData(STORAGE_KEYS.CLASSES, updatedList);
  return updatedClass;
}

export async function deleteClass(id: string): Promise<boolean> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      await supabase.from('classes').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteClass fallback:', e);
    }
  }

  const local = getLocalData<Class>(STORAGE_KEYS.CLASSES, initialSeedClasses);
  setLocalData(STORAGE_KEYS.CLASSES, local.filter((c) => c.id !== id));

  // Also remove enrollments
  const enrollments = getLocalData<ClassStudent>(STORAGE_KEYS.CLASS_STUDENTS, initialSeedClassStudents);
  setLocalData(STORAGE_KEYS.CLASS_STUDENTS, enrollments.filter((cs) => cs.class_id !== id));
  return true;
}

export async function fetchClassStudents(
  classId: string
): Promise<{ id: string; enrolled_at: string; student: Profile }[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('class_students')
        .select('id, enrolled_at, student:profiles(*)')
        .eq('class_id', classId);
      if (!error && data) {
        return (data as any).map((d: any) => ({
          id: d.id,
          enrolled_at: d.enrolled_at,
          student: d.student as Profile,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetchClassStudents fallback:', e);
    }
  }

  const enrollments = getLocalData<ClassStudent>(STORAGE_KEYS.CLASS_STUDENTS, initialSeedClassStudents);
  const profiles = await fetchProfiles();
  const matching = enrollments.filter((cs) => cs.class_id === classId);

  return matching.map((cs) => {
    const student = profiles.find((p) => p.id === cs.student_id) || {
      id: cs.student_id,
      full_name: 'Öğrenci',
      username: 'ogrenci',
      role: 'student',
      bio: null,
      phone: null,
      avatar_url: null,
      exam_stats: null,
      privacy_settings: null,
      theme_preference: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return {
      id: cs.id,
      enrolled_at: cs.enrolled_at,
      student,
    };
  });
}

export async function addStudentToClass(classId: string, studentId: string): Promise<ClassStudent> {
  initializeLocalStorage();
  const supabase = createClient();
  const toSave: ClassStudent = {
    id: `cs-${Date.now()}`,
    class_id: classId,
    student_id: studentId,
    enrolled_at: new Date().toISOString(),
  };

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase
        .from('class_students') as any)
        .insert(toSave)
        .select()
        .single();
      if (!error && data) {
        const local = getLocalData<ClassStudent>(STORAGE_KEYS.CLASS_STUDENTS, initialSeedClassStudents);
        setLocalData(STORAGE_KEYS.CLASS_STUDENTS, [...local, data as ClassStudent]);
        return data as ClassStudent;
      }
    } catch (e) {
      console.warn('Supabase addStudentToClass fallback:', e);
    }
  }

  const local = getLocalData<ClassStudent>(STORAGE_KEYS.CLASS_STUDENTS, initialSeedClassStudents);
  if (!local.some((cs) => cs.class_id === classId && cs.student_id === studentId)) {
    setLocalData(STORAGE_KEYS.CLASS_STUDENTS, [...local, toSave]);
  }
  return toSave;
}

export async function removeStudentFromClass(classId: string, studentId: string): Promise<boolean> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      await supabase
        .from('class_students')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', studentId);
    } catch (e) {
      console.warn('Supabase removeStudentFromClass fallback:', e);
    }
  }

  const local = getLocalData<ClassStudent>(STORAGE_KEYS.CLASS_STUDENTS, initialSeedClassStudents);
  setLocalData(
    STORAGE_KEYS.CLASS_STUDENTS,
    local.filter((cs) => !(cs.class_id === classId && cs.student_id === studentId))
  );
  return true;
}

export async function fetchStudentClasses(studentId: string): Promise<Class[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('class_students')
        .select('class:classes(*)')
        .eq('student_id', studentId);
      if (!error && data) {
        return (data as any).map((d: any) => d.class as Class).filter(Boolean);
      }
    } catch (e) {
      console.warn('Supabase fetchStudentClasses fallback:', e);
    }
  }

  const enrollments = getLocalData<ClassStudent>(STORAGE_KEYS.CLASS_STUDENTS, initialSeedClassStudents);
  const classes = await fetchClasses();
  const studentEnrollments = enrollments.filter((cs) => cs.student_id === studentId);
  return classes.filter((c) => studentEnrollments.some((se) => se.class_id === c.id));
}

/* ==============================================================================
   SCHEDULE EVENTS (SMART TIMETABLE & STUDY PLAN WITH CONFLICT ENGINE)
   ============================================================================== */
export const initialSeedScheduleEvents: ScheduleEvent[] = [
  {
    id: 'se-1',
    user_id: 's-001',
    title: 'Matematik: Türev & İntegral',
    subject: 'Matematik',
    event_type: 'school',
    day_of_week: 0, // Pazartesi
    start_time: '09:00',
    end_time: '09:40',
    specific_date: null,
    location_or_link: '12-A Dersliği',
    color: 'indigo',
    notes: 'Kazanım testleri çözülecek',
    is_completed: true,
    created_at: '2026-10-12T00:00:00.000Z',
    updated_at: '2026-10-12T00:00:00.000Z',
  },
  {
    id: 'se-2',
    user_id: 's-001',
    title: 'Fizik: Manyetizma & İndüksiyon',
    subject: 'Fizik',
    event_type: 'school',
    day_of_week: 0,
    start_time: '10:00',
    end_time: '10:40',
    specific_date: null,
    location_or_link: 'Fen Laboratuvarı',
    color: 'blue',
    notes: 'Manyetik alan formülleri tekrar edilecek',
    is_completed: true,
    created_at: '2026-10-12T00:00:00.000Z',
    updated_at: '2026-10-12T00:00:00.000Z',
  },
  {
    id: 'se-3',
    user_id: 's-001',
    title: 'Bireysel Etüt: 80 Soru AYT Matematik',
    subject: 'Matematik',
    event_type: 'personal_study',
    day_of_week: 0,
    start_time: '15:30',
    end_time: '17:00',
    specific_date: null,
    location_or_link: 'Ev Çalışma Masası',
    color: 'emerald',
    notes: 'Apotemi Türev Fasikülü sf. 45-60',
    is_completed: true,
    created_at: '2026-10-12T00:00:00.000Z',
    updated_at: '2026-10-12T00:00:00.000Z',
  },
  {
    id: 'se-4',
    user_id: 's-001',
    title: 'Kimya: Organik Bileşikler',
    subject: 'Kimya',
    event_type: 'school',
    day_of_week: 1, // Salı
    start_time: '09:00',
    end_time: '09:40',
    specific_date: null,
    location_or_link: '12-A Dersliği',
    color: 'indigo',
    notes: 'Fonksiyonel gruplar',
    is_completed: false,
    created_at: '2026-10-12T00:00:00.000Z',
    updated_at: '2026-10-12T00:00:00.000Z',
  },
  {
    id: 'se-5',
    user_id: 's-001',
    title: 'Özel Ders: AYT Geometri Koçluğu',
    subject: 'Geometri',
    event_type: 'private_lesson',
    day_of_week: 1,
    start_time: '14:00',
    end_time: '15:30',
    specific_date: null,
    location_or_link: 'Dersly Canlı Tahta',
    color: 'violet',
    notes: 'Çemberde Açılar & Teğetler',
    is_completed: false,
    created_at: '2026-10-12T00:00:00.000Z',
    updated_at: '2026-10-12T00:00:00.000Z',
  },
  {
    id: 'se-6',
    user_id: 's-001',
    title: 'Haftalık Konu Tekrarı & Hata Defteri',
    subject: 'Fizik',
    event_type: 'review',
    day_of_week: 1,
    start_time: '16:30',
    end_time: '18:00',
    specific_date: null,
    location_or_link: 'Kütüphane',
    color: 'amber',
    notes: 'Hatalı soruların çözümleri tekrar edilecek',
    is_completed: false,
    created_at: '2026-10-12T00:00:00.000Z',
    updated_at: '2026-10-12T00:00:00.000Z',
  },
  {
    id: 'se-7',
    user_id: 's-001',
    title: 'Biyoloji: Kalıtım & Genetik',
    subject: 'Biyoloji',
    event_type: 'school',
    day_of_week: 2, // Çarşamba
    start_time: '09:00',
    end_time: '09:40',
    specific_date: null,
    location_or_link: '12-A Dersliği',
    color: 'emerald',
    notes: 'Monohibrit ve Dihibrit Çaprazlamalar',
    is_completed: false,
    created_at: '2026-10-12T00:00:00.000Z',
    updated_at: '2026-10-12T00:00:00.000Z',
  },
  {
    id: 'se-8',
    user_id: 's-001',
    title: 'Bireysel Etüt: Paragraf ve Problem Rutini',
    subject: 'Türkçe & Matematik',
    event_type: 'personal_study',
    day_of_week: 2,
    start_time: '15:00',
    end_time: '16:30',
    specific_date: null,
    location_or_link: 'Ev Çalışma Masası',
    color: 'emerald',
    notes: '30 Paragraf + 20 Problem',
    is_completed: false,
    created_at: '2026-10-12T00:00:00.000Z',
    updated_at: '2026-10-12T00:00:00.000Z',
  },
  {
    id: 'se-9',
    user_id: 's-001',
    title: 'Haftalık TYT Kurumsal Deneme Sınavı',
    subject: 'Genel TYT',
    event_type: 'exam',
    day_of_week: 4, // Cuma
    start_time: '14:00',
    end_time: '16:45',
    specific_date: null,
    location_or_link: 'Okul Konferans Salonu',
    color: 'rose',
    notes: '165 Dakika TYT Süresi',
    is_completed: false,
    created_at: '2026-10-12T00:00:00.000Z',
    updated_at: '2026-10-12T00:00:00.000Z',
  },
];

/**
 * Zaman Çakışması Kontrol Motoru (Conflict Detection Engine)
 * Verilen gün/tarih ve saat diliminde mevcut etkinliklerle örtüşme olup olmadığını denetler.
 */
export function detectScheduleConflict(
  existingEvents: ScheduleEvent[],
  candidate: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    specific_date?: string | null;
    excludeId?: string;
  }
): ScheduleConflict {
  const conflicts = existingEvents.filter((ev) => {
    if (candidate.excludeId && ev.id === candidate.excludeId) return false;

    // Gün veya tarih eşleşmesi kontrolü
    const sameDay =
      (candidate.specific_date && ev.specific_date && candidate.specific_date === ev.specific_date) ||
      (!candidate.specific_date && !ev.specific_date && candidate.day_of_week === ev.day_of_week) ||
      (candidate.specific_date && !ev.specific_date && candidate.day_of_week === ev.day_of_week) ||
      (!candidate.specific_date && ev.specific_date && candidate.day_of_week === ev.day_of_week);

    if (!sameDay) return false;

    // Saat çakışması kontrolü: (startA < endB && endA > startB)
    const timeOverlap = candidate.start_time < ev.end_time && candidate.end_time > ev.start_time;
    return timeOverlap;
  });

  if (conflicts.length > 0) {
    const conflictNames = conflicts
      .map((c) => `"${c.title}" (${c.start_time} - ${c.end_time})`)
      .join(', ');
    return {
      hasConflict: true,
      conflictingEvents: conflicts,
      message: `Zaman çakışması tespit edildi! Bu saatte mevcut: ${conflictNames}`,
    };
  }

  return {
    hasConflict: false,
    conflictingEvents: [],
  };
}

/**
 * Öğretmen Özel Ders Randevusu ile Öğrencinin Okul/Etüt Programı Arasındaki Çakışmayı Denetler
 */
export function detectLessonConflictWithSchedule(
  scheduleEvents: ScheduleEvent[],
  lesson: {
    start_time: string; // ISO string örn: 2026-10-13T14:00:00
    end_time: string;   // ISO string örn: 2026-10-13T15:30:00
    excludeLessonId?: string;
  }
): ScheduleConflict {
  try {
    const d = new Date(lesson.start_time);
    const jsDay = d.getDay(); // 0 Pazar, 1 Pazartesi...
    const dayOfWeek = (jsDay + 6) % 7; // 0 Pazartesi, ..., 6 Pazar
    const startHour = lesson.start_time.includes('T') ? lesson.start_time.split('T')[1].slice(0, 5) : '14:00';
    const endHour = lesson.end_time.includes('T') ? lesson.end_time.split('T')[1].slice(0, 5) : '15:00';
    const specificDate = lesson.start_time.includes('T') ? lesson.start_time.split('T')[0] : null;

    return detectScheduleConflict(scheduleEvents, {
      day_of_week: dayOfWeek,
      start_time: startHour,
      end_time: endHour,
      specific_date: specificDate,
    });
  } catch {
    return { hasConflict: false, conflictingEvents: [] };
  }
}

export async function fetchScheduleEvents(userId?: string): Promise<ScheduleEvent[]> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      let query = supabase.from('schedule_events').select('*').order('start_time', { ascending: true });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as ScheduleEvent[];
      }
    } catch (e) {
      console.warn('Supabase fetchScheduleEvents fallback:', e);
    }
  }

  const local = getLocalData<ScheduleEvent>(STORAGE_KEYS.SCHEDULE_EVENTS, initialSeedScheduleEvents);
  if (userId) {
    return local.filter((ev) => ev.user_id === userId);
  }
  return local;
}

export async function createScheduleEvent(event: ScheduleEventInsert): Promise<ScheduleEvent> {
  initializeLocalStorage();
  const supabase = createClient();
  const toSave: ScheduleEvent = {
    id: `se-${Date.now()}`,
    user_id: event.user_id,
    title: event.title,
    subject: event.subject,
    event_type: event.event_type || 'school',
    day_of_week: event.day_of_week,
    start_time: event.start_time,
    end_time: event.end_time,
    specific_date: event.specific_date || null,
    location_or_link: event.location_or_link || null,
    color: event.color || 'indigo',
    notes: event.notes || null,
    is_completed: event.is_completed || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase
        .from('schedule_events') as any)
        .insert(toSave)
        .select()
        .single();
      if (!error && data) {
        const local = getLocalData<ScheduleEvent>(STORAGE_KEYS.SCHEDULE_EVENTS, initialSeedScheduleEvents);
        setLocalData(STORAGE_KEYS.SCHEDULE_EVENTS, [...local, data as ScheduleEvent]);
        return data as ScheduleEvent;
      }
    } catch (e) {
      console.warn('Supabase createScheduleEvent fallback:', e);
    }
  }

  const local = getLocalData<ScheduleEvent>(STORAGE_KEYS.SCHEDULE_EVENTS, initialSeedScheduleEvents);
  setLocalData(STORAGE_KEYS.SCHEDULE_EVENTS, [...local, toSave]);
  return toSave;
}

export async function updateScheduleEvent(
  id: string,
  updates: ScheduleEventUpdate
): Promise<ScheduleEvent | null> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase
        .from('schedule_events') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const local = getLocalData<ScheduleEvent>(STORAGE_KEYS.SCHEDULE_EVENTS, initialSeedScheduleEvents);
        setLocalData(
          STORAGE_KEYS.SCHEDULE_EVENTS,
          local.map((ev) => (ev.id === id ? (data as ScheduleEvent) : ev))
        );
        return data as ScheduleEvent;
      }
    } catch (e) {
      console.warn('Supabase updateScheduleEvent fallback:', e);
    }
  }

  const local = getLocalData<ScheduleEvent>(STORAGE_KEYS.SCHEDULE_EVENTS, initialSeedScheduleEvents);
  let updatedEvent: ScheduleEvent | null = null;
  const updatedList = local.map((ev) => {
    if (ev.id === id) {
      updatedEvent = { ...ev, ...updates, updated_at: new Date().toISOString() };
      return updatedEvent;
    }
    return ev;
  });
  setLocalData(STORAGE_KEYS.SCHEDULE_EVENTS, updatedList);
  return updatedEvent;
}

export async function deleteScheduleEvent(id: string): Promise<boolean> {
  initializeLocalStorage();
  const supabase = createClient();

  if (isRealSupabaseConfigured()) {
    try {
      await supabase.from('schedule_events').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteScheduleEvent fallback:', e);
    }
  }

  const local = getLocalData<ScheduleEvent>(STORAGE_KEYS.SCHEDULE_EVENTS, initialSeedScheduleEvents);
  setLocalData(
    STORAGE_KEYS.SCHEDULE_EVENTS,
    local.filter((ev) => ev.id !== id)
  );
  return true;
}

export async function toggleScheduleEventCompleted(
  id: string,
  isCompleted: boolean
): Promise<ScheduleEvent | null> {
  return updateScheduleEvent(id, { is_completed: isCompleted });
}


