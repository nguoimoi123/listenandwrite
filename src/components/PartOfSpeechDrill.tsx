import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpenCheck,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Target,
} from 'lucide-react';

type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb';

interface WordFamily {
  root: string;
  meaning: string;
  forms: Record<PartOfSpeech, string>;
}

interface DrillTemplate {
  pos: PartOfSpeech;
  sentence: string;
  clue: string;
  reason: string;
}

interface DrillQuestion {
  id: string;
  day: number;
  family: WordFamily;
  sentence: string;
  options: string[];
  answerIndex: number;
  answerPos: PartOfSpeech;
  clue: string;
  reason: string;
}

const QUESTIONS_PER_DAY = 20;
const TOTAL_DAYS = 25;
const TOTAL_QUESTIONS = QUESTIONS_PER_DAY * TOTAL_DAYS;
const STORAGE_KEY = 'lw_pos_drill_progress';
const COURSE_START_DATE_KEY = '2026-06-11';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const posLabels: Record<PartOfSpeech, string> = {
  noun: 'Danh từ',
  verb: 'Động từ',
  adjective: 'Tính từ',
  adverb: 'Trạng từ',
};

const wordFamilies: WordFamily[] = [
  { root: 'finance', meaning: 'tài chính', forms: { noun: 'funding', verb: 'finance', adjective: 'financial', adverb: 'financially' } },
  { root: 'approve', meaning: 'phê duyệt', forms: { noun: 'approval', verb: 'approve', adjective: 'approved', adverb: 'approvingly' } },
  { root: 'produce', meaning: 'sản xuất', forms: { noun: 'production', verb: 'produce', adjective: 'productive', adverb: 'productively' } },
  { root: 'compete', meaning: 'cạnh tranh', forms: { noun: 'competition', verb: 'compete', adjective: 'competitive', adverb: 'competitively' } },
  { root: 'rely', meaning: 'đáng tin cậy', forms: { noun: 'reliability', verb: 'rely', adjective: 'reliable', adverb: 'reliably' } },
  { root: 'efficient', meaning: 'hiệu quả', forms: { noun: 'efficiency', verb: 'streamline', adjective: 'efficient', adverb: 'efficiently' } },
  { root: 'announce', meaning: 'thông báo', forms: { noun: 'announcement', verb: 'announce', adjective: 'announced', adverb: 'officially' } },
  { root: 'deliver', meaning: 'giao hàng', forms: { noun: 'delivery', verb: 'deliver', adjective: 'delivered', adverb: 'promptly' } },
  { root: 'manage', meaning: 'quản lý', forms: { noun: 'management', verb: 'manage', adjective: 'managerial', adverb: 'managerially' } },
  { root: 'develop', meaning: 'phát triển', forms: { noun: 'development', verb: 'develop', adjective: 'developed', adverb: 'rapidly' } },
  { root: 'inform', meaning: 'thông tin', forms: { noun: 'information', verb: 'inform', adjective: 'informative', adverb: 'informatively' } },
  { root: 'succeed', meaning: 'thành công', forms: { noun: 'success', verb: 'succeed', adjective: 'successful', adverb: 'successfully' } },
  { root: 'care', meaning: 'cẩn thận', forms: { noun: 'carefulness', verb: 'handle', adjective: 'careful', adverb: 'carefully' } },
  { root: 'regular', meaning: 'đều đặn', forms: { noun: 'regularity', verb: 'regulate', adjective: 'regular', adverb: 'regularly' } },
  { root: 'accurate', meaning: 'chính xác', forms: { noun: 'accuracy', verb: 'verify', adjective: 'accurate', adverb: 'accurately' } },
  { root: 'secure', meaning: 'bảo mật', forms: { noun: 'security', verb: 'secure', adjective: 'secured', adverb: 'securely' } },
  { root: 'possible', meaning: 'có thể', forms: { noun: 'possibility', verb: 'enable', adjective: 'possible', adverb: 'possibly' } },
  { root: 'active', meaning: 'chủ động', forms: { noun: 'activity', verb: 'activate', adjective: 'active', adverb: 'actively' } },
  { root: 'clear', meaning: 'rõ ràng', forms: { noun: 'clarity', verb: 'clarify', adjective: 'clear', adverb: 'clearly' } },
  { root: 'safe', meaning: 'an toàn', forms: { noun: 'safety', verb: 'safeguard', adjective: 'safe', adverb: 'safely' } },
  { root: 'quick', meaning: 'nhanh', forms: { noun: 'speed', verb: 'quicken', adjective: 'quick', adverb: 'quickly' } },
  { root: 'stable', meaning: 'ổn định', forms: { noun: 'stability', verb: 'stabilize', adjective: 'stable', adverb: 'stably' } },
  { root: 'specific', meaning: 'cụ thể', forms: { noun: 'specification', verb: 'specify', adjective: 'specific', adverb: 'specifically' } },
  { root: 'modern', meaning: 'hiện đại', forms: { noun: 'modernization', verb: 'modernize', adjective: 'modern', adverb: 'modernly' } },
  { root: 'benefit', meaning: 'lợi ích', forms: { noun: 'benefits', verb: 'benefit', adjective: 'beneficial', adverb: 'beneficially' } },
  { root: 'arrange', meaning: 'sắp xếp', forms: { noun: 'arrangement', verb: 'arrange', adjective: 'arranged', adverb: 'systematically' } },
  { root: 'assist', meaning: 'hỗ trợ', forms: { noun: 'assistance', verb: 'assist', adjective: 'assistant', adverb: 'helpfully' } },
  { root: 'attend', meaning: 'tham dự', forms: { noun: 'attendance', verb: 'attend', adjective: 'attentive', adverb: 'attentively' } },
  { root: 'attract', meaning: 'thu hút', forms: { noun: 'attraction', verb: 'attract', adjective: 'attractive', adverb: 'attractively' } },
  { root: 'available', meaning: 'có sẵn', forms: { noun: 'availability', verb: 'provide', adjective: 'available', adverb: 'readily' } },
  { root: 'aware', meaning: 'nhận thức', forms: { noun: 'awareness', verb: 'notice', adjective: 'aware', adverb: 'consciously' } },
  { root: 'certain', meaning: 'chắc chắn', forms: { noun: 'certainty', verb: 'confirm', adjective: 'certain', adverb: 'certainly' } },
  { root: 'collect', meaning: 'thu thập', forms: { noun: 'collection', verb: 'collect', adjective: 'collective', adverb: 'collectively' } },
  { root: 'comfort', meaning: 'thoải mái', forms: { noun: 'comfortness', verb: 'comfort', adjective: 'comfortable', adverb: 'comfortably' } },
  { root: 'communicate', meaning: 'giao tiếp', forms: { noun: 'communication', verb: 'communicate', adjective: 'communicative', adverb: 'clearly' } },
  { root: 'complete', meaning: 'hoàn thành', forms: { noun: 'completion', verb: 'complete', adjective: 'completed', adverb: 'completely' } },
  { root: 'confident', meaning: 'tự tin', forms: { noun: 'confidence', verb: 'assure', adjective: 'confident', adverb: 'confidently' } },
  { root: 'confirm', meaning: 'xác nhận', forms: { noun: 'confirmation', verb: 'confirm', adjective: 'confirmed', adverb: 'formally' } },
  { root: 'construct', meaning: 'xây dựng', forms: { noun: 'construction', verb: 'construct', adjective: 'constructive', adverb: 'constructively' } },
  { root: 'consult', meaning: 'tư vấn', forms: { noun: 'consultation', verb: 'consult', adjective: 'consultative', adverb: 'professionally' } },
  { root: 'convenient', meaning: 'thuận tiện', forms: { noun: 'convenience', verb: 'simplify', adjective: 'convenient', adverb: 'conveniently' } },
  { root: 'create', meaning: 'tạo ra', forms: { noun: 'creation', verb: 'create', adjective: 'creative', adverb: 'creatively' } },
  { root: 'decide', meaning: 'quyết định', forms: { noun: 'decision', verb: 'decide', adjective: 'decisive', adverb: 'decisively' } },
  { root: 'demonstrate', meaning: 'trình bày', forms: { noun: 'demonstration', verb: 'demonstrate', adjective: 'demonstrable', adverb: 'clearly' } },
  { root: 'depend', meaning: 'phụ thuộc', forms: { noun: 'dependence', verb: 'depend', adjective: 'dependent', adverb: 'dependably' } },
  { root: 'direct', meaning: 'trực tiếp', forms: { noun: 'direction', verb: 'direct', adjective: 'directional', adverb: 'directly' } },
  { root: 'distribute', meaning: 'phân phối', forms: { noun: 'distribution', verb: 'distribute', adjective: 'distributed', adverb: 'widely' } },
  { root: 'economy', meaning: 'kinh tế', forms: { noun: 'economy', verb: 'economize', adjective: 'economic', adverb: 'economically' } },
  { root: 'educate', meaning: 'đào tạo', forms: { noun: 'education', verb: 'educate', adjective: 'educational', adverb: 'educationally' } },
  { root: 'employ', meaning: 'tuyển dụng', forms: { noun: 'employment', verb: 'employ', adjective: 'employable', adverb: 'gainfully' } },
  { root: 'encourage', meaning: 'khuyến khích', forms: { noun: 'encouragement', verb: 'encourage', adjective: 'encouraging', adverb: 'encouragingly' } },
  { root: 'equip', meaning: 'trang bị', forms: { noun: 'equipment', verb: 'equip', adjective: 'equipped', adverb: 'properly' } },
  { root: 'evaluate', meaning: 'đánh giá', forms: { noun: 'evaluation', verb: 'evaluate', adjective: 'evaluative', adverb: 'objectively' } },
  { root: 'expand', meaning: 'mở rộng', forms: { noun: 'expansion', verb: 'expand', adjective: 'expanded', adverb: 'rapidly' } },
  { root: 'expect', meaning: 'mong đợi', forms: { noun: 'expectation', verb: 'expect', adjective: 'expected', adverb: 'expectedly' } },
  { root: 'expense', meaning: 'chi phí', forms: { noun: 'expense', verb: 'spend', adjective: 'expensive', adverb: 'expensively' } },
  { root: 'flexible', meaning: 'linh hoạt', forms: { noun: 'flexibility', verb: 'adapt', adjective: 'flexible', adverb: 'flexibly' } },
  { root: 'frequent', meaning: 'thường xuyên', forms: { noun: 'frequency', verb: 'repeat', adjective: 'frequent', adverb: 'frequently' } },
  { root: 'generate', meaning: 'tạo ra', forms: { noun: 'generation', verb: 'generate', adjective: 'generative', adverb: 'automatically' } },
  { root: 'identify', meaning: 'xác định', forms: { noun: 'identification', verb: 'identify', adjective: 'identifiable', adverb: 'accurately' } },
  { root: 'immediate', meaning: 'ngay lập tức', forms: { noun: 'immediacy', verb: 'expedite', adjective: 'immediate', adverb: 'immediately' } },
  { root: 'improve', meaning: 'cải thiện', forms: { noun: 'improvement', verb: 'improve', adjective: 'improved', adverb: 'steadily' } },
  { root: 'inspect', meaning: 'kiểm tra', forms: { noun: 'inspection', verb: 'inspect', adjective: 'inspective', adverb: 'closely' } },
  { root: 'install', meaning: 'cài đặt', forms: { noun: 'installation', verb: 'install', adjective: 'installed', adverb: 'properly' } },
  { root: 'instruct', meaning: 'hướng dẫn', forms: { noun: 'instruction', verb: 'instruct', adjective: 'instructional', adverb: 'clearly' } },
  { root: 'invite', meaning: 'mời', forms: { noun: 'invitation', verb: 'invite', adjective: 'invited', adverb: 'cordially' } },
  { root: 'locate', meaning: 'định vị', forms: { noun: 'location', verb: 'locate', adjective: 'local', adverb: 'locally' } },
  { root: 'maintain', meaning: 'duy trì', forms: { noun: 'maintenance', verb: 'maintain', adjective: 'maintained', adverb: 'regularly' } },
  { root: 'motivate', meaning: 'thúc đẩy', forms: { noun: 'motivation', verb: 'motivate', adjective: 'motivated', adverb: 'enthusiastically' } },
  { root: 'negotiate', meaning: 'đàm phán', forms: { noun: 'negotiation', verb: 'negotiate', adjective: 'negotiable', adverb: 'successfully' } },
  { root: 'operate', meaning: 'vận hành', forms: { noun: 'operation', verb: 'operate', adjective: 'operational', adverb: 'operationally' } },
  { root: 'organize', meaning: 'tổ chức', forms: { noun: 'organization', verb: 'organize', adjective: 'organized', adverb: 'efficiently' } },
  { root: 'participate', meaning: 'tham gia', forms: { noun: 'participation', verb: 'participate', adjective: 'participatory', adverb: 'actively' } },
  { root: 'perform', meaning: 'thực hiện', forms: { noun: 'performance', verb: 'perform', adjective: 'performing', adverb: 'effectively' } },
  { root: 'permit', meaning: 'cho phép', forms: { noun: 'permission', verb: 'permit', adjective: 'permissible', adverb: 'legally' } },
  { root: 'prepare', meaning: 'chuẩn bị', forms: { noun: 'preparation', verb: 'prepare', adjective: 'prepared', adverb: 'thoroughly' } },
  { root: 'present', meaning: 'trình bày', forms: { noun: 'presentation', verb: 'present', adjective: 'presentable', adverb: 'professionally' } },
  { root: 'prevent', meaning: 'ngăn chặn', forms: { noun: 'prevention', verb: 'prevent', adjective: 'preventive', adverb: 'effectively' } },
  { root: 'process', meaning: 'xử lý', forms: { noun: 'processing', verb: 'process', adjective: 'procedural', adverb: 'systematically' } },
  { root: 'protect', meaning: 'bảo vệ', forms: { noun: 'protection', verb: 'protect', adjective: 'protective', adverb: 'securely' } },
  { root: 'publish', meaning: 'xuất bản', forms: { noun: 'publication', verb: 'publish', adjective: 'published', adverb: 'publicly' } },
  { root: 'purchase', meaning: 'mua hàng', forms: { noun: 'purchasing', verb: 'purchase', adjective: 'purchased', adverb: 'online' } },
  { root: 'recommend', meaning: 'đề xuất', forms: { noun: 'recommendation', verb: 'recommend', adjective: 'recommended', adverb: 'strongly' } },
  { root: 'reduce', meaning: 'giảm', forms: { noun: 'reduction', verb: 'reduce', adjective: 'reduced', adverb: 'significantly' } },
  { root: 'refer', meaning: 'tham khảo', forms: { noun: 'reference', verb: 'refer', adjective: 'referential', adverb: 'specifically' } },
  { root: 'register', meaning: 'đăng ký', forms: { noun: 'registration', verb: 'register', adjective: 'registered', adverb: 'online' } },
  { root: 'repair', meaning: 'sửa chữa', forms: { noun: 'repairs', verb: 'repair', adjective: 'repaired', adverb: 'quickly' } },
  { root: 'replace', meaning: 'thay thế', forms: { noun: 'replacement', verb: 'replace', adjective: 'replaceable', adverb: 'easily' } },
  { root: 'reserve', meaning: 'đặt trước', forms: { noun: 'reservation', verb: 'reserve', adjective: 'reserved', adverb: 'early' } },
  { root: 'respond', meaning: 'phản hồi', forms: { noun: 'response', verb: 'respond', adjective: 'responsive', adverb: 'promptly' } },
  { root: 'satisfy', meaning: 'hài lòng', forms: { noun: 'satisfaction', verb: 'satisfy', adjective: 'satisfactory', adverb: 'satisfactorily' } },
  { root: 'schedule', meaning: 'lên lịch', forms: { noun: 'scheduling', verb: 'schedule', adjective: 'scheduled', adverb: 'regularly' } },
  { root: 'select', meaning: 'chọn lựa', forms: { noun: 'selection', verb: 'select', adjective: 'selective', adverb: 'selectively' } },
  { root: 'special', meaning: 'đặc biệt', forms: { noun: 'specialty', verb: 'specialize', adjective: 'special', adverb: 'specially' } },
  { root: 'strategy', meaning: 'chiến lược', forms: { noun: 'strategy', verb: 'strategize', adjective: 'strategic', adverb: 'strategically' } },
  { root: 'submit', meaning: 'nộp', forms: { noun: 'submission', verb: 'submit', adjective: 'submitted', adverb: 'electronically' } },
  { root: 'supply', meaning: 'cung cấp', forms: { noun: 'supplies', verb: 'supply', adjective: 'supplied', adverb: 'regularly' } },
  { root: 'support', meaning: 'hỗ trợ', forms: { noun: 'supporting', verb: 'support', adjective: 'supportive', adverb: 'supportively' } },
  { root: 'train', meaning: 'đào tạo', forms: { noun: 'training', verb: 'train', adjective: 'trained', adverb: 'professionally' } },
  { root: 'transport', meaning: 'vận chuyển', forms: { noun: 'transportation', verb: 'transport', adjective: 'transportable', adverb: 'safely' } },
  { root: 'update', meaning: 'cập nhật', forms: { noun: 'updates', verb: 'update', adjective: 'updated', adverb: 'regularly' } },
  { root: 'use', meaning: 'sử dụng', forms: { noun: 'usage', verb: 'use', adjective: 'useful', adverb: 'usefully' } },
  { root: 'vary', meaning: 'thay đổi', forms: { noun: 'variety', verb: 'vary', adjective: 'various', adverb: 'variously' } },
];

const templates: DrillTemplate[] = [
  { pos: 'adjective', sentence: 'The _____ manager reviewed the contract.', clue: 'The + _____ + danh từ', reason: 'Sau chỗ trống là danh từ “manager”, nên chỗ trống cần một tính từ để bổ nghĩa cho danh từ đó.' },
  { pos: 'adjective', sentence: 'We need a _____ report by Friday.', clue: 'a + _____ + danh từ', reason: 'Sau mạo từ “a” và trước danh từ “report”, vị trí này cần tính từ.' },
  { pos: 'adjective', sentence: 'The team found the process _____.', clue: 'find + tân ngữ + _____', reason: 'Sau “found the process”, chỗ trống mô tả “the process”, nên chọn tính từ.' },
  { pos: 'adjective', sentence: 'This is a highly _____ market.', clue: 'highly + _____ + danh từ', reason: '“Highly” thường đứng trước tính từ; tính từ đó tiếp tục bổ nghĩa cho danh từ “market”.' },
  { pos: 'adjective', sentence: 'The _____ solution reduced delays.', clue: 'The + _____ + danh từ', reason: 'Chỗ trống đứng ngay trước danh từ “solution”, nên cần tính từ.' },
  { pos: 'noun', sentence: 'The _____ of the plan took two weeks.', clue: 'The + _____ + of', reason: 'Cụm “the _____ of” thường cần danh từ ở giữa, ví dụ “the approval of...”.' },
  { pos: 'noun', sentence: 'Several employees questioned the _____.', clue: 'the + _____', reason: 'Sau “the”, chỗ trống là thứ bị “questioned”, nên nó đóng vai trò danh từ.' },
  { pos: 'noun', sentence: 'There was a clear increase in _____.', clue: 'giới từ + _____', reason: 'Sau giới từ “in” thường cần danh từ hoặc cụm danh từ.' },
  { pos: 'noun', sentence: 'The department needs more _____ this quarter.', clue: 'need + tân ngữ', reason: 'Động từ “needs” cần một tân ngữ phía sau; vị trí tân ngữ thường là danh từ.' },
  { pos: 'noun', sentence: 'Good _____ helps the office work smoothly.', clue: 'tính từ + _____', reason: '“Good” là tính từ, nên sau nó thường là danh từ được bổ nghĩa.' },
  { pos: 'verb', sentence: 'The director will _____ the new policy.', clue: 'will + _____', reason: 'Sau động từ khuyết thiếu “will” phải dùng động từ nguyên mẫu.' },
  { pos: 'verb', sentence: 'All staff members must _____ the form.', clue: 'must + _____', reason: 'Sau “must” phải dùng động từ nguyên mẫu.' },
  { pos: 'verb', sentence: 'The company plans to _____ the service.', clue: 'to + _____', reason: 'Sau cấu trúc “plan to” cần động từ nguyên mẫu.' },
  { pos: 'verb', sentence: 'Please _____ the details before sending them.', clue: 'Please + _____', reason: 'Câu mệnh lệnh với “Please” cần động từ nguyên mẫu ngay phía sau.' },
  { pos: 'verb', sentence: 'The new system can _____ errors faster.', clue: 'can + _____', reason: 'Sau “can” phải dùng động từ nguyên mẫu.' },
  { pos: 'adverb', sentence: 'The assistant worked _____ during the event.', clue: 'động từ + _____', reason: 'Chỗ trống đứng sau động từ “worked” và mô tả cách làm việc, nên cần trạng từ.' },
  { pos: 'adverb', sentence: 'The manager _____ approved the request.', clue: '_____ + động từ', reason: 'Chỗ trống đứng trước cụm động từ “approved the request”, nên cần trạng từ để bổ nghĩa cho hành động.' },
  { pos: 'adverb', sentence: 'The package arrived _____ yesterday.', clue: 'arrived + _____', reason: 'Chỗ trống mô tả cách “arrived”, nên cần trạng từ.' },
  { pos: 'adverb', sentence: 'The figures were checked _____.', clue: 'động từ bị động + _____', reason: 'Sau cụm bị động “were checked”, trạng từ có thể mô tả cách hành động được thực hiện.' },
  { pos: 'adverb', sentence: 'She responded _____ to the client email.', clue: 'responded + _____', reason: 'Chỗ trống bổ nghĩa cho động từ “responded”, nên cần trạng từ.' },
];

function seededValue(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildQuestions(): DrillQuestion[] {
  const questions = wordFamilies.flatMap((family, familyIndex) =>
    templates.map((template, templateIndex) => {
      const options = [
        family.forms.noun,
        family.forms.verb,
        family.forms.adjective,
        family.forms.adverb,
      ];
      const answer = family.forms[template.pos];
      return {
        id: `pos-${familyIndex + 1}-${templateIndex + 1}`,
        day: familyIndex + 1,
        family,
        sentence: template.sentence.replace('_____', '_____'),
        options,
        answerIndex: options.indexOf(answer),
        answerPos: template.pos,
        clue: template.clue,
        reason: template.reason,
      };
    })
  );

  return questions
    .sort((first, second) => seededValue(first.id) - seededValue(second.id))
    .slice(0, TOTAL_QUESTIONS)
    .map((question, index) => ({
      ...question,
      day: Math.floor(index / QUESTIONS_PER_DAY) + 1,
    }));
}

function loadCompletedDays(): number[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed.completedDays) ? parsed.completedDays : [];
  } catch {
    return [];
  }
}

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getScheduledDay(date = new Date()): number {
  const courseStart = parseLocalDateKey(COURSE_START_DATE_KEY);
  const today = parseLocalDateKey(getLocalDateKey(date));
  const daysSinceStart = Math.floor((today.getTime() - courseStart.getTime()) / DAY_IN_MS);
  return Math.min(Math.max(daysSinceStart + 1, 1), TOTAL_DAYS);
}

function getNextLocalMidnightDelay(): number {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 5, 0);
  return Math.max(nextMidnight.getTime() - now.getTime(), 1000);
}

export default function PartOfSpeechDrill() {
  const allQuestions = useMemo(() => buildQuestions(), []);
  const [calendarDateKey, setCalendarDateKey] = useState<string>(() => getLocalDateKey());
  const [selectedDay, setSelectedDay] = useState<number>(() => getScheduledDay());
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completedDays, setCompletedDays] = useState<number[]>(() => loadCompletedDays());
  const scheduledDay = useMemo(() => getScheduledDay(parseLocalDateKey(calendarDateKey)), [calendarDateKey]);

  useEffect(() => {
    let intervalId: number | undefined;
    const syncToToday = () => {
      setCalendarDateKey(getLocalDateKey());
      setSelectedDay(getScheduledDay());
    };

    const timeoutId = window.setTimeout(() => {
      syncToToday();
      intervalId = window.setInterval(syncToToday, 60 * 60 * 1000);
    }, getNextLocalMidnightDelay());

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  const newQuestions = allQuestions.slice((selectedDay - 1) * QUESTIONS_PER_DAY, selectedDay * QUESTIONS_PER_DAY);
  const reviewQuestions =
    selectedDay > 1
      ? allQuestions.slice((selectedDay - 2) * QUESTIONS_PER_DAY, (selectedDay - 1) * QUESTIONS_PER_DAY)
      : [];
  const todayQuestions = [...newQuestions, ...reviewQuestions];
  const answeredCount = todayQuestions.filter((question) => answers[question.id] !== undefined).length;
  const correctCount = todayQuestions.filter((question) => answers[question.id] === question.answerIndex).length;
  const progressPercent = Math.round((completedDays.length / TOTAL_DAYS) * 100);

  const answerQuestion = (questionId: string, optionIndex: number) => {
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
  };

  const completeDay = () => {
    const nextCompleted = Array.from(new Set([...completedDays, selectedDay])).sort((a, b) => a - b);
    setCompletedDays(nextCompleted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedDays: nextCompleted }));
  };

  const resetToday = () => {
    const ids = new Set(todayQuestions.map((question) => question.id));
    setAnswers((current) => {
      const next = { ...current };
      ids.forEach((id) => delete next[id]);
      return next;
    });
  };

  return (
    <section className="space-y-5">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Target className="h-4 w-4" />
              Part 5 N - V - Adj - Adv
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Từ loại trong câu</h2>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                500 câu trong 25 ngày, lấy từ kho {wordFamilies.length} nhóm từ TOEIC. Mỗi ngày làm 20 câu mới được trộn từ nhiều nhóm từ; từ ngày 2 trở đi sẽ có thêm 20 câu ôn của ngày trước.
                Mỗi câu giải thích theo dấu hiệu câu, không học bằng cách dịch từng từ.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 min-w-full sm:min-w-[360px]">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">Hôm nay</div>
              <div className="text-xl font-black text-white mt-1">{todayQuestions.length}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">Điểm</div>
              <div className="text-xl font-black text-emerald-300 mt-1">{correctCount}/{answeredCount || 0}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">Tháng</div>
              <div className="text-xl font-black text-sky-300 mt-1">{progressPercent}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-emerald-400" />
          <div>
            <div className="text-sm font-black text-white">Ngày {selectedDay}/{TOTAL_DAYS}</div>
            <div className="text-xs text-slate-500">
              Lịch thật: {calendarDateKey} = Ngày {scheduledDay}{selectedDay !== scheduledDay ? `, đang xem lại Ngày ${selectedDay}` : ''}
            </div>
            <div className="text-xs text-slate-500">20 câu mới{selectedDay > 1 ? ' + 20 câu ôn hôm qua' : ''}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDay((day) => Math.max(1, day - 1))}
            className="h-10 px-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 text-sm font-bold"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </button>
          <select
            value={selectedDay}
            onChange={(event) => setSelectedDay(Number(event.target.value))}
            className="h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-sm font-bold text-slate-200"
          >
            {Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1).map((day) => (
              <option key={day} value={day}>Ngày {day}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSelectedDay(scheduledDay)}
            className="h-10 px-3 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/15 flex items-center gap-2 text-sm font-black"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => setSelectedDay((day) => Math.min(TOTAL_DAYS, day + 1))}
            className="h-10 px-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 text-sm font-bold"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={resetToday}
            className="h-10 px-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 text-sm font-bold"
          >
            <RotateCcw className="h-4 w-4" />
            Làm lại
          </button>
          <button
            type="button"
            onClick={completeDay}
            className="h-10 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-2 text-sm font-black"
          >
            <CheckCircle className="h-4 w-4" />
            Hoàn thành ngày
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {todayQuestions.map((question, index) => {
          const selectedAnswer = answers[question.id];
          const isAnswered = selectedAnswer !== undefined;
          const isCorrect = selectedAnswer === question.answerIndex;
          const isReview = index >= newQuestions.length;
          const correctWord = question.options[question.answerIndex];

          return (
            <article key={question.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="lg:w-72 shrink-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-xs font-black text-slate-300">
                      {index + 1}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded-full border ${
                      isReview
                        ? 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    }`}>
                      {isReview ? 'Ôn lại' : 'Câu mới'}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-black text-slate-500">
                      {question.family.root} - {question.family.meaning}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <BookOpenCheck className="h-4 w-4 text-slate-500" />
                    Dấu hiệu: <span className="text-slate-300 font-bold">{question.clue}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-4">
                  <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                    {question.sentence}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                    {question.options.map((option, optionIndex) => {
                      const optionIsCorrect = optionIndex === question.answerIndex;
                      const optionWasSelected = selectedAnswer === optionIndex;
                      return (
                        <button
                          key={`${question.id}-${optionIndex}`}
                          type="button"
                          onClick={() => answerQuestion(question.id, optionIndex)}
                          className={`min-h-12 rounded-xl border px-3 py-2 text-left transition-all ${
                            optionWasSelected && optionIsCorrect
                              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200'
                              : optionWasSelected
                                ? 'border-rose-500/50 bg-rose-500/10 text-rose-200'
                                : isAnswered && optionIsCorrect
                                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                  : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          <div className="text-sm font-black">{option}</div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
                            {posLabels[(['noun', 'verb', 'adjective', 'adverb'] as PartOfSpeech[])[optionIndex]]}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className={`rounded-xl border p-3 text-sm ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-100'
                    }`}>
                      <div className="font-black flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        {isCorrect ? 'Đúng' : `Chưa đúng. Đáp án: ${correctWord}`}
                      </div>
                      <p className="mt-1 text-slate-300 leading-relaxed">
                        Cần chọn <span className="font-black text-white">{posLabels[question.answerPos]}</span> vì {question.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
