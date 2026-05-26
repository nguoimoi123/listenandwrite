import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Map, 
  BookMarked, 
  FileEdit, 
  CheckSquare, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  EyeOff, 
  Eye, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  Volume2,
  Bookmark,
  CheckCircle,
  Clock,
  Check,
  Languages,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { Lesson, VocabularyItem } from '../types';

interface ListeningPracticeProps {
  lessons: Lesson[];
  selectedLessonId: string;
  setSelectedLessonId: (id: string) => void;
  onUpdateLessonStatus: (id: string, status: 'Not Started' | 'In Progress' | 'Completed', score?: number) => void;
  onAddLog: (action: string, lessonTitle: string, score?: number, minutes?: number) => void;
  onAddVocab: (item: VocabularyItem) => void;
  vNotebook: VocabularyItem[];
}

export default function ListeningPractice({ 
  lessons, 
  selectedLessonId, 
  setSelectedLessonId, 
  onUpdateLessonStatus,
  onAddLog,
  onAddVocab,
  vNotebook
}: ListeningPracticeProps) {

  const activeLesson = lessons.find(l => l.id === selectedLessonId) || lessons[0];

  // Active step (0: Listen First, 1: Listen with Context, 2: Vocab Focus, 3: Rewrite from Memory, 4: Compare & Improve)
  const [currentStep, setCurrentStep] = useState(0);

  // Audio simulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Step 2 related states
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);
  const [hideTranslationMap, setHideTranslationMap] = useState<Record<string, boolean>>({});

  // Step 3 related states
  const [vocabReviewStatus, setVocabReviewStatus] = useState<Record<string, 'known' | 'later'>>({});

  // Step 4 related states
  const [studentText, setStudentText] = useState(activeLesson.studentLastRewrite || '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Simulated grading results
  const [evaluation, setEvaluation] = useState<{
    score: number;
    grammarErrors: { wrong: string; correct: string; explanation: string }[];
    vocabSuggestions: { useInstead: string; logic: string }[];
    missingIdeas: string[];
    betterSuggestions: string[];
    feedbackText: string;
  } | null>(null);

  // Active playing audio snippet for small segments
  const [snipActiveId, setSnipActiveId] = useState<string | null>(null);

  // Monitor lesson selection switches
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setAudioProgress(0);
    setTimeElapsed(0);
    setHighlightedSectionId(null);
    setStudentText(activeLesson.studentLastRewrite || '');
    setIsSubmitted(false);
    setEvaluation(null);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
  }, [selectedLessonId, activeLesson]);

  // Audio timer simulations
  useEffect(() => {
    if (isPlaying) {
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
            return 100;
          }
          return prev + (100 / activeLesson.durationSeconds);
        });
        setTimeElapsed(prev => {
          if (prev >= activeLesson.durationSeconds) {
            return activeLesson.durationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }

    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isPlaying, activeLesson.durationSeconds]);

  // Handle Mark as Listened for Step 1
  const handleMarkAsListened = () => {
    // simulated listen trigger
    onUpdateLessonStatus(activeLesson.id, 'In Progress');
    onAddLog('Luyện nghe Step 1: Listen First', activeLesson.title, undefined, 2);
    // Auto shift to step 2 after nice visual trigger
    setCurrentStep(1);
    setIsPlaying(false);
    setAudioProgress(0);
    setTimeElapsed(0);
  };

  const toggleGlobalPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetPlaying = () => {
    setIsPlaying(false);
    setAudioProgress(0);
    setTimeElapsed(0);
  };

  // Play micro segment audio simulation
  const handlePlaySegment = (sectionId: string) => {
    setSnipActiveId(sectionId);
    setTimeout(() => setSnipActiveId(null), 2500);
  };

  const toggleTranslation = (id: string) => {
    setHideTranslationMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSetVocabStatus = (vocab: VocabularyItem, state: 'known' | 'later') => {
    setVocabReviewStatus(prev => ({
      ...prev,
      [vocab.id]: state
    }));

    if (state === 'known') {
      // Add or update status in main state notebook via props
      onAddVocab({
        ...vocab,
        status: 'Mastered'
      });
    } else {
      onAddVocab({
        ...vocab,
        status: 'Learning'
      });
    }
  };

  // Real-time comparison NLP grading engine (client-side matching key terms!)
  const submitRewriting = () => {
    const text = studentText.trim();
    if (text.length < 15) {
      alert("Đoạn viết của bạn quá ngắn. Hãy cố viết ít nhất một vài câu hoàn chỉnh!");
      return;
    }

    onUpdateLessonStatus(activeLesson.id, 'In Progress');

    // Simple keyword extraction scanner to award scores
    const keyPhrasesGym = [
      { rx: /coding/i, desc: 'Sitting and coding for project' },
      { rx: /work\s*out|exercise|gym/i, desc: 'Decided to work out' },
      { rx: /running\s*on\s*the\s*machine/i, desc: 'Running on the running machine / treadmill' },
      { rx: /water\s*bottle/i, desc: 'Grabbing his water bottle' },
      { rx: /bumped\s*into|hit|crashed/i, desc: 'Bumped into a younger student' },
      { rx: /lost\s*control|balance/i, desc: 'Student lost control/balance' },
      { rx: /fell\s*over|down/i, desc: 'Student fell over' },
      { rx: /weight\s*rack/i, desc: 'Almost knocked over the weight rack' },
      { rx: /bent\s*down/i, desc: 'Bent down to help' },
      { rx: /help\s*him\s*up/i, desc: 'Helped the student up' },
      { rx: /by\s*himself/i, desc: 'Student got up by himself' },
      { rx: /came\s*back\s*to\s*room/i, desc: 'Came back to his room after workout' }
    ];

    const keyPhrasesCoffee = [
      { rx: /specialty coffee|roasters/i, desc: 'Seattle Roasters cafe' },
      { rx: /caramel\s*macchiato/i, desc: 'Caramel Macchiato order' },
      { rx: /oat\s*milk/i, desc: 'Oat milk customized' },
      { rx: /hot|iced/i, desc: 'Temperature choice (Hot or Iced)' },
      { rx: /extra\s*hot/i, desc: 'Requested extra hot drinks' },
      { rx: /less\s*sweet|syrup/i, desc: 'Syrup custom adjustment' },
      { rx: /6\.50|six\s*dollars|fifty\s*cents/i, desc: 'Price check $6.50' },
      { rx: /cash\s*or\s*card/i, desc: 'Payment prompt Cash or Card' }
    ];

    const keyPhrasesWork = [
      { rx: /wrap\s*up|complete/i, desc: 'Quarterly reviews wrapping up' },
      { rx: /quarterly\s*financial|reviews/i, desc: 'Quarterly reviews topic' },
      { rx: /chief\s*executive|ceo/i, desc: 'Chief executive scheduling the meeting' },
      { rx: /brief|pitch|present/i, desc: 'Fast progress pitch required' },
      { rx: /sales\s*wins/i, desc: 'Highlighting sales wins clearly' },
      { rx: /mitigate/i, desc: 'Mitigate risk vectors' },
      { rx: /eleventh\s*hour|last\s*minute/i, desc: 'Avoid rush at eleventh hour' }
    ];

    let matches = 0;
    let missingPoints: string[] = [];
    let activeKeyTriggers = keyPhrasesGym;

    if (activeLesson.id === 'lesson-2') {
      activeKeyTriggers = keyPhrasesCoffee;
    } else if (activeLesson.id === 'lesson-3') {
      activeKeyTriggers = keyPhrasesWork;
    }

    activeKeyTriggers.forEach(item => {
      if (item.rx.test(text)) {
        matches++;
      } else {
        missingPoints.push(item.desc);
      }
    });

    // Score calculation
    const accuracyPortion = (matches / activeKeyTriggers.length) * 50; // Max 50 points
    const lengthPortion = Math.min(30, (text.split(' ').length / activeLesson.transcript.split(' ').length) * 30); // Max 30 points
    const coherenceBonus = text.includes('.') && text.split('.').length > 3 ? 20 : 10; // Max 20 points
    const calculatedScore = Math.min(100, Math.round(accuracyPortion + lengthPortion + coherenceBonus));

    // Dynamic corrections scanner based on typical learner write-ups
    const grammarErrResults: { wrong: string; correct: string; explanation: string }[] = [];
    
    if (text.includes("runing")) {
      grammarErrResults.push({
        wrong: "runing",
        correct: "running",
        explanation: 'Nhân đôi chữ "n" khi thêm đuôi -ing vào động từ có một âm tiết kết thúc bằng một nguyên âm và một phụ âm (run -> running).'
      });
    }
    if (text.includes("on machine")) {
      grammarErrResults.push({
        wrong: "on machine",
        correct: "on the machine",
        explanation: 'Thêm mạo từ "the" trước danh từ đã xác định (máy chạy trong phòng gym).'
      });
    }
    if (text.includes("water bottle") && !text.includes("my water bottle") && !text.includes("the water bottle")) {
      grammarErrResults.push({
        wrong: "water bottle",
        correct: "my water bottle",
        explanation: 'Nên đề cập tính từ sở hữu "my" để câu văn tự nhiên và rõ ràng hơn.'
      });
    }
    if (text.includes("bump into")) {
      grammarErrResults.push({
        wrong: "bump into",
        correct: "bumped into",
        explanation: 'Câu chuyện diễn ra trong quá khứ, nên chia động từ ở quá khứ đơn (bump -> bumped).'
      });
    }
    if (text.includes("lose balance") || text.includes("lose control")) {
      grammarErrResults.push({
        wrong: "lose",
        correct: "lost",
        explanation: 'Dùng quá khứ đơn (lost) thay vì hiện tại cơ bản (lose).'
      });
    }
    if (text.includes("fall down") && !text.includes("fell down") && !text.includes("fell over")) {
      grammarErrResults.push({
        wrong: "fall down",
        correct: "fell over / fell down",
        explanation: 'Chuyển đổi sang dạng quá khứ của động từ bất quy tắc (fall -> fell).'
      });
    }

    const vocabSug: { useInstead: string; logic: string }[] = [];
    if (!text.includes("bumped into") && text.includes("hit")) {
      vocabSug.push({
        useInstead: "bumped into",
        logic: 'Dùng "bumped into" sẽ mang tính tự nhiên chuẩn bản xứ hơn so với động từ khô khan "hit".'
      });
    }
    if (!text.includes("work out") && text.includes("exercise")) {
      vocabSug.push({
        useInstead: "work out",
        logic: 'Cụm phrasal verb "work out" thường được dùng rất nhiều trong thực tế hội thoại khi nói về tập gym.'
      });
    }

    const betterSuggestions = [
      `Original: "${activeLesson.sections[0]?.english || 'Sentence example'}"`,
      activeLesson.id === 'lesson-1' 
        ? 'Dùng cấu trúc "While I was running..." giúp kết nối hai hành động chặt chẽ hơn.'
        : 'Nên bổ sung cấu trúc dán hóa đơn lịch sự như "Could I have..."'
    ];

    let scoreValue = calculatedScore;
    if (scoreValue < 30) scoreValue = 45; // lowest floor score for encouragement

    const evalResult = {
      score: scoreValue,
      grammarErrors: grammarErrResults,
      vocabSuggestions: vocabSug,
      missingIdeas: missingPoints.slice(0, 3), // max 3 points
      betterSuggestions: betterSuggestions,
      feedbackText: scoreValue >= 85 
        ? "Cực kỳ xuất sắc! Bạn nhớ bài nghe gần như trọn vẹn, hành văn trôi chảy và mắc rất ít lỗi diễn đạt." 
        : scoreValue >= 65 
          ? "Rất tốt! Bạn đã nắm giữ hầu hết bối cảnh chính, hãy chú ý hơn một chút tới việc chia động từ ở các thì quá khứ." 
          : "Khá ổn! Bạn hiểu tổng quan mạch truyện, tuy nhiên cần chú ý rèn lại từ vựng để nắm chắc thêm các chi tiết nhỏ của đoạn nghe."
    };

    setEvaluation(evalResult);
    setIsSubmitted(true);
    onUpdateLessonStatus(activeLesson.id, 'Completed', scoreValue);
    onAddLog('Hoàn thành bài viết lại (5 Bước)', activeLesson.title, scoreValue, 5);
    setCurrentStep(4); // Move straight to Step 5 (index 4)
  };

  // Step names translation helper
  const stepMeta = [
    { num: 1, text: "Listen First", dec: "Chỉ nghe không nhìn chữ", icon: Headphones },
    { num: 2, text: "Listen with Context", dec: "Rà soát ý nghĩa câu thoại", icon: Map },
    { num: 3, text: "Vocabulary Focus", dec: "Đào sâu từ vựng mấu chốt", icon: BookMarked },
    { num: 4, text: "Rewrite from Memory", dec: "Tử thách tự diễn đạt lại", icon: FileEdit },
    { num: 5, text: "Compare & Improve", dec: "Nhận xét & Sửa lỗi chi tiết", icon: CheckSquare }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Current Lesson Info top strip */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {activeLesson.topic}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Level: {activeLesson.level}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">{activeLesson.title}</h2>
        </div>
        
        {/* Quick Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Đổi bài học:</label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {lessons.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress learning flow step index container */}
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stepMeta.map((s, idx) => {
            const SIcon = s.icon;
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            
            return (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-xs' 
                    : isCompleted 
                      ? 'bg-slate-950/50 border-emerald-900/30 text-slate-400' 
                      : 'bg-slate-950/20 border-slate-850 text-slate-600 hover:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : isCompleted ? 'bg-slate-800 text-emerald-500' : 'bg-slate-900 text-slate-500'
                  }`}>
                    Step {s.num}
                  </span>
                  {isCompleted && <Check className="h-3 w-3 text-emerald-400" />}
                </div>
                <h4 className="font-bold text-xs line-clamp-1">{s.text}</h4>
                <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">{s.dec}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT SWITCH PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main learning workplace board */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: Blind Listening Mode */}
          {currentStep === 0 && (
            <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6 text-center">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
                <Headphones className="h-10 w-10 animate-pulse" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-slate-200">Bước 1: Nghe Chân Thực Không Nhìn Chữ</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Nhấn phát âm thanh, nhắm mắt tự cảm nhận giọng đọc, nhịp điệu và ngữ điệu mà không bị phân tâm bởi văn bản.
                </p>
              </div>

              {/* Graphical audio wave simulation player */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 max-w-lg mx-auto space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">00:{timeElapsed.toString().padStart(2, '0')}</span>
                  <span className="font-semibold text-emerald-400">
                    {isPlaying ? '⚡ Đang phát sóng audio...' : '⏸️ Tạm dừng phát'}
                  </span>
                  <span className="font-mono">00:{activeLesson.durationSeconds.toString().padStart(2, '0')}</span>
                </div>

                {/* Sound wave bars block */}
                <div className="h-12 flex items-center justify-center gap-1">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const rndHeight = Math.max(15, isPlaying ? Math.random() * 40 + 5 : Math.sin(i * 0.5) * 12 + 15);
                    return (
                      <div 
                        key={i} 
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isPlaying ? 'bg-gradient-to-t from-emerald-500 to-teal-400' : 'bg-slate-800'
                        }`}
                        style={{ height: `${rndHeight}%` }}
                      />
                    );
                  })}
                </div>

                {/* Timeline slider container */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>

                {/* Player button controls row */}
                <div className="flex justify-center items-center gap-4">
                  <button 
                    onClick={resetPlaying} 
                    className="p-2 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    title="Phát lại"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={toggleGlobalPlay}
                    className="p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl transition-all shadow-md shadow-emerald-500/20"
                  >
                    {isPlaying ? <Pause className="h-6 w-6 stroke-[3px]" /> : <Play className="h-6 w-6 stroke-[3px] fill-slate-950" />}
                  </button>
                  <div className="p-2 w-8" />
                </div>
              </div>

              {/* Action trigger button */}
              <div className="pt-4 border-t border-slate-800/60 max-w-md mx-auto">
                <button
                  onClick={handleMarkAsListened}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Xác nhận đã nghe xong, sang Bước 2</span>
                </button>
                <span className="text-[10px] text-slate-500 block mt-2">
                  Bạn có thể nghe bao nhiêu lần tùy mong muốn trước khi bấm đổi bước.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Listen with Context */}
          {currentStep === 1 && (
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-200">Bước 2: Luyện Nghe Đối Chiếu Theo Ngữ Cảnh</h3>
                <p className="text-xs text-slate-400">
                  Hãy nghe lại từng phân đoạn nhỏ. Hãy rê chuột qua từng câu để xem dịch nghĩa tiếng Việt, cấu trúc câu tiêu biểu và bối cảnh sử dụng.
                </p>
              </div>

              {/* Loop Segment List */}
              <div className="space-y-4">
                {activeLesson.sections.map((sec, index) => {
                  const isFlashed = snipActiveId === sec.id;
                  const isHiddenTranslation = hideTranslationMap[sec.id] === true;
                  
                  return (
                    <div 
                      key={sec.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isFlashed 
                          ? 'bg-amber-500/5 border-amber-500/30 ring-1 ring-amber-500/20' 
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-850 h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        
                        <div className="flex-1 space-y-2">
                          {/* English block Sentence */}
                          <p className="text-base font-bold text-slate-100 tracking-wide font-sans md:leading-relaxed">
                            {sec.english}
                          </p>

                          {/* Vietnamese translation segment */}
                          {!isHiddenTranslation && (
                            <p className="text-sm text-emerald-400 font-sans pl-3 border-l-2 border-emerald-700/60 transition-opacity">
                              {sec.vietnamese}
                            </p>
                          )}

                          {/* Detail contextual explanation block */}
                          <div className="bg-slate-900/60 rounded-xl p-3 text-xs text-slate-400 space-y-2 border border-slate-800/80">
                            <div>
                              <b className="text-slate-300">Phân tích hội thoại:</b> {sec.context}
                            </div>
                            
                            {/* Segment Vocabularies */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {sec.vocabulary.map((vo, vIdx) => (
                                <span key={vIdx} className="bg-slate-950 border border-slate-850 px-2.5 py-0.5 rounded text-[10px] text-slate-300">
                                  💎 <b className="text-slate-200">{vo.word}</b>: {vo.meaning}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interactive control triggers for segment */}
                        <div className="flex flex-col gap-1.5 shrink-0">
                          {/* Play snippet btn */}
                          <button
                            onClick={() => handlePlaySegment(sec.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700/50 hover:text-emerald-400 transition-all"
                            title="Nghe riêng đoạn này"
                          >
                            <Volume2 className="h-4.5 w-4.5" />
                            <span className="text-[10px] hidden md:inline">Loa thoại ({isFlashed ? '...' : `${index + 1}`})</span>
                          </button>

                          {/* Show hide translator btn */}
                          <button
                            onClick={() => toggleTranslation(sec.id)}
                            className="p-1.5 bg-slate-900/60 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-medium flex items-center justify-center transition-all"
                            title="Ẩn/Hiện bản dịch nghĩa"
                          >
                            {isHiddenTranslation ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation button to next phase */}
              <div className="flex justify-end pt-4 border-t border-slate-800/60">
                <button
                  onClick={() => {
                    onAddLog('Luyện nghe Step 2: Context Listening', activeLesson.title, undefined, 3);
                    setCurrentStep(2);
                  }}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 transition-all border border-slate-750"
                >
                  <span>Chuyển sang Bước 3: Đào từ vựng</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Vocabulary Focus studycards */}
          {currentStep === 2 && (
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-200">Bước 3: Đào Sâu Các Cụm Từ & Phrasal Verbs</h3>
                <p className="text-xs text-slate-400">
                  Hòa mình vào cấu trúc tiếng Anh thực thụ. Phân tích cách người bản xứ phối hợp động từ tách rời, giới từ và ghi chú sổ tay.
                </p>
              </div>

              {/* Vocab Study Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeLesson.vocabularies.map((vocab) => {
                  const savedState = vocabReviewStatus[vocab.id];
                  const isInNotebookAlready = vNotebook.some(vn => vn.word === vocab.word);
                  
                  return (
                    <div 
                      key={vocab.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        savedState === 'known' 
                          ? 'bg-emerald-500/[0.02] border-emerald-500/30' 
                          : savedState === 'later'
                            ? 'bg-amber-500/[0.02] border-amber-900/30'
                            : 'bg-slate-950/50 border-slate-800'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-slate-100 flex items-center gap-1">
                            <span className="text-amber-400 font-sans">★</span>
                            <span>{vocab.word}</span>
                          </h4>
                          {vocab.ipa && (
                            <span className="text-[11px] font-mono text-slate-400 font-medium">
                              {vocab.ipa}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                            {vocab.vietnamese}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 italic leading-relaxed pt-1">
                          🧠 <b>Sử dụng:</b> {vocab.contextUsage}
                        </p>

                        <div className="p-2.5 bg-slate-900/80 rounded-lg text-xs border border-slate-800">
                          <span className="text-slate-500 block uppercase text-[8px] tracking-wider mb-0.5">Câu ví dụ:</span>
                          <span className="text-slate-200 font-sans font-medium">"{vocab.exampleSentence}"</span>
                        </div>
                      </div>

                      {/* Control check triggers */}
                      <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                        <button
                          type="button"
                          onClick={() => handleSetVocabStatus(vocab, 'known')}
                          className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                            savedState === 'known' || isInNotebookAlready
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Tôi đã thuộc từ này</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetVocabStatus(vocab, 'later')}
                          className={`flex-1 py-1.5 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
                            savedState === 'later'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-300 border border-transparent'
                          }`}
                        >
                          <Bookmark className="h-3.5 w-3.5" />
                          <span>Lưu lại sổ tay ôn tập</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Navigation button to next phase */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800/60">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại Bước 2</span>
                </button>
                <button
                  onClick={() => {
                    onAddLog('Luyện nghe Step 3: Vocabulary Focus', activeLesson.title, undefined, 2);
                    setCurrentStep(3);
                  }}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-2 transition-all border border-slate-750"
                >
                  <span>Chuyển sang Bước 4: Viết hồi tưởng</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Rewrite from Memory */}
          {currentStep === 3 && (
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-200">Bước 4: Hãy Tự Viết Lại Nội Dung Sườn Ý Của Bài Nghe</h3>
                <p className="text-xs text-slate-400">
                  Đây là trái tim của phương pháp! Sau khi đã tai nghe, ý thấu, hãy sử dụng ngôn từ, ngữ pháp tiếng Anh của chính bạn để tái hiện lại câu chuyện mà bạn vừa học.
                </p>
              </div>

              {/* Guidelines helper questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-850/80">
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-teal-400 uppercase tracking-wider">💡 Bộ câu hỏi định hướng khung viết:</h5>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    <li>Sự việc nào diễn ra đầu tiên? (What happened first?)</li>
                    <li>Có những nhân vật hay đối tượng nào tham gia?</li>
                    <li>Sự cố hoặc vấn đề nổi lên ở đây là gì?</li>
                    <li>Kết thúc sự việc đó diễn biến như thế nào?</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">🌟 Những cụm từ gợі ý nên phối hợp:</h5>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {activeLesson.vocabularies.slice(0, 5).map(v => (
                      <span key={v.id} className="text-[10px] font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                        {v.word}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 block pt-1 leading-normal italic">
                    Gợi ý: Sử dụng linh hoạt các thì quá khứ (Past Continuous + Past Simple) để câu văn mạch lạc!
                  </span>
                </div>
              </div>

              {/* Text Writing Area */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Khung viết bài của bạn:</span>
                  <span className="text-slate-400">
                    Số từ: <b className="text-slate-200">{studentText.trim() === '' ? 0 : studentText.trim().split(/\s+/).length} từ</b> (Khuyên dùng từ 40 - 100 từ)
                  </span>
                </div>

                <textarea
                  id="rewrite-memory-textarea"
                  placeholder="Today, after spending a busy day... (Gõ lại đoạn văn bạn nhớ bằng tiếng Anh của bạn)"
                  rows={8}
                  value={studentText}
                  onChange={(e) => setStudentText(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl px-5 py-4 text-slate-100 placeholder-slate-600 leading-relaxed font-sans transition-all outline-none"
                />
              </div>

              {/* Submission row buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800/60">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại Bước 3</span>
                </button>
                <button
                  type="button"
                  onClick={submitRewriting}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/10"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Nộp bài & Kiểm tra bằng AI Coach</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 5: Compare and Improve results board */}
          {currentStep === 4 && evaluation && (
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-6">
              
              {/* Grading scoring top segment */}
              <div className="bg-gradient-to-r from-emerald-950/30 to-slate-900/40 p-5 rounded-2xl border border-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner flex flex-col justify-center items-center shrink-0">
                    <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">SCORE</span>
                    <span className="text-emerald-300 text-2xl font-black">{evaluation.score}</span>
                  </div>
                  <div className="space-y-0.5 text-center md:text-left">
                    <h4 className="font-bold text-slate-200">Báo Cáo Đánh Giá Từ AI Listening Coach</h4>
                    <p className="text-xs text-slate-400 leading-normal max-w-md">{evaluation.feedbackText}</p>
                  </div>
                </div>

                <div className="text-xs text-center border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5 shrink-0 col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">REWRITE ATTEMPTS</span>
                  <span className="text-2xl font-black text-slate-100">{activeLesson.rewriteCount + 1} lần</span>
                </div>
              </div>

              {/* Scribe Side-by-Side Comparison view */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-300">Đôi cánh đối chiếu: Bản viết của bạn vs Bài nghe gốc</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student box */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-1.5">
                    <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase">Bản viết của bạn</span>
                    <p className="text-xs text-slate-200 leading-relaxed italic whitespace-pre-wrap">
                      "{studentText}"
                    </p>
                  </div>
                  
                  {/* Original text box */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-1.5">
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Bài gốc đối chứng</span>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      "{activeLesson.transcript}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Breakdown Corrections panels */}
              <div className="space-y-4 pt-2">
                
                {/* Grammar correction tabs */}
                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-850 space-y-3">
                  <h5 className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Lỗi diễn đạt & Quy tắc ngữ pháp cần lưu ý ({evaluation.grammarErrors.length})</span>
                  </h5>
                  {evaluation.grammarErrors.length === 0 ? (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Không phát hiện lỗi chính tả hay ngữ pháp nghiêm trọng. Làm tốt lắm!</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {evaluation.grammarErrors.map((err, errIdx) => (
                        <div key={errIdx} className="bg-slate-900 rounded-xl p-3 border border-slate-850 flex items-start gap-2.5">
                          <span className="h-5 w-5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                            {errIdx + 1}
                          </span>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="line-through text-red-400 font-bold bg-red-500/10 px-1.5 rounded">"{err.wrong}"</span>
                              <span className="text-slate-500">➜</span>
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 rounded">"{err.correct}"</span>
                            </div>
                            <p className="text-slate-300 leading-normal">{err.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing ideas / Details analyzer */}
                {evaluation.missingIdeas.length > 0 && (
                  <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-850 space-y-2">
                    <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Lightbulb className="h-4 w-4" />
                      <span>Chi tiết có thể bổ sung thêm để đạt điểm tối đa ({evaluation.missingIdeas.length})</span>
                    </h5>
                    <ul className="space-y-1 list-disc list-inside text-xs text-slate-300">
                      {evaluation.missingIdeas.map((idea, idIdx) => (
                        <li key={idIdx} className="leading-relaxed">
                          Chưa nêu rõ chi tiết: <span className="font-semibold text-slate-200">{idea}</span>.
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Vocabulary custom suggestions */}
                {evaluation.vocabSuggestions.length > 0 && (
                  <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-850 space-y-2.5">
                    <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="h-4 w-4" />
                      <span>Mẹo sử dụng từ ngữ cao cấp chuẩn người bản xứ</span>
                    </h5>
                    {evaluation.vocabSuggestions.map((vSug, vIdx) => (
                      <div key={vIdx} className="text-xs space-y-0.5">
                        <div className="text-emerald-300 font-bold">💡 Nên sử dụng cụm phrasal verb: "{vSug.useInstead}"</div>
                        <p className="text-slate-400 leading-normal pl-4 border-l border-slate-700">{vSug.logic}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* End steps action navigators */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-800/60 gap-4">
                <button
                  onClick={() => {
                    setStudentText('');
                    setIsSubmitted(false);
                    setEvaluation(null);
                    setCurrentStep(3); // Go back to Step 4
                  }}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Viết lại một bản viết mới từ đầu</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Switch to beginning
                      setCurrentStep(0);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-750"
                  >
                    Nghe Blind Test lại lần nữa
                  </button>
                  <button
                    onClick={() => {
                      // Go to next lesson
                      const activeIndex = lessons.findIndex(l => l.id === selectedLessonId);
                      const nextLesson = lessons[(activeIndex + 1) % lessons.length];
                      if (nextLesson) {
                        setSelectedLessonId(nextLesson.id);
                      }
                    }}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-sm shadow-emerald-500/10"
                  >
                    Học bài nghe tiếp theo
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right side helper dock block: AI listening Coach */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            
            {/* Coach avatar line */}
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
              <div className="relative">
                <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Headphones className="h-5 w-5 animate-bounce" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <span>AI Listening Coach</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">ONLINE</span>
                </div>
                <div className="text-[10px] text-slate-400">Người đồng hành rèn hai tai & phản xạ</div>
              </div>
            </div>

            {/* Simulated Coach response according to dynamic context */}
            <div className="space-y-3">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900 text-xs text-slate-300 leading-relaxed space-y-2.5 relative">
                <p>
                  {currentStep === 0 && (
                    "Hãy thư giãn cơ thể một cách tối đa, nhắm nghiền mắt lại và cố bấu víu lấy bất kỳ từ nào bạn nhận ra lúc phát audio. Chưa cần hiểu ngữ pháp vội nhé!"
                  )}
                  {currentStep === 1 && (
                    "Rất tốt! Giờ hãy rê chuột so sánh hai thứ tiếng. Hãy để ý xem người nói nhấn mạnh (stress) vào những phrasal verb hay giới từ nào nhé!"
                  )}
                  {currentStep === 2 && (
                    "Đây đều là những thành ngữ dắt túi cực kỳ chất! Hãy bóc tách nghĩa tiếng Việt, bấm ôn tập ngay và lưu chúng vào sổ tay để ứng dụng vào đoạn viết sắp tới của bạn."
                  )}
                  {currentStep === 3 && (
                    "Đừng quá lo lắng về lỗi sai chính tả! Hãy cố dồn tất cả dữ kiện đầu từ ban đầu bạn ghi nhớ được để viết liền mạch. Tôi sẽ chỉnh lý và nâng điểm văn phong cho bạn ngay sau đây!"
                  )}
                  {currentStep === 4 && (
                    `Bạn đạt ${evaluation?.score} điểm! Hãy lướt nhìn qua những chỉnh lý màu sắc phía bên trái. Thực hiện viết lại thêm một lần hôm nay sẽ giúp nạo sâu từ vựng đó vào mảng trí nhớ vĩnh viễn.`
                  )}
                </p>
                <div className="absolute -left-1.5 top-5 w-3.5 h-3.5 rotate-45 bg-slate-955 border-l border-b border-slate-900" />
              </div>

              {/* Tips check list for listeners */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Nhiệm vụ rèn luyện:</span>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center shrink-0 border ${
                      currentStep >= 1 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-slate-800 bg-slate-950/40 text-slate-600'
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={currentStep >= 1 ? 'line-through text-slate-500' : 'text-slate-300'}>Nghe blind âm thanh (Step 1)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center shrink-0 border ${
                      currentStep >= 2 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-slate-800 bg-slate-950/40 text-slate-600'
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={currentStep >= 2 ? 'line-through text-slate-500' : 'text-slate-300'}>Kiểm tra ngữ cảnh (Step 2)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center shrink-0 border ${
                      currentStep >= 3 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-slate-800 bg-slate-950/40 text-slate-600'
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={currentStep >= 3 ? 'line-through text-slate-500' : 'text-slate-300'}>Chọn lọc & nạp từ vựng mấu chốt (Step 3)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center shrink-0 border ${
                      currentStep >= 4 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-slate-800 bg-slate-950/40 text-slate-600'
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={currentStep >= 4 ? 'line-through text-slate-500' : 'text-slate-300'}>Tự viết lại nội dung cốt truyện (Step 4)</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
