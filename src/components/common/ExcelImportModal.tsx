'use client';

import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import type { ScheduleEvent, ScheduleEventInsert } from '@/types/database.types';
import {
  parseSpreadsheetOrCSV,
  detectDefaultScheduleMapping,
  validateAndMapScheduleRows,
  downloadScheduleTemplate,
  TURKISH_DAYS,
  EVENT_TYPE_LABELS,
  type ScheduleImportMapping,
  type ValidatedImportItem,
  type ParsedFileResult,
} from '@/lib/services/exportImportService';
import { createBulkScheduleEvents } from '@/lib/services/supabaseService';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  existingEvents: ScheduleEvent[];
  onImportSuccess: (created: ScheduleEvent[]) => void;
}

export function ExcelImportModal({
  isOpen,
  onClose,
  userId,
  existingEvents,
  onImportSuccess,
}: ExcelImportModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedFileResult | null>(null);
  const [mapping, setMapping] = useState<ScheduleImportMapping>({});
  const [validatedItems, setValidatedItems] = useState<ValidatedImportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setParsedData(null);
    setMapping({});
    setValidatedItems([]);
    setErrorMsg(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileSelected = async (selectedFile: File) => {
    setErrorMsg(null);
    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMsg('Lütfen sadece .xlsx, .xls veya .csv uzantılı bir dosya yükleyin.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg('Dosya boyutu 5MB sınırını aşamaz.');
      return;
    }

    setIsLoading(true);
    setFile(selectedFile);

    try {
      const parsed = await parseSpreadsheetOrCSV(selectedFile);
      if (parsed.rows.length === 0) {
        setErrorMsg('Yüklenen dosya boş görünüyor.');
        setIsLoading(false);
        return;
      }

      setParsedData(parsed);
      const detected = detectDefaultScheduleMapping(parsed.headers);
      setMapping(detected);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Dosya işlenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToValidation = () => {
    if (!parsedData) return;
    const validated = validateAndMapScheduleRows(
      parsedData.rows,
      mapping,
      userId,
      existingEvents
    );
    setValidatedItems(validated);
    setStep(3);
  };

  const handleConfirmImport = async () => {
    const validEvents = validatedItems
      .filter((item) => item.isValid)
      .map((item) => item.event);

    if (validEvents.length === 0) {
      alert('İçe aktarılacak geçerli satır bulunamadı.');
      return;
    }

    setIsLoading(true);
    try {
      const created = await createBulkScheduleEvents(validEvents);
      onImportSuccess(created);
      handleClose();
    } catch (e: any) {
      alert('İçe aktarma sırasında hata oluştu: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validCount = validatedItems.filter((i) => i.isValid).length;
  const conflictCount = validatedItems.filter((i) => i.conflicts.length > 0).length;
  const errorCount = validatedItems.filter((i) => !i.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Excel / CSV ile Ders Programı İçe Aktar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Okul çizelgenizi veya etüt takviminizi tek tıkla sisteme yükleyin
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Steps */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>1</span>
            Dosya Yükle
          </div>
          <div className="h-px w-12 bg-slate-300 dark:bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>2</span>
            Sütun Eşleştirme
          </div>
          <div className="h-px w-12 bg-slate-300 dark:bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>3</span>
            Önizleme & Doğrulama
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Upload File */}
          {step === 1 && (
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelected(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-900/30 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Excel veya CSV dosyanızı buraya sürükleyin
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                  .xlsx, .xls veya .csv formatında ders çizelgenizi yükleyin (Maksimum 5 MB).
                </p>
                <span className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 group-hover:bg-indigo-500 transition">
                  Bilgisayarımdan Dosya Seç
                </span>
              </div>

              {/* Sample Templates Download Box */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Hazır Şablon mu Gerekiyor?
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sistemle tam uyumlu örnek haftalık program şablonunu indirip doldurabilirsiniz.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => downloadScheduleTemplate('xlsx')}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => downloadScheduleTemplate('csv')}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV (.csv)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {step === 2 && parsedData && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Dosya: {parsedData.fileName} ({parsedData.rowCount} satır tespit edildi)</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lütfen sütunları sistem alanlarıyla eşleştirin
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'day_of_week', label: 'Gün (Pazartesi .. Pazar)', required: true },
                  { key: 'start_time', label: 'Başlangıç Saati (08:30)', required: true },
                  { key: 'end_time', label: 'Bitiş Saati (09:15)', required: true },
                  { key: 'title', label: 'Ders Adı / Başlık', required: true },
                  { key: 'subject', label: 'Branş / Kategori', required: false },
                  { key: 'event_type', label: 'Etkinlik Türü', required: false },
                  { key: 'location_or_link', label: 'Konum / Link', required: false },
                  { key: 'notes', label: 'Notlar / Açıklama', required: false },
                ].map((field) => (
                  <div
                    key={field.key}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {field.label}
                      </label>
                      {field.required && (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                          Zorunlu
                        </span>
                      )}
                    </div>
                    <select
                      value={(mapping as any)[field.key] || ''}
                      onChange={(e) =>
                        setMapping((prev) => ({
                          ...prev,
                          [field.key]: e.target.value || undefined,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Sütun Seçin --</option>
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Preview & Validation */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Summary Badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                      Geçerli Satırlar
                    </div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-300">
                      {validCount}
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                      Çakışma Uyarısı
                    </div>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-300">
                      {conflictCount}
                    </div>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">
                      Hatalı Satırlar
                    </div>
                    <div className="text-xl font-black text-rose-600 dark:text-rose-300">
                      {errorCount}
                    </div>
                  </div>
                  <XCircle className="w-5 h-5 text-rose-500" />
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Gün</th>
                      <th className="p-3">Saat</th>
                      <th className="p-3">Ders</th>
                      <th className="p-3">Tür</th>
                      <th className="p-3">Durum & Uyarı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {validatedItems.map((item) => (
                      <tr
                        key={item.index}
                        className={
                          !item.isValid
                            ? 'bg-rose-50/50 dark:bg-rose-950/20'
                            : item.conflicts.length > 0
                            ? 'bg-amber-50/50 dark:bg-amber-950/20'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                        }
                      >
                        <td className="p-3 font-mono text-slate-400">{item.index}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          {TURKISH_DAYS[item.event.day_of_week] || `Gün ${item.event.day_of_week}`}
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                          {item.event.start_time} - {item.event.end_time}
                        </td>
                        <td className="p-3 text-slate-900 dark:text-white font-bold">
                          {item.event.title}
                          {item.event.notes && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {item.event.notes}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {EVENT_TYPE_LABELS[item.event.event_type || 'school']}
                          </span>
                        </td>
                        <td className="p-3">
                          {!item.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                              <XCircle className="w-3.5 h-3.5" />
                              {item.errors.join(', ')}
                            </span>
                          ) : item.conflicts.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {item.conflicts.join(', ')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Uygun
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              İptal
            </button>

            {step === 2 && (
              <button
                onClick={handleProceedToValidation}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
              >
                Önizlemeyi Gör
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                disabled={isLoading || validCount === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                {validCount} Dersi Programa Aktar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
