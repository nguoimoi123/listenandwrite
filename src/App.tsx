import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Sparkles, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  FileText, 
  Check, 
  Trash2, 
  PlayCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Zap,
  BookOpen,
  ArrowRight,
  ListRestart,
  Save,
  Download,
  FileDown,
  UploadCloud,
  FolderOpen,
  Maximize2,
  Minimize2,
  Plus,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Info,
  RefreshCw,
  Target
} from 'lucide-react';
import { computeWordDiff, calculateAccuracy, DiffToken } from './utils/diff';
import { getLocalLessons, saveLocalLesson, deleteLocalLesson, SavedLesson, initDB } from './utils/db';
import { initAuth, googleSignIn, logout } from './utils/firebaseAuth';
import { 
  gdriveFindFile, 
  gdriveReadFileText, 
  gdriveReadFileBlob, 
  gdriveSaveFile, 
  gdriveDeleteFile, 
  gdriveCreateFolder,
  gdriveListFolders
} from './utils/gdrive';
import VocabularyModule from './components/VocabularyModule';
import PartOfSpeechDrill from './components/PartOfSpeechDrill';
import { TOEIC_VOCABULARY_VERSION, toeicVocabulary } from './data/toeicVocabulary';

interface PracticeHistory {
  id: string;
  lessonTitle: string;
  accuracy: number;
  wordCount: number;
  date: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
  translate: string;
  example: string;
  exampleTranslate: string;
  category: string;
  box: number; // Leitner box (1 to 5)
  tags: string[];
}

const getInitialVocabularyWords = (): VocabularyWord[] => {
  const savedVersion = localStorage.getItem('lw_vocabulary_seed_version');

  if (savedVersion !== TOEIC_VOCABULARY_VERSION) {
    localStorage.setItem('lw_vocabulary_seed_version', TOEIC_VOCABULARY_VERSION);
    localStorage.setItem('lw_v_words', JSON.stringify(toeicVocabulary));
    return toeicVocabulary;
  }

  const saved = localStorage.getItem('lw_v_words');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error(e);
    }
  }

  return toeicVocabulary;
};

export default function App() {
  // Navigation Module Selector
  const [activeModule, setActiveModule] = useState<'listenwrite' | 'vocabulary' | 'partsOfSpeech'>('listenwrite');

  // Vocabulary Feature States
  const [vocabWords, setVocabWords] = useState<VocabularyWord[]>(getInitialVocabularyWords);

  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [vocabSearchQuery, setVocabSearchQuery] = useState<string>('');
  const [vocabFilterCategory, setVocabFilterCategory] = useState<string>('All');
  const [vocabFilterBox, setVocabFilterBox] = useState<number | 'All'>('All');
  
  // Quiz states
  const [quizScore, setQuizScore] = useState<{correct: number; total: number} | null>(null);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState<{
    word: VocabularyWord;
    options: string[];
    correctIndex: number;
    selectedIndex: number | null;
    isRevealed: boolean;
  } | null>(null);

  // Add Vocab modals/states
  const [showAddVocabForm, setShowAddVocabForm] = useState<boolean>(false);
  const [newWord, setNewWord] = useState<string>('');
  const [newPhonetic, setNewPhonetic] = useState<string>('');
  const [newDefinition, setNewDefinition] = useState<string>('');
  const [newTranslate, setNewTranslate] = useState<string>('');
  const [newExample, setNewExample] = useState<string>('');
  const [newExampleTranslate, setNewExampleTranslate] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('General');
  const [newTags, setNewTags] = useState<string>('');

  // Mode selection & Setup state
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string>('');
  const [customTranscriptText, setCustomTranscriptText] = useState<string>('');
  const [isTranscriptVisible, setIsTranscriptVisible] = useState<boolean>(true);
  const [customTranslateText, setCustomTranslateText] = useState<string>('');
  const [customTitleText, setCustomTitleText] = useState<string>('');
  
  // Custom workspace connection screen helper bypass
  const [useBrowserDatabaseFallback, setUseBrowserDatabaseFallback] = useState<boolean>(true); // Bypassed startup shield by default so the workspace loads immediately out-of-the-box!

  // Storage preference states: 'local' | 'gdrive' | 'db' (Browser Database indexedDB fallback)
  const [storageMode, setStorageMode] = useState<'local' | 'gdrive' | 'db'>(() => {
    return (localStorage.getItem('lw_storage_mode') as any) || 'db';
  });

  // Google Drive Authentication states
  const [gdriveUser, setGDriveUser] = useState<any>(null);
  const [gdriveToken, setGDriveToken] = useState<string | null>(null);
  const [gdriveFolderId, setGDriveFolderId] = useState<string>(() => {
    return localStorage.getItem('lw_gdrive_folder_id') || '';
  });
  const [gdriveFolderName, setGDriveFolderName] = useState<string>(() => {
    return localStorage.getItem('lw_gdrive_folder_name') || '';
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Custom Google Drive custom folder selector states
  const [isGDriveFolderModalOpen, setIsGDriveFolderModalOpen] = useState<boolean>(false);
  const [gdriveFoldersList, setGDriveFoldersList] = useState<any[]>([]);
  const [isGdriveFoldersLoading, setIsGdriveFoldersLoading] = useState<boolean>(false);
  const [newGDriveFolderNameInput, setNewGDriveFolderNameInput] = useState<string>('');

  // Reconnection persistence states
  const [savedDirInfo, setSavedDirInfo] = useState<{ handle: any; name: string } | null>(null);

  // Batch Upload / Advanced Import states
  const [creationTab, setCreationTab] = useState<'single' | 'bulk'>('single');
  const [matchedLessonsList, setMatchedLessonsList] = useState<Array<{
    id: string;
    title: string;
    audioFile: File | null;
    textFile: File | null;
    status: 'both' | 'audio_only' | 'text_only';
    transcript: string;
  }>>([]);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    activeName: string;
    isSlow: boolean;
  } | null>(null);

  // Lesson sidebar Search query
  const [lessonSearchQuery, setLessonSearchQuery] = useState<string>('');

  // Collapsing and UI Optimization states (Zen Focus & Compression)
  const [isCreatorCollapsed, setIsCreatorCollapsed] = useState<boolean>(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState<boolean>(false);
  const [isBannerClosed, setIsBannerClosed] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Sub-tabs in Batch Import View
  const [bulkUploadSubTab, setBulkUploadSubTab] = useState<'auto' | 'manual'>('auto');

  // Manual Batch Creator row list state
  const [manualBatchRows, setManualBatchRows] = useState<Array<{
    id: string;
    title: string;
    audioFile: File | null;
    transcriptText: string;
    translateText: string;
  }>>([
    {
      id: `manual-0`,
      title: 'Bài luyện nghe 1',
      audioFile: null,
      transcriptText: '',
      translateText: ''
    }
  ]);

  // States for Notebook Zoom & Word Glossary Lookup
  const [notebookFontSize, setNotebookFontSize] = useState<number>(16);
  const [isNotebookZoomed, setIsNotebookZoomed] = useState<boolean>(false);
  const [lookupWord, setLookupWord] = useState<string>('');

  // Input Transcript and typing input states
  const [sourceTranscript, setSourceTranscript] = useState<string>('');
  const [studentText, setStudentText] = useState<string>('');
  const transcriptSegments = sourceTranscript
    .split(/(?<=[.!?])\s+|\n+/)
    .map(segment => segment.trim())
    .filter(Boolean);
  const [selectedTtsSegmentIndex, setSelectedTtsSegmentIndex] = useState<number>(0);

  // Player States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingAudioSeekRef = useRef<number | null>(null);

  // Web Speech API Synthesis state fallback for Custom Text without Audio Upload
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRequestIdRef = useRef(0);
  const [isSynthPlaying, setIsSynthPlaying] = useState<boolean>(false);

  // Verification result states
  const [evaluationResult, setEvaluationResult] = useState<{
    accuracy: number;
    diffs: DiffToken[];
    correctCount: number;
    missingCount: number;
    extraCount: number;
  } | null>(null);
  const [isEvaluationChecked, setIsEvaluationChecked] = useState<boolean>(false);

  // Saved practice logs list in LocalStorage (Initialized to empty, free of mock data!)
  const [practiceLogs, setPracticeLogs] = useState<PracticeHistory[]>(() => {
    const saved = localStorage.getItem('dictation_practice_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Track global listening count (Defaults to 0!)
  const [listenCount, setListenCount] = useState<number>(() => {
    const saved = localStorage.getItem('dictation_listen_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Custom lessons stored in IndexedDB virtual file system or connected local workspace folder
  const [localLessons, setLocalLessons] = useState<SavedLesson[]>([]);
  const [selectedLocalLessonId, setSelectedLocalLessonId] = useState<string>('');
  
  // File System Access Directory connection handle
  const [localDirectoryHandle, setLocalDirectoryHandle] = useState<any>(null);
  const [localDirectoryName, setLocalDirectoryName] = useState<string>('');

  // Persist flashcards to memory (and local folder if active)
  useEffect(() => {
    localStorage.setItem('lw_v_words', JSON.stringify(vocabWords));
    if (localDirectoryHandle) {
      saveVocabToDirectory(localDirectoryHandle, vocabWords);
    }
  }, [vocabWords, localDirectoryHandle]);

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Notebook styling & zoom states
  const [notebookZoom, setNotebookZoom] = useState<number>(1.2); // Default to 1.2x zoom for notebook paper comfort
  const [selectedNotebookWord, setSelectedNotebookWord] = useState<string>('');

  const handleSpeakWord = (word: string) => {
    if (!word) return;
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'“’\[\]]/g, "").trim();
    if (!cleanWord) return;
    setSelectedNotebookWord(cleanWord);
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanWord);
        utterance.lang = "en-US";
        utterance.rate = 0.8; // Clear, slow paced pronunciation helper
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("TTS failed for word:", cleanWord, e);
    }
  };

  // --- IndexedDB Persistance functions for directory handle ---
  const saveDirectoryToIndexedDB = async (handle: any) => {
    try {
      const db = await initDB();
      const transaction = db.transaction('custom_lessons', 'readwrite');
      const store = transaction.objectStore('custom_lessons');
      const payload = {
        id: 'system_directory_meta_handle',
        title: 'Active Folder Handle Connection metadata',
        transcript: handle.name,
        translate: 'system_record',
        audioBlob: handle, // Storing FileSystemDirectoryHandle directly in browser DB is standard and supported in Chrome
        fileName: handle.name,
        date: new Date().toLocaleDateString('vi-VN')
      };
      await store.put(payload);
    } catch (err) {
      console.warn("Could not save directory handle reference to IndexedDB:", err);
    }
  };

  const saveVocabToDirectory = async (handle: any, words: VocabularyWord[]) => {
    if (!handle) return;
    try {
      const fileHandle = await handle.getFileHandle('vocabulary.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(words, null, 2));
      await writable.close();
      console.log('Saved vocabulary to directory');
    } catch (err) {
      console.warn("Could not save vocabulary to directory handle:", err);
    }
  };

  const getSavedDirectoryFromIndexedDB = async (): Promise<any | null> => {
    try {
      const db = await initDB();
      return new Promise((resolve) => {
        const transaction = db.transaction('custom_lessons', 'readonly');
        const store = transaction.objectStore('custom_lessons');
        const request = store.get('system_directory_meta_handle');
        request.onsuccess = () => {
          const res = request.result;
          if (res && res.audioBlob && typeof res.audioBlob.getFileHandle === 'function') {
            resolve(res.audioBlob);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (err) {
      return null;
    }
  };

  const removeSavedDirectoryFromIndexedDB = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction('custom_lessons', 'readwrite');
      const store = transaction.objectStore('custom_lessons');
      await store.delete('system_directory_meta_handle');
    } catch (err) {}
  };

  // Helper to sync lessons from a selected directory
  const syncDirectoryLessons = async (dirHandle: any) => {
    let manifestFileExists = false;
    let lessonsList: any[] = [];
    try {
      const fileHandle = await dirHandle.getFileHandle('lessons_manifest.json');
      const file = await fileHandle.getFile();
      const text = await file.text();
      lessonsList = JSON.parse(text);
      manifestFileExists = true;
    } catch (err) {
      console.log("Không tìm thấy manifest file cũ, chuẩn bị tạo mới...", err);
    }

    if (!manifestFileExists) {
      try {
        const fileHandle = await dirHandle.getFileHandle('lessons_manifest.json', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify([], null, 2));
        await writable.close();
      } catch (writeErr) {
        console.error("Không thể ghi file cấu hình gốc:", writeErr);
      }
    }

    // Load logs too inside history folder
    let logsList: any[] = [];
    let countValue = 0;
    try {
      const historyDirHandle = await dirHandle.getDirectoryHandle('history', { create: true });
      let logsFileHandle;
      try {
        logsFileHandle = await historyDirHandle.getFileHandle('practice_logs.json');
      } catch (noHistFile) {
        // If not found in history folder, check if it exists at root
        try {
          const rootLogsFileHandle = await dirHandle.getFileHandle('practice_logs.json');
          // Migrate root to history
          const rootFile = await rootLogsFileHandle.getFile();
          const rootText = await rootFile.text();
          // Write to history
          logsFileHandle = await historyDirHandle.getFileHandle('practice_logs.json', { create: true });
          const writable = await logsFileHandle.createWritable();
          await writable.write(rootText);
          await writable.close();
          // Try to remove root file
          try {
            await dirHandle.removeEntry('practice_logs.json');
            console.log("Đã chuyển file practice_logs.json vào thư mục history và xóa bản cũ ở thư mục gốc.");
          } catch (delErr) {
            console.warn("Đã sao chép nhưng không thể xóa file cũ ở thư mục gốc:", delErr);
          }
        } catch (noRootFile) {
          // Both do not exist, lets throw to trigger fallback/creation
          throw noHistFile;
        }
      }

      const logsFile = await logsFileHandle.getFile();
      const logsText = await logsFile.text();
      const parsedLogs = JSON.parse(logsText);
      if (parsedLogs) {
        if (Array.isArray(parsedLogs.logs)) {
          logsList = parsedLogs.logs;
        }
        if (typeof parsedLogs.listenCount === 'number') {
          countValue = parsedLogs.listenCount;
        }
      }
    } catch (err) {
      console.log("Không tìm thấy file logs rèn luyện");
    }

    setLocalLessons(lessonsList);
    setPracticeLogs(logsList.length > 0 ? logsList : practiceLogs);
    setListenCount(countValue || listenCount);

    // Load vocabulary list from connected directory
    try {
      const vocabFileHandle = await dirHandle.getFileHandle('vocabulary.json');
      const file = await vocabFileHandle.getFile();
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setVocabWords(parsed);
        console.log("Đã tải thành công từ vựng từ thư mục reconnection!");
      }
    } catch (err) {
      console.log("Không tìm thấy tệp vocabulary.json trong thư mục reconnection");
    }

    if (lessonsList.length > 0) {
      await loadLocalLessonIntoWorkspace(lessonsList[0], dirHandle);
    } else {
      setSelectedLocalLessonId('');
      setCustomTranscriptText('');
      setCustomTranslateText('');
      handleClearCustomAudio();
    }
  };

  const handleReconnectDirectory = async () => {
    if (!savedDirInfo) return;
    try {
      const opts = { mode: 'readwrite' };
      if ((await savedDirInfo.handle.queryPermission(opts)) === 'granted') {
        setLocalDirectoryHandle(savedDirInfo.handle);
        setLocalDirectoryName(savedDirInfo.name);
        await syncDirectoryLessons(savedDirInfo.handle);
      } else if ((await savedDirInfo.handle.requestPermission(opts)) === 'granted') {
        setLocalDirectoryHandle(savedDirInfo.handle);
        setLocalDirectoryName(savedDirInfo.name);
        await syncDirectoryLessons(savedDirInfo.handle);
      } else {
        alert("⚠️ Bạn đã từ chối cấp quyền. Vui lòng kết nối thủ công bằng cách click chọn thư mục.");
      }
    } catch (e: any) {
      console.error("Lỗi phục hồi kết nối thư mục:", e);
      alert("⚠️ Không thể tự động kết nối lại thư mục. Vui lòng nhấn 'Đồng bộ Thư mục (Local Folder)' để chọn lại.");
    }
  };

  // Setup Google Drive and Folder Helper
  const autoSetupGDriveFolder = async (token: string) => {
    try {
      let folder = await gdriveFindFile(token, 'ListenWrite Hub');
      let folderId = folder?.id;
      
      if (!folderId) {
        folderId = await gdriveCreateFolder(token, 'ListenWrite Hub');
        console.log("Đã khởi tạo thư mục 'ListenWrite Hub' mới trên Drive có ID:", folderId);
      } else {
        console.log("Đã tìm thấy thư mục 'ListenWrite Hub' cũ trên Drive có ID:", folderId);
      }

      setGDriveFolderId(folderId);
      setGDriveFolderName('ListenWrite Hub');
      localStorage.setItem('lw_gdrive_folder_id', folderId);
      localStorage.setItem('lw_gdrive_folder_name', 'ListenWrite Hub');
      setStorageMode('gdrive');
      localStorage.setItem('lw_storage_mode', 'gdrive');

      await syncGDriveLessons(token, folderId);
    } catch (e: any) {
      console.error("Lỗi khởi chạy thư mục Google Drive:", e);
      alert(`⚠️ Không thể khởi tạo thư mục lưu trữ bài học trên Google Drive của bạn: ${e.message || e}`);
    }
  };

  const syncGDriveLessons = async (token: string, folderId: string) => {
    try {
      const manifestFile = await gdriveFindFile(token, 'lessons_manifest.json', folderId);
      let lessonsList: SavedLesson[] = [];
      if (manifestFile) {
        try {
          const content = await gdriveReadFileText(token, manifestFile.id);
          lessonsList = JSON.parse(content);
          if (!Array.isArray(lessonsList)) lessonsList = [];
        } catch (e) {
          lessonsList = [];
        }
      }

      setLocalLessons(lessonsList);

      if (lessonsList.length > 0) {
        await loadLocalLessonIntoWorkspace(lessonsList[0]);
      } else {
        setSelectedLocalLessonId('');
        setCustomTranscriptText('');
        setCustomTranslateText('');
        handleClearCustomAudio();
      }

      // Sync Practice logs
      const historyFile = await gdriveFindFile(token, 'practice_logs.json', folderId);
      if (historyFile) {
        try {
          const rawHistoryText = await gdriveReadFileText(token, historyFile.id);
          const data = JSON.parse(rawHistoryText);
          if (data && Array.isArray(data.logs)) {
            setPracticeLogs(data.logs);
            localStorage.setItem('dictation_practice_logs', JSON.stringify(data.logs));
            if (typeof data.listenCount === 'number') {
              setListenCount(data.listenCount);
              localStorage.setItem('dictation_listen_count', data.listenCount.toString());
            }
          }
        } catch (hErr) {
          console.error("Lỗi đồng bộ lịch sử luyện tập từ GDrive:", hErr);
        }
      }
    } catch (err) {
      console.error("Lỗi kết nối tệp tin Google Drive:", err);
      throw err;
    }
  };

  const openGDriveFolderSelector = async (token: string) => {
    setIsGdriveFoldersLoading(true);
    setIsGDriveFolderModalOpen(true);
    try {
      const folders = await gdriveListFolders(token);
      setGDriveFoldersList(folders);
    } catch (err: any) {
      console.error("Lỗi lấy danh sách thư mục GDrive:", err);
      const message = err.message || String(err);
      if (message.includes('403') || message.includes('insufficient authentication scopes')) {
        alert("⚠️ Tài khoản Google chưa cấp đủ quyền Drive cho ứng dụng.\n\nHãy bấm Đăng xuất Google Drive, sau đó Kết nối Google Drive lại và chọn Allow/Cho phép ở màn hình cấp quyền.");
      } else {
        alert("⚠️ Không thể lấy danh sách thư mục từ Google Drive: " + message);
      }
    } finally {
      setIsGdriveFoldersLoading(false);
    }
  };

  const handleChooseGDriveFolder = async (folderId: string, folderName: string, tokenOverride?: string) => {
    const activeToken = tokenOverride || gdriveToken;
    if (!activeToken) {
      alert("⚠️ Chưa có quyền truy cập Google Drive. Vui lòng đăng nhập Google lại rồi chọn thư mục.");
      return;
    }
    try {
      setGDriveFolderId(folderId);
      setGDriveFolderName(folderName);
      localStorage.setItem('lw_gdrive_folder_id', folderId);
      localStorage.setItem('lw_gdrive_folder_name', folderName);
      setStorageMode('gdrive');
      localStorage.setItem('lw_storage_mode', 'gdrive');

      await syncGDriveLessons(activeToken, folderId);
      setIsGDriveFolderModalOpen(false);
    } catch (err: any) {
      console.error("Lỗi đồng bộ thư mục chọn:", err);
      alert("⚠️ Có lỗi khi đồng bộ bài học từ thư mục này: " + (err.message || err));
    }
  };

  const handleCreateAndChooseGDriveFolder = async () => {
    if (!gdriveToken) return;
    const name = newGDriveFolderNameInput.trim();
    if (!name) {
      alert("⚠️ Vui lòng nhập tên thư mục cần tạo!");
      return;
    }
    setIsGdriveFoldersLoading(true);
    try {
      const newFolderId = await gdriveCreateFolder(gdriveToken, name);
      setNewGDriveFolderNameInput('');
      
      // Update list
      const folders = await gdriveListFolders(gdriveToken);
      setGDriveFoldersList(folders);

      // Automatically select the new folder
      await handleChooseGDriveFolder(newFolderId, name, gdriveToken);
    } catch (err: any) {
      console.error("Lỗi tạo thư mục mới trên Drive:", err);
      alert("⚠️ Không thể tạo thư mục mới trên Google Drive: " + (err.message || err));
    } finally {
      setIsGdriveFoldersLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isAuthLoading) return;

    setIsAuthLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGDriveUser(result.user);
        setGDriveToken(result.accessToken);
        await openGDriveFolderSelector(result.accessToken);
      }
    } catch (err: any) {
      console.error("Lỗi đăng nhập Google pop-up:", err);
      const isPopupClosed = err?.code === 'auth/popup-closed-by-user' || 
                            err?.message?.includes('popup-closed-by-user') ||
                            err?.message?.includes('closed-by-user');

      if (isPopupClosed) {
        alert("ℹ️ Cửa sổ đăng nhập Google đã được đóng lại. Bạn có thể nhấn nút 'ĐỒNG BỘ GOOGLE DRIVE' bất cứ khi nào sẵn sàng để tiếp tục kết nối lưu trữ đám mây! ☁️");
      } else if (isIframe) {
        alert("⚠️ Không thể mở cửa sổ Google đăng nhập do hạn chế bảo mật của Khung xem trước (iframe).\nVui lòng nhấp nút '🚀 MỞ TAB MỚI TOÀN MÀN HÌNH' ở thanh góc phải để hoạt động trơn tru!");
      } else {
        alert(`⚠️ Đăng nhập Google thất bại: ${err.message || err}`);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setGDriveUser(null);
      setGDriveToken(null);
      setGDriveFolderId('');
      setGDriveFolderName('');
      localStorage.removeItem('lw_gdrive_folder_id');
      localStorage.removeItem('lw_gdrive_folder_name');
      setStorageMode('db');
      localStorage.setItem('lw_storage_mode', 'db');

      const lessons = await getLocalLessons();
      const filtered = lessons.filter(l => l.id !== 'system_directory_meta_handle');
      setLocalLessons(filtered);
      if (filtered.length > 0) {
        loadLocalLessonIntoWorkspace(filtered[0]);
      } else {
        setSelectedLocalLessonId('');
        setCustomTranscriptText('');
        setCustomTranslateText('');
        handleClearCustomAudio();
      }
      alert("Đã ngắt kết nối Google Drive và tải dữ liệu lưu trữ từ Bộ nhớ Trình duyệt (IndexedDB)!");
    } catch (err: any) {
      console.error("Lỗi đăng xuất:", err);
    }
  };

  const saveVocabToGDrive = async (token: string, folderId: string, words: VocabularyWord[]) => {
    try {
      await gdriveSaveFile(token, folderId, 'vocabulary.json', JSON.stringify(words, null, 2), 'application/json');
    } catch (err) {
      console.error("Lỗi ghi từ vựng GDrive:", err);
    }
  };

  const syncHistoryDataToStorage = async (logs: PracticeHistory[], count: number) => {
    if (storageMode === 'gdrive' && gdriveToken && gdriveFolderId) {
      try {
        await gdriveSaveFile(gdriveToken, gdriveFolderId, 'practice_logs.json', JSON.stringify({ logs, listenCount: count }, null, 2), 'application/json');
      } catch (err) {
        console.error("Lỗi đồng bộ lịch sử đám mây:", err);
      }
    } else if (localDirectoryHandle) {
      try {
        const historyDir = await localDirectoryHandle.getDirectoryHandle('history', { create: true });
        const fileHandle = await historyDir.getFileHandle('practice_logs.json', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify({ logs, listenCount: count }, null, 2));
        await writable.close();
      } catch (err) {
        console.error("Lỗi đồng bộ lịch sử máy tính:", err);
      }
    } else {
      localStorage.setItem('dictation_practice_logs', JSON.stringify(logs));
      localStorage.setItem('dictation_listen_count', count.toString());
    }
  };

  useEffect(() => {
    // 1. Listen for Firebase Google Auth state change for Google Drive Sync
    const unsubscribeAuth = initAuth(
      async (user, token) => {
        setGDriveUser(user);
        setGDriveToken(token);
        console.log("🔥 Đăng nhập Google thành công:", user.displayName);

        const savedFolderId = localStorage.getItem('lw_gdrive_folder_id');
        const savedFolderName = localStorage.getItem('lw_gdrive_folder_name');
        if (savedFolderId && savedFolderName) {
          setGDriveFolderId(savedFolderId);
          setGDriveFolderName(savedFolderName);
          try {
            await syncGDriveLessons(token, savedFolderId);
          } catch (err: any) {
            console.error("Không thể kết nối lại thư mục Google Drive đã lưu:", err);
            setGDriveFolderId('');
            setGDriveFolderName('');
            localStorage.removeItem('lw_gdrive_folder_id');
            localStorage.removeItem('lw_gdrive_folder_name');
            alert("⚠️ Không thể mở lại thư mục Google Drive đã chọn trước đó. Vui lòng bấm Đồng bộ Google Drive và chọn lại thư mục.\n\nChi tiết: " + (err.message || err));
          }
        }
      },
      () => {
        setGDriveUser(null);
        setGDriveToken(null);
        console.log("🔥 Người dùng chưa đăng nhập Google.");
      }
    );

    // 2. Check if there is any previously saved directory handle
    getSavedDirectoryFromIndexedDB().then(savedHandle => {
      if (savedHandle) {
        setSavedDirInfo({ handle: savedHandle, name: savedHandle.name });
      }
    });

    // 3. Load local stored custom lessons from IndexedDB on startup
    getLocalLessons().then(lessons => {
      const filtered = lessons.filter(l => l.id !== 'system_directory_meta_handle');
      if (filtered.length > 0 && storageMode === 'db') {
        setLocalLessons(filtered);
        loadLocalLessonIntoWorkspace(filtered[0]);
      }
    }).catch(err => {
      console.error("IndexedDB fetch error:", err);
    });

    return () => {
      unsubscribeAuth();
    };
  }, [storageMode]);

  const loadLocalLessonIntoWorkspace = async (lesson: SavedLesson, dirHandleOverride?: any) => {
    const activeDirHandle = dirHandleOverride !== undefined ? dirHandleOverride : localDirectoryHandle;
    setSelectedLocalLessonId(lesson.id);
    setCustomTitleText(lesson.title);
    setCustomTranscriptText(lesson.transcript);
    setIsTranscriptVisible(false); // Hide the transcript automatically when a lesson is loaded for dictation practice
    setCustomTranslateText(lesson.translate);
    
    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
    }
    
    if (storageMode === 'gdrive' && gdriveToken && gdriveFolderId) {
      // Load audio from Google Drive if audioFileName exists
      if ((lesson as any).audioFileName) {
        try {
          const audioFile = await gdriveFindFile(gdriveToken, (lesson as any).audioFileName, gdriveFolderId);
          if (audioFile) {
            const blob = await gdriveReadFileBlob(gdriveToken, audioFile.id);
            const file = new File([blob], lesson.fileName || (lesson as any).audioFileName, { type: blob.type || 'audio/mpeg' });
            setCustomAudioFile(file);
            const newUrl = URL.createObjectURL(file);
            setCustomAudioUrl(newUrl);
          } else {
            setCustomAudioFile(null);
            setCustomAudioUrl('');
          }
        } catch (err) {
          console.error("Lỗi đọc tệp tin âm thanh từ Google Drive:", err);
          setCustomAudioFile(null);
          setCustomAudioUrl('');
        }
      } else {
        setCustomAudioFile(null);
        setCustomAudioUrl('');
      }
    } else if (activeDirHandle && (lesson as any).audioFileName) {
      // Check if it is connected to a local workspace folder and has an audio file key
      try {
        const fileHandle = await activeDirHandle.getFileHandle((lesson as any).audioFileName);
        const file = await fileHandle.getFile();
        setCustomAudioFile(file);
        const newUrl = URL.createObjectURL(file);
        setCustomAudioUrl(newUrl);
      } catch (err) {
        console.error("Lỗi đọc tệp tin âm thanh trực tiếp từ thư mục local máy tính:", err);
        if (lesson.audioBlob) {
          setCustomAudioFile(new File([lesson.audioBlob], lesson.fileName, { type: lesson.audioBlob.type }));
          setCustomAudioUrl(URL.createObjectURL(lesson.audioBlob));
        } else {
          setCustomAudioFile(null);
          setCustomAudioUrl('');
        }
      }
    } else if (lesson.audioBlob) {
      setCustomAudioFile(new File([lesson.audioBlob], lesson.fileName, { type: lesson.audioBlob.type }));
      const newUrl = URL.createObjectURL(lesson.audioBlob);
      setCustomAudioUrl(newUrl);
    } else {
      setCustomAudioFile(null);
      setCustomAudioUrl('');
    }
    stopAnyPlayback();
  };

  const handleSelectLocalDirectory = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert("⚠️ Trình duyệt của bạn chưa hỗ trợ File System Access API. Vui lòng sử dụng Google Chrome, Microsoft Edge hoặc Opera phiên bản mới nhất.");
        return;
      }
      // Ask user to pick the folder
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      setLocalDirectoryHandle(dirHandle);
      setLocalDirectoryName(dirHandle.name);

      let manifestFileExists = false;
      let lessonsList: any[] = [];
      try {
        const fileHandle = await dirHandle.getFileHandle('lessons_manifest.json');
        const file = await fileHandle.getFile();
        const text = await file.text();
        lessonsList = JSON.parse(text);
        manifestFileExists = true;
      } catch (err) {
        console.log("Không tìm thấy manifest file cũ, chuẩn bị tạo mới...", err);
      }

      if (!manifestFileExists) {
        try {
          const fileHandle = await dirHandle.getFileHandle('lessons_manifest.json', { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(JSON.stringify([], null, 2));
          await writable.close();
        } catch (writeErr) {
          console.error("Không thể ghi file cấu hình gốc:", writeErr);
        }
      }

      // Load practice history & listen count from directory
      let logsList: any[] = [];
      let countValue = 0;
      let logsFileExists = false;
      try {
        const historyDirHandle = await dirHandle.getDirectoryHandle('history', { create: true });
        let logsFileHandle;
        try {
          logsFileHandle = await historyDirHandle.getFileHandle('practice_logs.json');
        } catch (noHistFile) {
          // If not found in history folder, check if it exists at root
          try {
            const rootLogsFileHandle = await dirHandle.getFileHandle('practice_logs.json');
            // Migrate root to history
            const rootFile = await rootLogsFileHandle.getFile();
            const rootText = await rootFile.text();
            // Write to history
            logsFileHandle = await historyDirHandle.getFileHandle('practice_logs.json', { create: true });
            const writable = await logsFileHandle.createWritable();
            await writable.write(rootText);
            await writable.close();
            // Try to remove root file
            try {
              await dirHandle.removeEntry('practice_logs.json');
              console.log("Đã chuyển file practice_logs.json vào thư mục history và xóa bản cũ ở thư mục gốc.");
            } catch (delErr) {
              console.warn("Đã sao chép nhưng không thể xóa file cũ ở thư mục gốc:", delErr);
            }
          } catch (noRootFile) {
            // Both do not exist, lets throw to trigger fallback/creation
            throw noHistFile;
          }
        }

        const logsFile = await logsFileHandle.getFile();
        const logsText = await logsFile.text();
        const parsedLogs = JSON.parse(logsText);
        if (parsedLogs) {
          if (Array.isArray(parsedLogs.logs)) {
            logsList = parsedLogs.logs;
          }
          if (typeof parsedLogs.listenCount === 'number') {
            countValue = parsedLogs.listenCount;
          }
          logsFileExists = true;
        }
      } catch (err) {
        console.log("Không tìm thấy file lịch sử logs rèn luyện, chuẩn bị tạo mới...", err);
      }

      if (!logsFileExists) {
        try {
          const historyDirHandle = await dirHandle.getDirectoryHandle('history', { create: true });
          const logsFileHandle = await historyDirHandle.getFileHandle('practice_logs.json', { create: true });
          const writable = await logsFileHandle.createWritable();
          await writable.write(JSON.stringify({ logs: practiceLogs, listenCount: listenCount }, null, 2));
          await writable.close();
          logsList = practiceLogs;
          countValue = listenCount;
        } catch (writeErr) {
          console.error("Không thể tạo file logs đồng bộ ở thư mục history:", writeErr);
        }
      }

      setLocalLessons(lessonsList);
      setPracticeLogs(logsList);
      setListenCount(countValue);

      // Load vocabulary list from connected directory
      try {
        const vocabFileHandle = await dirHandle.getFileHandle('vocabulary.json');
        const file = await vocabFileHandle.getFile();
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setVocabWords(parsed);
          console.log("Đã tải thành công từ vựng từ thư mục!");
        }
      } catch (err) {
        console.log("Không tìm thấy tệp vocabulary.json trong thư mục, sẽ tự động tạo khi thêm từ vựng.");
      }

      // Save directory handle reference to IndexedDB for seamless auto-restores
      await saveDirectoryToIndexedDB(dirHandle);

      if (lessonsList.length > 0) {
        await loadLocalLessonIntoWorkspace(lessonsList[0], dirHandle);
      } else {
        setSelectedLocalLessonId('');
        setCustomTranscriptText('');
        setCustomTranslateText('');
        handleClearCustomAudio();
      }
      alert(`🎉 Đã kết nối & đồng bộ thành công thư mục máy tính: "${dirHandle.name}"!\nLịch sử và các bài học của bạn đã được tải lên thành công.`);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('User cancelled directory picker');
        return;
      }
      if (e.name === 'SecurityError' || (e.message && (e.message.toLowerCase().includes('origin') || e.message.toLowerCase().includes('sub frame') || e.message.toLowerCase().includes('iframe') || e.message.toLowerCase().includes('picker')))) {
        alert("⚠️ Hạn Chế Bảo Mật Xem Trước (Iframe Context):\n\nTrình duyệt không cho phép mở hộp thoại chọn thư mục máy tính (showDirectoryPicker) trực tiếp từ bên trong khung xem trước (Iframe) để đảm bảo an toàn bảo mật.\n\n👉 VUI LÒNG bấm vào nút \"Mở ở tab mới\" (Open in a new tab) ở phía trên bên phải của AI Studio để mở ứng dụng toàn màn hình. Khi đó, tính năng lưu/tải trực tiếp từ Thư Mục Máy Tính của bạn sẽ hoạt động mượt mà và an toàn hoàn hảo!");
        return;
      }
      console.error(e);
      alert("⚠️ Không thể kết nối với thư mục máy tính: " + e.message);
    }
  };

  const handleDisconnectLocalDirectory = async () => {
    setLocalDirectoryHandle(null);
    setLocalDirectoryName('');
    setSavedDirInfo(null);
    
    // Clear persisted directory handle reference from IndexedDB
    await removeSavedDirectoryFromIndexedDB();
    
    // Reload standard backup list from IndexedDB and local storage fallback
    const savedLogs = localStorage.getItem('dictation_practice_logs');
    const savedCount = localStorage.getItem('dictation_listen_count');
    setPracticeLogs(savedLogs ? JSON.parse(savedLogs) : []);
    setListenCount(savedCount ? parseInt(savedCount, 10) : 0);

    getLocalLessons().then(lessons => {
      const filtered = lessons.filter(l => l.id !== 'system_directory_meta_handle');
      setLocalLessons(filtered);
      if (filtered.length > 0) {
        loadLocalLessonIntoWorkspace(filtered[0], null);
      } else {
        setSelectedLocalLessonId('');
        setCustomTranscriptText('');
        setCustomTranslateText('');
        handleClearCustomAudio();
      }
      alert("ℹ️ Đã ngắt kết nối thư mục máy tính. Đang dùng tạm bộ nhớ trình duyệt IndexedDB mặc định.");
    }).catch(err => {
      console.error("IndexedDB fetch error during disconnect:", err);
    });
  };

  // Fetch active configurations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    setSourceTranscript(customTranscriptText || '');
    // Clean states on topic shift
    setStudentText('');
    setEvaluationResult(null);
    setIsEvaluationChecked(false);
    setSelectedTtsSegmentIndex(0);
    stopAnyPlayback();
  }, [customTranscriptText, customTranslateText]);

  // Handle custom audio drag & upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (customAudioUrl) {
        URL.revokeObjectURL(customAudioUrl);
      }
      setCustomAudioFile(file);
      setCustomAudioUrl(URL.createObjectURL(file));
      stopAnyPlayback();
      
      // Auto-prefill the title if it's currently empty
      if (!customTitleText.trim()) {
        const titleWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setCustomTitleText(titleWithoutExt);
      }
    }
  };

  const handleClearCustomAudio = () => {
    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
    }
    setCustomAudioFile(null);
    setCustomAudioUrl('');
    stopAnyPlayback();
  };

  // Sound Engine Controls
  const stopAnyPlayback = () => {
    // Stop native html5 audio
    if (audioRef.current) {
      audioRef.current.pause();
      if (Number.isFinite(audioRef.current.duration) || audioRef.current.readyState > 0) {
        audioRef.current.currentTime = 0;
      }
    }
    setIsPlaying(false);
    setCurrentTime(0);

    // Stop browser TTS vocal synth
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSynthPlaying(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    pendingAudioSeekRef.current = null;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (audio) {
      audio.pause();
      if (audio.readyState > 0) {
        audio.currentTime = 0;
      }
      audio.playbackRate = playSpeed;
      audio.load();
    }
  }, [customAudioUrl]);

  const startSynthPlayback = (text: string) => {
    const synth = synthRef.current;
    const speakText = text.trim();
    if (!synth) {
      alert("Thiết bị của bạn không hỗ trợ công cụ đọc văn bản SpeechSynthesis.");
      return;
    }
    if (!speakText) {
      alert("Chưa có nội dung transcript để đọc.");
      return;
    }

    const requestId = synthRequestIdRef.current + 1;
    synthRequestIdRef.current = requestId;
    synth.cancel();
    setIsSynthPlaying(false);

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = 'en-US';
    utterance.rate = playSpeed;

    utterance.onend = () => {
      if (synthRequestIdRef.current === requestId) {
        setIsSynthPlaying(false);
      }
    };

    utterance.onerror = (e) => {
      console.error("Synth error:", e);
      if (synthRequestIdRef.current === requestId) {
        setIsSynthPlaying(false);
      }
    };

    utteranceRef.current = utterance;
    window.setTimeout(() => {
      if (synthRequestIdRef.current !== requestId) return;
      synth.speak(utterance);
      setIsSynthPlaying(true);
    }, 0);
    setListenCount(prev => {
      const next = prev + 1;
      syncHistoryDataToStorage(practiceLogs, next);
      return next;
    });
  };

  const playTtsSegment = (index: number) => {
    if (transcriptSegments.length === 0) {
      alert("Chưa có đoạn transcript để đọc.");
      return;
    }
    const safeIndex = Math.min(Math.max(index, 0), transcriptSegments.length - 1);
    setSelectedTtsSegmentIndex(safeIndex);
    startSynthPlayback(transcriptSegments[safeIndex]);
  };

  const playRandomTtsSegment = () => {
    if (transcriptSegments.length === 0) {
      alert("Chưa có đoạn transcript để đọc.");
      return;
    }
    playTtsSegment(Math.floor(Math.random() * transcriptSegments.length));
  };

  const togglePlayback = () => {
    // If we have custom audio file loaded
    if (customAudioUrl) {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        if (audio.ended || (Number.isFinite(audio.duration) && audio.currentTime >= audio.duration - 0.05)) {
          audio.currentTime = 0;
          setCurrentTime(0);
        }
        audio.playbackRate = playSpeed;
        audio.play()
          .then(() => {
            setIsPlaying(true);
            setListenCount(prev => {
              const next = prev + 1;
              syncHistoryDataToStorage(practiceLogs, next);
              return next;
            });
          })
          .catch(err => {
            console.error("Audio play failed:", err);
            alert("Trình duyệt chặn phát âm thanh tự động. Vui lòng bấm lại nút Phát!");
          });
      }
    } else {
      // Use web speech synthesis (TTS) to speak the active source English Transcript!
      const synth = synthRef.current;
      if (!synth) {
        alert("Thiết bị của bạn không hỗ trợ công cụ đọc văn bản SpeechSynthesis.");
        return;
      }

      if (isSynthPlaying) {
        synth.cancel();
        setIsSynthPlaying(false);
      } else {
        synth.cancel(); // safety reset

        const speakText = sourceTranscript;
        const utterance = new SpeechSynthesisUtterance(speakText);
        utterance.lang = 'en-US';
        utterance.rate = playSpeed;

        utterance.onend = () => {
          setIsSynthPlaying(false);
        };

        utterance.onerror = (e) => {
          console.error("Synth error:", e);
          setIsSynthPlaying(false);
        };

        utteranceRef.current = utterance;
        synth.speak(utterance);
        setIsSynthPlaying(true);
        setListenCount(prev => {
          const next = prev + 1;
          syncHistoryDataToStorage(practiceLogs, next);
          return next;
        });
      }
    }
  };

  // Rewind or Fast Forward buttons for custom MP3 or synth re-trigger
  const handleJumpTime = (seconds: number) => {
    if (customAudioUrl && audioRef.current) {
      const audio = audioRef.current;
      let newTime = audio.currentTime + seconds;
      if (newTime < 0) newTime = 0;
      if (Number.isFinite(audio.duration) && newTime > audio.duration) newTime = audio.duration;
      pendingAudioSeekRef.current = newTime;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      // Re-trigger synthesis to help listen again
      if (synthRef.current) {
        synthRef.current.cancel();
        setIsSynthPlaying(false);
        setTimeout(() => togglePlayback(), 100);
      }
    }
  };

  // Seek position on timeline
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const safeDuration = Number.isFinite(audio.duration) ? audio.duration : duration;
      const safeTime = safeDuration ? Math.min(Math.max(time, 0), safeDuration) : Math.max(time, 0);
      pendingAudioSeekRef.current = safeTime;
      audio.currentTime = safeTime;
      setCurrentTime(safeTime);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaySpeed(speed);
    if (customAudioUrl && audioRef.current) {
      audioRef.current.playbackRate = speed;
    } else if (isSynthPlaying && synthRef.current && utteranceRef.current) {
      // Stop and restart with new speed
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(sourceTranscript);
      utterance.lang = 'en-US';
      utterance.rate = speed;
      utterance.onend = () => setIsSynthPlaying(false);
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    }
  };

  // Compare & Evaluation Trigger
  const handleCheckEvaluation = () => {
    if (!studentText.trim()) {
      alert("Vui lòng gõ nội dung tiếng Anh bạn nghe được trước khi chấm điểm!");
      return;
    }

    const accuracy = calculateAccuracy(sourceTranscript, studentText);
    const diffs = computeWordDiff(sourceTranscript, studentText);

    const correctCount = diffs.filter(d => d.type === 'correct').length;
    const missingCount = diffs.filter(d => d.type === 'missing').length;
    const extraCount = diffs.filter(d => d.type === 'extra').length;

    setEvaluationResult({
      accuracy,
      diffs,
      correctCount,
      missingCount,
      extraCount
    });
    setIsEvaluationChecked(true);

    // Save state to logs history
    const activeTitle = customAudioFile ? customAudioFile.name : 'Văn bản học tập';

    const newLog: PracticeHistory = {
      id: `log-${Date.now()}`,
      lessonTitle: activeTitle,
      accuracy,
      wordCount: studentText.split(/\s+/).filter(Boolean).length,
      date: new Date().toLocaleDateString('vi-VN')
    };

    const updatedLogs = [newLog, ...practiceLogs].slice(0, 8); // Keep top 8 records
    setPracticeLogs(updatedLogs);
    
    syncHistoryDataToStorage(updatedLogs, listenCount);
  };

  // Save custom lesson to local virtual list in IndexedDB / Local Folder / Google Drive
  const handleSaveToLocalList = async () => {
    const isGDriveActive = storageMode === 'gdrive' && gdriveToken && gdriveFolderId;
    if (!localDirectoryHandle && !isGDriveActive) {
      alert("⚠️ Hành động bị chặn: Bạn cần Kết nối Thư mục Máy tính hoặc Google Drive để bắt đầu lưu bài học!");
      return;
    }
    if (!customTranscriptText.trim()) {
      alert("Vui lòng điền văn bản gốc tiếng Anh trước khi lưu!");
      return;
    }
    const title = customTitleText.trim() || (customAudioFile 
      ? customAudioFile.name.replace(/\.[^/.]+$/, "") 
      : "Bài nghe " + new Date().toLocaleDateString('vi-VN') + " " + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    
    const lessonId = `custom-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('vi-VN');

    if (isGDriveActive) {
      // 1. Google Drive Unified Mode!
      try {
        let audioFileName = '';
        if (customAudioFile) {
          const ext = customAudioFile.name.split('.').pop() || 'mp3';
          audioFileName = `audio_${lessonId}.${ext}`;
          await gdriveSaveFile(gdriveToken, gdriveFolderId, audioFileName, customAudioFile, customAudioFile.type || 'audio/mpeg');
        }

        const newLessonMeta: SavedLesson & { audioFileName?: string } = {
          id: lessonId,
          title: title,
          transcript: customTranscriptText,
          translate: customTranslateText || 'Chưa chuẩn bị bản dịch tiếng Việt học thuật.',
          audioBlob: null,
          fileName: customAudioFile ? customAudioFile.name : '',
          audioFileName: audioFileName,
          date: dateStr
        };

        const manifestFile = await gdriveFindFile(gdriveToken, 'lessons_manifest.json', gdriveFolderId);
        let currentLessons = [];
        if (manifestFile) {
          try {
            const text = await gdriveReadFileText(gdriveToken, manifestFile.id);
            currentLessons = JSON.parse(text);
            if (!Array.isArray(currentLessons)) currentLessons = [];
          } catch (e) {
            currentLessons = [];
          }
        }

        currentLessons.push(newLessonMeta);

        await gdriveSaveFile(gdriveToken, gdriveFolderId, 'lessons_manifest.json', JSON.stringify(currentLessons, null, 2), 'application/json');

        setLocalLessons(currentLessons);
        setSelectedLocalLessonId(lessonId);
         
        setCustomAudioFile(null);
        setCustomAudioUrl('');
        setCustomTitleText('');
        setCustomTranscriptText('');
        setCustomTranslateText('');

        alert(`🎉 Đồng bộ cơ sở dữ liệu đám mây thành công!\nTệp tin âm thanh và văn bản gốc đã được lưu vào Google Drive thư mục "${gdriveFolderName}".`);
      } catch (err: any) {
        console.error("Lỗi đồng bộ hóa Google Drive:", err);
        alert(`⚠️ Có lỗi xảy ra khi lưu tệp tin lên Google Drive: ${err.message || err}`);
      }
    } else if (localDirectoryHandle) {
      // 1. Direct Local Folder Database Mode!
      try {
        let audioFileName = '';
        if (customAudioFile) {
          const ext = customAudioFile.name.split('.').pop() || 'mp3';
          audioFileName = `audio_${lessonId}.${ext}`;
          
          const audioFileHandle = await localDirectoryHandle.getFileHandle(audioFileName, { create: true });
          const writable = await audioFileHandle.createWritable();
          await writable.write(customAudioFile);
          await writable.close();
        }

        const newLessonMeta: SavedLesson & { audioFileName?: string } = {
          id: lessonId,
          title: title,
          transcript: customTranscriptText,
          translate: customTranslateText || 'Chưa chuẩn bị bản dịch tiếng Việt học thuật.',
          audioBlob: null, // Saved on disk, not in browser memory db
          fileName: customAudioFile ? customAudioFile.name : '',
          audioFileName: audioFileName,
          date: dateStr
        };

        // read existing from lessons_manifest.json
        const manifestHandle = await localDirectoryHandle.getFileHandle('lessons_manifest.json', { create: true });
        let currentLessons = [];
        try {
          const file = await manifestHandle.getFile();
          const text = await file.text();
          currentLessons = JSON.parse(text);
          if (!Array.isArray(currentLessons)) currentLessons = [];
        } catch (e) {
          currentLessons = [];
        }

        currentLessons.push(newLessonMeta);

        // write updated index file back to disk
        const writableManifest = await manifestHandle.createWritable();
        await writableManifest.write(JSON.stringify(currentLessons, null, 2));
        await writableManifest.close();

        // Sync with UI
        setLocalLessons(currentLessons);
        setSelectedLocalLessonId(lessonId);
        
        // Reset single form states on successful save
        setCustomAudioFile(null);
        setCustomAudioUrl('');
        setCustomTitleText('');
        setCustomTranscriptText('');
        setCustomTranslateText('');

        alert(`🎉 Đồng bộ cơ sở dữ liệu thành công!\nTệp tin âm thanh và văn bản gốc đã được lưu vào thư mục "${localDirectoryName}".`);
      } catch (err: any) {
        console.error("Lỗi đồng bộ hóa thư mục máy tính local:", err);
        alert(`⚠️ Có lỗi xảy ra khi ghi file vào thư mục máy tính: ${err.message || err}\nHãy chắc chắn bạn đã cấp quyền ghi tệp tin cho trình duyệt.`);
      }
    } else {
      // 2. Standard Browser Fallback (IndexedDB)
      const newLesson: SavedLesson = {
        id: lessonId,
        title: title,
        transcript: customTranscriptText,
        translate: customTranslateText || 'Chưa chuẩn bị bản dịch tiếng Việt học thuật.',
        audioBlob: customAudioFile ? customAudioFile : null,
        fileName: customAudioFile ? customAudioFile.name : '',
        date: dateStr
      };

      try {
        await saveLocalLesson(newLesson);
        const updated = await getLocalLessons();
        const filtered = updated.filter(l => l.id !== 'system_directory_meta_handle');
        setLocalLessons(filtered);
        setSelectedLocalLessonId(newLesson.id);

        // Reset single form states on successful save
        setCustomAudioFile(null);
        setCustomAudioUrl('');
        setCustomTitleText('');
        setCustomTranscriptText('');
        setCustomTranslateText('');

        alert("🎉 Đã lưu bài học thành công vào Bộ nhớ Trình duyệt (IndexedDB)!");
      } catch (err) {
        console.error(err);
        alert("Lỗi khi ghi tệp vào IndexedDB!");
      }
    }
  };

  // Update currently selected lesson in local directory or fallback DB or Google Drive
  const handleUpdateSelectedLesson = async () => {
    const isGDriveActive = storageMode === 'gdrive' && gdriveToken && gdriveFolderId;
    if (!localDirectoryHandle && !isGDriveActive) {
      alert("⚠️ Hành động bị chặn: Bạn cần Kết nối Thư mục Máy tính hoặc Google Drive để cập nhật bài học!");
      return;
    }
    if (!selectedLocalLessonId) {
      alert("⚠️ Vui lòng chọn một bài học trong Playlist trước khi bấm cập nhật!");
      return;
    }
    if (!customTranscriptText.trim()) {
      alert("Vui lòng điền văn bản gốc tiếng Anh trước khi cập nhật!");
      return;
    }

    const title = customTitleText.trim() || (customAudioFile 
      ? customAudioFile.name.replace(/\.[^/.]+$/, "") 
      : "Bài cập nhật " + new Date().toLocaleDateString('vi-VN'));

    if (isGDriveActive) {
      try {
        const existingIndex = localLessons.findIndex(l => l.id === selectedLocalLessonId);
        if (existingIndex === -1) {
          alert("Không tìm thấy bài học đang chọn trong Google Drive!");
          return;
        }

        const existingLesson = localLessons[existingIndex];
        let audioFileName = (existingLesson as any).audioFileName || '';

        // Check if there is a new audio file or changed
        if (customAudioFile && customAudioFile.name !== existingLesson.fileName) {
          const ext = customAudioFile.name.split('.').pop() || 'mp3';
          audioFileName = `audio_${selectedLocalLessonId}.${ext}`;
          await gdriveSaveFile(gdriveToken, gdriveFolderId, audioFileName, customAudioFile, customAudioFile.type || 'audio/mpeg');
        }

        const updatedLessonMeta: SavedLesson & { audioFileName?: string } = {
          ...existingLesson,
          title: title,
          transcript: customTranscriptText,
          translate: customTranslateText || 'Chưa chuẩn bị bản dịch tiếng Việt học thuật.',
          fileName: customAudioFile ? customAudioFile.name : (existingLesson.fileName || ''),
          audioFileName: audioFileName
        };

        const updatedLessons = [...localLessons];
        updatedLessons[existingIndex] = updatedLessonMeta;

        // write updated manifest file back to Google Drive
        await gdriveSaveFile(gdriveToken, gdriveFolderId, 'lessons_manifest.json', JSON.stringify(updatedLessons, null, 2), 'application/json');

        // Sync with UI
        setLocalLessons(updatedLessons);

        alert(`🎉 Đã cập nhật thành công bài học "${title}" trên Google Drive!`);
      } catch (err: any) {
        console.error("Lỗi cập nhật bài học GDrive:", err);
        alert(`⚠️ Có lỗi xảy ra khi cập nhật tệp tin trên Google Drive: ${err.message || err}`);
      }
    } else if (localDirectoryHandle) {
      try {
        const existingIndex = localLessons.findIndex(l => l.id === selectedLocalLessonId);
        if (existingIndex === -1) {
          alert("Không tìm thấy bài học đang chọn trong thư mục gốc!");
          return;
        }

        const existingLesson = localLessons[existingIndex];
        let audioFileName = (existingLesson as any).audioFileName || '';

        // Check if there is a new audio file or changed
        if (customAudioFile && customAudioFile.name !== existingLesson.fileName) {
          const ext = customAudioFile.name.split('.').pop() || 'mp3';
          audioFileName = `audio_${selectedLocalLessonId}.${ext}`;
          
          const audioFileHandle = await localDirectoryHandle.getFileHandle(audioFileName, { create: true });
          const writable = await audioFileHandle.createWritable();
          await writable.write(customAudioFile);
          await writable.close();
        }

        const updatedLessonMeta: SavedLesson & { audioFileName?: string } = {
          ...existingLesson,
          title: title,
          transcript: customTranscriptText,
          translate: customTranslateText || 'Chưa chuẩn bị bản dịch tiếng Việt học thuật.',
          fileName: customAudioFile ? customAudioFile.name : (existingLesson.fileName || ''),
          audioFileName: audioFileName
        };

        const updatedLessons = [...localLessons];
        updatedLessons[existingIndex] = updatedLessonMeta;

        // write updated index file back to disk
        const manifestHandle = await localDirectoryHandle.getFileHandle('lessons_manifest.json', { create: true });
        const writableManifest = await manifestHandle.createWritable();
        await writableManifest.write(JSON.stringify(updatedLessons, null, 2));
        await writableManifest.close();

        // Sync with UI
        setLocalLessons(updatedLessons);

        alert(`🎉 Đã cập nhật thành công bài học "${title}" trong dự án của bạn!`);
      } catch (err: any) {
        console.error("Lỗi cập nhật bài học:", err);
        alert(`⚠️ Có lỗi xảy ra khi cập nhật tệp tin: ${err.message || err}`);
      }
    } else {
      // IndexedDB Fallback update
      try {
        const existingIndex = localLessons.findIndex(l => l.id === selectedLocalLessonId);
        if (existingIndex === -1) {
          alert("Không tìm thấy bài học tương ứng trong danh sách cập nhật!");
          return;
        }
        const existingLesson = localLessons[existingIndex];
        const updatedLesson: SavedLesson = {
          ...existingLesson,
          title: title,
          transcript: customTranscriptText,
          translate: customTranslateText || 'Chưa chuẩn bị bản dịch tiếng Việt học thuật.',
          audioBlob: customAudioFile ? customAudioFile : existingLesson.audioBlob,
          fileName: customAudioFile ? customAudioFile.name : (existingLesson.fileName || ''),
        };

        await saveLocalLesson(updatedLesson);
        const updated = await getLocalLessons();
        const filtered = updated.filter(l => l.id !== 'system_directory_meta_handle');
        setLocalLessons(filtered);

        alert(`🎉 Đã cập nhật thành công bài học "${title}" vào bộ nhớ trình duyệt!`);
      } catch (err) {
        console.error(err);
        alert("Lỗi khi ghi tệp cập nhật vào IndexedDB!");
      }
    }
  };

  // Preview local .txt file inside single creator's transcript textarea
  const handleTextFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setCustomTranscriptText(event.target.result);
          // auto title if empty
          if (!customTitleText.trim()) {
            const cleanName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
            setCustomTitleText(cleanName.replace(/[_-]/g, ' '));
          }
        }
      };
      reader.readAsText(selectedFile, 'UTF-8');
    }
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve((e.target?.result as string) || '');
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsText(file, 'UTF-8');
    });
  };

  const handleBulkFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const fileGroupMap: { [key: string]: {
      id: string;
      title: string;
      audioFile: File | null;
      textFile: File | null;
      transcript: string;
    }} = {};

    for (const file of files) {
      const nameParts = file.name.split('.');
      const ext = nameParts.pop()?.toLowerCase() || '';
      const baseName = nameParts.join('.');
      const normalizedBaseKey = baseName.trim().toLowerCase();

      if (!fileGroupMap[normalizedBaseKey]) {
        fileGroupMap[normalizedBaseKey] = {
          id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: baseName,
          audioFile: null,
          textFile: null,
          transcript: ''
        };
      }

      if (['mp3', 'wav', 'm4a', 'ogg', 'webm', 'aac', 'flac'].includes(ext)) {
        fileGroupMap[normalizedBaseKey].audioFile = file;
      } else if (ext === 'txt') {
        fileGroupMap[normalizedBaseKey].textFile = file;
        try {
          const text = await readTextFile(file);
          fileGroupMap[normalizedBaseKey].transcript = text;
        } catch (err) {
          console.error("Lỗi đọc văn bản:", file.name, err);
        }
      }
    }

    const list = Object.values(fileGroupMap).map((item) => {
      let status: 'both' | 'audio_only' | 'text_only' = 'audio_only';
      if (item.audioFile && item.textFile) {
        status = 'both';
      } else if (item.audioFile) {
        status = 'audio_only';
      } else if (item.textFile) {
        status = 'text_only';
      }
      return {
        ...item,
        status
      };
    });

    setMatchedLessonsList(list);
  };

  const handleStartBulkImport = async () => {
    const isGDriveActive = storageMode === 'gdrive' && gdriveToken && gdriveFolderId;
    if (!localDirectoryHandle && !isGDriveActive) {
      alert("⚠️ Hành động bị chặn: Bạn cần Kết nối Thư mục Máy tính hoặc Google Drive để bắt đầu nạp tệp hàng loạt!");
      return;
    }
    if (matchedLessonsList.length === 0) {
      alert("Chưa có tệp dữ liệu nào được phát hiện để nạp!");
      return;
    }

    setImportProgress({
      current: 0,
      total: matchedLessonsList.length,
      activeName: '',
      isSlow: false
    });

    const dateStr = new Date().toLocaleDateString('vi-VN');
    const importedLessons: SavedLesson[] = [];

    if (isGDriveActive) {
      // Mode: Google Drive Cloud Sync
      try {
        const manifestFile = await gdriveFindFile(gdriveToken, 'lessons_manifest.json', gdriveFolderId);
        let currentLessons = [];
        if (manifestFile) {
          try {
            const text = await gdriveReadFileText(gdriveToken, manifestFile.id);
            currentLessons = JSON.parse(text);
            if (!Array.isArray(currentLessons)) currentLessons = [];
          } catch (e) {
            currentLessons = [];
          }
        }

        let idx = 0;
        for (const item of matchedLessonsList) {
          idx++;
          const lessonId = `custom-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
          setImportProgress({
            current: idx,
            total: matchedLessonsList.length,
            activeName: item.title,
            isSlow: idx > 3
          });

          let audioFileName = '';
          if (item.audioFile) {
            const ext = item.audioFile.name.split('.').pop() || 'mp3';
            audioFileName = `audio_${lessonId}.${ext}`;
            await gdriveSaveFile(gdriveToken, gdriveFolderId, audioFileName, item.audioFile, item.audioFile.type || 'audio/mpeg');
          }

          const newLessonMeta: SavedLesson & { audioFileName?: string } = {
            id: lessonId,
            title: item.title,
            transcript: item.transcript || 'Chưa chuẩn bị transcript học tập.',
            translate: 'Bản dịch học tập tiếng Việt sẽ được bổ sung sau.',
            audioBlob: null,
            fileName: item.audioFile ? item.audioFile.name : '',
            audioFileName: audioFileName,
            date: dateStr
          };

          currentLessons.push(newLessonMeta);
          importedLessons.push(newLessonMeta);
        }

        // Save manifest to Google Drive
        await gdriveSaveFile(gdriveToken, gdriveFolderId, 'lessons_manifest.json', JSON.stringify(currentLessons, null, 2), 'application/json');

        setLocalLessons(currentLessons);
        setMatchedLessonsList([]);
        setImportProgress(null);

        if (importedLessons.length > 0) {
          await loadLocalLessonIntoWorkspace(importedLessons[0]);
        }
        alert(`🎉 Đồng bộ cơ sở dữ liệu đám mây hàng loạt thành công!\nĐã lưu và đồng bộ ${importedLessons.length} bài học mới vào Google Drive thư mục "${gdriveFolderName}".`);
      } catch (err: any) {
        console.error("Lỗi đồng bộ bulk Google Drive:", err);
        setImportProgress(null);
        alert(`⚠️ Có lỗi xảy ra khi lưu tệp tin hàng loạt lên Google Drive: ${err.message || err}`);
      }
    } else if (localDirectoryHandle) {
      // Mode: PC Local Folder
      try {
        const manifestHandle = await localDirectoryHandle.getFileHandle('lessons_manifest.json', { create: true });
        let currentLessons: any[] = [];
        try {
          const file = await manifestHandle.getFile();
          const text = await file.text();
          currentLessons = JSON.parse(text);
          if (!Array.isArray(currentLessons)) currentLessons = [];
        } catch (e) {
          currentLessons = [];
        }

        let idx = 0;
        for (const item of matchedLessonsList) {
          idx++;
          const lessonId = `custom-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
          setImportProgress({
            current: idx,
            total: matchedLessonsList.length,
            activeName: item.title,
            isSlow: idx > 3
          });

          let audioFileName = '';
          if (item.audioFile) {
            const ext = item.audioFile.name.split('.').pop() || 'mp3';
            audioFileName = `audio_${lessonId}.${ext}`;
            const audioFileHandle = await localDirectoryHandle.getFileHandle(audioFileName, { create: true });
            const writable = await audioFileHandle.createWritable();
            await writable.write(item.audioFile);
            await writable.close();
          }

          const newLessonMeta: any = {
            id: lessonId,
            title: item.title,
            transcript: item.transcript || 'Chưa chuẩn bị transcript học tập.',
            translate: 'Bản dịch học tập tiếng Việt sẽ được bổ sung sau.',
            audioBlob: null,
            fileName: item.audioFile ? item.audioFile.name : '',
            audioFileName: audioFileName,
            date: dateStr
          };

          currentLessons.push(newLessonMeta);
          importedLessons.push(newLessonMeta);
        }

        const writableManifest = await manifestHandle.createWritable();
        await writableManifest.write(JSON.stringify(currentLessons, null, 2));
        await writableManifest.close();

        setLocalLessons(currentLessons);
        setMatchedLessonsList([]);
        setImportProgress(null);

        if (importedLessons.length > 0) {
          await loadLocalLessonIntoWorkspace(importedLessons[0]);
        }
        alert(`🎉 Nhập hàng loạt thành công!\nĐã lưu và đồng bộ ${importedLessons.length} bài học mới vào thư mục rèn luyện của máy tính.`);
      } catch (err: any) {
        console.error("Lỗi đồng bộ bulk PC folder:", err);
        setImportProgress(null);
        alert(`⚠️ Có lỗi xảy ra khi đồng bộ hàng loạt vào thư mục ngoại tuyến: ${err.message || err}`);
      }
    } else {
      // Mode: IndexedDB Browser Storage Fallback
      try {
        let idx = 0;
        for (const item of matchedLessonsList) {
          idx++;
          const lessonId = `custom-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
          setImportProgress({
            current: idx,
            total: matchedLessonsList.length,
            activeName: item.title,
            isSlow: false
          });

          const dbLesson: SavedLesson = {
            id: lessonId,
            title: item.title,
            transcript: item.transcript || 'Chưa chuẩn bị transcript học tập.',
            translate: 'Bản dịch học tập tiếng Việt sẽ được bổ sung sau.',
            audioBlob: item.audioFile,
            fileName: item.audioFile ? item.audioFile.name : '',
            date: dateStr
          };

          await saveLocalLesson(dbLesson);
          importedLessons.push(dbLesson);
        }

        const updated = await getLocalLessons();
        const filtered = updated.filter(l => l.id !== 'system_directory_meta_handle');
        setLocalLessons(filtered);
        setMatchedLessonsList([]);
        setImportProgress(null);

        if (importedLessons.length > 0) {
          await loadLocalLessonIntoWorkspace(importedLessons[0]);
        }
        alert(`🎉 Nhập hàng loạt vào bộ nhớ trình duyệt thành công!\nĐã nạp ${importedLessons.length} bài học mới vào playlist.`);
      } catch (err: any) {
        console.error("Lỗi đồng bộ bulk IndexedDB:", err);
        setImportProgress(null);
        alert(`⚠️ Lỗi khi lưu bài học hàng loạt vào bộ nhớ trình duyệt: ${err.message || err}`);
      }
    }
  };

  // --- Handlers for Manual Batch Uploader rows ---
  const handleAddManualRow = () => {
    setManualBatchRows(prev => [
      ...prev,
      {
        id: `manual-${Date.now()}-${prev.length}`,
        title: `Bài luyện nghe ${prev.length + 1}`,
        audioFile: null,
        transcriptText: '',
        translateText: ''
      }
    ]);
  };

  const handleRemoveManualRow = (id: string) => {
    setManualBatchRows(prev => {
      const filtered = prev.filter(row => row.id !== id);
      return filtered;
    });
  };

  const handleUpdateManualRow = (id: string, field: 'title' | 'transcriptText' | 'translateText', value: string) => {
    setManualBatchRows(prev =>
      prev.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleManualRowAudioUpload = (id: string, file: File | null) => {
    setManualBatchRows(prev =>
      prev.map(row => (row.id === id ? { ...row, audioFile: file } : row))
    );
  };

  const handleStartManualBulkImport = async () => {
    const isGDriveActive = storageMode === 'gdrive' && gdriveToken && gdriveFolderId;
    if (!localDirectoryHandle && !isGDriveActive) {
      alert("⚠️ Hành động bị chặn: Bạn cần Kết nối Thư mục Máy tính hoặc Google Drive để thêm các bài học thủ công!");
      return;
    }
    // Filter out rows that are entirely empty in transcript
    const validRows = manualBatchRows.filter(row => row.transcriptText.trim().length > 0);
    if (validRows.length === 0) {
      alert("Vui lòng nhập văn bản Transcript tiếng Anh gốc cho ít nhất một bài học!");
      return;
    }

    setImportProgress({
      current: 0,
      total: validRows.length,
      activeName: '',
      isSlow: false
    });

    const dateStr = new Date().toLocaleDateString('vi-VN');
    const importedLessons: SavedLesson[] = [];

    if (isGDriveActive) {
      // Mode: Google Drive Cloud Sync
      try {
        const manifestFile = await gdriveFindFile(gdriveToken, 'lessons_manifest.json', gdriveFolderId);
        let currentLessons = [];
        if (manifestFile) {
          try {
            const text = await gdriveReadFileText(gdriveToken, manifestFile.id);
            currentLessons = JSON.parse(text);
            if (!Array.isArray(currentLessons)) currentLessons = [];
          } catch (e) {
            currentLessons = [];
          }
        }

        let idx = 0;
        for (const item of validRows) {
          idx++;
          const lessonId = `custom-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
          setImportProgress({
            current: idx,
            total: validRows.length,
            activeName: item.title,
            isSlow: idx > 2
          });

          let audioFileName = '';
          if (item.audioFile) {
            const ext = item.audioFile.name.split('.').pop() || 'mp3';
            audioFileName = `audio_${lessonId}.${ext}`;
            await gdriveSaveFile(gdriveToken, gdriveFolderId, audioFileName, item.audioFile, item.audioFile.type || 'audio/mpeg');
          }

          const newLessonMeta: SavedLesson & { audioFileName?: string } = {
            id: lessonId,
            title: item.title || `Bài luyện nghe ${idx}`,
            transcript: item.transcriptText,
            translate: item.translateText || 'Bản dịch học tập tiếng Việt sẽ được bổ sung sau.',
            audioBlob: null,
            fileName: item.audioFile ? item.audioFile.name : '',
            audioFileName: audioFileName,
            date: dateStr
          };

          currentLessons.push(newLessonMeta);
          importedLessons.push(newLessonMeta);
        }

         // Save manifest to Google Drive
        await gdriveSaveFile(gdriveToken, gdriveFolderId, 'lessons_manifest.json', JSON.stringify(currentLessons, null, 2), 'application/json');

        setLocalLessons(currentLessons);
        
        // Reset manual rows to empty default row
        setManualBatchRows([{
          id: `manual-${Date.now()}-0`,
          title: 'Bài luyện nghe 1',
          audioFile: null,
          transcriptText: '',
          translateText: ''
        }]);
        setImportProgress(null);

        if (importedLessons.length > 0) {
          await loadLocalLessonIntoWorkspace(importedLessons[0]);
        }
        alert(`🎉 Đồng bộ cơ sở dữ liệu đám mây hàng loạt thành công!\nĐã lưu thêm ${importedLessons.length} bài học mới vào Google Drive thư mục "${gdriveFolderName}".`);
      } catch (err: any) {
        console.error("Lỗi đồng bộ manual bulk Google Drive:", err);
        setImportProgress(null);
        alert(`⚠️ Lỗi khi ghi và đồng bộ các bài rèn luyện thủ công lên Google Drive: ${err.message || err}`);
      }
    } else if (localDirectoryHandle) {
      // Mode: PC Local Folder
      try {
        const manifestHandle = await localDirectoryHandle.getFileHandle('lessons_manifest.json', { create: true });
        let currentLessons: any[] = [];
        try {
          const file = await manifestHandle.getFile();
          const text = await file.text();
          currentLessons = JSON.parse(text);
          if (!Array.isArray(currentLessons)) currentLessons = [];
        } catch (e) {
          currentLessons = [];
        }

        let idx = 0;
        for (const item of validRows) {
          idx++;
          const lessonId = `custom-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
          setImportProgress({
            current: idx,
            total: validRows.length,
            activeName: item.title,
            isSlow: idx > 2
          });

          let audioFileName = '';
          if (item.audioFile) {
            const ext = item.audioFile.name.split('.').pop() || 'mp3';
            audioFileName = `audio_${lessonId}.${ext}`;
            const audioFileHandle = await localDirectoryHandle.getFileHandle(audioFileName, { create: true });
            const writable = await audioFileHandle.createWritable();
            await writable.write(item.audioFile);
            await writable.close();
          }

          const newLessonMeta: any = {
            id: lessonId,
            title: item.title || `Bài luyện nghe ${idx}`,
            transcript: item.transcriptText,
            translate: item.translateText || 'Bản dịch học tập tiếng Việt sẽ được bổ sung sau.',
            audioBlob: null,
            fileName: item.audioFile ? item.audioFile.name : '',
            audioFileName: audioFileName,
            date: dateStr
          };

          currentLessons.push(newLessonMeta);
          importedLessons.push(newLessonMeta);
        }

        const writableManifest = await manifestHandle.createWritable();
        await writableManifest.write(JSON.stringify(currentLessons, null, 2));
        await writableManifest.close();

        setLocalLessons(currentLessons);
        // Reset manual rows to empty default row
        setManualBatchRows([{
          id: `manual-${Date.now()}-0`,
          title: 'Bài luyện nghe 1',
          audioFile: null,
          transcriptText: '',
          translateText: ''
        }]);
        setImportProgress(null);

        if (importedLessons.length > 0) {
          await loadLocalLessonIntoWorkspace(importedLessons[0]);
        }
        alert(`🎉 Đồng bộ và nạp hàng loạt thành công!\nĐã lưu thêm ${importedLessons.length} bài học mới vào thư mục rèn luyện trên máy tính.`);
      } catch (err: any) {
        console.error("Lỗi đồng bộ manual bulk PC folder:", err);
        setImportProgress(null);
        alert(`⚠️ Lỗi khi ghi và đồng bộ các bài rèn luyện thủ công: ${err.message || err}`);
      }
    } else {
      // Mode: IndexedDB Browser Storage Fallback
      try {
        let idx = 0;
        for (const item of validRows) {
          idx++;
          const lessonId = `custom-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
          setImportProgress({
            current: idx,
            total: validRows.length,
            activeName: item.title,
            isSlow: false
          });

          const dbLesson: SavedLesson = {
            id: lessonId,
            title: item.title || `Bài luyện nghe ${idx}`,
            transcript: item.transcriptText,
            translate: item.translateText || 'Bản dịch học tập tiếng Việt sẽ được bổ sung sau.',
            audioBlob: item.audioFile,
            fileName: item.audioFile ? item.audioFile.name : '',
            date: dateStr
          };

          await saveLocalLesson(dbLesson);
          importedLessons.push(dbLesson);
        }

        const updated = await getLocalLessons();
        const filtered = updated.filter(l => l.id !== 'system_directory_meta_handle');
        setLocalLessons(filtered);
        // Reset manual rows to empty default row
        setManualBatchRows([{
          id: `manual-${Date.now()}-0`,
          title: 'Bài luyện nghe 1',
          audioFile: null,
          transcriptText: '',
          translateText: ''
        }]);
        setImportProgress(null);

        if (importedLessons.length > 0) {
          await loadLocalLessonIntoWorkspace(importedLessons[0]);
        }
        alert(`🎉 Đã nạp thành công ${importedLessons.length} bài học mới tự soạn vào Playlist trình duyệt (IndexedDB)!`);
      } catch (err: any) {
        console.error("Lỗi lưu manual bulk IndexedDB:", err);
        setImportProgress(null);
        alert(`⚠️ Lỗi khi lưu bài học thủ công hàng loạt vào bộ nhớ trình duyệt: ${err.message || err}`);
      }
    }
  };

  // Delete custom lesson
  const handleDeleteLocalLesson = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa bài học tự thiết lập này khỏi bộ lưu trữ?")) return;

    const isGDriveActive = storageMode === 'gdrive' && gdriveToken && gdriveFolderId;

    if (isGDriveActive) {
      try {
        const itemToDelete = localLessons.find(l => l.id === id);
        
        const manifestFile = await gdriveFindFile(gdriveToken, 'lessons_manifest.json', gdriveFolderId);
        let currentLessons = [];
        if (manifestFile) {
          try {
            const text = await gdriveReadFileText(gdriveToken, manifestFile.id);
            currentLessons = JSON.parse(text);
            if (!Array.isArray(currentLessons)) currentLessons = [];
          } catch (e) {
            currentLessons = [];
          }
        }

        const filtered = currentLessons.filter((l: any) => l.id !== id);

        // write updated manifest file back to Google Drive
        await gdriveSaveFile(gdriveToken, gdriveFolderId, 'lessons_manifest.json', JSON.stringify(filtered, null, 2), 'application/json');

        // Delete audio file if exists
        if (itemToDelete && (itemToDelete as any).audioFileName) {
          try {
            const audioFile = await gdriveFindFile(gdriveToken, (itemToDelete as any).audioFileName, gdriveFolderId);
            if (audioFile) {
              await gdriveDeleteFile(gdriveToken, audioFile.id);
            }
          } catch (delErr) {
            console.log("Không thể xóa tệp âm thanh trên Google Drive hoặc tệp không tồn tại:", delErr);
          }
        }

        setLocalLessons(filtered);

        if (selectedLocalLessonId === id) {
          if (filtered.length > 0) {
            loadLocalLessonIntoWorkspace(filtered[0]);
          } else {
            setSelectedLocalLessonId('');
            setCustomTranscriptText('');
            setCustomTranslateText('');
            handleClearCustomAudio();
          }
        }
        alert("Đã gỡ bài học thành công khỏi Google Drive!");
      } catch (err: any) {
        console.error("Lỗi khi xóa bài học trên Google Drive:", err);
        alert("Có lỗi xảy ra khi xóa tệp tin bài học Google Drive: " + (err.message || err));
      }
    } else if (localDirectoryHandle) {
      try {
        const itemToDelete = localLessons.find(l => l.id === id);
        
        // Remove from lessons_manifest.json
        const manifestHandle = await localDirectoryHandle.getFileHandle('lessons_manifest.json', { create: true });
        let currentLessons = [];
        try {
          const file = await manifestHandle.getFile();
          const text = await file.text();
          currentLessons = JSON.parse(text);
          if (!Array.isArray(currentLessons)) currentLessons = [];
        } catch (e) {
          currentLessons = [];
        }

        const filtered = currentLessons.filter((l: any) => l.id !== id);

        const writableManifest = await manifestHandle.createWritable();
        await writableManifest.write(JSON.stringify(filtered, null, 2));
        await writableManifest.close();

        // Try to remove audio file associated
        if (itemToDelete && (itemToDelete as any).audioFileName) {
          try {
            await localDirectoryHandle.removeEntry((itemToDelete as any).audioFileName);
          } catch (delErr) {
            console.log("Không tìm thấy tệp âm thanh để xóa, có thể đã bị xóa thủ công:", delErr);
          }
        }

        setLocalLessons(filtered);

        if (selectedLocalLessonId === id) {
          if (filtered.length > 0) {
            loadLocalLessonIntoWorkspace(filtered[0], localDirectoryHandle);
          } else {
            setSelectedLocalLessonId('');
            setCustomTranscriptText('');
            setCustomTranslateText('');
            handleClearCustomAudio();
          }
        }
        alert("Đã gỡ bài học thành công từ đĩa thư mục máy tính!");
      } catch (err: any) {
        console.error("Lỗi khi xóa bài học trong thư mục local:", err);
        alert("Có lỗi xảy ra khi xóa tệp tin bài học: " + (err.message || err));
      }
    } else {
      try {
        await deleteLocalLesson(id);
        const updated = await getLocalLessons();
        setLocalLessons(updated);
        if (selectedLocalLessonId === id) {
          if (updated.length > 0) {
            loadLocalLessonIntoWorkspace(updated[0], null);
          } else {
            setSelectedLocalLessonId('');
            setCustomTranscriptText('');
            setCustomTranslateText('');
            handleClearCustomAudio();
          }
        }
        alert("Đã gỡ bài học thành công!");
      } catch (err) {
        console.error(err);
        alert("Không gỡ bỏ được bài học.");
      }
    }
  };

  // Export Local Study Backup config file (.json)
  const handleExportBackup = () => {
    const backupData = {
      practiceLogs,
      listenCount,
      customLessons: localLessons.map(l => ({
        id: l.id,
        title: l.title,
        transcript: l.transcript,
        translate: l.translate,
        fileName: l.fileName,
        date: l.date
      }))
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `listenwrite-backpack-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };  // Import Backup config file
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.practiceLogs) {
          setPracticeLogs(data.practiceLogs);
          localStorage.setItem('dictation_practice_logs', JSON.stringify(data.practiceLogs));
        }
        if (typeof data.listenCount === 'number') {
          setListenCount(data.listenCount);
          localStorage.setItem('dictation_listen_count', data.listenCount.toString());
        }

        if (data.customLessons && Array.isArray(data.customLessons)) {
          for (const raw of data.customLessons) {
            const lessonObj: SavedLesson = {
              id: raw.id || `imported-${Date.now()}-${Math.random()}`,
              title: raw.title || 'Bài nghe nhập khẩu',
              transcript: raw.transcript || '',
              translate: raw.translate || '',
              audioBlob: null,
              fileName: raw.fileName || '',
              date: raw.date || new Date().toLocaleDateString('vi-VN')
            };
            await saveLocalLesson(lessonObj);
          }
          const updated = await getLocalLessons();
          setLocalLessons(updated);
          if (updated.length > 0) {
            loadLocalLessonIntoWorkspace(updated[0]);
          }
        }
        alert("🎉 Khôi phục cấu hình lịch sử rèn luyện và playlist thành công!");
      } catch (err) {
        console.error(err);
        alert("⚠️ Tệp tin sao lưu cấu hình không hợp lệ hoặc bị hỏng!");
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Generate study report (.md) file to download instantly
  const handleDownloadStudyReport = () => {
    if (!evaluationResult) return;

    const activeTitle = customAudioFile ? customAudioFile.name : 'Văn bản tùy soạn';

    const reportContent = `# BÁO CÁO LUYỆN NGHE CHÉP CHÍNH TẢ - DICTATION NOTEBOOK
*Thời điểm thực hiện: ${new Date().toLocaleString('vi-VN')}*
*Tên tài liệu: ${activeTitle}*

## 📊 Chỉ số rèn luyện đạt được
- **Độ chính xác (Accuracy):** ${evaluationResult.accuracy}%
- **Từ viết chính xác (Correct Words):** ${evaluationResult.correctCount} từ
- **Từ bị thiếu (Missing Words):** ${evaluationResult.missingCount} từ
- **Từ viết sai hoặc dư (Extra Words):** ${evaluationResult.extraCount} từ

## 🧠 Sơ đồ so sánh chính tả chi tiết
${evaluationResult.diffs.map(d => {
  if (d.type === 'correct') return ` [✓ ${d.text}]`;
  if (d.type === 'missing') return ` [🛑 THIẾU: ${d.text}]`;
  return ` [⚠️ SAI/DƯ: ${d.text}]`;
}).join('')}

---

## 📝 Văn Bản Gốc chuẩn chỉnh (Transcript)
"${sourceTranscript}"

## ✍️ Bài viết của bạn
"${studentText}"

---
*Chúc bạn kiên trì và cải thiện rõ rệt mỗi ngày! Notebook hỗ trợ bạn rèn luyện không mệt mỏi.*
`;

    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dictation-Report-${activeTitle.replace(/[^a-zA-Z0-9-]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleClearWorkspace = () => {
    if (confirm("Bạn có chắc chắn muốn xóa văn bản đã gõ để làm lại cuộc kiểm tra này không?")) {
      setStudentText('');
      setEvaluationResult(null);
      setIsEvaluationChecked(false);
    }
  };

  const handleClearAllHistory = async () => {
    if (confirm("🔑 Bạn có chắc chắn muốn XÓA TOÀN BỘ LỊCH SỬ rèn luyện chép chính tả không?\nHành động này cũng sẽ cài đặt lại trạng thái trống cho bài làm hiện tại của bạn.")) {
      setPracticeLogs([]);
      // Reset current draft work too
      setStudentText('');
      setEvaluationResult(null);
      setIsEvaluationChecked(false);

      if (localDirectoryHandle) {
        try {
          const historyDir = await localDirectoryHandle.getDirectoryHandle('history', { create: true });
          const logsFileHandle = await historyDir.getFileHandle('practice_logs.json', { create: true });
          const writable = await logsFileHandle.createWritable();
          await writable.write(JSON.stringify({ logs: [], listenCount: listenCount }, null, 2));
          await writable.close();
          console.log("Đã đồng bộ hóa xóa lịch sử vào thư mục history local.");
        } catch (err) {
          console.error("Lỗi xóa file lịch sử máy tính:", err);
        }
      } else {
        localStorage.removeItem('dictation_practice_logs');
      }
      alert("🎉 Đã dọn dẹp sạch toàn bộ lịch sử luyện tập và bài làm hiện tại!");
    }
  };

  // Speed active visual helper
  const speedBtnClass = (s: number) => {
    return `px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-colors ${
      playSpeed === s 
        ? 'bg-emerald-500 text-slate-950 font-bold' 
        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
    }`;
  };

  const isGDriveActive = storageMode === 'gdrive' && !!gdriveToken && !!gdriveFolderId;
  const hasActiveStorageConnection = !!localDirectoryHandle || isGDriveActive;
  const isWorkspaceActive = hasActiveStorageConnection || useBrowserDatabaseFallback || localLessons.length > 0 || practiceLogs.length > 0;

  if (!isWorkspaceActive) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-slate-950">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
          {/* Accent radial glow */}
          <div className="absolute -top-10 -left-10 h-32 w-32 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-teal-500/10 rounded-full blur-2xl" />

          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-4 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/10">
            <FolderOpen className="h-8 w-8 stroke-[2]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Cấu Trúc Thư Mục Học Tập
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Vui lòng chọn một thư mục trên máy tính của bạn làm nơi lưu trữ trọn đời bài học, tệp âm thanh và điểm số luyện tập. Lần sau vào lại, chỉ cần nạp lại thư mục này để tiếp tục học tập.
            </p>
          </div>

          {isIframe ? (
            <div className="space-y-3">
              <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-2xl text-[11px] text-amber-300 leading-relaxed text-left space-y-2">
                <p className="font-extrabold flex items-center gap-1">⚠️ Hạn Chế Bảo Mật Xem Trước (Iframe Context):</p>
                <p>Trình duyệt chặn việc chọn thư mục máy tính trực tiếp từ khung xem trước tích hợp.</p>
                <p><b>Giải pháp:</b> Hãy bấm nút vàng ở dưới để mở ứng dụng ở <b>Tab Mới Toàn Màn Hiện Tại</b>, tính năng chọn thư mục sẽ hoạt động cực kỳ mượt mà!</p>
              </div>
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-amber-500 hover:bg-amber-450 text-slate-950 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg text-center"
              >
                <span>🚀 MỞ TAB MỚI TOÀN MÀN HÌNH</span>
              </a>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleSelectLocalDirectory}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>📂 Chọn thư mục rèn luyện (Local Folder)</span>
              </button>
              
              <button
                type="button"
                onClick={() => setUseBrowserDatabaseFallback(true)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Sử dụng tạm Bộ nhớ Trình duyệt (IndexedDB)</span>
              </button>
            </div>
          )}

          <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-4">
            Mọi bài học & âm thanh của bạn đều được lưu trữ hoàn toàn ngoại tuyến và bảo mật trên thiết bị riêng.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Header Row */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-2.5 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/10">
              <Volume2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                ListenWrite <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">Premium Studio</span>
              </h1>
              <p className="text-xs text-slate-400">Ứng dụng luyện nghe chép chính tả & học từ vựng thông minh</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-300">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>Số lần nghe: <b>{listenCount}</b></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              <span>Từ vựng lưu trữ: <b>{vocabWords.length} từ</b></span>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Module Navigation Tabs */}
        <div className="bg-slate-950/90 border-t border-slate-900 flex justify-center sm:justify-start">
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 flex items-center gap-1">
            <button
              onClick={() => setActiveModule('listenwrite')}
              className={`py-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer relative ${
                activeModule === 'listenwrite'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900-50/10'
              }`}
            >
              <Volume2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>🎧 LUYỆN NGHE CHÉP CHÍNH TẢ</span>
            </button>
            <button
              onClick={() => setActiveModule('vocabulary')}
              className={`py-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer relative ${
                activeModule === 'vocabulary'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900-50/10'
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0 text-amber-450" />
              <span>🎴 THẺ TỪ VỰNG THÔNG MINH (Flashcards)</span>
              <span className="hidden sm:inline bg-emerald-500/15 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider animate-pulse">Hot</span>
            </button>
            <button
              onClick={() => setActiveModule('partsOfSpeech')}
              className={`py-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer relative ${
                activeModule === 'partsOfSpeech'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900-50/10'
              }`}
            >
              <Target className="h-4 w-4 shrink-0 text-sky-400" />
              <span>PART 5 TỪ LOẠI TRONG CÂU</span>
              <span className="hidden sm:inline bg-sky-500/15 text-sky-300 text-[9px] font-black px-1.5 py-0.5 rounded border border-sky-500/20 uppercase tracking-wider">500 câu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Single-View Application Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 animate-fade-in">
        
        {activeModule === 'listenwrite' ? (
          <>
            {/* Helper quick announcement banner */}
            {!isBannerClosed && (
          <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-slate-950 p-4 rounded-2xl border border-emerald-500/10 flex items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/15">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div className="text-xs text-slate-300 leading-relaxed pr-2">
                <span className="font-extrabold text-emerald-400">Cách hoạt động:</span> Bạn thêm bài nghe bằng cách dán văn bản tiếng Anh & chọn tệp âm thanh (hoặc nghe giọng đọc AI). Gõ lại văn bản nghe được vào bảng chép góc phải rồi bấm "Kiểm tra kết quả" để đối chiếu chi tiết và tra từ mới!
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsBannerClosed(true)}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-950/80 shrink-0 transition-colors cursor-pointer select-none"
              title="Đóng chỉ dẫn này"
            >
              ✕
            </button>
          </div>
        )}

        {/* Local Backup System hub - No database required */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-slate-900/20 border border-slate-900/70 p-4 rounded-2xl gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${localDirectoryHandle ? 'bg-emerald-400 shadow-sm shadow-emerald-450/40 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-xs font-bold text-slate-300 font-mono text-[10px] tracking-wide uppercase">File Storage Local Hub (Kênh Đồng bộ tập tin máy tính)</span>
            </div>
            {storageMode === 'gdrive' && gdriveFolderId ? (
              <span className="text-[11px] text-sky-400 font-bold font-sans flex items-center gap-1.5 bg-sky-950/20 px-3 py-1 rounded-xl border border-sky-500/15">
                <span className="animate-pulse">☁️</span> Đang đồng bộ Google Drive: <span className="underline text-sky-300 font-extrabold">{gdriveFolderName}</span> ({gdriveUser?.displayName || 'Đã liên kết'})
              </span>
            ) : localDirectoryHandle ? (
              <span className="text-[11px] text-emerald-400 font-medium font-sans bg-emerald-950/20 px-3 py-1 rounded-xl border border-emerald-500/15">
                🟢 Thư mục SSD hoạt động: <span className="underline font-bold text-emerald-350">{localDirectoryName}</span>
              </span>
            ) : isIframe ? (
              <span className="text-[11.5px] text-amber-450 font-bold bg-amber-950/35 border border-amber-900/50 px-3 py-1 rounded-xl flex items-center gap-1.5">
                ⚠️ Iframe xem thử: Nên dùng đồng bộ GOOGLE DRIVE (hoạt động 100% không bị hạn chế popup/directory).
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-sans">
                Đang dùng bộ nhớ tạm của trình duyệt Web (IndexedDB). Nên kết nối thư mục máy tính hoặc Google Drive để lưu bền vững hơn!
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Zen Mode focus controller */}
            <button
               type="button"
               onClick={() => {
                 const targetMode = !isZenMode;
                 setIsZenMode(targetMode);
                 if (targetMode) {
                   setIsCreatorCollapsed(true);
                   setIsHistoryCollapsed(true);
                   setIsBannerClosed(true);
                 } else {
                   setIsCreatorCollapsed(false);
                   setIsHistoryCollapsed(false);
                   setIsBannerClosed(false);
                 }
               }}
               className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border select-none ${
                 isZenMode 
                   ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black shadow shadow-emerald-500/10' 
                   : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:text-white text-slate-300'
               }`}
               title="Ẩn toàn bộ bảng nạp bài & sidebar lịch sử để có tối đa không gian viết"
            >
               {isZenMode ? <Eye className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <EyeOff className="h-3.5 w-3.5 text-slate-450 shrink-0" />}
               <span>⚡ {isZenMode ? "HIỆU ỨNG ZEN ĐANG BẬT" : "Chế độ Zen (Giao diện tối giản)"}</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-800 hidden lg:block" />

            {/* Google Drive Connection Button */}
            {storageMode === 'gdrive' && gdriveToken ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openGDriveFolderSelector(gdriveToken)}
                  className="px-3 py-1.5 bg-sky-950/40 hover:bg-sky-900/40 text-sky-350 hover:text-white border border-sky-850/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Chọn thư mục lưu trữ khác trên Google Drive của bạn"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-sky-400" />
                  <span>📁 Chọn Thư mục</span>
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignOut}
                  className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-900/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Đăng xuất tài khoản Google và tắt đồng bộ đám mây"
                >
                  <span>☁️ Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isAuthLoading}
                onClick={handleGoogleSignIn}
                className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white border border-sky-500/10 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow"
                title="Đồng bộ đám mây bằng tài khoản Google Drive để học tập mọi nơi"
              >
                <span>☁️ {isAuthLoading ? "KẾT NỐI..." : "ĐỒNG BỘ GOOGLE DRIVE"}</span>
              </button>
            )}

            <div className="h-4 w-[1px] bg-slate-800 hidden lg:block" />

            {/* Folder selection connection */}
            {localDirectoryHandle ? (
              <button
                type="button"
                onClick={handleDisconnectLocalDirectory}
                className="px-3.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-300 hover:text-red-200 border border-red-900/40 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                title="Hủy liên kết và quay lại dùng bộ nhớ trình duyệt"
              >
                <FolderOpen className="h-3.5 w-3.5 text-red-400" />
                <span>Ngắt máy tính</span>
              </button>
            ) : isIframe ? (
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm animate-pulse"
                title="Mở ứng dụng ở tab mới để kích hoạt tính năng kết nối thư mục máy tính"
              >
                <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                <span>🚀 Mở Tab chọn SSD Máy Tính</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleSelectLocalDirectory}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                title="Chọn một thư mục máy tính để tự động tải/lưu bài học lâu dài"
              >
                <FolderOpen className="h-3.5 w-3.5 text-emerald-450" />
                <span>📂 ĐỒNG BỘ THƯ MỤC CỤC BỘ</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Section: Task Selection Configuration Header */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-4">
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isCreatorCollapsed ? '' : 'border-b border-slate-850 pb-4'}`}>
            <div>
              <h2 className="text-sm font-black text-slate-200 uppercase tracking-wide flex items-center gap-1.5 animate-none">
                <span>📂 DANH SÁCH BÀI LUYỆN NGHE CỦA BẠN</span>
                {isCreatorCollapsed && (
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                    {localLessons.filter(l => l.id !== 'system_directory_meta_handle').length} bài đã nạp
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Soạn mới văn bản hoặc nhập hàng loạt từ máy tính của bạn.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
              {!isCreatorCollapsed && (
                <div className="hidden lg:flex text-[11px] text-slate-400 items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
                  <HelpCircle className="h-3.5 w-3.5 text-emerald-450" />
                  <span>Có thể dùng giọng đọc AI tự động nếu thiếu âm thanh!</span>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setIsCreatorCollapsed(!isCreatorCollapsed)}
                className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  isCreatorCollapsed
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-950 hover:bg-slate-850 text-slate-350 hover:text-white border-slate-800'
                }`}
                title={isCreatorCollapsed ? "Mở rộng bảng" : "Thu gọn bảng bài học"}
              >
                {isCreatorCollapsed ? <ChevronDown className="h-4 w-4 text-emerald-400 shrink-0" /> : <ChevronUp className="h-4 w-4 text-emerald-450 shrink-0" />}
                <span>{isCreatorCollapsed ? "Mở Rộng Quản Lý (📂)" : "Thu Gọn Lại (－)"}</span>
              </button>
            </div>
          </div>

          {!isCreatorCollapsed && (
            <>

          {/* PLAYLIST SECTION - Always persistent and scrollable with Search */}
          <div className="bg-slate-955/40 p-5 rounded-2xl border border-slate-900 space-y-3.5">
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <span>🗂️ DANH SÁCH PLAYLIST BÀI LUYỆN NGHE ({localLessons.filter(l => l.id !== 'system_directory_meta_handle').length} bài đã nạp)</span>
            </span>

            {localLessons.filter(l => l.id !== 'system_directory_meta_handle').length > 0 ? (
              <div className="space-y-4">
                {/* Search query input */}
                <div className="flex items-center justify-between gap-3 bg-slate-900/40 p-2 text-xs rounded-xl border border-slate-850/60 max-w-md">
                  <span className="text-slate-400 font-bold shrink-0 pl-1">Tìm kiếm bài:</span>
                  <input
                    type="text"
                    placeholder="Gõ từ khóa tìm tiêu đề bài học..."
                    value={lessonSearchQuery}
                    onChange={(e) => setLessonSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-full font-sans transition-all"
                  />
                  {lessonSearchQuery && (
                    <button 
                      type="button" 
                      onClick={() => setLessonSearchQuery('')}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Xóa
                    </button>
                  )}
                  {false && !customAudioUrl && (
                    <div className="hidden">
                      <button
                        type="button"
                        onClick={() => playTtsSegment(selectedTtsSegmentIndex - 1)}
                        disabled={transcriptSegments.length === 0 || selectedTtsSegmentIndex <= 0}
                        className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Trước
                      </button>
                      <button
                        type="button"
                        onClick={() => playTtsSegment(selectedTtsSegmentIndex)}
                        disabled={transcriptSegments.length === 0}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-black text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Đọc đoạn {transcriptSegments.length ? selectedTtsSegmentIndex + 1 : 0}/{transcriptSegments.length}
                      </button>
                      <button
                        type="button"
                        onClick={playRandomTtsSegment}
                        disabled={transcriptSegments.length === 0}
                        className="px-2.5 py-1 rounded-lg border border-sky-500/25 bg-sky-500/10 text-[10px] font-black text-sky-300 hover:bg-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Ngẫu nhiên
                      </button>
                      <button
                        type="button"
                        onClick={() => playTtsSegment(selectedTtsSegmentIndex + 1)}
                        disabled={transcriptSegments.length === 0 || selectedTtsSegmentIndex >= transcriptSegments.length - 1}
                        className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Tiếp
                      </button>
                    </div>
                  )}
                </div>

                {/* Playlist Grid Scroll */}
                <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {localLessons.filter(l => l.id !== 'system_directory_meta_handle').filter(l => l.title.toLowerCase().includes(lessonSearchQuery.toLowerCase())).length === 0 ? (
                    <p className="text-xs text-slate-550 italic text-center py-6 bg-slate-950/25 rounded-xl border border-slate-900/60 border-dashed">Không thấy bài học nào khớp với từ khóa tìm kiếm.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {localLessons
                        .filter(l => l.id !== 'system_directory_meta_handle')
                        .filter(l => l.title.toLowerCase().includes(lessonSearchQuery.toLowerCase()))
                        .map((item) => {
                          const isSelected = selectedLocalLessonId === item.id;
                          const hasAudioFile = !!((item as any).audioFileName || item.audioBlob);
                          return (
                            <div
                              key={item.id}
                              onClick={() => loadLocalLessonIntoWorkspace(item)}
                              className={`px-3 py-2 rounded-xl border text-xs flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-emerald-950/30 to-teal-950/20 border-emerald-500/60 text-emerald-400 font-bold shadow-md ring-1 ring-emerald-500/10' 
                                  : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate flex-1 pr-1">
                                <Volume2 className={`h-4 w-4 shrink-0 ${isSelected ? 'text-emerald-400 stroke-[2.5]' : 'text-slate-450'}`} />
                                <div className="truncate flex flex-col">
                                  <span className="truncate font-semibold text-slate-200">{item.title}</span>
                                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">{item.date || 'Hôm nay'} • {hasAudioFile ? '🔊 Audio File' : '🤖 AI Speak'}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteLocalLesson(item.id, e)}
                                className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded transition-colors ml-1"
                                title="Xóa bài học này"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-3 bg-slate-950/20 px-3 rounded-lg border border-slate-900/50">💡 Thư mục hiện tại hoặc bộ nhớ tạm chưa có bài nghe nào. Hãy điền văn bản ở dưới để tạo bài, hoặc chuyển sang tab "Tải Lên Hàng Loạt" để nạp hàng loạt bài luyện nghe!</p>
            )}
          </div>

          {/* ADVANCED MULTI-OPTIONS CREATOR CARD */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-850 space-y-4">
            
            {/* Folder connection constraint warning */}
            {!hasActiveStorageConnection && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-405 rounded-xl shrink-0 mt-0.5">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">⚠️ YÊU CẦU KẾT NỐI KHU VỰC LƯU TRỮ</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                      Tính năng tạo bài học lẻ hoặc nạp hàng loạt đã được kích hoạt khóa bảo vệ. Bạn <strong className="text-amber-300">PHẢI KẾT NỐI THƯ MỤC SSD MÁY TÍNH CỤC BỘ</strong> hoặc <strong className="text-sky-300">ĐỒNG BỘ GOOGLE DRIVE CLOUD</strong> của dự án rèn luyện trước, giúp ngăn ngừa lưu lạc bài học hoặc mất dữ liệu khi đóng trình duyệt.
                    </p>
                  </div>
                </div>
                {isIframe ? (
                  <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-450 text-slate-950 text-xs font-extrabold rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    >
                      <span>☁️ Kết nối Google Drive (Iframe OK)</span>
                    </button>
                    <a
                      href={typeof window !== 'undefined' ? window.location.href : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span>Mở Tab mới đồng bộ SSD</span>
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-450 text-slate-950 text-xs font-extrabold rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    >
                      <span>☁️ Kết nối Google Drive</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectLocalDirectory}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span>Kết nối thư mục SSD</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className={!hasActiveStorageConnection ? "opacity-35 pointer-events-none select-none transition-all blur-[0.5px]" : ""}>
            {/* Tabs Selector for Creator panel */}
            <div className="flex gap-2.5 border-b border-slate-850 pb-2.5">
              <button
                type="button"
                onClick={() => setCreationTab('single')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  creationTab === 'single'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm'
                    : 'text-slate-450 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                👁️ Preview & Biên Soạn Lẻ
              </button>
              <button
                type="button"
                onClick={() => setCreationTab('bulk')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  creationTab === 'bulk'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm'
                    : 'text-slate-450 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                🗂️ Soạn Hàng Loạt (Bulk Manual Table)
                {matchedLessonsList.length > 0 && (
                  <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full">
                    {matchedLessonsList.length}
                  </span>
                )}
              </button>
            </div>

            {creationTab === 'single' ? (
              <div className="space-y-4 animate-fade-in">
                {/* Active selection helper alert */}
                {selectedLocalLessonId ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-400">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✏️</span>
                      <span>Bạn đang xem & chỉnh sửa bài: <b className="text-emerald-300">"{customTitleText}"</b>. Sửa thông tin ở dưới và nhấn <b>"Cập Nhật Đang Chọn"</b> để lưu.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocalLessonId('');
                        setCustomTitleText('');
                        setCustomTranscriptText('');
                        setCustomTranslateText('');
                        setCustomAudioFile(null);
                        setCustomAudioUrl('');
                        setIsTranscriptVisible(true);
                      }}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition-all font-bold cursor-pointer active:scale-95 shrink-0"
                    >
                      Hủy để Soạn Bản Mới
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-900/30 border border-slate-850/60 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
                    💡 <b>Mẹo nâng cao:</b> Bạn có thể chọn bất kỳ bài học nào từ <b>Playlist</b> phía trên để hiển thị/chỉnh sửa nội dung văn bản gốc, tiêu đề và bản dịch học thuật tại khung này, sau đó cập nhật trực tiếp!
                  </div>
                )}

                {/* Input Lesson Title */}
                <div className="space-y-1.5 pb-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Tiêu đề bài học (<span className="text-slate-450 font-normal">Tùy chọn - Hệ thống tự đặt tên theo tập tin hoặc ngày giờ nếu bỏ trống</span>)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all font-sans placeholder-slate-600"
                    placeholder="Ví dụ: Lesson 1 - Daily Conversations (Nhập tên cho bài lẻ)"
                    value={customTitleText}
                    onChange={(e) => setCustomTitleText(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Audio upload box container */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Tải lên tệp âm thanh (Audio File - Tùy chọn)</label>
                    
                    {customAudioFile ? (
                      <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                            <Volume2 className="h-5 w-5" />
                          </div>
                          <div className="max-w-[200px] md:max-w-[250px]">
                            <p className="text-xs font-bold text-slate-200 truncate">{customAudioFile.name}</p>
                            <p className="text-[10px] text-slate-400">Dung lượng: {(customAudioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearCustomAudio}
                          className="p-1.5 hover:bg-slate-850 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                          title="Xóa tệp hiện tại"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative border-2 border-dashed border-slate-800 hover:border-emerald-500/40 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-900/20 group">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <Upload className="h-8 w-8 text-slate-500 group-hover:text-emerald-400 mx-auto mb-2 transition-colors" />
                        <p className="text-xs font-bold text-slate-300">Kéo thả tệp âm thanh nghe tại đây</p>
                        <p className="text-[10px] text-slate-500 mt-1">Chấp nhận .mp3, .wav, .m4a, .ogg...</p>
                      </div>
                    )}
                  </div>

                  {/* Input correct transcript text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between h-5">
                      <label className="text-xs font-bold text-slate-300 block">Văn bản tiếng Anh gốc / Transcript đúng (<span className="text-red-400">*</span>)</label>
                      <label className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-[10px] text-emerald-400 hover:text-emerald-300 rounded border border-slate-800 cursor-pointer flex items-center gap-1 transition-all">
                        <FileText className="h-3 w-3" />
                        <span>Nạp từ tệp .txt</span>
                        <input
                          type="file"
                          accept=".txt"
                          onChange={handleTextFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <textarea
                      rows={4}
                      placeholder="Dán hoặc gõ văn bản tiếng Anh gốc mà bạn muốn luyện nghe chép tại đây..."
                      value={customTranscriptText}
                      onChange={(e) => setCustomTranscriptText(e.target.value)}
                      className="w-full h-[116px] bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all font-sans placeholder-slate-655 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 block">Dịch nghĩa tiếng Việt (Tùy chọn - Tự phân tích sâu xa nghĩa sau khi so sánh)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      placeholder="Bản dịch tiếng Việt (Ví dụ: Thư viện là nơi lưu giữ tri thức...)"
                      value={customTranslateText}
                      onChange={(e) => setCustomTranslateText(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2 gap-2 flex-wrap">
                    <div>
                      {selectedLocalLessonId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLocalLessonId('');
                            setCustomTitleText('');
                            setCustomTranscriptText('');
                            setCustomTranslateText('');
                            setCustomAudioFile(null);
                            setCustomAudioUrl('');
                            setIsTranscriptVisible(true);
                          }}
                          className="px-3 py-2 hover:bg-slate-900 border border-slate-850 hover:text-white rounded-xl text-[11px] flex items-center gap-1.5 transition-all text-slate-400 font-bold cursor-pointer"
                          title="Đóng bản chỉnh sửa hiện tại và soạn tin bài học nháp mới tinh"
                        >
                          <Plus className="h-3.5 w-3.5 text-emerald-450" />
                          <span>Soạn Bản Mới</span>
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2.5">
                      {selectedLocalLessonId && (
                        <button
                          type="button"
                          onClick={handleUpdateSelectedLesson}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all transform active:scale-95 cursor-pointer"
                          title="Cập nhật văn bản chỉnh sửa hoặc tệp tin âm thanh mới vào bài học hiện tại đang chọn"
                        >
                          <RefreshCw className="h-3.5 w-3.5 animate-[spin_8s_linear_infinite]" />
                          <span>Cập Nhật Đang Chọn</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveToLocalList}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all transform active:scale-95 cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Lưu Bản Mới</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Bulk Create/Import view */
              <div className="space-y-4 animate-fade-in">
                {/* Sub-tabs for Bulk Choice */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-slate-850 pb-3">
                  <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850">
                    <button
                      type="button"
                      onClick={() => setBulkUploadSubTab('auto')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all cursor-pointer flex items-center gap-1 ${
                        bulkUploadSubTab === 'auto'
                          ? 'bg-slate-900 text-slate-100 shadow-sm border border-slate-800'
                          : 'text-slate-450 hover:text-slate-200'
                      }`}
                    >
                      🤖 Tự Khớp Tệp (.mp3/.txt Trùng Tên)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkUploadSubTab('manual')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all cursor-pointer flex items-center gap-1 ${
                        bulkUploadSubTab === 'manual'
                          ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                          : 'text-slate-450 hover:text-slate-200'
                      }`}
                    >
                      ✍️ Tự Soạn Thủ Công Từng Cặp
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-500 italic">
                    {bulkUploadSubTab === 'auto' 
                      ? "Phù hợp khi bạn có sẵn thư mục chứa các cặp tệp trùng tên" 
                      : "Dán văn bản trực tiếp & đính kèm file audio riêng biệt cho từng dòng"
                    }
                  </span>
                </div>

                {bulkUploadSubTab === 'auto' ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl text-[11px] text-slate-400 leading-relaxed space-y-1.5 font-sans">
                      <p className="font-bold text-slate-200 flex items-center gap-1">📋 Hướng dẫn nạp nhiều bài luyện tập bằng cặp tệp:</p>
                      <p>1. Chọn nhiều tệp cùng một lúc (bao gồm cả tệp âm thanh như <b>.mp3, .wav, .m4a</b> và tệp văn bản gốc <b>.txt</b> chứa script chính tả).</p>
                      <p>2. Hệ thống sẽ tự động ghép đôi các tệp có <b>tên giống nhau</b> (ví dụ: <code className="text-emerald-450 font-mono font-bold">lesson_01.mp3</code> đi kèm với <code className="text-emerald-450 font-mono font-bold">lesson_01.txt</code>).</p>
                      <p>3. Những tệp âm thanh đơn lẻ vẫn có thể rèn nghe (chép không có script so sánh), hoặc tệp văn bản đơn lẻ sẽ được phát tự động bằng Giọng nói AI!</p>
                    </div>

                    <div className="relative border-2 border-dashed border-slate-800 hover:border-emerald-500/40 rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-900/10 group">
                      <input
                        type="file"
                        multiple
                        accept="audio/*,text/plain"
                        onChange={handleBulkFileSelect}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <UploadCloud className="h-10 w-10 text-slate-500 group-hover:text-emerald-400 mx-auto mb-2 transition-colors" />
                      <p className="text-xs font-bold text-slate-350">Nhấp hoặc Kéo thả nhiều tệp Âm thanh & tệp .txt văn bản gốc vào đây</p>
                      <p className="text-[10px] text-slate-500 mt-1">Sử dụng phím Shift hoặc Ctrl để bôi đen chọn nhiều file cùng lúc</p>
                    </div>

                    {matchedLessonsList.length > 0 && (
                      <div className="space-y-3 pt-1 animate-fade-in">
                        <div className="flex justify-between items-center bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-850">
                          <span className="text-xs font-bold text-slate-300">📋 Kết quả phát hiện ({matchedLessonsList.length} bài)</span>
                          <button
                            type="button"
                            onClick={() => setMatchedLessonsList([])}
                            className="text-[10px] text-slate-455 hover:text-red-400 transition-colors font-bold"
                          >
                            Hủy bỏ danh sách
                          </button>
                        </div>

                        <div className="max-h-48 overflow-y-auto border border-slate-850/80 rounded-xl bg-slate-950 p-2 space-y-1.5 scrollbar-thin">
                          {matchedLessonsList.map((item, index) => (
                            <div key={item.id} className="p-2.5 bg-slate-900/70 border border-slate-850/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                              <div className="truncate pr-2">
                                <p className="font-bold text-slate-200 truncate">{item.title}</p>
                                <p className="text-[10px] text-slate-450 truncate mt-0.5">
                                  Audio: <span className="text-slate-350">{item.audioFile ? item.audioFile.name : 'Chưa gắn tệp'}</span> • Script: <span className="text-slate-350">{item.textFile ? item.textFile.name : 'Không có (AI Voice)'}</span>
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2 shrink-0">
                                {item.status === 'both' && (
                                  <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-lg text-[9px] border border-emerald-500/15 font-bold">🟢 Đủ cặp Âm thanh & Script</span>
                                )}
                                {item.status === 'audio_only' && (
                                  <span className="bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-lg text-[9px] border border-blue-500/15 font-bold">🔵 Chỉ có tệp Âm thanh</span>
                                )}
                                {item.status === 'text_only' && (
                                  <span className="bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-lg text-[9px] border border-amber-500/15 font-bold">🟡 Chỉ có văn bản (AI Voice)</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {importProgress && (
                          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-950 space-y-2 animate-pulse">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-emerald-400 animate-pulse">⚙️ Đang tải tập tin: "{importProgress.activeName}"...</span>
                              <span className="font-mono text-slate-450">{importProgress.current}/{importProgress.total} ({Math.round(importProgress.current / importProgress.total * 100)}%)</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                                style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleStartBulkImport}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all transform active:scale-95 cursor-pointer"
                          >
                            <Save className="h-4 w-4" />
                            <span>Khởi Động Nạp Hàng Loạt ({matchedLessonsList.length} bài)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Bulk Manual Creator rows view */
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 text-[11px] text-slate-450 space-y-1 hover:border-slate-800 transition-colors leading-relaxed">
                      <p className="font-extrabold text-slate-200 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-450" />
                        BẢNG TỰ SOẠN CẶP BÀI HỌC HÀNG LOẠT (TỰ SOẠN THỦ CÔNG TỪNG BÀI):
                      </p>
                      <p>• Nhấp nút <b>"➕ Thêm Dòng Bài Luyện Mới"</b> để tạo thêm các dòng bài luyện chính tả.</p>
                      <p>• Với mỗi dòng bài, điền tên bài, chọn tệp âm thanh nghe riêng biệt (.mp3/.wav/.m4a) & nhập văn bản tiếng Anh Transcript đúng tương ứng & bản dịch tiếng Việt học thuật.</p>
                      <p>• Bấm <b>"Lưu Toàn Bộ Bảng Soạn Bài"</b> dưới cùng để lưu vĩnh viễn hàng loạt vào đĩa cứng hoặc bộ nhớ trình duyệt!</p>
                    </div>

                    {/* Grid labels */}
                    <div className="hidden md:grid md:grid-cols-12 gap-3 px-2 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-850/50 pb-1.5">
                      <div className="col-span-2">1. Tiêu Đề Bài Học</div>
                      <div className="col-span-2">2. Tệp Âm Thanh (.mp3/wav...)</div>
                      <div className="col-span-4">3. Văn Bản Tiếng Anh Chuẩn (Transcript gốc)</div>
                      <div className="col-span-3">4. Bản Dịch Tiếng Việt (Tùy chọn)</div>
                      <div className="col-span-1 text-center">Xóa</div>
                    </div>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                      {manualBatchRows.map((row, index) => (
                        <div key={row.id} className="relative p-4 sm:p-3 bg-slate-900/60 border border-slate-850 rounded-xl md:grid md:grid-cols-12 gap-3 items-center group hover:border-slate-800 transition-colors">
                          <div className="md:hidden absolute top-2.5 left-2.5 bg-slate-950 px-2 py-0.5 rounded text-[10px] font-black text-emerald-400">
                            Bài luyện nghe #{index + 1}
                          </div>

                          {/* Title Input */}
                          <div className="col-span-2 space-y-1 pt-5 md:pt-0">
                            <label className="md:hidden text-[10px] font-bold text-slate-400">Tiêu đề bài học:</label>
                            <input
                              type="text"
                              value={row.title}
                              onChange={(e) => handleUpdateManualRow(row.id, 'title', e.target.value)}
                              placeholder={`Bài luyện số ${index + 1}`}
                              className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all font-semibold animate-none"
                            />
                          </div>

                          {/* Audio File Selection */}
                          <div className="col-span-2 space-y-1 my-2 md:my-0">
                            <label className="md:hidden text-[10px] font-bold text-slate-400 block pb-1">Tệp âm thanh tập đọc:</label>
                            {row.audioFile ? (
                              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 text-xs">
                                <span className="text-[11px] text-emerald-400 truncate max-w-[80px] font-semibold animate-none" title={row.audioFile.name}>
                                  🎵 {row.audioFile.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleManualRowAudioUpload(row.id, null)}
                                  className="text-red-400 hover:text-red-300 text-xs font-bold pl-1 shrink-0 bg-red-950/20 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-105"
                                  title="Xóa âm thanh dòng này"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="relative bg-slate-950 border border-slate-850 hover:border-slate-700 rounded-lg p-1.5 text-center cursor-pointer transition-colors">
                                <input
                                  type="file"
                                  accept="audio/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleManualRowAudioUpload(row.id, file);
                                  }}
                                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                />
                                <span className="text-[11px] text-slate-450 hover:text-slate-250 font-bold block py-1 flex items-center justify-center gap-1 select-none animate-none">
                                  <Upload className="h-3.5 w-3.5 text-slate-500" /> Chọn Tệp
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Correct English Transcript Script Textarea */}
                          <div className="col-span-4 space-y-1">
                            <label className="md:hidden text-[10px] font-bold text-slate-400">Văn bản tiếng Anh chuẩn / Transcript gốc:</label>
                            <textarea
                              rows={2}
                              value={row.transcriptText}
                              onChange={(e) => handleUpdateManualRow(row.id, 'transcriptText', e.target.value)}
                              placeholder="Dán hoặc gõ văn bản tiếng Anh chính tả gốc vào đây..."
                              className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans leading-relaxed resize-none"
                            />
                          </div>

                          {/* Academic Vietnamese Translation Textarea */}
                          <div className="col-span-3 space-y-1">
                            <label className="md:hidden text-[10px] font-bold text-slate-400">Bản dịch tiếng Việt học thuật:</label>
                            <textarea
                              rows={2}
                              value={row.translateText}
                              onChange={(e) => handleUpdateManualRow(row.id, 'translateText', e.target.value)}
                              placeholder="Nhập bản dịch tiếng Việt tương ứng (Tùy chọn)..."
                              className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans leading-relaxed resize-none"
                            />
                          </div>

                          {/* Actions column */}
                          <div className="col-span-1 text-center mt-2.5 md:mt-0">
                            <button
                              type="button"
                              onClick={() => handleRemoveManualRow(row.id)}
                              className="px-4 py-1.5 md:p-2 bg-red-950/30 hover:bg-red-500 hover:text-slate-950 text-red-400 rounded-xl border border-red-900/40 md:border-none transition-all text-xs font-bold md:font-normal cursor-pointer active:scale-95 flex items-center gap-1.5 mx-auto"
                              title="Xóa dòng bài học này"
                            >
                              <Trash2 className="h-4 w-4 md:h-4.5 md:w-4.5" />
                              <span className="md:hidden">Xóa bài</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {manualBatchRows.length === 0 && (
                        <div className="p-8 text-center bg-slate-900/10 border border-slate-850/80 border-dashed rounded-xl text-xs text-slate-505 italic">
                          Hiện không soạn bài học nào trong ma trạng. Hãy bấm "Thêm Dòng Bài Luyện Mới" ở góc trái.
                        </div>
                      )}
                    </div>

                    {importProgress && (
                      <div className="bg-slate-950 p-4 rounded-xl border border-emerald-950 space-y-2 animate-pulse">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-emerald-400">⚙️ Đang tải tập tin soạn thủ công: "{importProgress.activeName}"...</span>
                          <span className="font-mono text-slate-450">{importProgress.current}/{importProgress.total} ({Math.round(importProgress.current / importProgress.total * 100)}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                            style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleAddManualRow}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer transform hover:scale-102 active:scale-98 shadow"
                      >
                        <Plus className="h-4 w-4 text-emerald-450" />
                        <span>➕ Thêm Dòng Bài Luyện Mới</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStartManualBulkImport}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-emerald-500/20 transition-all transform active:scale-95 cursor-pointer"
                      >
                        <Save className="h-4 w-4" />
                        <span>Khởi Động Nạp Toàn Bộ Bảng Soạn Bài ({manualBatchRows.filter(r => r.transcriptText.trim().length > 0).length} bài được điền)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>

          </div>
          </>
          )}

        </div>

        {/* Grid Area: Listen and Write controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDE COLUMN: MEDIA CONTROLLER & LESSON DETAILS */}
          <div className={`${isZenMode ? 'lg:col-span-4' : 'lg:col-span-5'} space-y-5 transition-all duration-300`}>
            
            {/* Active player and parameters info Card */}
            <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 border-b border-slate-850 pb-2 flex items-center justify-between">
                <span>🔊 BỘ ĐIỀU KHIỂN ÂM THANH</span>
                <span className="text-[10px] text-emerald-400 lowercase italic">
                  {customAudioFile ? 'Phát tệp Mp3' : 'Giọng AI đọc (Tự động)'}
                </span>
              </h3>

              {/* Title display of the loaded session */}
              <div className="space-y-1 select-none">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Lớp Học Dictation
                </span>
                <h2 className="text-base font-extrabold text-white mt-1.5">
                  {customAudioFile ? customAudioFile.name : 'Tệp dữ liệu học tập'}
                </h2>
              </div>

              {/* Native hidden audio block for custom file playbacks */}
              <audio 
                ref={audioRef} 
                src={customAudioUrl || undefined} 
                onEnded={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                  }
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => {
                  const time = e.currentTarget.currentTime;
                  setCurrentTime(Number.isFinite(time) ? time : 0);
                }}
                onLoadedMetadata={(e) => {
                  const audio = e.currentTarget;
                  const loadedDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
                  const requestedTime = pendingAudioSeekRef.current;
                  const targetTime = requestedTime !== null ? requestedTime : audio.currentTime;
                  const safeTime = loadedDuration ? Math.min(Math.max(targetTime, 0), loadedDuration) : 0;
                  audio.currentTime = safeTime;
                  audio.playbackRate = playSpeed;
                  setDuration(loadedDuration);
                  setCurrentTime(safeTime);
                  pendingAudioSeekRef.current = null;
                }}
                onDurationChange={(e) => {
                  const nextDuration = e.currentTarget.duration;
                  setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
                }}
                onSeeked={(e) => {
                  const time = e.currentTarget.currentTime;
                  setCurrentTime(Number.isFinite(time) ? time : 0);
                }}
              />

              {/* Custom Media Player visually */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5">
                
                {/* Active Player Status Wave Bar animation mockup when playing */}
                <div className="h-8 flex items-center justify-center gap-1 inline-flex w-full bg-slate-900/50 rounded-lg p-1.5 overflow-hidden">
                  { (isPlaying || isSynthPlaying) ? (
                    Array.from({ length: 16 }).map((_, idx) => (
                      <span 
                        key={idx} 
                        className="w-1 bg-emerald-500 rounded-full animate-pulse" 
                        style={{ 
                          height: `${Math.random() * 80 + 20}%`,
                          animationDelay: `${idx * 0.08}s`
                        }}
                      />
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Dừng phát âm thanh</span>
                  )}
                </div>

                {/* Professional Seekable Progress Timeline Scrubber */}
                <div className="space-y-1.5 px-0.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 font-mono select-none">
                    <span className="bg-slate-900/40 px-2 py-0.5 rounded text-emerald-400">
                      {formatTime(currentTime)}
                    </span>
                    <span className="bg-slate-900/40 px-2 py-0.5 rounded text-slate-400">
                      {formatTime(duration)}
                    </span>
                  </div>

                  <div className="relative group flex items-center">
                    <input 
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      disabled={!customAudioUrl}
                      className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${(duration ? (currentTime / duration) : 0) * 100}%, #0f172a ${(duration ? (currentTime / duration) : 0) * 100}%, #0f172a 100%)`
                      }}
                    />
                  </div>

                  {!customAudioUrl && (
                    <div className="text-center text-[9px] text-slate-500 italic select-none">
                      💡 Mẹo: Chế độ giọng AI (TTS) không hỗ trợ trượt tua. Hãy tải tệp audio lên để mở khóa thanh cuộn thông minh này!
                    </div>
                  )}
                </div>

                {!customAudioUrl && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 select-none">
                    <button
                      type="button"
                      onClick={() => playTtsSegment(selectedTtsSegmentIndex - 1)}
                      disabled={transcriptSegments.length === 0 || selectedTtsSegmentIndex <= 0}
                      className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Trước
                    </button>
                    <button
                      type="button"
                      onClick={() => playTtsSegment(selectedTtsSegmentIndex)}
                      disabled={transcriptSegments.length === 0}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-black text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Đọc đoạn {transcriptSegments.length ? selectedTtsSegmentIndex + 1 : 0}/{transcriptSegments.length}
                    </button>
                    <button
                      type="button"
                      onClick={playRandomTtsSegment}
                      disabled={transcriptSegments.length === 0}
                      className="px-2.5 py-1 rounded-lg border border-sky-500/25 bg-sky-500/10 text-[10px] font-black text-sky-300 hover:bg-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Ngẫu nhiên
                    </button>
                    <button
                      type="button"
                      onClick={() => playTtsSegment(selectedTtsSegmentIndex + 1)}
                      disabled={transcriptSegments.length === 0 || selectedTtsSegmentIndex >= transcriptSegments.length - 1}
                      className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Tiếp
                    </button>
                  </div>
                )}

                {/* Micro operational media button control bars */}
                <div className="flex items-center justify-center gap-3.5">
                  
                  {/* Rewind 5 seconds */}
                  <button
                    type="button"
                    onClick={() => handleJumpTime(-5)}
                    className="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-850"
                    title="Lùi 5 giây"
                  >
                    <RotateCcw className="h-4.5 w-4.5" />
                  </button>

                  {/* Play / Pause main button */}
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className="h-12 w-12 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/10 shrink-0 transform active:scale-95"
                    title={ (isPlaying || isSynthPlaying) ? "Tạm dừng" : "Bắt đầu phát âm thanh" }
                  >
                    { (isPlaying || isSynthPlaying) ? (
                      <Pause className="h-5.5 w-5.5 fill-slate-950" />
                    ) : (
                      <Play className="h-5.5 w-5.5 fill-slate-950 ml-1" />
                    )}
                  </button>

                  {/* Forward 5 seconds */}
                  <button
                    type="button"
                    onClick={() => handleJumpTime(5)}
                    className="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-850"
                    title="Tiến 5 giây"
                  >
                    <PlayCircle className="h-4.5 w-4.5 rotate-180" />
                  </button>

                </div>

                {/* Speed Play Rate configuration elements */}
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Tốc độ đọc:</span>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => handleSpeedChange(0.75)} className={speedBtnClass(0.75)}>0.75x</button>
                    <button type="button" onClick={() => handleSpeedChange(1.0)} className={speedBtnClass(1.0)}>1.0x</button>
                    <button type="button" onClick={() => handleSpeedChange(1.2)} className={speedBtnClass(1.2)}>1.2x</button>
                    <button type="button" onClick={() => handleSpeedChange(1.5)} className={speedBtnClass(1.5)}>1.5x</button>
                  </div>
                </div>

              </div>

            </div>

            {/* Quick Practice History sidebar section */}
            <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 border-b border-slate-850 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>📚 LỊCH SỬ CHÉP CHÍNH TẢ</span>
                  {isHistoryCollapsed && (
                    <span className="text-[10px] text-emerald-400 font-bold">({practiceLogs.length})</span>
                  )}
                </span>
                <div className="flex items-center gap-1.5 font-mono text-[9px]">
                  {practiceLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded border border-red-500/20 transition-all font-bold uppercase cursor-pointer select-none"
                      title="Xóa tất cả lịch sử chép & làm mới bài hiện tại"
                    >
                      Xóa hết
                    </button>
                  )}
                  <span className="text-[9px] text-slate-500 hidden sm:inline">8 bài gần đây</span>
                  <button
                    type="button"
                    onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
                    className="p-1 hover:bg-slate-950 text-slate-400 hover:text-white rounded border border-slate-800 cursor-pointer transition-colors"
                    title={isHistoryCollapsed ? "Mở rộng lịch sử" : "Thu gọn lịch sử"}
                  >
                    {isHistoryCollapsed ? <ChevronDown className="h-3 w-3 text-emerald-400" /> : <ChevronUp className="h-3 w-3 text-slate-400" />}
                  </button>
                </div>
              </h3>

              {!isHistoryCollapsed && (
                <div className="space-y-2 animate-fade-in">
                  {practiceLogs.map((log) => (
                    <div key={log.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs hover:border-slate-800 transition-colors">
                      <div className="truncate pr-2">
                        <p className="font-semibold text-slate-200 truncate">{log.lessonTitle}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Thời điểm: {log.date} • {log.wordCount} từ</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] shrink-0 ${
                        log.accuracy >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                        log.accuracy >= 70 ? 'bg-amber-500/10 text-amber-500 border border-emerald-500/15' :
                        'bg-red-500/10 text-red-400 border border-red-500/15'
                      }`}>
                        {log.accuracy}%
                      </span>
                    </div>
                  ))}

                  {practiceLogs.length === 0 && (
                    <p className="text-[11px] text-slate-500 italic text-center py-2">Chưa ghi nhận lịch sử nào mới.</p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDE COLUMN: TYPING WORKSPACE CANVAS */}
          <div className={`${isZenMode ? 'lg:col-span-8' : 'lg:col-span-7'} space-y-5 transition-all duration-300`}>
            
            {/* The actual Dictation Typing Canvas */}
            <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Dictation column */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                    <h3 className="text-[11px] uppercase font-extrabold tracking-wider text-slate-300 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      <span>VÙNG LUYỆN VIẾT TIẾNG ANH (DICTATION BOX)</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      <b>{studentText.split(/\s+/).filter(Boolean).length} từ</b> / {studentText.length} kí tự
                    </span>
                  </div>
                  <div className="position-relative">
                    <textarea
                      placeholder="Bắt đầu từ câu thứ nhất... Hãy gõ tiếng Anh bạn nghe được tại đây."
                      value={studentText}
                      onChange={(e) => setStudentText(e.target.value)}
                      className="w-full h-[240px] bg-slate-950 border border-slate-850/80 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-650 focus:outline-none transition-all resize-none shadow-inner leading-relaxed"
                    />
                  </div>
                </div>

                {/* Transcript column */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                    <h3 className="text-[11px] uppercase font-extrabold tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-blue-400" />
                      <span>VĂN BẢN GỐC (TRANSCRIPT)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsTranscriptVisible(!isTranscriptVisible)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold transition-colors border cursor-pointer flex items-center gap-1 bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                    >
                      {isTranscriptVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {isTranscriptVisible ? 'Giấu đi' : 'Xem Bản Gốc'}
                    </button>
                  </div>
                  <div className="relative group">
                    <div className={`w-full overflow-y-auto h-[240px] bg-slate-900/50 border border-slate-850 rounded-xl px-4 py-3 text-xs sm:text-sm font-sans transition-all leading-relaxed whitespace-pre-wrap ${isTranscriptVisible ? 'text-slate-300 select-text' : 'text-transparent bg-clip-text select-none blur-[5px]'}`}>
                      {sourceTranscript || "Chưa có transcript gốc cho bài luyện tập này."}
                    </div>
                    {!isTranscriptVisible && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-slate-950/90 px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-2 shadow-lg z-10">
                          <EyeOff className="h-4 w-4" />
                          <span>Đang ẩn Transcript để rèn luyện tai nghe.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls buttons row */}
              <div className="flex justify-between items-center pt-1.5">
                <button
                  type="button"
                  onClick={handleClearWorkspace}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-905 text-xs transition-colors"
                >
                  Nhập lại từ đầu
                </button>

                <button
                  type="button"
                  onClick={handleCheckEvaluation}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/15"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Kiểm Tra Kết Quả</span>
                </button>
              </div>

            </div>

            {/* Dynamic Card: COMPARISON RESULTS EVALUATION (Behaves as details edit highlight) */}
            {isEvaluationChecked && evaluationResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 animate-fade-in">
                
                {/* Scoring indicators and metric badges */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ĐỘ TRÙNG KHỚP CHÍNH TẢ</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black font-sans leading-none ${
                        evaluationResult.accuracy >= 90 ? 'text-emerald-400' :
                        evaluationResult.accuracy >= 70 ? 'text-amber-500' :
                        'text-red-400'
                      }`}>
                        {evaluationResult.accuracy}%
                      </span>
                    </div>
                  </div>

                  {/* Word indicators */}
                  <div className="grid grid-cols-3 gap-3 self-stretch sm:self-auto flex-1 sm:flex-none">
                    <div className="bg-slate-900 px-3 py-1.5 rounded-lg text-center border border-slate-800">
                      <p className="text-[9px] text-slate-450 font-black">Từ đúng</p>
                      <p className="text-sm font-extrabold text-emerald-405">{evaluationResult.correctCount}</p>
                    </div>
                    <div className="bg-slate-900 px-3 py-1.5 rounded-lg text-center border border-slate-800">
                      <p className="text-[9px] text-slate-450 font-black">Từ thiếu</p>
                      <p className="text-sm font-extrabold text-red-405">{evaluationResult.missingCount}</p>
                    </div>
                    <div className="bg-slate-900 px-3 py-1.5 rounded-lg text-center border border-slate-800">
                      <p className="text-[9px] text-slate-455 font-black">Viết dư</p>
                      <p className="text-sm font-extrabold text-amber-505">{evaluationResult.extraCount}</p>
                    </div>
                  </div>
                </div>

                {/* COMPARISON AND DETAILED DICTATION NOTEBOOK */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📓 VỞ GHI CHÉP LUYỆN NGHE & CHÉP CHÍNH TẢ DICTATION</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Thu phóng chữ:</span>
                      <button 
                        type="button" 
                        onClick={() => setNotebookFontSize(prev => Math.max(12, prev - 2))}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-lg text-[11px] font-bold transition-all text-slate-300 cursor-pointer"
                        title="GIảm cỡ chữ notebook"
                      >
                        A -
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setNotebookFontSize(prev => Math.min(28, prev + 2))}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-lg text-[11px] font-bold transition-all text-slate-300 cursor-pointer"
                        title="Tăng cỡ chữ notebook"
                      >
                        A +
                      </button>
                      <span className="text-xs font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                        {notebookFontSize}px
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setIsNotebookZoomed(true)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-lg text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer transform hover:scale-105"
                        title="Mở sảnh notebook zoom đại"
                      >
                        <Maximize2 className="h-3 w-3" />
                        <span>Phóng To Xem</span>
                      </button>
                    </div>
                  </div>

                  {/* Real school ruled ivory paper layout */}
                  <div 
                    className="relative p-6 sm:p-8 rounded-2xl border-l-[6px] border-amber-300/80 shadow-2xl select-text transition-all duration-200"
                    style={{
                      fontSize: `${notebookFontSize}px`,
                      lineHeight: '2.5rem',
                      backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px)',
                      backgroundSize: '100% 2.5rem',
                      backgroundColor: '#FAF7F2', // School paper ivory
                      color: '#1e293b'
                    }}
                  >
                    {/* Left margin red line */}
                    <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-red-400/40 pointer-events-none md:left-6" />

                    <div className="pl-6 md:pl-10 flex flex-wrap gap-x-1.5 gap-y-1 items-baseline select-none leading-loose">
                      {evaluationResult.diffs.map((token, index) => {
                        const isChosen = selectedNotebookWord.toLowerCase() === token.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'“’\[\]]/g, "").toLowerCase();

                        if (token.type === 'correct') {
                          return (
                            <span 
                              key={index} 
                              onClick={() => handleSpeakWord(token.text)}
                              className={`px-1.5 rounded-md cursor-pointer transition-all duration-150 ${
                                isChosen 
                                  ? 'bg-blue-200 text-blue-900 font-bold scale-110 shadow-sm ring-2 ring-blue-500' 
                                  : 'text-emerald-700 hover:bg-emerald-100 font-medium'
                              }`}
                              title="Ấn để nghe phát âm & tra cứu rèn luyện"
                            >
                              {token.text}
                            </span>
                          );
                        } else if (token.type === 'missing') {
                          return (
                            <span 
                              key={index} 
                              onClick={() => handleSpeakWord(token.text)}
                              className={`px-1.5 rounded-md cursor-pointer line-through decoration-red-400/70 font-bold transition-all duration-150 ${
                                isChosen 
                                  ? 'bg-blue-200 text-blue-900 scale-110 shadow-sm ring-2 ring-blue-500' 
                                  : 'text-red-600 bg-red-550/10 hover:bg-red-100'
                              }`}
                              title="Từ gốc bị ghi thiếu - Ấn để nghe"
                            >
                              {token.text}
                            </span>
                          );
                        } else {
                          return (
                            <span 
                              key={index} 
                              onClick={() => handleSpeakWord(token.text)}
                              className={`px-1.5 rounded-md cursor-pointer underline decoration-amber-500 decoration-wavy font-bold transition-all duration-150 ${
                                isChosen 
                                  ? 'bg-blue-200 text-blue-900 scale-110 shadow-sm ring-2 ring-blue-500' 
                                  : 'text-amber-700 bg-amber-500/10 hover:bg-amber-100'
                              }`}
                              title="Từ viết thừa hoặc phát âm sai - Ấn để nghe"
                            >
                              {token.text}
                            </span>
                          );
                        }
                      })}
                    </div>
                  </div>

                  {/* Micro color dictionary guides */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-400 pt-1 font-sans">
                    <span className="font-bold text-slate-350">Ghi chú:</span>
                    <span className="flex items-center gap-1.5 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30 text-emerald-450 text-[10px]">
                      <span>✓ Bạn gõ đúng chính tả</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-red-955/20 px-2 py-0.5 rounded border border-red-900/30 text-red-450 text-[10px] line-through">
                      <span>Bạn viết thiếu</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-amber-955/35 px-2 py-0.5 rounded border border-amber-900/30 text-amber-450 text-[10px] underline decoration-wavy">
                      <span>Từ thừa / Viết sai lỗi ghép</span>
                    </span>
                    <span className="text-slate-500 italic ml-auto text-[10px] hidden sm:inline">(Mẹo: Click vào bất kỳ từ nào để tra cứu từ điển tức thì)</span>
                  </div>

                  {/* Dynamic interactive dictionary portal */}
                  {selectedNotebookWord && (
                    <div className="bg-slate-950/90 p-4 rounded-xl border border-blue-900/40 space-y-3.5 animate-fade-in relative overflow-hidden">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                        <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-900/60 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>MÁY DIỄN GIẢI TRA CỨU TỰ ĐỘNG</span>
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setSelectedNotebookWord('')}
                          className="text-[10px] text-slate-500 hover:text-white transition-colors cursor-pointer"
                        >
                          Tắt bảng tra ✕
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-2xl font-black font-mono text-emerald-400 tracking-tight">{selectedNotebookWord}</p>
                          <p className="text-[11px] text-slate-400 font-sans mt-0.5">Hệ thống của bạn đang hỗ trợ nghe phiên âm độc lập. Chọn cổng từ điển để truy nghĩa:</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSpeakWord(selectedNotebookWord)}
                          className="px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-850 text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                        >
                          <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Nghe phát âm chuẩn (AI)</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-sans">
                        <a 
                          href={`https://vdict.com/english-vietnamese,${encodeURIComponent(selectedNotebookWord.toLowerCase())},0,0.html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-center text-slate-200 hover:text-white transition-all flex items-center justify-center shadow"
                        >
                          🇻🇳 Tra từ điển VDict
                        </a>
                        <a 
                          href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(selectedNotebookWord.toLowerCase())}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-center text-slate-200 hover:text-white transition-all flex items-center justify-center shadow"
                        >
                          🏛️ Từ điển Cambridge
                        </a>
                        <a 
                          href={`https://translate.google.com/?sl=en&tl=vi&text=${encodeURIComponent(selectedNotebookWord.toLowerCase())}&op=translate`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-center text-slate-200 hover:text-white transition-all flex items-center justify-center shadow"
                        >
                          🌐 Google Dịch câu
                        </a>
                        <a 
                          href={`https://www.google.com/search?q=define+${encodeURIComponent(selectedNotebookWord.toLowerCase())}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-gradient-to-r from-blue-950/40 to-slate-900 hover:bg-blue-900/30 border border-blue-900/30 rounded-lg text-[11px] font-bold text-center text-blue-300 hover:text-white transition-all flex items-center justify-center shadow"
                        >
                          💡 Google Định nghĩa
                        </a>
                      </div>
                    </div>
                  )}

                </div>

                {/* Original transcript show container side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-850 pt-4 text-xs">
                  <div className="space-y-1 bg-slate-950/45 p-3 rounded-lg border border-slate-850">
                    <p className="font-bold text-[10px] uppercase text-emerald-400">📝 Văn Bản Gốc (Transcript):</p>
                    <p className="text-slate-300 leading-relaxed font-sans mt-1">"{sourceTranscript}"</p>
                  </div>
                  <div className="space-y-1 bg-slate-950/45 p-3 rounded-lg border border-slate-850">
                    <p className="font-bold text-[10px] uppercase text-slate-450">✍️ Bài Bạn Đã Gõ:</p>
                    <p className="text-slate-300 leading-relaxed font-sans mt-1">"{studentText}"</p>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
        </>
        ) : activeModule === 'vocabulary' ? (
          <VocabularyModule
            vocabWords={vocabWords}
            setVocabWords={setVocabWords}
            handleSpeakWord={handleSpeakWord}
            localDirectoryHandle={localDirectoryHandle}
            localDirectoryName={localDirectoryName}
            handleSelectLocalDirectory={handleSelectLocalDirectory}
            gdriveFolderId={gdriveFolderId}
            gdriveFolderName={gdriveFolderName}
            storageMode={storageMode}
            gdriveUser={gdriveUser}
            handleGoogleSignIn={handleGoogleSignIn}
          />
        ) : (
          <PartOfSpeechDrill />
        )}

      </main>

      {/* Footer copyright */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-auto py-5 select-none text-center">
        <div className="max-w-6xl mx-auto px-4 text-[10px] text-slate-500">
          <span>© 2026 Context Listening English. Được phát triển tối giản và hiệu quả cao để luyện nghe chép chính tả. ❤️</span>
        </div>
      </footer>

      {/* Premium Full-Screen Immersive Notebook Zoom Overlay */}
      {isNotebookZoomed && evaluationResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 h-[90vh] flex flex-col justify-between shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-400 stroke-[2.5]" />
                <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide">
                  🔎 PHÓNG TO VỞ CHÉP DICTATION NOTEBOOK
                </h3>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNotebookZoomed(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Minimize2 className="h-4 w-4" />
                  <span>Đóng phóng to</span>
                </button>
              </div>
            </div>

            {/* Notebook Ivory ruled sheet with maximum size config */}
            <div className="flex-1 overflow-y-auto py-2">
              <div 
                className="relative p-6 sm:p-10 rounded-2xl border-l-[8px] border-amber-300 shadow-xl select-text transition-all duration-150 leading-[3rem]"
                style={{
                  fontSize: `${notebookFontSize + 6}px`, // Boost zoom size even higher in fullscreen modality
                  lineHeight: '3rem',
                  backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
                  backgroundSize: '100% 3rem',
                  backgroundColor: '#FAF7F2', // School paper ivory
                  color: '#1e293b'
                }}
              >
                {/* Left margin line */}
                <div className="absolute left-4 top-0 bottom-0 w-[1.5px] bg-red-400/40 pointer-events-none md:left-7" />

                <div className="pl-6 md:pl-10 flex flex-wrap gap-x-2 gap-y-1 items-baseline select-none">
                  {evaluationResult.diffs.map((token, index) => {
                    const isChosen = selectedNotebookWord.toLowerCase() === token.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'“’\[\]]/g, "").toLowerCase();

                    if (token.type === 'correct') {
                      return (
                        <span 
                          key={index} 
                          onClick={() => handleSpeakWord(token.text)}
                          className={`px-1.5 rounded-md cursor-pointer transition-all duration-150 ${
                            isChosen 
                              ? 'bg-blue-200 text-blue-900 font-bold scale-110 shadow-sm ring-2 ring-blue-500' 
                              : 'text-emerald-700 hover:bg-emerald-100 font-medium'
                          }`}
                        >
                          {token.text}
                        </span>
                      );
                    } else if (token.type === 'missing') {
                      return (
                        <span 
                          key={index} 
                          onClick={() => handleSpeakWord(token.text)}
                          className={`px-1.5 rounded-md cursor-pointer line-through decoration-red-400/70 font-bold transition-all duration-150 ${
                            isChosen 
                              ? 'bg-blue-200 text-blue-900 scale-110 shadow-sm ring-2 ring-blue-500' 
                              : 'text-red-600 bg-red-550/15 hover:bg-red-100'
                          }`}
                        >
                          {token.text}
                        </span>
                      );
                    } else {
                      return (
                        <span 
                          key={index} 
                          onClick={() => handleSpeakWord(token.text)}
                          className={`px-1.5 rounded-md cursor-pointer underline decoration-amber-500 decoration-wavy font-bold transition-all duration-150 ${
                            isChosen 
                              ? 'bg-blue-200 text-blue-900 scale-110 shadow-sm ring-2 ring-blue-500' 
                              : 'text-amber-700 bg-amber-500/15 hover:bg-amber-100'
                          }`}
                        >
                          {token.text}
                        </span>
                      );
                    }
                  })}
                </div>
              </div>
            </div>

            {/* Direct Built-in translation and Word Glossary Tool inside Zoom modal */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" />
                  <span>Click vào từ khó ở vở chép để tra nghĩa & nghe phát âm</span>
                </span>
                {selectedNotebookWord && (
                  <button 
                    type="button" 
                    onClick={() => setSelectedNotebookWord('')} 
                    className="text-[10px] text-slate-550 hover:text-white"
                  >
                    Xóa tra cứu ✕
                  </button>
                )}
              </div>

              {selectedNotebookWord ? (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-mono text-emerald-400 font-extrabold tracking-tight">{selectedNotebookWord}</span>
                      <span className="text-[10px] text-slate-450 ml-2 italic">(Nhấp cổng từ điển liên kết ngoài để học nghĩa tường tận)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSpeakWord(selectedNotebookWord)}
                      className="px-2.5 py-1 bg-blue-950 text-blue-300 border border-blue-900 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-blue-900"
                    >
                      <Volume2 className="h-3 w-3 text-blue-450" />
                      <span>Phát âm AI</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-sans text-xs flex-wrap">
                    <a 
                      href={`https://vdict.com/english-vietnamese,${encodeURIComponent(selectedNotebookWord.toLowerCase())},0,0.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-300 hover:text-white rounded-lg text-center font-bold"
                    >
                      🇻🇳 Tra VDict
                    </a>
                    <a 
                      href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(selectedNotebookWord.toLowerCase())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-300 hover:text-white rounded-lg text-center font-bold"
                    >
                      🏛️ Lên Cambridge
                    </a>
                    <a 
                      href={`https://translate.google.com/?sl=en&tl=vi&text=${encodeURIComponent(selectedNotebookWord.toLowerCase())}&op=translate`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-300 hover:text-white rounded-lg text-center font-bold"
                    >
                      🌐 Google Dịch
                    </a>
                    <a 
                      href={`https://www.google.com/search?q=define+${encodeURIComponent(selectedNotebookWord.toLowerCase())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-955/40 to-slate-900 border border-blue-900/30 text-[11px] text-blue-350 hover:text-white rounded-lg text-center font-bold"
                    >
                      🔍 Định nghĩa Google
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-550 italic leading-relaxed">Hãy chạm hoặc nhấp vào bất kỳ từ nào trên vở ghi chép ở trên để tra nhanh phiên âm và từ điển học thuật ngoài để lưu từ mới.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📁 GOOGLE DRIVE CUSTOM FOLDER SELECTOR MODAL */}
      {isGDriveFolderModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Accent glowing circle */}
            <div className="absolute -top-12 -left-12 h-40 w-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
                  <FolderOpen className="h-6 w-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight uppercase">
                    📁 Chọn Thư Mục Google Drive
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Chọn một thư mục sẵn có hoặc nhập tên để tạo một không gian học tập mới dán chặt vào mây!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGDriveFolderModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-850 rounded-xl transition-all cursor-pointer"
                title="Đóng bảng chọn"
              >
                ✕
              </button>
            </div>

            {/* Quick Default Recommended creation */}
            <div className="bg-slate-950/50 hover:bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-sky-350 flex items-center gap-1.5">
                  ⭐ Đề xuất thư mục mặc định
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Hệ thống tự động kích hoạt thư mục chuẩn <span className="font-mono text-sky-305 font-black">"ListenWrite Hub"</span> để học tập đồng bộ tức thì.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (gdriveToken) {
                    setIsGdriveFoldersLoading(true);
                    try {
                      await autoSetupGDriveFolder(gdriveToken);
                      setIsGDriveFolderModalOpen(false);
                      alert("🎉 Đã thiết lập và đồng bộ thư mục mặc định 'ListenWrite Hub' thành công!");
                    } catch (err: any) {
                      alert(`⚠️ Có lỗi xảy ra: ${err.message || err}`);
                    } finally {
                      setIsGdriveFoldersLoading(false);
                    }
                  }
                }}
                className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-450 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer select-none shadow hover:shadow-sky-500/10 shrink-0 self-stretch sm:self-auto text-center flex items-center justify-center"
              >
                Khởi tạo siêu tốc
              </button>
            </div>

            {/* Create New Folder controls */}
            <div className="space-y-2 border-t border-slate-850 pt-4">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
                ➕ Tạo thư mục rèn luyện mới tinh:
              </label>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Ví dụ: Luyện tiếng Anh 7.0 IELTS, Prep dictation..."
                  value={newGDriveFolderNameInput}
                  onChange={(e) => setNewGDriveFolderNameInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-xs text-white placeholder-slate-650 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateAndChooseGDriveFolder}
                  disabled={isGdriveFoldersLoading || !newGDriveFolderNameInput.trim()}
                  className="px-4 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-450 hover:to-teal-450 disabled:from-slate-800 disabled:to-slate-850 disabled:text-slate-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow hover:shadow-sky-500/15 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center font-bold"
                >
                  {isGdriveFoldersLoading ? "Đang tạo..." : "Tạo & Dùng"}
                </button>
              </div>
            </div>

            {/* Existing Folder list */}
            <div className="space-y-3 pt-2 border-t border-slate-850">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  📁 Các thư mục sẵn có trên Drive của bạn:
                </label>
                <div className="flex gap-2 items-center">
                  <span className="text-[9px] text-slate-500 italic hidden sm:inline">(Nếu không thấy thư mục, hãy xoá cache trình duyệt hoặc dùng ẩn danh)</span>
                  <button
                    type="button"
                    onClick={() => gdriveToken && openGDriveFolderSelector(gdriveToken)}
                    className="text-[10px] text-sky-400 hover:underline font-bold"
                  >
                    🔄 Tải lại
                  </button>
                </div>
              </div>

              {isGdriveFoldersLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="h-7 w-7 border-2 border-sky-500 border-t-transparent animate-spin rounded-full" />
                  <p className="text-[11px] text-slate-400">Đang quét các thư mục của bạn trên Google Drive đám mây...</p>
                </div>
              ) : gdriveFoldersList.length === 0 ? (
                <div className="text-center py-8 bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl space-y-1.5 p-4">
                  <p className="text-xs text-slate-500 italic">Không tìm thấy thư mục nào trên Google Drive của bạn.</p>
                  <p className="text-[10px] text-slate-600">Hãy nhập tên và bấm nút bên trên để tạo mới thư mục học tập đầu tiên!</p>
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto pr-1 border border-slate-850 rounded-2xl bg-slate-950/40 divide-y divide-slate-900">
                  {gdriveFoldersList.map((folder) => {
                    const isSelected = folder.id === gdriveFolderId;
                    return (
                      <div
                        key={folder.id}
                        onClick={() => handleChooseGDriveFolder(folder.id, folder.name)}
                        className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer group transition-colors ${
                          isSelected 
                            ? 'bg-sky-500/5 hover:bg-sky-500/10' 
                            : 'hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FolderOpen className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-350'}`} />
                          <span className={`text-xs font-semibold truncate ${isSelected ? 'text-sky-400 font-extrabold' : 'text-slate-300 group-hover:text-white'}`}>
                            {folder.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-sky-500/15 border border-sky-500/20 px-2 py-0.5 rounded text-sky-400 animate-pulse">
                              Đang dùng
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-sky-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl transition-colors">
                              Liên kết
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsGDriveFolderModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Đóng / Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
