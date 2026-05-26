import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Upload, 
  Headphones, 
  PenTool, 
  BookOpen, 
  BookMarked, 
  History, 
  TrendingUp,
  Flame,
  Clock,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  streakCount: number;
  minutesListened: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  streakCount, 
  minutesListened,
  isOpenMobile,
  setIsOpenMobile 
}: SidebarProps) {

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, desc: 'Tổng quan học tập' },
    { id: 'lessons', name: 'My Lessons', icon: History, desc: 'Kho bài nghe đã học' },
    { id: 'upload', name: 'Upload Lesson', icon: Upload, desc: 'Thêm bài nghe mới' },
    { id: 'listening', name: 'Listening Practice', icon: Headphones, desc: 'Luyện nghe 5 bước' },
    { id: 'rewrite', name: 'Rewrite Practice', icon: PenTool, desc: 'Luyện viết lại' },
    { id: 'exercises', name: 'Exercises', icon: BookOpen, desc: 'Trò chơi bài tập' },
    { id: 'vocabulary', name: 'Vocabulary', icon: BookMarked, desc: 'Sổ tay từ vựng' },
  ];

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        id="sidebar-container"
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 z-50 flex flex-col border-r border-slate-800 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header - Brand */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-semibold text-lg tracking-tight bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent">
                Context English
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Listening & Rewriting</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpenMobile(false)}
            className="p-1 lg:hidden text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Mini Streak Banner */}
        <div className="px-4 py-3 mx-4 my-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-around text-center gap-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
              <Flame className="h-4.5 w-4.5 fill-amber-500/10 animate-pulse" />
              <span>{streakCount} Ngày</span>
            </div>
            <span className="text-[10px] text-slate-400">Streak tích lũy</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-700" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-teal-400 text-sm font-bold">
              <Clock className="h-4.5 w-4.5" />
              <span>{minutesListened} Phút</span>
            </div>
            <span className="text-[10px] text-slate-400">Đã học nghe</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id || 
              (item.id === 'listening' && activeTab.startsWith('listening'));
            
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-300 font-medium border border-emerald-500/20' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <IconComponent className={`h-5 w-5 transition-transform duration-300 group-hover:scale-105 ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <div>
                  <div className="text-sm">{item.name}</div>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-400 font-normal transition-colors block">
                    {item.desc}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info - Pro Tip */}
        <div className="p-4 mx-4 mb-6 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors border border-emerald-500/10 rounded-xl flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-emerald-300 mb-0.5 text-xs">Phương Pháp Học Ngữ Cảnh</h4>
            <p className="text-slate-400 leading-normal text-[11px]">
              Nghe lặp lại, học cụm từ thay vì từ đơn lẻ, sau đó tái hiện lại cốt truyện giúp ghi nhớ tiếng Anh lâu hơn 3-4 lần!
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
