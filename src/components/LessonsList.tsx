import React from 'react';
import { 
  History, 
  Trash2, 
  Play, 
  BookMarked, 
  PenTool, 
  Sparkles, 
  Clock, 
  Award,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Lesson } from '../types';

interface LessonsListProps {
  lessons: Lesson[];
  onDeleteLesson: (id: string) => void;
  setActiveTab: (tab: string) => void;
  setSelectedLessonId: (id: string) => void;
}

export default function LessonsList({ lessons, onDeleteLesson, setActiveTab, setSelectedLessonId }: LessonsListProps) {

  const handleAction = (lessonId: string, tab: 'listening' | 'rewrite' | 'vocabulary') => {
    setSelectedLessonId(lessonId);
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title segment */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-xs">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">My Lessons</h2>
            <p className="text-xs text-slate-400">Kho lưu trữ tất cả bài học tiếng Anh theo ngữ cảnh đã tải và rèn luyện.</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('upload')}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold border border-emerald-500/20 px-3.5 py-1.5 rounded-lg hover:bg-emerald-500/5 transition-all"
        >
          + Thêm Bài Mới
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/30 rounded-2xl border border-slate-850 text-slate-450 space-y-2">
          <AlertCircle className="h-10 w-10 text-slate-500 mx-auto opacity-40" />
          <h4 className="font-bold text-xs">Chưa có bài học nào được chuẩn bị</h4>
          <p className="text-[11px] max-w-sm mx-auto">Vui lòng nhấp nút tải lên ở thanh Sidebar để thêm bài nghe đầu tiên của riêng bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((lesson) => {
            const isCompleted = lesson.status === 'Completed';
            const isInProgress = lesson.status === 'In Progress';
            
            return (
              <div 
                key={lesson.id}
                className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
              >
                {/* Header segment badge */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                      lesson.level === 'Beginner' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      lesson.level === 'Intermediate' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {lesson.level}
                    </span>
                    <span className="bg-slate-950 text-slate-450 border border-slate-850/60 px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider">
                      {lesson.topic}
                    </span>
                  </div>

                  {/* Status Indicator badge */}
                  <span className={`text-[9px] py-0.5 px-2 font-bold rounded-full ${
                    isCompleted 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : isInProgress 
                        ? 'bg-amber-500/10 text-amber-400' 
                        : 'bg-slate-950 text-slate-500'
                  }`}>
                    {isCompleted ? '✓ Học hoàn thành' : isInProgress ? '• Đang ôn luyên' : 'Chưa luyện'}
                  </span>
                </div>

                {/* Lesson title description */}
                <div className="space-y-1.5 flex-1 select-none">
                  <h3 className="font-bold text-slate-100 text-sm md:text-base leading-snug line-clamp-1">{lesson.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                    {lesson.vietnameseTranslation}
                  </p>
                </div>

                {/* Micro stats indicators */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 border-t border-slate-850 pt-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Thời lượng: <b>{lesson.durationSeconds}s</b></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-emerald-405 shrink-0" />
                    {lesson.bestScore ? (
                      <span className="text-emerald-405">Điểm tốt: <b>{lesson.bestScore}/100</b></span>
                    ) : (
                      <span>Luyện viết: <b>{lesson.rewriteCount} lần</b></span>
                    )}
                  </div>
                </div>

                {/* Operations grid buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-850/60">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Continue */}
                    <button
                      onClick={() => handleAction(lesson.id, 'listening')}
                      className="py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all border border-slate-700/50"
                    >
                      <Play className="h-3 w-3 fill-slate-200" />
                      <span>{isCompleted ? 'Luyện nghe lại' : 'Luyện 5 bước'}</span>
                    </button>

                    {/* Review Vocab */}
                    <button
                      onClick={() => handleAction(lesson.id, 'vocabulary')}
                      className="py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all border border-slate-700/50"
                    >
                      <BookMarked className="h-3 w-3" />
                      <span>Ôn từ vựng</span>
                    </button>
                  </div>

                  {/* Writing Workspace */}
                  <button
                    onClick={() => handleAction(lesson.id, 'rewrite')}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all shadow-xs"
                  >
                    <PenTool className="h-3 w-3" />
                    <span>Luyện viết lại sườn truyện</span>
                  </button>
                  
                  {/* Delete button (especially for uploaded custom additions) */}
                  {lesson.id.startsWith('lesson-custom') && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          if (confirm(`Bạn chắc chắn muốn xóa vĩnh viễn bài nghe tự soạn "${lesson.title}" không?`)) {
                            onDeleteLesson(lesson.id);
                          }
                        }}
                        className="text-[10px] text-red-500 hover:text-red-400 font-semibold flex items-center gap-0.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Xóa bài học tự tạo</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
