import React, { useState } from 'react';
import { 
  BookMarked, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  BookOpen, 
  Filter, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { VocabularyItem, Level, Topic } from '../types';

interface VocabularyNotebookProps {
  vocabularyList: VocabularyItem[];
  onUpdateVocabSentence: (vId: string, sentence: string) => void;
  onUpdateVocabStatus: (vId: string, status: 'New' | 'Learning' | 'Mastered') => void;
  onDeleteVocabItem: (vId: string) => void;
  onAddCustomVocab: (vocab: VocabularyItem) => void;
}

export default function VocabularyNotebook({ 
  vocabularyList, 
  onUpdateVocabSentence,
  onUpdateVocabStatus,
  onDeleteVocabItem,
  onAddCustomVocab
}: VocabularyNotebookProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState<string>('All');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // New word form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newIpa, setNewIpa] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newTopic, setNewTopic] = useState<Topic>('Daily life');
  const [newLevel, setNewLevel] = useState<Level>('Intermediate');

  // Editing state mapping
  const [editingSentenceId, setEditingSentenceId] = useState<string | null>(null);
  const [tempSentenceText, setTempSentenceText] = useState('');

  const topicsList = ['Daily life', 'School', 'Work', 'Travel', 'Health', 'Story', 'Conversation'];

  const handleSubmitNewWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaning.trim()) {
      alert("Vui lòng nhập tối thiểu Từ tiếng Anh và Nghĩa tiếng Việt!");
      return;
    }

    const item: VocabularyItem = {
      id: `v-custom-${Date.now()}`,
      word: newWord.trim(),
      ipa: newIpa.trim() || undefined,
      vietnamese: newMeaning.trim(),
      contextUsage: newContext.trim() || 'Thêm thủ công vào sổ tay',
      exampleSentence: newExample.trim() || 'Thêm câu mẫu sau...',
      status: 'New',
      topic: newTopic,
      level: newLevel
    };

    onAddCustomVocab(item);
    setIsAddingNew(false);
    setNewWord('');
    setNewIpa('');
    setNewMeaning('');
    setNewContext('');
    setNewExample('');
  };

  const handleStartEditSentence = (item: VocabularyItem) => {
    setEditingSentenceId(item.id);
    setTempSentenceText(item.mySentence || '');
  };

  const handleSaveSentence = (id: string) => {
    onUpdateVocabSentence(id, tempSentenceText);
    setEditingSentenceId(null);
  };

  // Filter processes
  const filteredList = vocabularyList.filter(item => {
    const matchesSearch = item.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.vietnamese.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = filterTopic === 'All' || item.topic === filterTopic;
    const matchesLevel = filterLevel === 'All' || item.level === filterLevel;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    
    return matchesSearch && matchesTopic && matchesLevel && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in col-span-3">
      
      {/* Brand Title strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-xs">
            <BookMarked className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">Vocabulary Notebook</h2>
            <p className="text-xs text-slate-400">Xem và sửa đổi các cụm từ quan trọng rút ra từ bài nghe. Tích lũy vốn tiếng Anh thực tế.</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 self-start md:self-center"
        >
          <Plus className="h-4.5 w-4.5 stroke-[3px]" />
          <span>Thêm Từ Mới Thủ Công</span>
        </button>
      </div>

      {/* Adding Word Modal Box Container */}
      {isAddingNew && (
        <form onSubmit={handleSubmitNewWord} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 max-w-2xl animate-fade-in">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
            <span>📝 Khai báo từ vựng mới vào sổ tay</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Từ vựng/Cụm từ tiếng Anh <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                placeholder="VD: bump into, look up to..."
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Phát âm IPA</label>
              <input
                type="text"
                placeholder="VD: /bʌmp ˈɪntuː/"
                value={newIpa}
                onChange={(e) => setNewIpa(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Nghĩa tiếng Việt <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                placeholder="VD: tình cờ va vào, đính kèm vào..."
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Cách dùng chính</label>
              <input
                type="text"
                placeholder="VD: Nói về việc bất chợt va phải người đi đường..."
                value={newContext}
                onChange={(e) => setNewContext(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Chủ đề liên đới</label>
              <select
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value as Topic)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {topicsList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Phân hạn Trình độ</label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value as Level)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block">Ví dụ minh họa đặt câu</label>
            <textarea
              placeholder="Ghi ghép câu minh họa giúp bài viết dễ nhớ hơn..."
              rows={2}
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex gap-2 justify-end border-t border-slate-800/80 pt-3">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
            >
              Lưu từ mới
            </button>
          </div>
        </form>
      )}

      {/* Filter widgets blocks layout */}
      <section className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo từ, nghĩa Việt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-550 outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filter Topic */}
        <div className="flex items-center gap-1.5 bg-slate-950/45 border border-slate-850 rounded-xl px-3 py-1.5">
          <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Topic:</span>
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-transparent border-0 text-slate-300 text-xs focus:ring-0 focus:outline-none font-medium p-0 w-full cursor-pointer"
          >
            <option value="All">All Topics</option>
            {topicsList.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Filter Level */}
        <div className="flex items-center gap-1.5 bg-slate-950/45 border border-slate-850 rounded-xl px-3 py-1.5">
          <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Level:</span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-transparent border-0 text-slate-300 text-xs focus:ring-0 focus:outline-none font-medium p-0 w-full cursor-pointer"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-1.5 bg-slate-950/45 border border-slate-850 rounded-xl px-3 py-1.5">
          <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent border-0 text-slate-300 text-xs focus:ring-0 focus:outline-none font-medium p-0 w-full cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="New">New Word</option>
            <option value="Learning">In Progress</option>
            <option value="Mastered">Mastered (Thuộc)</option>
          </select>
        </div>
      </section>

      {/* Dictionary Cards Results List Grid */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/30 rounded-2xl border border-slate-850 text-slate-450 space-y-2">
          <FolderOpen className="h-10 w-10 text-slate-500 mx-auto opacity-40" />
          <h4 className="font-bold text-xs">Không tìm thấy từ vựng tương ứng</h4>
          <p className="text-[11px] max-w-sm mx-auto">Vui lòng điều chỉnh lại bộ lọc tìm kiếm hoặc nộp thêm từ mới vào sổ tay ôn tập.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const isEditingSentence = editingSentenceId === item.id;
            
            return (
              <div 
                key={item.id}
                id={`vocab-card-${item.id}`}
                className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850 hover:border-slate-800 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Status pills header row */}
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-950/80 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] lowercase font-medium">
                      #{item.topic || 'General'}
                    </span>

                    {/* Status change selector */}
                    <div className="flex items-center gap-1">
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateVocabStatus(item.id, e.target.value as 'New' | 'Learning' | 'Mastered')}
                        className={`text-[10px] font-bold uppercase rounded p-1 border cursor-pointer ${
                          item.status === 'Mastered' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                            : item.status === 'Learning'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                              : 'bg-indigo-500/10 text-indigo-450 border-indigo-500/25'
                        }`}
                      >
                        <option value="New" className="bg-slate-900 border-0">NEW</option>
                        <option value="Learning" className="bg-slate-900 border-0">IN PROGRESS</option>
                        <option value="Mastered" className="bg-slate-900 border-0">MASTERED</option>
                      </select>
                      
                      <button
                        type="button"
                        onClick={() => onDeleteVocabItem(item.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title="Xóa từ vựng này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Word title and Meaning */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="font-extrabold text-base text-slate-100 font-sans tracking-wide">{item.word}</h3>
                      {item.ipa && (
                        <span className="text-[10px] font-mono text-slate-400 font-light">{item.ipa}</span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-emerald-300 inline-block bg-emerald-500/5 px-2 py-0.5 rounded">
                      {item.vietnamese}
                    </div>
                  </div>

                  {/* Usage explanation */}
                  <p className="text-[11px] text-slate-400 px-3 py-1.5 bg-slate-950/40 rounded-xl border border-slate-850/80 leading-relaxed italic">
                    🧠 <b>Bối cảnh:</b> {item.contextUsage}
                  </p>

                  {/* Transcript quote line */}
                  <div className="text-[11px] text-slate-300 pl-3 border-l border-emerald-800">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Ví dụ trích văn mẫu:</span>
                    <span>"{item.exampleSentence}"</span>
                  </div>

                  {/* Student customized own sentence */}
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850 mt-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">✍️ Câu đặt của tôi:</span>
                      {!isEditingSentence && (
                        <button
                          onClick={() => handleStartEditSentence(item)}
                          className="text-[9px] text-indigo-400 font-semibold flex items-center gap-0.5"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Viết câu của mình</span>
                        </button>
                      )}
                    </div>

                    {isEditingSentence ? (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Tự đặt câu của bạn bằng từ này giúp nhớ sâu..."
                          rows={2}
                          value={tempSentenceText}
                          onChange={(e) => setTempSentenceText(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg p-2 text-xs text-slate-200 outline-none transition-all"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingSentenceId(null)}
                            className="bg-slate-800 px-2 py-1 rounded text-[10px] text-slate-450 font-semibold"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveSentence(item.id)}
                            className="bg-emerald-500 text-slate-950 px-2.5 py-1 rounded text-[10px] font-bold"
                          >
                            Lưu câu
                          </button>
                        </div>
                      </div>
                    ) : item.mySentence ? (
                      <p className="text-xs text-teal-300 font-sans italic">
                        "{item.mySentence}"
                      </p>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic block">Chưa đặt câu của cá nhân. Việc đặt câu giúp nhớ cụm từ gấp 4 lần!</span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
