import React, { useState, useEffect } from 'react';
import { 
  FileEdit, 
  Play, 
  BookMarked, 
  HelpCircle, 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle, 
  Award,
  BookOpen,
  Check,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Lesson } from '../types';

interface RewriteWorkspaceProps {
  lessons: Lesson[];
  selectedLessonId: string;
  setSelectedLessonId: (id: string) => void;
  onUpdateLessonRewrite: (id: string, text: string, score: number) => void;
  onAddLog: (action: string, lessonTitle: string, score?: number, minutes?: number) => void;
}

export default function RewriteWorkspace({ 
  lessons, 
  selectedLessonId, 
  setSelectedLessonId,
  onUpdateLessonRewrite,
  onAddLog
}: RewriteWorkspaceProps) {

  const activeLesson = lessons.find(l => l.id === selectedLessonId) || lessons[0];

  const [studentWriting, setStudentWriting] = useState(activeLesson.studentLastRewrite || '');
  const [isCheckSuccess, setIsCheckSuccess] = useState(false);
  const [hideTips, setHideTips] = useState(true);

  // Dynamic feedback engine states
  const [grades, setGrades] = useState<{
    grammarScore: number;
    vocabScore: number;
    coherenceScore: number;
    overallScore: number;
    corrections: { textSegment: string; corrected: string; explanation: string }[];
    alternatives: { original: string; better: string; reason: string }[];
  } | null>(null);

  // Synchronize writing when active lesson changes
  useEffect(() => {
    setStudentWriting(activeLesson.studentLastRewrite || '');
    setIsCheckSuccess(false);
    setGrades(null);
  }, [selectedLessonId, activeLesson]);

  const handleCheckWriting = () => {
    const text = studentWriting.trim();
    if (text.length < 20) {
      alert("Vui lòng thực hành gõ ít nhất 1-2 câu tiếng Anh đầy đủ để nhận được phân tích thấu đáo nhất!");
      return;
    }

    // Advanced dynamic keyword scanning logic
    const phrasalVerbs = [
      { term: /work\s*out/i, original: 'exercise', better: 'work out', reason: 'Tự nhiên chuẩn bản xứ phản ánh đúng bối cảnh phòng tập thể hình.' },
      { term: /bumped\s*into|bump\s*into/i, termPast: /bumped\s*into/i, original: 'hit', better: 'bumped into', reason: 'Dùng "bump into" mang ý nghĩa vô tình chạm trán một cách ngẫu nhiên.' },
      { term: /fell\s*over|fell\s*down/i, original: 'fell', better: 'fell over', reason: 'Phrasal verb thể hiện tư thế ngã nhào, đổ chúi một cách bất ngờ.' },
      { term: /knock\s*over|knocked\s*over/i, original: 'dropped', better: 'knocked the weight rack over', reason: 'Xô ngã rạp/làm đổ một đồ vật đứng thẳng bằng lực va chạm.' },
      { term: /help\s*him\s*up|helped\s*him\s*up/i, original: 'lifted', better: 'helped him up', reason: 'Cấu trúc ấm áp rèn sự hỗ trợ động viên ai đó đứng dậy.' }
    ];

    let grammarErrorsList: { textSegment: string; corrected: string; explanation: string }[] = [];
    let vocabAlts: { original: string; better: string; reason: string }[] = [];

    // Analyze grammar errors based on string pattern
    if (/runing/i.test(text)) {
      grammarErrorsList.push({
        textSegment: "runing on machine",
        corrected: "running on the machine",
        explanation: 'Sai lỗi chính tả động từ gấp đôi phụ âm "running" và thiếu mạo từ xác định "the".'
      });
    }
    if (/i\s+was\s+run/i.test(text)) {
      grammarErrorsList.push({
        textSegment: "I was run on",
        corrected: "I was running on",
        explanation: 'Thì quá khứ tiếp diễn được cấu trúc bằng S + was/were + V-ing diễn đạt hành động đang xảy ra.'
      });
    }
    if (/turned\s+around\s+get/i.test(text)) {
      grammarErrorsList.push({
        textSegment: "turned around get",
        corrected: "turned around to get",
        explanation: 'Cấu trúc chỉ mục đích hành động: turned around + TO + Infinitive (quay lại ĐỂ lấy...'
      });
    }
    if (/he\s+almost\s+knock\s+/i.test(text)) {
      grammarErrorsList.push({
        textSegment: "he almost knock",
        corrected: "he almost knocked",
        explanation: 'Đây là câu chuyện quá khứ, tất cả động từ của mạch câu chuyện chính cần được nhất quán ở quá khứ đơn.'
      });
    }
    if (/by\s+his\s*self/i.test(text)) {
      grammarErrorsList.push({
        textSegment: "by his self",
        corrected: "by himself",
        explanation: 'Đại từ phản thân của "He" là "himself", không phải "his self".'
      });
    }

    // Analyze vocab alternatives
    phrasalVerbs.forEach(pv => {
      if (!pv.term.test(text)) {
        vocabAlts.push({
          original: pv.original,
          better: pv.better,
          reason: pv.reason
        });
      }
    });

    // Award detailed scores based on patterns matched
    let foundGrammarErrorsCount = grammarErrorsList.length;
    let missingVocabsCount = vocabAlts.length;

    const computedGrammarScore = Math.max(50, 100 - (foundGrammarErrorsCount * 15));
    const computedVocabScore = Math.max(60, 100 - (missingVocabsCount * 10));
    const coherenceRaw = text.split('.').length >= 4 ? 95 : text.split('.').length >= 2 ? 80 : 60;
    const finalOverallScore = Math.round((computedGrammarScore * 0.4) + (computedVocabScore * 0.4) + (coherenceRaw * 0.2));

    setGrades({
      grammarScore: computedGrammarScore,
      vocabScore: computedVocabScore,
      coherenceScore: coherenceRaw,
      overallScore: finalOverallScore,
      corrections: grammarErrorsList,
      alternatives: vocabAlts.slice(0, 3)
    });

    setIsCheckSuccess(true);
    onUpdateLessonRewrite(activeLesson.id, text, finalOverallScore);
    onAddLog('Sử dụng phòng Rewrite Workspace', activeLesson.title, finalOverallScore, 4);
  };

  const loadOriginalSnippetToInput = () => {
    if (confirm("Hành động này sẽ ghi đè bản dịch gốc của hệ thống lên khung nháp viết. Bạn vẫn muốn tiếp tục?")) {
      setStudentWriting(activeLesson.transcript);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title block banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-xs">
            <FileEdit className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">Rewrite Practice</h2>
            <p className="text-xs text-slate-400">Không gian luyện viết lại độc lập. Tối ưu kỹ năng diễn đạt và ngữ pháp.</p>
          </div>
        </div>

        {/* Change Lesson switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <span className="text-xs text-slate-400 font-medium pl-1">Chọn bài tập:</span>
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

      {/* Split Window Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Player & Reference Materials */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Nội Dung Trực Quan Đối Chiếu</span>
            </h3>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Level: {activeLesson.level} • {activeLesson.topic}</span>
          </div>

          {/* Simple mock audio player strip */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-500/20">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-300">File âm thanh bài nghe chính</div>
                <div className="text-slate-500 text-[10px]">Thời lượng đề xuất: {activeLesson.durationSeconds} giây</div>
              </div>
            </div>
            
            <button
              onClick={() => {
                alert("Simulating Lesson Audio! Bạn đang nghe audio chất lượng cao từ loa thoại hệ thống.");
              }}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
            >
              🎧 Nghe ngay
            </button>
          </div>

          {/* Transcript Paragraph view */}
          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tiếng Anh gốc (Original Transcript):</span>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850/60 leading-relaxed text-sm text-slate-300 font-sans">
                {activeLesson.transcript}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Bản dịch tiếng Việt (Vietnamese Meaning):</span>
                <button
                  type="button"
                  onClick={() => setHideTips(!hideTips)}
                  className="text-[10px] text-emerald-400 font-semibold underline hover:text-emerald-300"
                >
                  {hideTips ? 'Hiện dịch Việt' : 'Ẩn dịch Việt'}
                </button>
              </div>
              {!hideTips && (
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850/60 leading-relaxed text-xs text-teal-400/95 font-sans italic">
                  {activeLesson.vietnameseTranslation}
                </div>
              )}
            </div>

            {/* List of important phrasal phrases */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Các cụm từ chủ chốt nên vận dụng:</span>
              <div className="flex flex-wrap gap-2">
                {activeLesson.vocabularies.map(v => (
                  <span key={v.id} className="text-xs bg-slate-950 p-2 border border-slate-850 rounded-xl text-slate-300 font-medium">
                    🔍 <b className="text-slate-200">{v.word}</b> ({v.vietnamese})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Writing Board & Grading AI feedback report */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <FileEdit className="h-4 w-4 text-indigo-400" />
                <span>Khung Soạn Thảo Để Ôn Luyện</span>
              </h3>
              
              <button
                type="button"
                onClick={loadOriginalSnippetToInput}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold"
              >
                Nhập nhanh bản gốc
              </button>
            </div>

            {/* Student text entry */}
            <textarea
              placeholder="Bắt đầu viết lại cốt yếu nội dung câu chuyện bằng từ vựng tiếng Anh của chính bạn tại đây..."
              rows={9}
              value={studentWriting}
              onChange={(e) => setStudentWriting(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-650 leading-relaxed font-sans focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            />

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Độ dài ký tự: {studentWriting.length} kí tự</span>
              <span>Độ dài từ: {studentWriting.trim() === '' ? 0 : studentWriting.trim().split(/\s+/).length} từ</span>
            </div>

            {/* Button call to evaluate */}
            <div>
              <button
                type="button"
                onClick={handleCheckWriting}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10"
              >
                <Sparkles className="h-4.5 w-4.5 fill-slate-950" />
                <span>PHÂN TÍCH CHẤT LƯỢNG VIẾT (Check My Writing)</span>
              </button>
            </div>
          </div>

          {/* AI Check Evaluation Card */}
          {isCheckSuccess && grades && (
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6 animate-fade-in">
              
              {/* Scores bar */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Award className="h-5 w-5" />
                  <h4>Tổng Điểm Đánh Giá Luyện Viết: {grades.overallScore}/100</h4>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="text-[10px] text-slate-500 uppercase block">Grammar</span>
                    <span className="text-base font-bold text-red-400">{grades.grammarScore}%</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="text-[10px] text-slate-500 uppercase block">Vocabulary</span>
                    <span className="text-base font-bold text-emerald-400">{grades.vocabScore}%</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="text-[10px] text-slate-500 uppercase block">Coherence</span>
                    <span className="text-base font-bold text-indigo-400">{grades.coherenceScore}%</span>
                  </div>
                </div>
              </div>

              {/* Spell-check correction boxes */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>Sửa đổi lỗi chính tả và cấu trúc câu ({grades.corrections.length})</span>
                </h5>

                {grades.corrections.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-955 p-3 rounded-xl border border-slate-850">
                    🎉 Không tìm thấy lỗi ngữ pháp rõ rệt nào trong bài của bạn! Cách sử dụng của bạn cực kỳ chính xác.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {grades.corrections.map((corr, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="line-through text-red-400 font-bold bg-red-500/10 px-1 rounded">"{corr.textSegment}"</span>
                          <span className="text-slate-500">➜</span>
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">"{corr.corrected}"</span>
                        </div>
                        <p className="text-slate-300">{corr.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Native vocabulary replacement suggestions */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Cụm từ người bản xứ sẽ dùng nhiều hơn</span>
                </h5>

                {grades.alternatives.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-955 p-3 rounded-xl border border-slate-850">
                    Bài viết của bạn đã chứa đầy đủ 100% các cụm phrasal verb mấu chốt của tác phẩm nghe! Quá đỉnh.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {grades.alternatives.map((alt, idx) => (
                      <div key={idx} className="text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-0.5">
                        <div className="font-semibold text-slate-200">
                          Thay vì viết <span className="text-slate-400">"{alt.original}"</span> ➜ Hãy dùng: <span className="text-emerald-400 font-bold">"{alt.better}"</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal pl-3 border-l-2 border-emerald-800">{alt.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom suggestion action */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStudentWriting('');
                    setIsCheckSuccess(false);
                    setGrades(null);
                  }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 font-bold rounded-xl transition-all border border-slate-700/50"
                >
                  Viết lại bản nháp mới
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
