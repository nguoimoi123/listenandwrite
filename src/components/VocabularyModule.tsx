import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Volume2, 
  Sparkles, 
  Check, 
  HelpCircle, 
  Zap, 
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  Search,
  CheckCircle,
  FolderOpen,
  Info,
  Layers
} from 'lucide-react';
import { VocabularyWord } from '../App';
import { wordPartGroups } from '../data/wordParts';

type PartOfSpeech = 'noun' | 'adjective' | 'verb' | 'adverb';

interface WordFamilyEntry {
  id: string;
  topic: string;
  topicVi: string;
  root: string;
  meaningVi: string;
  forms: Record<PartOfSpeech, string>;
  recognition: Record<PartOfSpeech, string>;
  examples: Record<PartOfSpeech, string>;
}

const wordFamilyTopics = [
  { id: 'daily-life', name: 'Daily Life', vi: 'Sinh hoạt' },
  { id: 'school', name: 'School', vi: 'Trường học' },
  { id: 'work', name: 'Work', vi: 'Công việc' },
  { id: 'travel', name: 'Travel', vi: 'Du lịch' },
  { id: 'health', name: 'Health', vi: 'Sức khỏe' },
  { id: 'technology', name: 'Technology', vi: 'Công nghệ' },
  { id: 'business', name: 'Business', vi: 'Kinh doanh' },
  { id: 'environment', name: 'Environment', vi: 'Môi trường' },
  { id: 'society', name: 'Society', vi: 'Xã hội' },
  { id: 'academic', name: 'Academic', vi: 'Học thuật' }
];

const posLabels: Record<PartOfSpeech, string> = {
  noun: 'Danh từ',
  adjective: 'Tính từ',
  verb: 'Động từ',
  adverb: 'Trạng từ'
};

const posShortLabels: Record<PartOfSpeech, string> = {
  noun: 'Danh',
  adjective: 'Tính',
  verb: 'Động',
  adverb: 'Trạng'
};

const posOrder: PartOfSpeech[] = ['noun', 'adjective', 'verb', 'adverb'];

interface VocabularyModuleProps {
  vocabWords: VocabularyWord[];
  setVocabWords: React.Dispatch<React.SetStateAction<VocabularyWord[]>>;
  handleSpeakWord: (word: string) => void;
  localDirectoryHandle: any;
  localDirectoryName: string;
  handleSelectLocalDirectory: () => Promise<void>;
  gdriveFolderId?: string;
  gdriveFolderName?: string;
  storageMode?: string;
  gdriveUser?: any;
  handleGoogleSignIn?: () => Promise<void>;
}

export default function VocabularyModule({ 
  vocabWords, 
  setVocabWords, 
  handleSpeakWord,
  localDirectoryHandle,
  localDirectoryName,
  handleSelectLocalDirectory,
  gdriveFolderId,
  gdriveFolderName,
  storageMode,
  gdriveUser,
  handleGoogleSignIn
}: VocabularyModuleProps) {
  // Navigation internal mode
  const [activeSubTab, setActiveSubTab] = useState<'flashcards' | 'wordParts' | 'partsOfSpeech' | 'wordsList' | 'quiz'>('flashcards');

  // Flashcards navigation
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Search/Filters for Words list
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterBox, setFilterBox] = useState<number | 'All'>('All');
  const [wordPartTypeFilter, setWordPartTypeFilter] = useState<'all' | 'prefix' | 'suffix'>('all');
  const [selectedWordPartId, setSelectedWordPartId] = useState<string>(wordPartGroups[0]?.id || '');
  const [selectedFamilyTopic, setSelectedFamilyTopic] = useState<string>('daily-life');
  const [wordFamilies, setWordFamilies] = useState<WordFamilyEntry[]>([]);
  const [wordFamilyIndex, setWordFamilyIndex] = useState<number>(0);
  const [wordFamilyMode, setWordFamilyMode] = useState<'study' | 'review'>('study');
  const [posQuizPart, setPosQuizPart] = useState<PartOfSpeech>('noun');
  const [selectedPosAnswer, setSelectedPosAnswer] = useState<PartOfSpeech | null>(null);
  const [posQuizScore, setPosQuizScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  // New Word Form Toggle & Fields
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [word, setWord] = useState<string>('');
  const [phonetic, setPhonetic] = useState<string>('');
  const [definition, setDefinition] = useState<string>('');
  const [translate, setTranslate] = useState<string>('');
  const [example, setExample] = useState<string>('');
  const [exampleTranslate, setExampleTranslate] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [tags, setTags] = useState<string>('');

  // Quiz states
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);
  const [quizQuestion, setQuizQuestion] = useState<{
    word: VocabularyWord;
    options: string[];
    correctIndex: number;
    selectedIndex: number | null;
    isRevealed: boolean;
  } | null>(null);

  // Computed Categories
  const categories = ['All', ...Array.from(new Set(vocabWords.map(w => w.category || 'General')))];
  const filteredWordPartGroups = wordPartGroups.filter(group => wordPartTypeFilter === 'all' || group.type === wordPartTypeFilter);
  const activeWordPartGroup = wordPartGroups.find(group => group.id === selectedWordPartId) || filteredWordPartGroups[0] || wordPartGroups[0];
  const activeWordFamily = wordFamilies[wordFamilyIndex] || null;
  const activePosQuizWord = activeWordFamily ? activeWordFamily.forms[posQuizPart] : '';

  useEffect(() => {
    let isMounted = true;

    fetch(`/word-families/${selectedFamilyTopic}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Cannot load ${selectedFamilyTopic}.json`);
        return res.json();
      })
      .then((data: WordFamilyEntry[]) => {
        if (!isMounted) return;
        setWordFamilies(data);
        setWordFamilyIndex(wordFamilyMode === 'review' ? Math.floor(Math.random() * data.length) : 0);
        setSelectedPosAnswer(null);
        setPosQuizPart(posOrder[Math.floor(Math.random() * posOrder.length)]);
      })
      .catch((error) => {
        console.warn('Word family data load failed:', error);
        if (isMounted) setWordFamilies([]);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFamilyTopic, wordFamilyMode]);

  // Leitner boxes calculations
  const getBoxCount = (boxNum: number) => {
    return vocabWords.filter(w => w.box === boxNum).length;
  };

  // Switch to study box or general pool
  const filteredWordsForFlashcards = vocabWords.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          w.translate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || w.category === filterCategory;
    const matchesBox = filterBox === 'All' || w.box === Number(filterBox);
    return matchesSearch && matchesCategory && matchesBox;
  });

  // Safe navigation inside cards
  const activeCard = filteredWordsForFlashcards[currentCardIndex] || null;

  const handleNextCard = () => {
    setIsFlipped(false);
    if (filteredWordsForFlashcards.length > 0) {
      setCurrentCardIndex((prev) => (prev + 1) % filteredWordsForFlashcards.length);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (filteredWordsForFlashcards.length > 0) {
      setCurrentCardIndex((prev) => (prev - 1 + filteredWordsForFlashcards.length) % filteredWordsForFlashcards.length);
    }
  };

  // Leitner system vote handler
  const handleLeitnerVote = (memorized: boolean) => {
    if (!activeCard) return;

    let nextBox = activeCard.box;
    if (memorized) {
      nextBox = Math.min(5, activeCard.box + 1);
    } else {
      nextBox = 1; // Direct reset to box 1 for immediate review!
    }

    // Update word states
    const updated = vocabWords.map(w => {
      if (w.id === activeCard.id) {
        return { ...w, box: nextBox };
      }
      return w;
    });

    setVocabWords(updated);

    // Auto visual animation / flip-state reset and go next
    setIsFlipped(false);
    setTimeout(() => {
      // If we are at the end of the filtered list, wrap or stay
      if (filteredWordsForFlashcards.length > 1) {
        handleNextCard();
      }
    }, 200);
  };

  // Vocabulary Addition handler
  const handleAddWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !translate.trim()) {
      alert("⚠️ Vui lòng điền tối thiểu Từ vựng và Nghĩa tương ứng!");
      return;
    }

    const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const newWordItem: VocabularyWord = {
      id: `custom-word-${Date.now()}`,
      word: word.trim(),
      phonetic: phonetic.trim() || '/.../',
      definition: definition.trim(),
      translate: translate.trim(),
      example: example.trim(),
      exampleTranslate: exampleTranslate.trim(),
      category: category.trim() || 'General',
      box: 1,
      tags: tagArray
    };

    setVocabWords(prev => [newWordItem, ...prev]);

    // Reset inputs
    setWord('');
    setPhonetic('');
    setDefinition('');
    setTranslate('');
    setExample('');
    setExampleTranslate('');
    setCategory('General');
    setTags('');
    setIsAdding(false);
  };

  // Delete word handler
  const handleDeleteWord = (id: string) => {
    if (confirm("🚨 Bạn có chắc chắn muốn xóa từ vựng này khỏi thư viện cá nhân?")) {
      const remaining = vocabWords.filter(w => w.id !== id);
      setVocabWords(remaining);
      // Adjust indices
      if (currentCardIndex >= remaining.length) {
        setCurrentCardIndex(Math.max(0, remaining.length - 1));
      }
    }
  };

  // Quiz generator module
  const startNewQuiz = () => {
    if (vocabWords.length < 4) {
      alert("⚠️ Cần tối thiểu 4 từ vựng trong Thư Viện để tạo bộ câu hỏi trắc nghiệm!");
      return;
    }

    // Pick 1 random word
    const randIndex = Math.floor(Math.random() * vocabWords.length);
    const target = vocabWords[randIndex];

    // Pick 3 random wrong options
    const pool = vocabWords.filter(w => w.id !== target.id);
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const wrongTranslations = shuffledPool.slice(0, 3).map(w => w.translate);

    // Merge options
    const rawOptions = [target.translate, ...wrongTranslations];
    const correctVal = target.translate;

    // Shuffle options
    const finalOptions = rawOptions.sort(() => Math.random() - 0.5);
    const correctIndex = finalOptions.indexOf(correctVal);

    setQuizQuestion({
      word: target,
      options: finalOptions,
      correctIndex,
      selectedIndex: null,
      isRevealed: false
    });
  };

  const submitQuizChoice = (idx: number) => {
    if (!quizQuestion || quizQuestion.isRevealed) return;

    const correct = idx === quizQuestion.correctIndex;
    setQuizQuestion(prev => prev ? { ...prev, selectedIndex: idx, isRevealed: true } : null);

    setQuizScore(prev => {
      if (!prev) return { correct: correct ? 1 : 0, total: 1 };
      return {
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1
      };
    });
  };

  const startRandomPartOfSpeechQuestion = () => {
    if (wordFamilies.length === 0) return;

    setWordFamilyIndex((prev) => {
      if (wordFamilies.length === 1) return 0;

      let next = Math.floor(Math.random() * wordFamilies.length);
      while (next === prev) {
        next = Math.floor(Math.random() * wordFamilies.length);
      }
      return next;
    });
    setSelectedPosAnswer(null);
    setPosQuizPart(posOrder[Math.floor(Math.random() * posOrder.length)]);
  };

  const submitPartOfSpeechAnswer = (part: PartOfSpeech) => {
    if (!activeWordFamily || selectedPosAnswer) return;

    setSelectedPosAnswer(part);
    setPosQuizScore((prev) => ({
      correct: prev.correct + (part === posQuizPart ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const isSyncActive = localDirectoryHandle || (storageMode === 'gdrive' && gdriveFolderId);
  const syncLabel = localDirectoryHandle
    ? (localDirectoryName || 'Local folder') + '/vocabulary.json'
    : 'TOEIC 800+ in app + browser memory';
  const requireSyncBeforeVocabulary = false;

  if (requireSyncBeforeVocabulary && !isSyncActive) {
    return (
      <div className="w-full flex flex-col gap-6 select-text animate-fade-in py-8">
        <div className="max-w-xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 text-center shadow-2xl relative">
          <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
            📁
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white tracking-tight uppercase">
              Kết nối thư mục học tập của bạn 📚
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tính năng <b>Từ vựng thông minh (Flashcards)</b> yêu cầu bạn đăng ký liên kết đồng bộ trực tiếp với máy tính của mình hoặc thông qua đám mây. 
              Mọi dữ liệu từ vựng sinh động đều được tự động lưu mượt mà vào tệp tin 
              <code className="bg-slate-900 border border-slate-800 text-emerald-400 px-1.5 py-0.5 rounded mx-1 font-mono font-bold">vocabulary.json</code>.
            </p>
          </div>

          <div className="bg-slate-900/40 rounded-2xl border border-slate-900/60 p-4 text-left space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-slate-350 leading-relaxed">
              <span className="text-sky-400 font-extrabold shrink-0">☁️</span>
              <p><b>Đồng bộ Google Drive (khuyên dùng):</b> Hoạt động 100% không bị hạn chế bảo mật khi chạy dưới dạng cửa sổ xem thử (iframe), lưu trực tuyến mọi nơi.</p>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-355 leading-relaxed">
              <span className="text-emerald-400 font-extrabold shrink-0">📂</span>
              <p><b>Thư mục cục bộ (SSD):</b> Bản ghi ngoại tuyến bảo mật tuyệt đối, yêu cầu chạy ứng dụng trong tab độc lập.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-xs font-black rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>☁️ KẾT NỐI GOOGLE DRIVE</span>
            </button>
            <button
              type="button"
              onClick={handleSelectLocalDirectory}
              className="py-3 px-4 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <FolderOpen className="h-3.5 w-3.5 text-emerald-450" />
              <span>📂 CHỌN THƯ MỤC máy tính</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text animate-fade-in">
      
      {/* Dynamic Header Stat Ribbon with Spaced Repetition Box distribution */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {[1, 2, 3, 4, 5].map((boxNumber) => {
          const colorClasses = [
            'from-rose-500/10 to-transparent border-rose-500/20 text-rose-450',
            'from-amber-500/10 to-transparent border-amber-500/20 text-amber-450',
            'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',
            'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400',
            'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400'
          ][boxNumber - 1];

          const labelNames = [
            'Hộp 1: Từ Mới / Quên',
            'Hộp 2: Biết Sơ Bộ',
            'Hộp 3: Đã Nhớ Nhẹ',
            'Hộp 4: Sử Dụng Thạo',
            'Hộp 5: Thành Thạo Sâu'
          ][boxNumber - 1];

          return (
            <div 
              key={boxNumber}
              onClick={() => {
                setFilterBox(boxNumber);
                setActiveSubTab('flashcards');
                setCurrentCardIndex(0);
              }}
              className={`p-3 bg-gradient-to-br ${colorClasses} border rounded-2xl hover:bg-slate-900/40 transition-all cursor-pointer flex flex-col justify-between`}
            >
              <span className="text-[10px] font-black tracking-wide uppercase opacity-75">{labelNames}</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl font-black font-mono">{getBoxCount(boxNumber)}</span>
                <span className="text-[10px] text-slate-500 font-sans">từ</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Control Navigation for Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-900 pb-4 gap-4">
        {/* Module Sub-tabs select */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-slate-900/60 p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveSubTab('flashcards')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'flashcards'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Trượt Ôn Flashcards</span>
            </button>
            
            <button
              onClick={() => setActiveSubTab('wordParts')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'wordParts'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Tiền/Hậu Tố</span>
            </button>
            
            <button
              onClick={() => setActiveSubTab('partsOfSpeech')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'partsOfSpeech'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Danh/Tính/Động/Trạng</span>
            </button>
            
            <button
              onClick={() => setActiveSubTab('wordsList')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'wordsList'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Kho Từ Vựng ({vocabWords.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab('quiz');
                startNewQuiz();
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'quiz'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="h-3.5 w-3.5 animate-bounce" />
              <span>Trắc Nghiệm Phản Xạ</span>
            </button>
          </div>

          {/* Active directory real-time sync notification */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400 font-bold rounded-xl shadow-inner select-none">
            <span className="h-1.5 w-1.5 bg-emerald-450 rounded-full animate-pulse" />
            <span className="font-mono text-slate-500 font-medium">Đồng bộ:</span>
            <span>{syncLabel}</span>
          </div>
        </div>

        {/* Function Actions for adding custom lexical words */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Nạp Thêm Từ Mới</span>
          </button>
          
          {(filterBox !== 'All' || filterCategory !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setFilterBox('All');
                setFilterCategory('All');
                setSearchQuery('');
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition-colors cursor-pointer border border-slate-800"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Input Word Addition Dropdown Module */}
      {isAdding && (
        <form onSubmit={handleAddWordSubmit} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in relative">
          <div className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer text-xs" onClick={() => setIsAdding(false)}>✖ Đóng</div>
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-emerald-400 stroke-[3]" />
            <span>NẠP TỪ VỰNG MỚI VÀO TIẾN TRÌNH KHÔNG KHÓA CHỈ ĐỊNH</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Từ Vựng Tiếng Anh*</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Aesthetic"
                value={word}
                onChange={e => setWord(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Phiên âm (IPA Phonetic)</label>
              <input
                type="text"
                placeholder="Ví dụ: /esˈθet.ɪk/"
                value={phonetic}
                onChange={e => setPhonetic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Phân loại danh mục</label>
              <input
                type="text"
                placeholder="Ví dụ: IELTS General"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Định nghĩa Tiếng Anh</label>
              <textarea
                placeholder="Ví dụ: Concerned with beauty or the appreciation of beauty."
                rows={2}
                value={definition}
                onChange={e => setDefinition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Nghĩa Tiếng Việt*</label>
              <textarea
                required
                placeholder="Ví dụ: Thuộc về mỹ học, có thẩm mỹ cao."
                rows={2}
                value={translate}
                onChange={e => setTranslate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Câu ví dụ Tiếng Anh</label>
              <input
                type="text"
                placeholder="Ví dụ: He has a highly modern aesthetic."
                value={example}
                onChange={e => setExample(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Dịch nghĩa câu ví dụ</label>
              <input
                type="text"
                placeholder="Ví dụ: Anh ấy có gu thẩm mỹ rất hiện đại."
                value={exampleTranslate}
                onChange={e => setExampleTranslate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400">Nhãn từ vựng (Tags, phân tách bằng dấu phẩy)</label>
            <input
              type="text"
              placeholder="Arts, Academic, Psychology, Design"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-905 border border-slate-850 rounded-xl text-xs font-semibold text-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black rounded-xl text-xs"
            >
              Lưu từ vựng 💾
            </button>
          </div>
        </form>
      )}

      {/* SUB-MODULE REVIEW CONTENT STAGE */}

      {activeSubTab === 'flashcards' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in py-2">
          
          {/* Active filter indication */}
          <div className="flex items-center gap-2 max-w-sm justify-center bg-slate-900/40 border border-slate-850 py-1.5 px-3 rounded-full text-[10.5px] text-slate-400 text-center font-semibold mb-1">
            <span>Đang ôn tập từ lọc:</span>
            <span className="text-emerald-400 bg-slate-900 border border-slate-800 px-2 rounded-md font-mono font-bold">Lọc Hộp: {filterBox}</span>
            <span className="text-emerald-400 bg-slate-900 border border-slate-800 px-2 rounded-md font-bold">Danh mục: {filterCategory}</span>
          </div>

          {filteredWordsForFlashcards.length === 0 ? (
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-xl">
              <div className="h-12 w-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-emerald-400">
                <Info className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-200">Không tìm thấy từ vựng nào khớp với bộ lọc!</p>
              <p className="text-xs text-slate-400">Hãy chuyển Hộp lọc hoặc danh mục lọc về "Tất cả" (All) để xem toàn bộ vốn từ vựng của bạn.</p>
              <button
                onClick={() => {
                  setFilterBox('All');
                  setFilterCategory('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-black rounded-xl transition-all"
              >
                Nhìn toàn bộ thư viện từ 🗂️
              </button>
            </div>
          ) : (
            <div className="w-full max-w-lg flex flex-col gap-5">
              
              {/* Massive CSS-Flip 3D Styled Flashcard Container */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ perspective: '1000px' }}
                className="w-full h-[320px] cursor-pointer group select-none"
              >
                <div 
                  className={`relative w-full h-full text-center transition-all duration-500 rounded-3xl shadow-xl transform border ${
                    isFlipped 
                      ? 'rotate-y-180 bg-slate-900 border-emerald-500/35 shadow-emerald-500/5' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700/85'
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  
                  {/* FRONT SIDE (English focus) */}
                  <div 
                    className="absolute inset-0 w-full h-full p-6 sm:p-8 flex flex-col justify-between backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-slate-950 px-3 py-1 text-[10px] font-bold text-slate-450 uppercase tracking-widest rounded-full border border-slate-850">
                        📦 Hộp Leitner {activeCard.box}
                      </span>
                      <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        {activeCard.category || 'Vocabulary'}
                      </span>
                    </div>

                    <div className="space-y-2 mt-4">
                      <span className="text-4xl font-black font-mono tracking-tight text-white block">
                        {activeCard.word}
                      </span>
                      <span className="text-sm text-slate-400 font-serif block italic">
                        {activeCard.phonetic}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Audio voice pronounce trigger */}
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation(); // Stop flipping trigger
                          handleSpeakWord(activeCard.word);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 rounded-xl text-xs font-bold transition-all border border-indigo-900"
                        title="Nghe giọng đọc chuẩn"
                      >
                        <Volume2 className="h-4 w-4 text-indigo-400 animate-pulse" />
                        <span>Nghe Phát Âm</span>
                      </button>

                      <p className="text-[11px] text-slate-500 animate-pulse font-medium">Bấm vào đây để lật nghĩa & mẫu câu ví dụ 🔄</p>
                    </div>
                  </div>

                  {/* BACK SIDE (Definition / Viet translation focus) */}
                  <div 
                    className="absolute inset-0 w-full h-full p-6 sm:p-8 flex flex-col justify-between backface-hidden text-left"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                        🇻🇳 Định nghĩa & Nghĩa Việt:
                      </span>
                      <span className="bg-slate-950 px-2.5 py-0.5 text-[9px] text-slate-500 font-bold uppercase rounded border border-slate-800">
                        {activeCard.word}
                      </span>
                    </div>

                    <div className="space-y-3 my-auto">
                      <p className="text-sm text-slate-300 font-sans italic leading-relaxed">
                        <b>Definition:</b> {activeCard.definition || 'No definition defined.'}
                      </p>
                      
                      <div className="bg-emerald-500/5 border-l-4 border-emerald-500/80 p-3 rounded-r-xl">
                        <p className="text-sm font-black text-emerald-350">
                          {activeCard.translate}
                        </p>
                      </div>

                      {activeCard.example && (
                        <div className="text-[11.5px] text-slate-400 mt-2 font-serif space-y-0.5 border-t border-slate-850 pt-2 text-wrap">
                          <p className="text-slate-350 leading-relaxed italic">" {activeCard.example} "</p>
                          {activeCard.exampleTranslate && (
                            <p className="text-slate-500 font-sans font-medium text-[11px]">{activeCard.exampleTranslate}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-center pt-2">
                      <p className="text-[10px] text-teal-500 underline uppercase tracking-widest font-black">Bấm để lật trở lại mặt chính ↔️</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Leitner Box Movement Controller Actions */}
              <div className="grid grid-cols-2 gap-3 pb-1">
                <button
                  onClick={() => handleLeitnerVote(false)}
                  className="py-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/30 text-rose-450 hover:text-rose-350 font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all text-center"
                  title="Đặt lại mức tự hiển thị vào hộp 1 để lấy lại nền tảng"
                >
                  ✕ Chưa thuộc (Reset về Hộp 1)
                </button>
                <button
                  onClick={() => handleLeitnerVote(true)}
                  className="py-3 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all text-center"
                  title="Nâng hạng từ lên hộp Leitner tiếp theo"
                >
                  ✓ Đã thuộc (Lên Hộp cao hơn)
                </button>
              </div>

              {/* Slider Deck Navigation Arrows */}
              <div className="flex items-center justify-between bg-slate-900/30 border border-slate-900 p-3 rounded-2xl">
                <button
                  type="button"
                  onClick={handlePrevCard}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-300 disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="text-xs text-slate-400 font-semibold font-mono">
                  Mục <span className="text-emerald-400 font-bold">{currentCardIndex + 1}</span> / <span className="text-slate-200">{filteredWordsForFlashcards.length}</span> trong bộ ôn tập
                </div>

                <button
                  type="button"
                  onClick={handleNextCard}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-300 disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {activeSubTab === 'wordParts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in">
          <div className="lg:col-span-4 bg-slate-900/35 border border-slate-900 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">Bộ tiền tố / hậu tố</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Học theo mảnh nghĩa để đoán từ nhanh hơn.</p>
              </div>
              <select
                value={wordPartTypeFilter}
                onChange={(e) => {
                  const next = e.target.value as 'all' | 'prefix' | 'suffix';
                  setWordPartTypeFilter(next);
                  const first = wordPartGroups.find(group => next === 'all' || group.type === next);
                  if (first) setSelectedWordPartId(first.id);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Tất cả</option>
                <option value="prefix">Prefix</option>
                <option value="suffix">Suffix</option>
              </select>
            </div>

            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredWordPartGroups.map((group) => {
                const isActive = activeWordPartGroup?.id === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setSelectedWordPartId(group.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300'
                        : 'bg-slate-950/50 border-slate-850 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-sm font-mono">{group.part}</span>
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border ${
                        group.type === 'prefix'
                          ? 'bg-sky-500/10 border-sky-500/20 text-sky-300'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      }`}>
                        {group.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{group.meaning}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 bg-slate-900/35 border border-slate-900 rounded-2xl p-5 space-y-5">
            {activeWordPartGroup && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-slate-850 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black font-mono text-white">{activeWordPartGroup.part}</span>
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${
                        activeWordPartGroup.type === 'prefix'
                          ? 'bg-sky-500/10 border-sky-500/20 text-sky-300'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      }`}>
                        {activeWordPartGroup.type === 'prefix' ? 'Tiền tố' : 'Hậu tố'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-emerald-300 mt-1">{activeWordPartGroup.meaning}</p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{activeWordPartGroup.note}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 font-mono">
                    JSON: /word_parts.json
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeWordPartGroup.examples.map((item) => (
                    <div key={item.word} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-lg font-black text-white font-mono">{item.word}</span>
                        <button
                          type="button"
                          onClick={() => handleSpeakWord(item.word)}
                          className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-900 transition-colors"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="inline-flex px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-300 font-mono">
                        {item.breakdown}
                      </div>
                      <p className="text-sm font-bold text-slate-200">{item.meaning}</p>
                      <p className="text-xs text-slate-450 italic leading-relaxed">"{item.example}"</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-4 text-xs text-slate-350 leading-relaxed">
                  <b className="text-emerald-300">Cách học:</b> đọc nghĩa của mảnh từ trước, sau đó đoán nghĩa của từng ví dụ bằng công thức
                  <span className="font-mono text-sky-300"> prefix/suffix + root word</span>. Khi gặp từ mới, thử tách mảnh trước khi tra từ điển.
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'partsOfSpeech' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 animate-fade-in">
          <div className="xl:col-span-4 bg-slate-900/35 border border-slate-900 rounded-2xl p-4 space-y-4">
            <div className="border-b border-slate-850 pb-3">
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">4 loại từ chính</h3>
              <p className="text-[10px] text-slate-500 mt-1">
                Chọn chủ đề, học family word rồi ôn bằng câu hỏi: từ này là danh, tính, động hay trạng?
              </p>
            </div>

            <select
              value={selectedFamilyTopic}
              onChange={(e) => setSelectedFamilyTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {wordFamilyTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.vi} - {topic.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWordFamilyMode('study')}
                className={`py-2 rounded-xl text-xs font-black border transition-all ${
                  wordFamilyMode === 'study'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                Học nhận biết
              </button>
              <button
                type="button"
                onClick={() => {
                  setWordFamilyMode('review');
                  startRandomPartOfSpeechQuestion();
                }}
                className={`py-2 rounded-xl text-xs font-black border transition-all ${
                  wordFamilyMode === 'review'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                Ôn trắc nghiệm
              </button>
            </div>

            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {wordFamilies.map((item, index) => {
                const isActive = index === wordFamilyIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setWordFamilyIndex(index);
                      setSelectedPosAnswer(null);
                      setPosQuizPart(posOrder[Math.floor(Math.random() * posOrder.length)]);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300'
                        : 'bg-slate-950/50 border-slate-850 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-sm font-mono">{item.root}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {index + 1}/{wordFamilies.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{item.meaningVi}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-8 bg-slate-900/35 border border-slate-900 rounded-2xl p-5 space-y-5">
            {activeWordFamily ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-slate-850 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-emerald-400" />
                      <h3 className="text-2xl font-black text-white font-mono">{activeWordFamily.root}</h3>
                    </div>
                    <p className="text-sm text-emerald-300 font-bold mt-1">{activeWordFamily.meaningVi}</p>
                    <p className="text-xs text-slate-450 mt-2">
                      Chủ đề: {activeWordFamily.topicVi} - JSON: /word-families/{selectedFamilyTopic}.json
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono">
                    Điểm ôn: <span className="text-emerald-400 font-black">{posQuizScore.correct}/{posQuizScore.total}</span>
                  </div>
                </div>

                {wordFamilyMode === 'study' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {posOrder.map((part) => (
                        <div key={part} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">{posLabels[part]}</span>
                            <button
                              type="button"
                              onClick={() => handleSpeakWord(activeWordFamily.forms[part])}
                              className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-900 transition-colors"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="text-xl font-black text-white font-mono">{activeWordFamily.forms[part]}</div>
                          <p className="text-xs text-emerald-300 leading-relaxed">{activeWordFamily.recognition[part]}</p>
                          <p className="text-xs text-slate-450 italic leading-relaxed">"{activeWordFamily.examples[part]}"</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-4 text-xs text-slate-350 leading-relaxed">
                      <b className="text-emerald-300">Mẹo nhận biết nhanh:</b> danh từ thường làm chủ ngữ/tân ngữ; tính từ mô tả danh từ; động từ chỉ hành động/trạng thái; trạng từ bổ nghĩa cho động từ, tính từ hoặc cả câu. Đuôi như <span className="font-mono text-sky-300">-ion, -ment, -ness</span> hay gặp ở danh từ; <span className="font-mono text-amber-300">-ive, -able, -ful</span> hay gặp ở tính từ; <span className="font-mono text-indigo-300">-ly</span> hay gặp ở trạng từ.
                    </div>
                  </>
                ) : (
                  <div className="max-w-2xl mx-auto py-4 space-y-5">
                    <div className="text-center space-y-2">
                      <span className="text-[11px] uppercase font-black text-slate-500 tracking-widest block">
                        Từ này thuộc loại nào?
                      </span>
                      <div className="inline-flex items-center gap-3 justify-center">
                        <span className="text-4xl font-black font-mono tracking-tight text-white">{activePosQuizWord}</span>
                        <button
                          type="button"
                          onClick={() => handleSpeakWord(activePosQuizWord)}
                          className="p-2 bg-indigo-950 hover:bg-indigo-900 rounded-xl cursor-pointer transition-colors"
                          title="Phát âm"
                        >
                          <Volume2 className="h-4 w-4 text-indigo-400" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">Gốc nghĩa: {activeWordFamily.meaningVi}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {posOrder.map((part) => {
                        const isSelected = selectedPosAnswer === part;
                        const isCorrect = posQuizPart === part;
                        const revealed = Boolean(selectedPosAnswer);
                        const stateClass = !revealed
                          ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-slate-200'
                          : isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                            : isSelected
                              ? 'bg-rose-500/10 border-rose-500 text-rose-300'
                              : 'bg-slate-950/20 border-slate-900 text-slate-600';

                        return (
                          <button
                            key={part}
                            type="button"
                            disabled={revealed}
                            onClick={() => submitPartOfSpeechAnswer(part)}
                            className={`py-4 px-4 rounded-2xl border text-sm font-black transition-all ${stateClass}`}
                          >
                            {posShortLabels[part]}
                          </button>
                        );
                      })}
                    </div>

                    {selectedPosAnswer && (
                      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-xs text-slate-350 leading-relaxed space-y-3">
                        <p>
                          Đáp án đúng: <b className="text-emerald-300">{posLabels[posQuizPart]}</b>. {activeWordFamily.recognition[posQuizPart]}
                        </p>
                        <p className="italic text-slate-450">"{activeWordFamily.examples[posQuizPart]}"</p>
                        <button
                          type="button"
                          onClick={startRandomPartOfSpeechQuestion}
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-black rounded-xl transition-all"
                        >
                          Câu tiếp theo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500 italic">
                Đang tải dữ liệu word family...
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'wordsList' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Internal searching ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm từ vựng hoặc nghĩa..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">Tất cả danh mục ({categories.length - 1})</option>
                {categories.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterBox}
                onChange={e => setFilterBox(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">Tất cả bài ôn tập Leitner</option>
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>Chỉ xem Hộp {num}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Word list view rows */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-2xl overflow-hidden shadow-md">
            <div className="px-5 py-4 bg-slate-900 flex items-center justify-between border-b border-slate-850 text-xs font-black text-slate-400 select-none uppercase tracking-wider font-mono">
              <span className="w-1/3">Từ Vựng / IPA</span>
              <span className="w-1/3">Định Nghĩa / Giải Nghĩa</span>
              <span className="w-1/4 text-center">Tiến trình (Hộp Leitner)</span>
              <span className="w-12 text-right">Xóa</span>
            </div>

            {filteredWordsForFlashcards.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500 italic">Thư viện trống hoặc không khớp từ cần tìm.</p>
            ) : (
              <div className="divide-y divide-slate-900">
                {filteredWordsForFlashcards.map((item) => {
                  const boxBadgeClass = [
                    'bg-rose-500/10 text-rose-450 border-rose-500/20',
                    'bg-amber-500/10 text-amber-450 border-amber-500/20',
                    'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                    'bg-emerald-500/15 text-emerald-450 border-emerald-500/20'
                  ][item.box - 1];

                  return (
                    <div key={item.id} className="px-5 py-3.5 hover:bg-slate-900/30 transition-colors flex items-center justify-between text-xs gap-3">
                      <div className="w-1/3 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm font-mono tracking-tight">{item.word}</span>
                          <button 
                            type="button" 
                            onClick={() => handleSpeakWord(item.word)}
                            className="p-1 bg-slate-800 hover:bg-emerald-550 hover:text-slate-950 text-slate-400 rounded-lg transition-colors cursor-pointer"
                            title="Nghe phát âm chuẩn"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-slate-500 font-serif italic text-[11px]">{item.phonetic}</p>
                      </div>

                      <div className="w-1/3 space-y-1">
                        <p className="font-extrabold text-emerald-350">{item.translate}</p>
                        {item.definition && (
                          <p className="text-[11px] text-slate-450 leading-relaxed max-w-sm line-clamp-1 hover:line-clamp-none font-serif">{item.definition}</p>
                        )}
                      </div>

                      <div className="w-1/4 flex flex-col items-center justify-center gap-1.5">
                        <span className={`px-2.5 py-0.5 text-[10px] uppercase font-black tracking-wider rounded-md border ${boxBadgeClass}`}>
                          Hộp {item.box}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono italic">
                          {item.category || 'General'}
                        </span>
                      </div>

                      <div className="w-12 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteWord(item.id)}
                          className="p-1 px-1.5 text-slate-600 hover:text-rose-450 border border-transparent hover:border-rose-900/25 rounded-md hover:bg-rose-950/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {activeSubTab === 'quiz' && (
        <div className="max-w-xl mx-auto w-full py-4 animate-fade-in">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Score Ribbon bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-black uppercase text-slate-300 tracking-wider">Trắc Nghiệm Phản Xạ Từ Vựng</span>
              </div>
              <div className="bg-slate-950 px-3 py-1 rounded-xl text-xs text-emerald-400 border border-slate-850 font-mono font-bold">
                Điểm Độc Lập: <span className="font-mono text-emerald-300 font-black">{quizScore ? `${quizScore.correct}/${quizScore.total}` : '0/0'}</span>
              </div>
            </div>

            {quizQuestion ? (
              <div className="space-y-6 animate-fade-in">
                {/* Active question */}
                <div className="space-y-2 text-center">
                  <span className="text-[11px] uppercase font-black text-slate-500 tracking-widest block">Hãy chọn giải nghĩa thích hợp cho từ:</span>
                  <div className="inline-flex items-center gap-2.5 justify-center">
                    <span className="text-3xl font-black font-mono tracking-tight text-white">{quizQuestion.word.word}</span>
                    <button
                      type="button"
                      onClick={() => handleSpeakWord(quizQuestion.word.word)}
                      className="p-1.5 bg-indigo-950 hover:bg-indigo-900 rounded-xl cursor-pointer transition-colors"
                      title="Phát âm"
                    >
                      <Volume2 className="h-4 w-4 text-indigo-400" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 italic block">{quizQuestion.word.phonetic}</span>
                </div>

                {/* Choices list */}
                <div className="grid grid-cols-1 gap-3.5">
                  {quizQuestion.options.map((opt, idx) => {
                    const isSelected = quizQuestion.selectedIndex === idx;
                    const isCorrect = idx === quizQuestion.correctIndex;
                    
                    let bgBorderColor = 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950';
                    let leadingIndicator = `${idx + 1}.`;

                    if (quizQuestion.isRevealed) {
                      if (isCorrect) {
                        bgBorderColor = 'bg-emerald-500/10 border-emerald-500 text-emerald-400';
                        leadingIndicator = '✓';
                      } else if (isSelected) {
                        bgBorderColor = 'bg-rose-500/10 border-rose-500/80 text-rose-450';
                        leadingIndicator = '✗';
                      } else {
                        bgBorderColor = 'bg-slate-950/20 border-slate-900 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quizQuestion.isRevealed}
                        onClick={() => submitQuizChoice(idx)}
                        className={`w-full py-3.5 px-5 border rounded-2xl text-xs font-bold transition-all text-left flex items-center justify-between gap-3 ${
                          quizQuestion.isRevealed ? 'cursor-default' : 'cursor-pointer hover:-translate-y-0.5'
                        } ${bgBorderColor}`}
                      >
                        <span>{opt}</span>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-900/60 border border-slate-800">{leadingIndicator}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Question feedback and Next query */}
                {quizQuestion.isRevealed && (
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl text-xs leading-relaxed space-y-2.5 animate-fade-in text-slate-350">
                    <div>
                      <span className="font-extrabold text-emerald-400">Gợi Ý Mẫu Câu Ví Dụ: </span>
                      <span className="italic">"{quizQuestion.word.example || 'Chưa định nghĩa câu'}"</span>
                    </div>
                    {quizQuestion.word.exampleTranslate && (
                      <p className="text-[11px] text-slate-450">Dịch nghĩa câu: {quizQuestion.word.exampleTranslate}</p>
                    )}
                    
                    <button
                      type="button"
                      onClick={startNewQuiz}
                      className="w-full mt-3 py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Tiếp tục câu hỏi tiếp theo 🚀</span>
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 italic">Nhấp Tiếp tục để khởi tạo bộ đề thi từ vựng.</p>
                <button
                  onClick={startNewQuiz}
                  className="mt-4 px-5 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Khởi động thi trắc nghiệm!
                </button>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
