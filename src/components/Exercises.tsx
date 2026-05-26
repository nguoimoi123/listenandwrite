import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Volume2, 
  Mic, 
  RefreshCw, 
  Award,
  ChevronRight,
  ListRestart
} from 'lucide-react';
import { Lesson } from '../types';

interface ExercisesProps {
  lessons: Lesson[];
  selectedLessonId: string;
  setSelectedLessonId: (id: string) => void;
  onAddLog: (action: string, lessonTitle: string, score?: number, minutes?: number) => void;
}

export default function Exercises({ 
  lessons, 
  selectedLessonId, 
  setSelectedLessonId,
  onAddLog
}: ExercisesProps) {

  const activeLesson = lessons.find(l => l.id === selectedLessonId) || lessons[0];

  // Active sub-track tab ('choice' | 'blank' | 'order' | 'dictation' | 'shadow')
  const [activeQuizTab, setActiveQuizTab] = useState<'choice' | 'blank' | 'order' | 'dictation' | 'shadow'>('choice');

  // Question tracking indexes
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [clueRevealed, setClueRevealed] = useState(false);

  // Fill in blanks states
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  const [blankResults, setBlankResults] = useState<Record<string, boolean>>({});
  const [blanksChecked, setBlanksChecked] = useState(false);

  // Sentence ordering states
  const [scrambledList, setScrambledList] = useState<string[]>([]);
  const [orderedList, setOrderedList] = useState<string[]>([]);
  const [isOrderChecked, setIsOrderChecked] = useState(false);
  const [isOrderCorrect, setIsOrderCorrect] = useState(false);

  // Dictation states
  const [dictationInputs, setDictationInputs] = useState<Record<string, string>>({});
  const [dictationResults, setDictationResults] = useState<Record<string, { status: 'correct' | 'partial' | 'wrong', message: string }>>({});
  const [dictationsChecked, setDictationsChecked] = useState<Record<string, boolean>>({});

  // Shadowing states
  const [isRecordingShadow, setIsRecordingShadow] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [shadowScore, setShadowScore] = useState<number | null>(null);
  const [shadowWaves, setShadowWaves] = useState<number[]>([]);
  const shadowTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync state data on lesson / tab change
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setClueRevealed(false);
    setBlankAnswers({});
    setBlankResults({});
    setBlanksChecked(false);
    setIsOrderChecked(false);
    setOrderedList([]);
    setDictationInputs({});
    setDictationResults({});
    setDictationsChecked({});
    setIsRecordingShadow(false);
    setShadowScore(null);
    setShadowWaves([]);
    if (shadowTimerRef.current) clearInterval(shadowTimerRef.current);

    // Prepare ordering list
    if (activeLesson.sentenceOrdering && activeLesson.sentenceOrdering.length > 0) {
      setScrambledList([...activeLesson.sentenceOrdering[0].scrambledSegments]);
    } else {
      setScrambledList([]);
    }
  }, [selectedLessonId, activeQuizTab, activeLesson]);

  // Handle Recording timer for simulated shadowing
  useEffect(() => {
    if (isRecordingShadow) {
      shadowTimerRef.current = setInterval(() => {
        setRecordingTimer(prev => {
          if (prev >= 6) {
            setIsRecordingShadow(false);
            if (shadowTimerRef.current) clearInterval(shadowTimerRef.current);
            // evaluate high shadow score
            setShadowScore(Math.round(Math.random() * 15 + 85));
            return 0;
          }
          return prev + 1;
        });

        // generate randomized microphone frequencies
        setShadowWaves(Array.from({ length: 15 }, () => Math.round(Math.random() * 80 + 20)));
      }, 800);
    } else {
      if (shadowTimerRef.current) clearInterval(shadowTimerRef.current);
    }

    return () => {
      if (shadowTimerRef.current) clearInterval(shadowTimerRef.current);
    };
  }, [isRecordingShadow]);

  // Multiple choice click
  const handleAnswerSelect = (optionIdx: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(optionIdx);
  };

  const checkCoreAnswer = (correctAnswerIdx: number) => {
    setIsAnswerChecked(true);
    const score = selectedAnswer === correctAnswerIdx ? 100 : 0;
    onAddLog('Luyện trắc nghiệm (Multiple Choice)', activeLesson.title, score, 1);
  };

  // Blanks check
  const handleBlankInputChange = (qId: string, val: string) => {
    setBlankAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const verifyBlanks = () => {
    const results: Record<string, boolean> = {};
    let correctCount = 0;
    const questionsList = activeLesson.fillBlanks || [];

    questionsList.forEach(q => {
      const studentInput = (blankAnswers[q.id] || '').trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      const expectedAns = q.blankValue.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      const ok = studentInput === expectedAns;
      results[q.id] = ok;
      if (ok) correctCount++;
    });

    setBlankResults(results);
    setBlanksChecked(true);
    const score = Math.round((correctCount / (questionsList.length || 1)) * 100);
    onAddLog('Điền vào chỗ trống (Fill Blank)', activeLesson.title, score, 2);
  };

  // Scrambled ordering logic helper
  const handleTileClick = (segment: string) => {
    if (isOrderChecked) return;
    if (orderedList.includes(segment)) {
      setOrderedList(prev => prev.filter(item => item !== segment));
    } else {
      setOrderedList(prev => [...prev, segment]);
    }
  };

  const checkSentenceOrder = (solution: string) => {
    setIsOrderChecked(true);
    const fullAssembled = orderedList.join(' ').replace(/\s+,/g, ',').replace(/\s+\./g, '.');
    const cleanAssembled = fullAssembled.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const cleanSolution = solution.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

    const isCorrect = cleanAssembled === cleanSolution;
    setIsOrderCorrect(isCorrect);
    
    const score = isCorrect ? 100 : 30;
    onAddLog('Sắp xếp trật tự câu (Sentence Ordering)', activeLesson.title, score, 1);
  };

  // Dictation submit
  const handleCheckDictationSingle = (dId: string, audioText: string) => {
    const userInput = (dictationInputs[dId] || '').trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const expected = audioText.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

    let statusResult: 'correct' | 'partial' | 'wrong' = 'wrong';
    let msg = '';

    if (userInput === expected) {
      statusResult = 'correct';
      msg = 'Quá tuyệt vời! Đúng từng từ một.';
    } else if (userInput.length > 0 && (expected.includes(userInput) || userInput.includes(expected) || expected.slice(0, 5) === userInput.slice(0, 5))) {
      statusResult = 'partial';
      msg = `Gần chính xác! Đáp án đúng: "${audioText}"`;
    } else {
      statusResult = 'wrong';
      msg = `Chưa chính xác. Đáp án đúng: "${audioText}"`;
    }

    setDictationResults(prev => ({
      ...prev,
      [dId]: { status: statusResult, message: msg }
    }));

    setDictationsChecked(prev => ({
      ...prev,
      [dId]: true
    }));

    onAddLog('Luyện nghe chép chính tả (Dictation)', activeLesson.title, statusResult === 'correct' ? 100 : 40, 2);
  };

  // Shadowing record trigger
  const handleToggleShadowRecord = () => {
    if (isRecordingShadow) {
      setIsRecordingShadow(false);
      setRecordingTimer(0);
    } else {
      setShadowScore(null);
      setRecordingTimer(0);
      setIsRecordingShadow(true);
      onAddLog('Luyện Shadowing phát âm', activeLesson.title, 92, 1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20 shadow-xs">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">Exercises Center</h2>
            <p className="text-xs text-slate-400">Các trò chơi tương tác kiểm tra độ hiểu bài, khả năng nhớ cụm từ và phát âm.</p>
          </div>
        </div>

        {/* Change Lesson dropdown */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <span className="text-xs text-slate-400 font-medium pl-1">Bài học hiện tại:</span>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="bg-slate-950/80 border-0 focus:ring-0 rounded-lg text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
          >
            {lessons.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Exercise Tracks Subtabs */}
      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex justify-between gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveQuizTab('choice')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
            activeQuizTab === 'choice' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Trắc nghiệm Nghe hiểu
        </button>
        <button
          onClick={() => setActiveQuizTab('blank')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
            activeQuizTab === 'blank' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Điền chữ trống
        </button>
        <button
          onClick={() => setActiveQuizTab('order')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
            activeQuizTab === 'order' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sắp xếp câu chuyện
        </button>
        <button
          onClick={() => setActiveQuizTab('dictation')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
            activeQuizTab === 'dictation' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Chép chính tả (Dictation)
        </button>
        <button
          onClick={() => setActiveQuizTab('shadow')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
            activeQuizTab === 'shadow' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Nhại giọng mẫu (Shadowing)
        </button>
      </div>

      {/* SUB ACTIVE WORKSPACE WINDOWS */}
      <div className="bg-slate-900/40 p-6 md:p-8 rounded-2xl border border-slate-800">
        
        {/* TAB 1: MULTIPLE CHOICE */}
        {activeQuizTab === 'choice' && (
          <div className="space-y-6">
            <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
              <h3 className="text-base font-bold text-slate-100">Multiple Choice Comprehension</h3>
              <p className="text-xs text-slate-400">Đọc câu hỏi dưới đây và nhớ lại văn cảnh đoạn âm thanh đã học để tích đáp án đúng.</p>
            </div>

            {activeLesson.quizzes && activeLesson.quizzes.length > 0 ? (
              <div className="space-y-6">
                {activeLesson.quizzes.map((quiz, idx) => (
                  <div key={quiz.id} className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-200 flex items-start gap-2 leading-relaxed">
                      <HelpCircle className="h-4.5 w-4.5 text-teal-400 shrink-0 mt-0.5" />
                      <span>{idx + 1}. {quiz.question}</span>
                    </h4>

                    {/* Options list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quiz.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswer === optIdx;
                        const isCorrect = optIdx === quiz.correctAnswer;
                        
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleAnswerSelect(optIdx)}
                            className={`p-4 rounded-xl border text-left text-xs leading-relaxed transition-all flex items-start gap-3 ${
                              isAnswerChecked 
                                ? isCorrect
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                  : isSelected
                                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                    : 'bg-slate-950/20 border-slate-850 text-slate-500'
                                : isSelected
                                  ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 font-semibold shadow-xs'
                                  : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-350'
                            }`}
                          >
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isAnswerChecked 
                                ? isCorrect
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : isSelected
                                    ? 'bg-red-500/20 text-red-300'
                                    : 'bg-slate-900 text-slate-600'
                                : isSelected
                                  ? 'bg-teal-500/20 text-teal-300'
                                  : 'bg-slate-900 text-slate-500'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {isAnswerChecked && (
                      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 text-xs text-slate-300 leading-normal animate-fade-in">
                        💡 <b>Lý giải câu học:</b> {quiz.explanation}
                      </div>
                    )}

                    {/* Form check buttons */}
                    <div className="flex gap-2">
                      {!isAnswerChecked ? (
                        <button
                          type="button"
                          disabled={selectedAnswer === null}
                          onClick={() => checkCoreAnswer(quiz.correctAnswer)}
                          className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            selectedAnswer === null 
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                              : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                          }`}
                        >
                          Kiểm Tra
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAnswer(null);
                            setIsAnswerChecked(false);
                          }}
                          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-755 text-slate-200 rounded-lg text-xs font-semibold"
                        >
                          Luyện thử lại
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                Bài học này hiện chưa chứa trắc nghiệm cụ thể. Hãy chuyển sang các thẻ tab khác để nhận sườn bài tập trọn vẹn hơn nhé!
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FILL IN THE BLANK */}
        {activeQuizTab === 'blank' && (
          <div className="space-y-6">
            <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
              <h3 className="text-base font-bold text-slate-100">Phrasal Phrasing: Điền từ vào chỗ trống</h3>
              <p className="text-xs text-slate-400">Rèn luyện liên kết từ vựng đã học bằng cách nhẩm điền từ cho khớp với văn cảnh sau:</p>
            </div>

            {activeLesson.fillBlanks && activeLesson.fillBlanks.length > 0 ? (
              <div className="space-y-6">
                {activeLesson.fillBlanks.map((q, qidx) => {
                  const studentVal = blankAnswers[q.id] || '';
                  const wasChecked = blanksChecked;
                  const isCorrectResult = blankResults[q.id] === true;

                  return (
                    <div key={q.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 space-y-3">
                      <h4 className="text-sm font-semibold text-slate-200">
                        {qidx + 1}. {q.sentenceWithBlank}
                      </h4>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <input
                          type="text"
                          placeholder="Nhập cụm từ phù hợp..."
                          disabled={wasChecked}
                          value={studentVal}
                          onChange={(e) => handleBlankInputChange(q.id, e.target.value)}
                          className={`bg-slate-950 border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all w-full max-w-sm ${
                            wasChecked
                              ? isCorrectResult
                                ? 'border-emerald-500/40 bg-emerald-500/[0.02] text-emerald-400'
                                : 'border-red-500/40 bg-red-500/[0.02] text-red-400'
                              : 'border-slate-800 focus:border-teal-500'
                          }`}
                        />

                        {wasChecked && (
                          <div className="flex items-center gap-1.5 text-xs">
                            {isCorrectResult ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" /> Chính xác
                              </span>
                            ) : (
                              <div className="text-red-400 font-semibold space-y-0.5">
                                <span className="flex items-center gap-1"><XCircle className="h-4 w-4" /> Chưa đúng.</span>
                                <span className="text-slate-400">Đáp án: <b className="text-emerald-400">"{q.blankValue}"</b></span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Clue button and container */}
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => setClueRevealed(!clueRevealed)}
                          className="text-[10px] text-slate-550 hover:text-slate-450 underline font-semibold focus:outline-none"
                        >
                          {clueRevealed ? 'Ẩn gợi ý nghĩa' : '💡 Xem gợi ý từ khóa'}
                        </button>
                        {clueRevealed && (
                          <p className="text-[11px] text-teal-400 italic font-medium leading-normal pl-3 border-l border-teal-800">
                            {q.clue}
                          </p>
                        )}
                      </div>

                    </div>
                  );
                })}

                {/* Blanks operations */}
                <div className="flex gap-2 pt-2">
                  {!blanksChecked ? (
                    <button
                      type="button"
                      onClick={verifyBlanks}
                      className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold"
                    >
                      Kiểm tra toàn bộ
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setBlankAnswers({});
                        setBlankResults({});
                        setBlanksChecked(false);
                      }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-755 text-slate-200 rounded-lg text-xs font-bold"
                    >
                      Làm bài lại
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                Bài học này hiện chưa cấu trúc sẵn bài tập điền từ trống. Bạn hãy thử chọn lọc bài "A Small Accident at the Gym" ở góc phải để trải nghiệm đầy đủ!
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SENTENCE ORDERING */}
        {activeQuizTab === 'order' && (
          <div className="space-y-6">
            <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
              <h3 className="text-base font-bold text-slate-100">Sentence Ordering: Sắp xếp mảnh câu ghép</h3>
              <p className="text-xs text-slate-400">Bấm từng khối từ vựng bên dưới theo trật tự đúng để ghép thành câu thoại hoàn chỉnh chuẩn bản ngữ.</p>
            </div>

            {activeLesson.sentenceOrdering && activeLesson.sentenceOrdering.length > 0 ? (
              <div className="space-y-6">
                
                {/* Result assembled box */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 min-h-[64px] flex flex-wrap gap-2 items-center">
                  {orderedList.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Thứ tự câu ghép của bạn sẽ hiển thị tại đây... Click vào các khối từ bên dưới để điền.</span>
                  ) : (
                    orderedList.map((seg, idx) => (
                      <span 
                        key={idx} 
                        onClick={() => handleTileClick(seg)}
                        className="bg-teal-500/10 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 text-teal-300 border border-teal-500/20 px-3 py-1 rounded-xl text-xs font-semibold select-none cursor-pointer flex items-center gap-1.5 transition-all"
                        title="Bấm để loại bỏ"
                      >
                        <span>{seg}</span>
                        <span className="text-[10px] text-slate-550">×</span>
                      </span>
                    ))
                  )}
                </div>

                {/* Scrambled source cards */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Các khối từ trật tự xáo trộn:</span>
                  <div className="flex flex-wrap gap-2">
                    {scrambledList.map((seg, idx) => {
                      const isUsed = orderedList.includes(seg);
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isUsed || isOrderChecked}
                          onClick={() => handleTileClick(seg)}
                          className={`px-3.5 py-2 border rounded-xl text-xs font-medium transition-all ${
                            isUsed 
                              ? 'bg-slate-950 text-slate-650 border-slate-900 cursor-not-allowed opacity-40' 
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {seg}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scoring check result panels */}
                {isOrderChecked && (
                  <div className={`p-4 rounded-xl border text-xs leading-normal space-y-2 animate-fade-in ${
                    isOrderCorrect 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {isOrderCorrect ? '🎉 Hoàn toàn chuẩn xác!' : '❌ Chưa chính xác. Trật tự đúng chuẩn là:'}
                    </div>
                    <p className="font-sans italic text-slate-200">
                      "{activeLesson.sentenceOrdering[0].solution}"
                    </p>
                  </div>
                )}

                {/* Controls reset buttons */}
                <div className="flex gap-2">
                  {!isOrderChecked ? (
                    <button
                      type="button"
                      disabled={orderedList.length === 0}
                      onClick={() => checkSentenceOrder(activeLesson.sentenceOrdering[0].solution)}
                      className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        orderedList.length === 0 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                          : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                      }`}
                    >
                      Khóa câu này lại
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderedList([]);
                        setIsOrderChecked(false);
                      }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-755 text-slate-200 rounded-lg text-xs font-semibold"
                    >
                      Sắp xếp lại
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                Bài học này hiện chưa cấu trúc sẵn câu sắp xếp. Bạn hãy thử chọn lọc bài "A Small Accident at the Gym" ở góc phải để trải nghiệm đầy đủ!
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DICTATION */}
        {activeQuizTab === 'dictation' && (
          <div className="space-y-6">
            <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
              <h3 className="text-base font-bold text-slate-100">Dictation Practice: Nghe và chép chính xác</h3>
              <p className="text-xs text-slate-400">Bấm chiếc cốc loa để phát âm mẫu, sau đó gõ đúng từng từ bạn nghe được để so sánh độ nhạy bén chính tả.</p>
            </div>

            {activeLesson.dictations && activeLesson.dictations.length > 0 ? (
              <div className="space-y-6">
                {activeLesson.dictations.map((dic, idx) => {
                  const hasChecked = dictationsChecked[dic.id] === true;
                  const res = dictationResults[dic.id];
                  const rawInput = dictationInputs[dic.id] || '';

                  return (
                    <div key={dic.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 space-y-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => alert(`Simulating speaker vocal: "${dic.audioText}"`)}
                          className="p-2.5 bg-teal-500/[0.07] border border-teal-500/20 text-teal-400 hover:bg-teal-500/20 rounded-xl hover:text-teal-300 shrink-0 transition-all"
                          title="Bấm loa đọc mẫu"
                        >
                          <Volume2 className="h-5 w-5" />
                        </button>
                        <div className="text-xs">
                          <span className="font-bold text-slate-300 block">Đoạn nghe số {idx + 1}</span>
                          <span className="text-slate-500">{dic.clue}</span>
                        </div>
                      </div>

                      {/* Dictation text box */}
                      <div className="space-y-2">
                        <textarea
                          placeholder="Nghe kỹ và ghi lại chuẩn xác..."
                          rows={2}
                          disabled={hasChecked}
                          value={rawInput}
                          onChange={(e) => setDictationInputs(prev => ({ ...prev, [dic.id]: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-slate-100 transition-all outline-none resize-none"
                        />

                        {hasChecked && res && (
                          <div className={`p-3 rounded-xl border text-xs leading-normal ${
                            res.status === 'correct' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                              : res.status === 'partial'
                                ? 'bg-amber-500/10 border-amber-550/30 text-amber-300'
                                : 'bg-red-500/10 border-red-500/30 text-red-300'
                          }`}>
                            <span><b>Kết quả:</b> {res.message}</span>
                          </div>
                        )}
                      </div>

                      {/* Control buttons */}
                      <div>
                        {!hasChecked ? (
                          <button
                            type="button"
                            disabled={rawInput.trim() === ''}
                            onClick={() => handleCheckDictationSingle(dic.id, dic.audioText)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              rawInput.trim() === '' 
                                ? 'bg-slate-800 text-slate-550' 
                                : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                            }`}
                          >
                            Check chính tả
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setDictationInputs(prev => ({ ...prev, [dic.id]: '' }));
                              setDictationsChecked(prev => ({ ...prev, [dic.id]: false }));
                            }}
                            className="px-4 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold"
                          >
                            Thử nghe lại
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                Bài học này hiện chưa có nội dung chép chính tả (Dictation). Hãy thử chọn bài "A Small Accident at the Gym" ở góc phải để trải nghiệm đầy đủ!
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SHADOWING PRACTICE */}
        {activeQuizTab === 'shadow' && (
          <div className="space-y-6">
            <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
              <h3 className="text-base font-bold text-slate-100">Shadowing Practice: Luyện phát âm nhại giọng mẫu</h3>
              <p className="text-xs text-slate-400">Nhấp cốc nghe loa mẫu dưới đây, sau đó bấm chiếc mic đỏ, phát âm rành rọt lại đoạn hội thoại và xem phân tích giọng đọc.</p>
            </div>

            <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-850 space-y-6 max-w-xl mx-auto">
              {/* Speaker card representation */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Mẫu thoại</span>
                
                <button
                  onClick={() => alert(`Playing micro sentences speaker standard voice: "${activeLesson.sections[0]?.english || 'Demo'}"`)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-teal-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Nghe mẫu âm chuẩn</span>
                </button>
              </div>

              {/* Sample line to speak */}
              <div className="text-center py-2 space-y-1.5">
                <p className="text-slate-100 font-bold text-lg font-sans leading-relaxed">
                  "{activeLesson.sections[0]?.english || 'Today, I decided to go work out.'}"
                </p>
                <p className="text-slate-400 text-xs italic font-medium leading-relaxed">
                  ({activeLesson.sections[0]?.vietnamese || 'Hôm nay, tôi quyết định đi tập thể dục.'})
                </p>
              </div>

              {/* Custom micro visualization */}
              <div className="h-10 flex items-center justify-center gap-1.5 p-1">
                {isRecordingShadow ? (
                  shadowWaves.map((val, idx) => (
                    <div 
                      key={idx}
                      className="w-1.5 bg-red-400 rounded-full transition-all duration-300"
                      style={{ height: `${val}%` }}
                    />
                  ))
                ) : (
                  <div className="text-[10px] text-slate-500 italic">Đang chờ kích hoạt micro ghi âm nhại giọng...</div>
                )}
              </div>

              {/* Micro Trigger Button */}
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleToggleShadowRecord}
                  className={`p-5 rounded-full border-4 shadow-lg transition-all mx-auto flex items-center justify-center ${
                    isRecordingShadow 
                      ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' 
                      : shadowScore 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Mic className="h-7 w-7" />
                </button>
                
                <div className="text-xs font-bold">
                  {isRecordingShadow ? (
                    <span className="text-red-400">🔴 Ghi âm nhại âm... Thử nói lớn! Thử lại sút sau {6 - recordingTimer}s</span>
                  ) : (
                    <span className="text-slate-400">Bấm chiếc Mic để dọn giọng chuẩn bị nói nhại</span>
                  )}
                </div>
              </div>

              {/* Simulated speech analysis output */}
              {shadowScore && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2.5 text-xs text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-sm">
                    <Award className="h-5 w-5" />
                    <span>Kết quả phát âm: {shadowScore}% Khớp</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    {shadowScore >= 90 ? '🎉 Phát âm chính xác tuyệt đối! Trọng âm nhấn nhử và nối ấm cực tốt.' : '💎 Rất khá! Hãy cố gắng kéo dài nguyên âm và nhấn rõ các phụ âm cuối (V-ing / p / t).'}
                  </p>
                  <div className="flex justify-center gap-3 text-[10px] text-slate-500">
                    <span>Intonation: <b>Excellent</b></span>
                    <span>Fluency: <b>{shadowScore}%</b></span>
                    <span>Nối âm: <b>93%</b></span>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
