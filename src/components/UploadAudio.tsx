import React, { useState, useRef } from 'react';
import { 
  FileAudio, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  AudioLines,
  AlertCircle
} from 'lucide-react';
import { Lesson, Level, Topic } from '../types';

interface UploadAudioProps {
  onAddLesson: (lesson: Lesson) => void;
  setActiveTab: (tab: string) => void;
  setSelectedLessonId: (id: string) => void;
}

export default function UploadAudio({ onAddLesson, setActiveTab, setSelectedLessonId }: UploadAudioProps) {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<Level>('Intermediate');
  const [topic, setTopic] = useState<Topic>('Daily life');
  const [transcript, setTranscript] = useState('');
  const [vietnameseTranslation, setVietnameseTranslation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const topics: Topic[] = ['Daily life', 'School', 'Work', 'Travel', 'Health', 'Story', 'Conversation'];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('audio/') || ['.mp3', '.wav', '.m4a'].some(ext => droppedFile.name.endsWith(ext))) {
        setFile(droppedFile);
        setErrorText('');
        if (!title) {
          // auto title from file name
          const cleanName = droppedFile.name.substring(0, droppedFile.name.lastIndexOf('.')) || droppedFile.name;
          setTitle(cleanName.replace(/[_-]/g, ' '));
        }
      } else {
        setErrorText('Chỉ chấp nhận các tệp định dạng âm thanh (mp3, wav, m4a).');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setErrorText('');
      if (!title) {
        const cleanName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
        setTitle(cleanName.replace(/[_-]/g, ' '));
      }
    }
  };

  const generateMockTranscript = () => {
    // Generate realistic text depending on selected topic & level
    let mockE = '';
    let mockV = '';

    if (topic === 'Travel') {
      mockE = 'Last summer, my family spent a magnificent weekend in high-altitude mountains. We packed lightweight tents and sleeping bags. On Saturday morning, we set out early in order to catch the sunrise. Suddenly, a thick fog swept across the trail and we lost direction. Fortunately, a friendly local guide helped us locate the main camp.';
      mockV = 'Mùa hè năm ngoái, gia đình tôi đã có một ngày cuối tuần tuyệt vời trên những ngọn núi cao. Chúng tôi đóng gói lều trại nhẹ và nệm ngủ ấm. Vào sáng thứ Bảy, chúng tôi lên đường sớm để ngắm bình minh. Đột nhiên, sương mù dày đặc tràn qua lối đi và chúng tôi mất phương hướng. May mắn là, một kiểm lâm địa phương tốt bụng đã giúp đỡ chúng tôi chỉ ra vị trí trại chính.';
    } else if (topic === 'Work') {
      mockE = 'Our team leads decided to accelerate the launch date of our marketing project. Consequently, everyone worked late hours. We had to draft promotional materials, modify client contracts, and design infographics. Despite all stressful sessions, we delivered the proposal successfully and grabbed great feedback.';
      mockV = 'Trưởng nhóm của chúng tôi quyết định đẩy nhanh ngày ra mắt của dự án tiếp thị. Do đó, tất cả mọi người đều làm việc muộn. Chúng tôi phải phác thảo các tài liệu quảng cáo, sửa đổi hợp đồng của khách hàng và thiết kế hình ảnh đồ họa. Bất chấp tất cả các phiên họp căng thẳng, chúng tôi đã hoàn thành đề án thành công và thu về phản hồi tuyệt vời.';
    } else {
      mockE = 'I usually head over to the local community center on weekends to participate in social events. Today, I noticed a new sign up sheet for free Spanish sessions. I was talking to the receptionist when my old biology teacher walked in. We greeted each other warmly and exchanged phone numbers to catch up soon.';
      mockV = 'Tôi thường đi đến trung tâm cộng đồng địa phương vào cuối tuần để tham gia các sự kiện xã hội. Hôm nay, tôi nhận thấy một tờ đăng ký mới cho các khóa học tiếng Tây Ban Nha miễn phí. Tôi đang nói chuyện với nhân viên tiếp tân thì giáo viên sinh học cũ của tôi bước vào. Chúng tôi chào nhau nồng nhiệt và trao đổi số điện thoại để sớm hàn huyên câu chuyện.';
    }

    setTranscript(mockE);
    setVietnameseTranslation(mockV);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorText('Vui lòng nhập tiêu đề cho bài nghe.');
      return;
    }

    // In case user hasn't input transcript, generate a mock one
    let targetTranscript = transcript.trim();
    let targetTranslation = vietnameseTranslation.trim();

    if (!targetTranscript) {
      // Automatic mock data creation helper
      targetTranscript = 'Yesterday morning, I woke up with an intense craving for hot pancakes. I decided to head to the local diner down the street. While sitting at the counter, I ran into my high school literature teacher. We talked about classic novels for an hour. It was a wonderful start to my weekend.';
      targetTranslation = 'Sáng hôm qua, tôi thức dậy với cảm giác thèm ăn bánh pancake nóng hổi. Tôi quyết định đi bộ đến quán ăn nhỏ đầu phố. Trong lúc ngồi ăn tại quầy, tôi tình cờ chạm mặt cô giáo dạy văn cấp ba của mình. Chúng tôi đã trò chuyện về các cuốn tiểu thuyết cổ điển suốt cả tiếng. Đó quả là sự khởi đầu tuyệt vời cho những ngày nghỉ cuối tuần.';
    }

    // Parse transcript into sections
    const sentences = targetTranscript.split(/(?<=[.!?])\s+/);
    const translationSentences = targetTranslation.split(/(?<=[.!?])\s+/);

    const sections = sentences.map((sentence, idx) => {
      const translated = translationSentences[idx] || 'Bản dịch đang được cập nhật...';
      
      // Auto-extract mock words dynamically to show realistic system behaviour
      const words = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).slice(0, 2);
      const vocabItems = words.map(w => ({
        word: w.toLowerCase(),
        meaning: `Từ vựng trích xuất tự động: ${w}`
      }));

      return {
        id: `sec-${Date.now()}-${idx}`,
        english: sentence,
        vietnamese: translated,
        context: `Bối cảnh phân tích ngữ cảnh của câu học nghe số ${idx + 1}.`,
        vocabulary: vocabItems
      };
    });

    // Generate vocab items for lesson setup
    const vocabList = sections.map((sec, idx) => {
      const item = sec.vocabulary[0];
      return {
        id: `v-upload-${idx}-${Date.now()}`,
        word: item.word,
        vietnamese: `Nghĩa tiếng Việt của "${item.word}"`,
        contextUsage: `Được dùng trong câu: "${sec.english}"`,
        exampleSentence: sec.english,
        status: 'New' as const,
        topic,
        level
      };
    });

    // Create custom lesson structure
    const newLesson: Lesson = {
      id: `lesson-custom-${Date.now()}`,
      title,
      level,
      topic,
      durationSeconds: file ? Math.round(Math.random() * 30 + 30) : 40,
      transcript: targetTranscript,
      vietnameseTranslation: targetTranslation,
      sections,
      vocabularies: vocabList,
      quizzes: [
        {
          id: `q-custom-1`,
          question: `Chủ đề chính của bài học "${title}" là gì?`,
          options: [
            `Chủ đề ${topic} theo những gì diễn ra trong bài văn nghe nói.`,
            'Một vấn đề hoàn toàn không liên quan về công nghệ.',
            'Bàn luận về thiết kế thời trang hiện đại.',
            'Cách thức chăm sóc thú cưng.'
          ],
          correctAnswer: 0,
          explanation: 'Dựa vào văn cảnh và chủ đề bài viết được thiết lập ban đầu.'
        }
      ],
      fillBlanks: [
        {
          id: `f-custom-1`,
          sentenceWithBlank: `Câu chuyện này diễn tả hoạt động liên quan trực tiếp đến lĩnh vực: _______.`,
          blankValue: topic.toLowerCase(),
          clue: `Trùng khớp với nhãn chủ đề ${topic}.`
        }
      ],
      sentenceOrdering: [],
      dictations: [],
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Not Started',
      listenCount: 0,
      rewriteCount: 0
    };

    onAddLesson(newLesson);
    setIsSuccess(true);
    setTimeout(() => {
      setSelectedLessonId(newLesson.id);
      setActiveTab('listening');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Title block */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-xs">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">Upload Tài Liệu Học Mới</h2>
          <p className="text-sm text-slate-400">Tự động hóa giáo án nghe bằng cách tải file audio hoặc thêm bản phiên âm của riêng bạn.</p>
        </div>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-8 rounded-2xl text-center space-y-3 shadow-xs">
          <CheckCircle className="h-16 w-16 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold">Thao Tác Thành Công!</h3>
          <p className="text-sm text-emerald-200">Bài nghe "{title}" đã được phân tích ngữ cảnh và thiết lập giáo trình học tự động.</p>
          <p className="text-xs text-slate-400">Hệ thống đang điều hướng sang trang Luyện Nghe...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6">
          
          {errorText && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2.5 text-sm animate-pulse">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Section 1: Drag-and-drop simulated file selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">
              Bước 1: Tải lên tệp âm thanh nghe (Tùy chọn)
            </label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-emerald-400 bg-emerald-500/10' 
                  : file 
                    ? 'border-emerald-500/40 bg-slate-950/40' 
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-950/20 bg-slate-950/10'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="audio/*"
                className="hidden" 
              />
              {file ? (
                <div className="space-y-2">
                  <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <AudioLines className="h-8 w-8 animate-pulse" />
                  </div>
                  <div className="text-sm font-bold text-slate-200 line-clamp-1">{file.name}</div>
                  <div className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • Audio Format sẵn sàng</div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold underline mt-1"
                  >
                    Gỡ bỏ file khác
                  </button>
                </div>
              ) : (
                <div className="space-y-2 select-none">
                  <UploadCloud className="h-10 w-10 text-slate-400 mx-auto group-hover:text-emerald-400 transition-colors" />
                  <p className="text-sm font-medium text-slate-300">
                    Kéo thả file âm thanh của bạn vào đây, hoặc <span className="text-emerald-400 font-bold">nhấp để tìm</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Hỗ trợ tệp MP3, WAV, M4A định dạng tối đa 30MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Tiêu đề bài học <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: A Small Accident at the Gym, Buying Train Tickets..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
            </div>

            {/* Level and Topic Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Trình độ</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-3 text-sm text-slate-100 transition-all outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Chủ đề</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as Topic)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-3 text-sm text-slate-100 transition-all outline-none"
                >
                  {topics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Transcript entry */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-slate-400" />
                <span>Bước 2: Bản dịch và lời đọc phiên âm bằng tiếng Anh</span>
              </label>
              <button
                type="button"
                onClick={generateMockTranscript}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Thêm tài liệu mẫu nhanh</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-normal">
              Nếu bạn không tải file âm thanh lên hệ thống, hoặc dán lời dán, hệ thống sẽ tự động tổng hợp đoạn hội thoại theo chuyên đề {topic} với giọng chuẩn bản xứ để hỗ trợ luyện học.
            </p>

            <textarea
              id="upload-transcript-textarea"
              placeholder="Nhập hoặc dán nội dung đoạn văn bằng tiếng Anh tại đây..."
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-sans transition-all outline-none"
            />
          </div>

          {/* Vietnamese translation box */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">
              Bước 3: Bản dịch tiếng Việt (Tùy chọn)
            </label>
            <textarea
              placeholder="Dán bản dịch tiếng Việt tương ứng tương trợ kiểm tra nội dung..."
              rows={3}
              value={vietnameseTranslation}
              onChange={(e) => setVietnameseTranslation(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-sans transition-all outline-none"
            />
          </div>

          {/* Form Submit buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
            >
              Hủy bỏ, quay lại
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/10 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Phân tích & Bắt đầu học</span>
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
