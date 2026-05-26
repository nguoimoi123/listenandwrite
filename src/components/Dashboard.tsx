import React from 'react';
import { 
  Award, 
  BookMarked, 
  Clock, 
  Flame, 
  ListRestart, 
  PlayCircle, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  BookOpen, 
  ChevronRight,
  UserCheck,
  PenTool
} from 'lucide-react';
import { Lesson, VocabularyItem } from '../types';

interface DashboardProps {
  stats: {
    lessonsLearned: number;
    minutesListened: number;
    totalRewrites: number;
    averageScore: number;
    vocabularyLearned: number;
    dailyGoalMinutes: number;
    currentStreak: number;
    streakDates: string[];
  };
  lessons: Lesson[];
  setActiveTab: (tab: string) => void;
  setSelectedLessonId: (id: string) => void;
}

export default function Dashboard({ stats, lessons, setActiveTab, setSelectedLessonId }: DashboardProps) {
  // Compute user summary dynamically
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => l.status === 'Completed').length;
  const inProgressLessons = lessons.filter(l => l.status === 'In Progress').length;
  const averageRewriteScore = Math.round(
    lessons.reduce((acc, curr) => acc + (curr.bestScore || 0), 0) / (lessons.filter(l => l.bestScore !== undefined).length || 1)
  );

  const startLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setActiveTab('listening');
  };

  const startRewriteLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setActiveTab('rewrite');
  };

  // Daily goals percentage
  const goalPercent = Math.min(100, Math.round((stats.minutesListened / stats.dailyGoalMinutes) * 100));

  // Calendar for last 7 days of streak representation
  const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isodate = d.toISOString().split('T')[0];
    const isToday = isodate === new Date().toISOString().split('T')[0];
    const studied = stats.streakDates.includes(isodate) || (isToday && stats.minutesListened > 0);
    return {
      name: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
      dateLabel: d.getDate(),
      studied,
      isToday
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dynamic Header Badge / Welcome Segment */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-900/40 to-slate-950/40 p-6 md:p-8 rounded-3xl border border-slate-800/80">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5 animate-bounce" />
            <span>AI Coach: "Hôm nay là một ngày tuyệt vời để luyện tai!"</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Xin chào, Học Viên Context! 👋
          </h2>
          <p className="text-sm text-slate-400">
            Chỉ cần dành 20 phút nghe theo ngữ cảnh mỗi ngày, tai của bạn sẽ nhạy bén hơn 150% chỉ sau một tháng.
          </p>
        </div>

        {/* Level indicator / Streak banner */}
        <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shrink-0">
          <div className="h-12 w-12 bg-emerald-500/10 flex items-center justify-center rounded-xl text-emerald-400 border border-emerald-500/20">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] uppercase text-slate-400 tracking-wider">Trình độ đề xuất</div>
            <div className="text-base font-bold text-emerald-400">Intermediate (B1-B2)</div>
            <div className="text-[11px] text-slate-500">Mục tiêu: Nghe hiểu & Viết thuần thục</div>
          </div>
        </div>
      </header>

      {/* Progress Bars / Goal Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goal Indicator Card */}
        <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-200">Mục tiêu học nghe hôm nay</h3>
              <p className="text-xs text-slate-400">Thời lượng nghe tích lũy phục hồi trí nhớ</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              {stats.minutesListened} / {stats.dailyGoalMinutes} phút
            </span>
          </div>

          <div className="space-y-4">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/50">
              <div 
                className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${goalPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Hôm nay đạt: {goalPercent}%</span>
              <span>{goalPercent >= 100 ? '🎉 Đã hoàn thành mục tiêu!' : `Còn ${Math.max(0, stats.dailyGoalMinutes - stats.minutesListened)} phút để duy trì streak!`}</span>
            </div>
          </div>

          {/* Calendars of streak */}
          <div className="border-t border-slate-800 mt-6 pt-4">
            <div className="text-xs text-slate-400 mb-3 font-medium">Hoạt động trong tuần qua:</div>
            <div className="grid grid-cols-7 gap-2">
              {lastSevenDays.map((day, idx) => (
                <div 
                  key={idx} 
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                    day.studied 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : day.isToday 
                        ? 'bg-slate-800 border-slate-600 text-slate-300' 
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-medium tracking-tight mb-1">{day.name}</span>
                  <span className={`text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full ${
                    day.studied ? 'bg-emerald-500/20 text-emerald-300' : ''
                  }`}>
                    {day.dateLabel}
                  </span>
                  {day.studied && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mini Quote / Pro Tip Card */}
        <div id="ai-coach-advice-card" className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
            <Award className="h-5 w-5" />
            <h3>Lời khuyên từ Huấn luyện viên</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed italic">
            "Khi viết lại, đừng cố dịch từng câu một bằng tiếng Việt trong đầu bạn. Hãy nhắm mắt lại, nghe âm thanh của câu chuyện tiếng Anh, hình dung hình ảnh sự việc xảy ra trong óc và ghi lại bằng từ gốc bạn đã nghe."
          </p>
          <div className="border-t border-slate-800 mt-4 pt-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Coach Harry</div>
              <div className="text-[10px] text-slate-400">Context Listening Expert</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Stats Overview Grid */}
      <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Stat 1 */}
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Đã học / Tổng số</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{completedLessons}</span>
            <span className="text-sm text-slate-500">/ {totalLessons} bài</span>
          </div>
          <div className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>{inProgressLessons} bài đang học dang dở</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Tổng thời gian nghe</div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-100">{stats.minutesListened}</span>
            <span className="text-slate-400 text-sm font-medium">phút</span>
          </div>
          <div className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-teal-400 shrink-0" />
            <span>Mỗi tuần tích lũy học tai</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Lần luyện viết lại</div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-100">{stats.totalRewrites}</span>
            <span className="text-slate-400 text-sm font-medium">lần</span>
          </div>
          <div className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <ListRestart className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>Chìa khóa mở rộng phản xạ</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Từ vựng sổ tay</div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-100">{stats.vocabularyLearned}</span>
            <span className="text-slate-400 text-sm font-medium">từ</span>
          </div>
          <div className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <BookMarked className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Lưu từ ngữ cảnh thực tế</span>
          </div>
        </div>

        {/* Stat 5 */}
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 col-span-2 lg:col-span-1">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Điểm viết trung bình</div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-100">{averageRewriteScore || stats.averageScore}</span>
            <span className="text-slate-400 text-sm font-medium">/ 100</span>
          </div>
          <div className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Ngữ pháp & Hành văn tiến bộ</span>
          </div>
        </div>
      </section>

      {/* Daily Learning Route / Course Suggestions */}
      <section className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-bold text-slate-200 text-lg">Lộ trình học ngày hôm nay</h3>
            <p className="text-xs text-slate-400">Các bài tập luyện nghe và rèn phản xạ viết theo thứ tự ưu tiên</p>
          </div>
          <button 
            onClick={() => setActiveTab('lessons')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <span>Tất cả bài học</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 pt-2">
          {lessons.map((lesson, index) => {
            const isFinished = lesson.status === 'Completed';
            const progressLabel = isFinished ? 'Đã hoàn thành' : lesson.status === 'In Progress' ? 'Đang học dở' : 'Chưa học';
            
            return (
              <div 
                key={lesson.id}
                className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 font-bold text-xs h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                    isFinished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-200">{lesson.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        lesson.level === 'Beginner' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        lesson.level === 'Intermediate' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {lesson.level}
                      </span>
                      <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-700/30">
                        {lesson.topic}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {lesson.vietnameseTranslation}
                    </p>
                    <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
                      <span>Thời lượng: <b>{lesson.durationSeconds}s</b></span>
                      <span>Luyện viết: <b>{lesson.rewriteCount} lần</b></span>
                      {lesson.bestScore && (
                        <span className="text-emerald-400">Điểm cao nhất: <b>{lesson.bestScore}/100</b></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => startLesson(lesson.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>Luyện Nghe 5 Bước</span>
                  </button>
                  <button
                    onClick={() => startRewriteLesson(lesson.id)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shadow-emerald-500/10"
                  >
                    <PenTool className="h-4 w-4" />
                    <span>Viết Lại Ngay</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
