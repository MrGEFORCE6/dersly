import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  MessageSquare,
  User,
  Sparkles,
  Camera,
  Trash2,
  ExternalLink,
  MapPin,
} from 'lucide-react-native';
import { useTheme } from '../lib/theme';
import { ChatScreen } from './ChatScreen';
import { ProfileScreen } from './ProfileScreen';
import { AiStudentAssistant } from '../components/AiStudentAssistant';

interface StudentHomeScreenProps {
  studentName?: string;
  onLogout?: () => void;
}

interface MobileLesson {
  id: string;
  title: string;
  teacher: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'rescheduled' | 'cancelled';
  required_book?: string;
  reschedule_request?: {
    new_date: string;
    new_time: string;
    status: 'pending' | 'accepted' | 'rejected';
  } | null;
}

interface MobileHomework {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: 'pending' | 'submitted';
  teacher: string;
  fileUrl?: string;
  description?: string;
}

interface MobileBook {
  id: string;
  title: string;
  subject: string;
  publisher: string;
  topics: string[];
}

export function StudentHomeScreen({
  studentName = 'Zeynep Kaya',
  onLogout,
}: StudentHomeScreenProps) {
  const { colors } = useTheme();

  // Active Bottom Tab: 'home' | 'books' | 'chat' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'books' | 'chat' | 'profile'>('home');

  // Lessons State with reschedule request & required book
  const [lessons, setLessons] = useState<MobileLesson[]>([
    {
      id: 'l-1',
      title: 'AYT Matematik: Türevin Geometrik Yorumu',
      teacher: 'Ahmet Hoca',
      date: '12 Ekim 2026',
      time: '10:00 - 11:30',
      location: 'Yüz Yüze / Çalışma Ofisi',
      status: 'scheduled',
      required_book: 'Orijinal AYT Matematik Soru Bankası',
      reschedule_request: {
        new_date: '13 Ekim 2026',
        new_time: '14:00 - 15:30',
        status: 'pending',
      },
    },
    {
      id: 'l-2',
      title: 'AYT Fizik: Elektrik Alan ve Potansiyel',
      teacher: 'Selin Hoca',
      date: '15 Ekim 2026',
      time: '16:00 - 17:30',
      location: 'Online / Zoom',
      status: 'scheduled',
      required_book: '3D TYT-AYT Fizik Soru Bankası',
      reschedule_request: null,
    },
  ]);

  // Homeworks State
  const [homeworks, setHomeworks] = useState<MobileHomework[]>([
    {
      id: 'hw-1',
      title: 'İntegral Alan Hesabı - Test 7 & 8',
      course: 'Matematik',
      dueDate: '14 Ekim 2026',
      status: 'pending',
      teacher: 'Ahmet Hoca',
      fileUrl: 'https://derspompa.app/files/integral_test_7_8.pdf',
      description: 'Test 7 ve 8 deki eğri altında kalan alan soruları çözülecek. Takıldığınız soruları yuvarlak içine alın.',
    },
    {
      id: 'hw-2',
      title: 'Türev Teğet Denklemi Çözümlü Sorular',
      course: 'Matematik',
      dueDate: '16 Ekim 2026',
      status: 'pending',
      teacher: 'Ahmet Hoca',
      fileUrl: 'https://derspompa.app/files/turev_teget_ozet.pdf',
      description: 'Maksimum-minimum problem alıştırmaları.',
    },
  ]);

  // Bookshelf State
  const [books, setBooks] = useState<MobileBook[]>([
    {
      id: 'b-1',
      title: 'Orijinal AYT Matematik Soru Bankası',
      subject: 'Matematik',
      publisher: 'Orijinal Yayınları',
      topics: ['Türev', 'İntegral', 'Trigonometri', 'Limit'],
    },
    {
      id: 'b-2',
      title: '3D TYT-AYT Fizik Soru Bankası',
      subject: 'Fizik',
      publisher: '3D Yayınları',
      topics: ['Elektrik ve Manyetizma', 'Dalgalar', 'Optik'],
    },
    {
      id: 'b-3',
      title: 'Apotemi Türev Fasikülü',
      subject: 'Matematik',
      publisher: 'Apotemi',
      topics: ['Türev Alma Kuralları', 'Geometrik Yorum'],
    },
  ]);

  // Modal States
  const [activeUploadHw, setActiveUploadHw] = useState<MobileHomework | null>(null);
  const [viewingHwDetail, setViewingHwDetail] = useState<MobileHomework | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isScanningBook, setIsScanningBook] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookSubject, setNewBookSubject] = useState('Matematik');
  const [newBookPublisher, setNewBookPublisher] = useState('');

  // Reschedule Accept/Reject Handlers
  const handleAcceptReschedule = (lessonId: string) => {
    setLessons((prev) =>
      prev.map((l) => {
        if (l.id === lessonId && l.reschedule_request) {
          return {
            ...l,
            date: l.reschedule_request.new_date,
            time: l.reschedule_request.new_time,
            reschedule_request: null,
          };
        }
        return l;
      })
    );
  };

  const handleRejectReschedule = (lessonId: string) => {
    setLessons((prev) =>
      prev.map((l) => {
        if (l.id === lessonId) {
          return {
            ...l,
            reschedule_request: null,
          };
        }
        return l;
      })
    );
  };

  // Homework submit handler
  const handleSubmitSolution = () => {
    if (!activeUploadHw) return;
    setHomeworks((prev) =>
      prev.map((h) =>
        h.id === activeUploadHw.id ? { ...h, status: 'submitted' } : h
      )
    );
    setActiveUploadHw(null);
    setUploadedFile(null);
  };

  // AI Book Scan Simulation / Handler
  const handleScanBookAction = () => {
    setIsScanningBook(true);
    setTimeout(() => {
      setIsScanningBook(false);
      const scannedBook: MobileBook = {
        id: 'b-' + Date.now(),
        title: 'Karakök AYT Geometri Soru Bankası (Taranan Kitap)',
        subject: 'Geometri',
        publisher: 'Karakök Yayınları',
        topics: ['Üçgende Alan', 'Çember ve Daire', 'Analitik Geometri'],
      };
      setBooks((prev) => [scannedBook, ...prev]);
      alert('Yapay Zeka Taraması Başarılı! "Karakök AYT Geometri" kütüphanenize eklendi ✨');
    }, 2000);
  };

  const handleManualAddBook = () => {
    if (!newBookTitle.trim()) return;
    const addedBook: MobileBook = {
      id: 'b-' + Date.now(),
      title: newBookTitle.trim(),
      subject: newBookSubject,
      publisher: newBookPublisher.trim() || 'Özel Yayın',
      topics: ['Genel Konular', 'Soru Bankası'],
    };
    setBooks((prev) => [addedBook, ...prev]);
    setNewBookTitle('');
    setNewBookPublisher('');
    setIsAddBookModalOpen(false);
  };

  // If chat or profile tab is active, render that screen
  if (activeTab === 'chat') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ChatScreen />
        {/* Render Tab Bar */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />
      </View>
    );
  }

  if (activeTab === 'profile') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ProfileScreen studentName={studentName} onLogout={onLogout} />
        {/* Render Tab Bar */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.userInfo}>
          {/* Clean Circular Avatar - NO STORY RING */}
          <View style={[styles.userAvatar, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
              }}
              style={styles.avatarImg}
            />
          </View>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>İyi Günler, {studentName} ✨</Text>
            <Text style={[styles.roleSubtext, { color: colors.textMuted }]}>AYT Sayısal • Boğaziçi Hedefi</Text>
          </View>
        </View>

        {onLogout && (
          <TouchableOpacity
            onPress={onLogout}
            style={[styles.logoutBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
          >
            <Text style={[styles.logoutText, { color: colors.textSecondary }]}>Çıkış</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'home' && (
          <>
            {/* 1. DERS KAYDIRMA (RESCHEDULE) ONAY BİLDİRİM KARTI */}
            {lessons.map(
              (lesson) =>
                lesson.reschedule_request?.status === 'pending' && (
                  <View
                    key={'reschedule-' + lesson.id}
                    style={[styles.rescheduleCard, { backgroundColor: colors.warningBg, borderColor: colors.warning }]}
                  >
                    <View style={styles.rescheduleHeader}>
                      <AlertCircle size={20} color={colors.warning} />
                      <Text style={[styles.rescheduleTitle, { color: colors.warning }]}>
                        Ders Saati Değişiklik Talebi
                      </Text>
                    </View>

                    <Text style={[styles.rescheduleBody, { color: colors.text }]}>
                      <Text style={{ fontWeight: '700' }}>{lesson.teacher}</Text>,{' '}
                      <Text style={{ fontWeight: '600' }}>{lesson.title}</Text> dersini{' '}
                      <Text style={{ fontWeight: '800', color: colors.warning }}>
                        {lesson.reschedule_request.new_date} • {lesson.reschedule_request.new_time}
                      </Text>{' '}
                      olarak güncellemek istiyor.
                    </Text>

                    <View style={styles.rescheduleActions}>
                      <TouchableOpacity
                        style={[styles.rescheduleRejectBtn, { borderColor: colors.border }]}
                        onPress={() => handleRejectReschedule(lesson.id)}
                      >
                        <Text style={[styles.rescheduleRejectText, { color: colors.textMuted }]}>
                          ✕ Reddet
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.rescheduleAcceptBtn, { backgroundColor: colors.success }]}
                        onPress={() => handleAcceptReschedule(lesson.id)}
                      >
                        <Text style={styles.rescheduleAcceptText}>✓ Onayla ve Güncelle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
            )}

            {/* 2. SIRADAKİ DERSİM KARTI (With Required Book Badge) */}
            {lessons[0] && (
              <View style={[styles.nextLessonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.nextLessonBadge}>
                  <Text style={styles.nextLessonBadgeText}>⏳ SIRADAKİ DERSİN • Yarın</Text>
                </View>

                <Text style={[styles.nextLessonTitle, { color: colors.text }]}>
                  {lessons[0].title}
                </Text>

                <View style={styles.lessonMetaRow}>
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Eğitmen</Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>{lessons[0].teacher}</Text>
                  </View>
                  <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Tarih & Saat</Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {lessons[0].date} • {lessons[0].time}
                    </Text>
                  </View>
                </View>

                {/* 📌 HOCANDAN NOT: BU DERSE KİTAP İSTE ROZETİ */}
                {lessons[0].required_book && (
                  <View
                    style={[
                      styles.requiredBookBadge,
                      { backgroundColor: colors.accentBg, borderColor: colors.accentBorder },
                    ]}
                  >
                    <BookOpen size={16} color={colors.accent} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.requiredBookTitle, { color: colors.accent }]}>
                        📌 Hocandan Not:
                      </Text>
                      <Text style={[styles.requiredBookText, { color: colors.accent }]}>
                        Bu derse <Text style={{ fontWeight: '800' }}>{lessons[0].required_book}</Text>{' '}
                        kitabını getir.
                      </Text>
                    </View>
                  </View>
                )}

                <View style={[styles.onlinePill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <MapPin size={13} color={colors.textSecondary} />
                  <Text style={[styles.onlinePillText, { color: colors.textSecondary }]}>
                    {lessons[0].location}
                  </Text>
                </View>
              </View>
            )}

            {/* 3. KALAN DERS KREDİSİ & İLERLEME */}
            <View style={[styles.creditCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.creditHeader}>
                <View>
                  <Text style={[styles.creditLabel, { color: colors.textMuted }]}>Kalan Ders Paketi</Text>
                  <Text style={[styles.creditHours, { color: colors.text }]}>
                    8 <Text style={[styles.creditTotal, { color: colors.textMuted }]}>/ 20 Saat</Text>
                  </Text>
                </View>
                <View style={[styles.creditBadge, { backgroundColor: colors.accentBg }]}>
                  <Text style={[styles.creditBadgeText, { color: colors.accent }]}>%60 Kullanıldı</Text>
                </View>
              </View>

              <View style={[styles.progressBarBg, { backgroundColor: colors.background }]}>
                <View style={[styles.progressBarFill, { backgroundColor: colors.accent, width: '60%' }]} />
              </View>

              <View style={styles.creditFooter}>
                <Text style={[styles.creditFooterText, { color: colors.textMuted }]}>
                  Bu hafta 2 ders tamamlandı (Hedef: 3)
                </Text>
              </View>
            </View>

            {/* 4. TESLİM BEKLEYEN ÖDEVLERİM */}
            <View style={styles.homeworkSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Ödevlerim & Belgeler
                </Text>
                <View style={[styles.countBadge, { backgroundColor: colors.accentBg }]}>
                  <Text style={[styles.countBadgeText, { color: colors.accent }]}>
                    {homeworks.filter((h) => h.status === 'pending').length} Bekliyor
                  </Text>
                </View>
              </View>

              <View style={styles.homeworkList}>
                {homeworks.map((hw) => {
                  const isSubmitted = hw.status === 'submitted';
                  return (
                    <View
                      key={hw.id}
                      style={[styles.hwCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <View style={styles.hwHeader}>
                        <Text style={[styles.hwCourseBadge, { backgroundColor: colors.background, color: colors.text }]}>
                          {hw.course}
                        </Text>
                        <Text
                          style={[
                            styles.hwStatusBadge,
                            isSubmitted
                              ? { backgroundColor: colors.successBg, color: colors.success }
                              : { backgroundColor: colors.warningBg, color: colors.warning },
                          ]}
                        >
                          {isSubmitted ? '✓ Teslim Edildi' : 'Bekliyor'}
                        </Text>
                      </View>

                      <Text style={[styles.hwTitle, { color: colors.text }]}>{hw.title}</Text>
                      <Text style={[styles.hwDueDate, { color: colors.textMuted }]}>
                        📅 Son Teslim: {hw.dueDate}
                      </Text>

                      {/* PDF Dosyası Eki Varsa İnceleme Butonu */}
                      {hw.fileUrl && (
                        <TouchableOpacity
                          style={[styles.hwFileBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                          onPress={() => setViewingHwDetail(hw)}
                          activeOpacity={0.7}
                        >
                          <FileText size={16} color={colors.accent} />
                          <Text style={[styles.hwFileBtnText, { color: colors.accent }]} numberOfLines={1}>
                            Ödev PDF'ini / Soruları Görüntüle
                          </Text>
                        </TouchableOpacity>
                      )}

                      {!isSubmitted ? (
                        <TouchableOpacity
                          style={[styles.hwSubmitButton, { backgroundColor: colors.accent }]}
                          onPress={() => setActiveUploadHw(hw)}
                          activeOpacity={0.8}
                        >
                          <Upload size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={styles.hwSubmitButtonText}>
                            Çözüm Fotoğrafı / PDF Yükle
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={[styles.hwCompletedNotice, { backgroundColor: colors.successBg }]}>
                          <CheckCircle2 size={16} color={colors.success} style={{ marginRight: 6 }} />
                          <Text style={[styles.hwCompletedText, { color: colors.success }]}>
                            Öğretmenin incelemesi bekleniyor ✨
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* 5. AKILLI KİTAPLIK / KAYNAKLARIM SEKMESİ */}
        {activeTab === 'books' && (
          <View style={styles.booksSection}>
            <View style={styles.booksHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Akıllı Kütüphanem 📚
                </Text>
                <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                  Yapay zeka ile taranmış veya eklenmiş TYT/AYT kaynakların
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.scanTriggerBtn, { backgroundColor: colors.accent }]}
                onPress={handleScanBookAction}
                disabled={isScanningBook}
                activeOpacity={0.8}
              >
                {isScanningBook ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Camera size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.scanTriggerText}>Kameradan Tara</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.manualAddBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setIsAddBookModalOpen(true)}
            >
              <Text style={[styles.manualAddText, { color: colors.accent }]}>
                + Manuel Kitap Ekle
              </Text>
            </TouchableOpacity>

            <View style={styles.booksList}>
              {books.map((book) => (
                <View
                  key={book.id}
                  style={[styles.bookCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.bookHeaderRow}>
                    <View style={[styles.bookIconBadge, { backgroundColor: colors.accentBg }]}>
                      <BookOpen size={20} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.bookCardTitle, { color: colors.text }]}>
                        {book.title}
                      </Text>
                      <Text style={[styles.bookCardPublisher, { color: colors.textMuted }]}>
                        {book.publisher} • {book.subject}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.topicsRow}>
                    {book.topics.map((t, idx) => (
                      <View
                        key={idx}
                        style={[styles.topicBadge, { backgroundColor: colors.background, borderColor: colors.border }]}
                      >
                        <Text style={[styles.topicBadgeText, { color: colors.textSecondary }]}>
                          #{t}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FLOATING AI ASSISTANT */}
      <AiStudentAssistant />

      {/* Ödev Detay & PDF Görüntüleme Modalı */}
      <Modal
        visible={!!viewingHwDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setViewingHwDetail(null)}
      >
        <View style={styles.uploadOverlay}>
          <View style={[styles.hwDetailModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.hwDetailModalHeader}>
              <View>
                <Text style={[styles.hwDetailModalCourse, { color: colors.accent }]}>
                  {viewingHwDetail?.course}
                </Text>
                <Text style={[styles.hwDetailModalTitle, { color: colors.text }]}>
                  {viewingHwDetail?.title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setViewingHwDetail(null)}>
                <Text style={{ fontSize: 20, color: colors.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.hwDetailDesc, { color: colors.textSecondary }]}>
              {viewingHwDetail?.description}
            </Text>

            {/* Simüle Edilen PDF Görüntüleyici Kartı */}
            <View style={[styles.pdfViewerCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <FileText size={40} color={colors.accent} />
              <Text style={[styles.pdfFileName, { color: colors.text }]}>
                {viewingHwDetail?.title.replace(/\s+/g, '_').toLowerCase()}.pdf
              </Text>
              <Text style={[styles.pdfFileSize, { color: colors.textMuted }]}>
                PDF Dokümanı • 2 Sayfa • 1.4 MB
              </Text>
              <View style={[styles.pdfMockPage, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Text style={[styles.pdfPageText, { color: colors.textMuted }]}>
                  [ Sayfa 1/2: Soru 1 - 10 Çözüm Şablonu ]
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeDetailBtn, { backgroundColor: colors.accent }]}
              onPress={() => setViewingHwDetail(null)}
            >
              <Text style={styles.closeDetailBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Ödev Çözüm Yükleme Modalı */}
      <Modal
        visible={!!activeUploadHw}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActiveUploadHw(null)}
      >
        <View style={styles.uploadOverlay}>
          <View style={[styles.uploadCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.uploadTitle, { color: colors.text }]}>Ödev Çözümü Yükle</Text>
            <Text style={[styles.uploadSub, { color: colors.textMuted }]}>{activeUploadHw?.title}</Text>

            <TouchableOpacity
              style={[styles.dropZone, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setUploadedFile('cozum_odev_sayfa1_2.pdf')}
            >
              <Upload size={32} color={colors.accent} />
              <Text style={[styles.dropZoneTitle, { color: colors.text }]}>
                {uploadedFile ? uploadedFile : 'Fotoğraf Çek veya Dosya Seç'}
              </Text>
              <Text style={[styles.dropZoneDesc, { color: colors.textMuted }]}>
                PDF, JPEG veya PNG (Maks 15MB)
              </Text>
            </TouchableOpacity>

            <View style={styles.uploadActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setActiveUploadHw(null);
                  setUploadedFile(null);
                }}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Vazgeç</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.accent }]}
                onPress={handleSubmitSolution}
              >
                <Text style={styles.confirmBtnText}>Öğretmene İlet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manuel Kitap Ekle Modalı */}
      <Modal
        visible={isAddBookModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsAddBookModalOpen(false)}
      >
        <View style={styles.uploadOverlay}>
          <View style={[styles.uploadCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.uploadTitle, { color: colors.text }]}>Yeni Kitap Ekle</Text>
            <Text style={[styles.uploadSub, { color: colors.textMuted }]}>
              Öğretmenin bu kitabı görüp derse getirilmesini isteyebilir
            </Text>

            <View style={{ gap: 10, marginTop: 12 }}>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Kitap Adı (örn: Supara AYT Matematik)"
                placeholderTextColor={colors.textMuted}
                value={newBookTitle}
                onChangeText={setNewBookTitle}
              />
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Yayın Evi (örn: Supara Yayınları)"
                placeholderTextColor={colors.textMuted}
                value={newBookPublisher}
                onChangeText={setNewBookPublisher}
              />
            </View>

            <View style={styles.uploadActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsAddBookModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.accent }]}
                onPress={handleManualAddBook}
              >
                <Text style={styles.confirmBtnText}>Kitaplığıma Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BOTTOM TAB NAVIGATION BAR */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />
    </SafeAreaView>
  );
}

// Bottom Tab Navigation Component
function BottomNav({
  activeTab,
  setActiveTab,
  colors,
}: {
  activeTab: string;
  setActiveTab: (t: 'home' | 'books' | 'chat' | 'profile') => void;
  colors: any;
}) {
  return (
    <View style={[styles.bottomNav, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActiveTab('home')}
        activeOpacity={0.7}
      >
        <Calendar size={22} color={activeTab === 'home' ? colors.accent : colors.textMuted} />
        <Text
          style={[
            styles.navLabel,
            { color: activeTab === 'home' ? colors.accent : colors.textMuted },
          ]}
        >
          Dersler
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActiveTab('books')}
        activeOpacity={0.7}
      >
        <BookOpen size={22} color={activeTab === 'books' ? colors.accent : colors.textMuted} />
        <Text
          style={[
            styles.navLabel,
            { color: activeTab === 'books' ? colors.accent : colors.textMuted },
          ]}
        >
          Kitaplığım
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActiveTab('chat')}
        activeOpacity={0.7}
      >
        <MessageSquare size={22} color={activeTab === 'chat' ? colors.accent : colors.textMuted} />
        <Text
          style={[
            styles.navLabel,
            { color: activeTab === 'chat' ? colors.accent : colors.textMuted },
          ]}
        >
          Sohbet
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActiveTab('profile')}
        activeOpacity={0.7}
      >
        <User size={22} color={activeTab === 'profile' ? colors.accent : colors.textMuted} />
        <Text
          style={[
            styles.navLabel,
            { color: activeTab === 'profile' ? colors.accent : colors.textMuted },
          ]}
        >
          Profil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
  },
  roleSubtext: {
    fontSize: 11,
    marginTop: 1,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 24,
  },
  rescheduleCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    gap: 10,
  },
  rescheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rescheduleTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  rescheduleBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  rescheduleActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  rescheduleRejectBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  rescheduleRejectText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rescheduleAcceptBtn: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  rescheduleAcceptText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  nextLessonCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  nextLessonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  nextLessonBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  nextLessonTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  metaDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  requiredBookBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  requiredBookTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  requiredBookText: {
    fontSize: 12,
    marginTop: 1,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  onlinePillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  creditCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  creditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditLabel: {
    fontSize: 12,
  },
  creditHours: {
    fontSize: 22,
    fontWeight: '800',
  },
  creditTotal: {
    fontSize: 14,
    fontWeight: '500',
  },
  creditBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creditBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  creditFooter: {
    alignItems: 'flex-start',
  },
  creditFooterText: {
    fontSize: 11,
  },
  homeworkSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  homeworkList: {
    gap: 12,
  },
  hwCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  hwHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hwCourseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '700',
  },
  hwStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '700',
  },
  hwTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  hwDueDate: {
    fontSize: 11,
  },
  hwFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  hwFileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  hwSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  hwSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  hwCompletedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  hwCompletedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  booksSection: {
    gap: 14,
  },
  booksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  scanTriggerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  manualAddBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  manualAddText: {
    fontSize: 13,
    fontWeight: '700',
  },
  booksList: {
    gap: 10,
  },
  bookCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  bookHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  bookCardPublisher: {
    fontSize: 11,
    marginTop: 2,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  topicBadgeText: {
    fontSize: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  uploadOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  uploadSub: {
    fontSize: 12,
  },
  dropZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  dropZoneTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  dropZoneDesc: {
    fontSize: 11,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  hwDetailModal: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  hwDetailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hwDetailModalCourse: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  hwDetailModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  hwDetailDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  pdfViewerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  pdfFileName: {
    fontSize: 13,
    fontWeight: '700',
  },
  pdfFileSize: {
    fontSize: 11,
  },
  pdfMockPage: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  pdfPageText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  closeDetailBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  closeDetailBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
});
