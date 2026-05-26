export interface WordPartExample {
  word: string;
  meaning: string;
  breakdown: string;
  example: string;
}

export interface WordPartGroup {
  id: string;
  type: 'prefix' | 'suffix';
  part: string;
  meaning: string;
  note: string;
  examples: WordPartExample[];
}

export const wordPartGroups: WordPartGroup[] = [
  {
    id: 'prefix-re',
    type: 'prefix',
    part: 're-',
    meaning: 'again; back',
    note: 'Dùng để nói hành động lặp lại hoặc quay trở lại trạng thái trước.',
    examples: [
      { word: 'replay', meaning: 'phát/chơi lại', breakdown: 're + play', example: 'I replayed the audio twice.' },
      { word: 'review', meaning: 'xem lại, ôn lại', breakdown: 're + view', example: 'Review the lesson before the quiz.' },
      { word: 'rewrite', meaning: 'viết lại', breakdown: 're + write', example: 'Rewrite the paragraph in your own words.' },
      { word: 'reconnect', meaning: 'kết nối lại', breakdown: 're + connect', example: 'Reconnect Google Drive if syncing fails.' }
    ]
  },
  {
    id: 'prefix-un',
    type: 'prefix',
    part: 'un-',
    meaning: 'not; reverse',
    note: 'Thường phủ định tính từ hoặc đảo ngược hành động.',
    examples: [
      { word: 'unhappy', meaning: 'không vui', breakdown: 'un + happy', example: 'He felt unhappy with the result.' },
      { word: 'unfair', meaning: 'không công bằng', breakdown: 'un + fair', example: 'The rule seems unfair.' },
      { word: 'unlock', meaning: 'mở khóa', breakdown: 'un + lock', example: 'Upload audio to unlock the timeline.' },
      { word: 'undo', meaning: 'hoàn tác', breakdown: 'un + do', example: 'You can undo your last change.' }
    ]
  },
  {
    id: 'prefix-dis',
    type: 'prefix',
    part: 'dis-',
    meaning: 'not; opposite; away',
    note: 'Tạo nghĩa phủ định, trái ngược hoặc tách rời.',
    examples: [
      { word: 'disagree', meaning: 'không đồng ý', breakdown: 'dis + agree', example: 'I disagree with that opinion.' },
      { word: 'disconnect', meaning: 'ngắt kết nối', breakdown: 'dis + connect', example: 'Do not disconnect during upload.' },
      { word: 'disappear', meaning: 'biến mất', breakdown: 'dis + appear', example: 'The folder disappeared from the list.' },
      { word: 'disadvantage', meaning: 'bất lợi', breakdown: 'dis + advantage', example: 'One disadvantage is the high cost.' }
    ]
  },
  {
    id: 'prefix-mis',
    type: 'prefix',
    part: 'mis-',
    meaning: 'wrong; badly',
    note: 'Dùng khi hành động xảy ra sai cách hoặc hiểu sai.',
    examples: [
      { word: 'misread', meaning: 'đọc nhầm', breakdown: 'mis + read', example: 'I misread the instruction.' },
      { word: 'misunderstand', meaning: 'hiểu lầm', breakdown: 'mis + understand', example: 'Do not misunderstand the speaker.' },
      { word: 'mispronounce', meaning: 'phát âm sai', breakdown: 'mis + pronounce', example: 'Learners often mispronounce this word.' },
      { word: 'mislead', meaning: 'gây hiểu nhầm', breakdown: 'mis + lead', example: 'The title may mislead readers.' }
    ]
  },
  {
    id: 'prefix-pre',
    type: 'prefix',
    part: 'pre-',
    meaning: 'before',
    note: 'Chỉ điều gì xảy ra trước thời điểm chính.',
    examples: [
      { word: 'preview', meaning: 'xem trước', breakdown: 'pre + view', example: 'Preview the text before saving.' },
      { word: 'prepare', meaning: 'chuẩn bị', breakdown: 'pre + pare', example: 'Prepare your notes before class.' },
      { word: 'prepay', meaning: 'trả trước', breakdown: 'pre + pay', example: 'Some services require users to prepay.' },
      { word: 'preschool', meaning: 'mầm non', breakdown: 'pre + school', example: 'Preschool education supports early learning.' }
    ]
  },
  {
    id: 'prefix-over',
    type: 'prefix',
    part: 'over-',
    meaning: 'too much; above',
    note: 'Diễn tả sự quá mức hoặc ở phía trên.',
    examples: [
      { word: 'overwork', meaning: 'làm việc quá sức', breakdown: 'over + work', example: 'Overwork can harm your health.' },
      { word: 'overthink', meaning: 'suy nghĩ quá nhiều', breakdown: 'over + think', example: 'Do not overthink every mistake.' },
      { word: 'overuse', meaning: 'lạm dụng', breakdown: 'over + use', example: 'People overuse smartphones.' },
      { word: 'overcrowded', meaning: 'quá đông đúc', breakdown: 'over + crowded', example: 'The bus was overcrowded.' }
    ]
  },
  {
    id: 'prefix-under',
    type: 'prefix',
    part: 'under-',
    meaning: 'too little; below',
    note: 'Diễn tả sự thiếu mức, thấp hơn hoặc ở bên dưới.',
    examples: [
      { word: 'underestimate', meaning: 'đánh giá thấp', breakdown: 'under + estimate', example: 'Do not underestimate daily practice.' },
      { word: 'underpaid', meaning: 'được trả lương thấp', breakdown: 'under + paid', example: 'Many workers feel underpaid.' },
      { word: 'underground', meaning: 'dưới lòng đất', breakdown: 'under + ground', example: 'The underground station is crowded.' },
      { word: 'underdeveloped', meaning: 'kém phát triển', breakdown: 'under + developed', example: 'Some regions remain underdeveloped.' }
    ]
  },
  {
    id: 'prefix-inter',
    type: 'prefix',
    part: 'inter-',
    meaning: 'between; among',
    note: 'Chỉ sự kết nối giữa nhiều người, nơi hoặc hệ thống.',
    examples: [
      { word: 'international', meaning: 'quốc tế', breakdown: 'inter + national', example: 'International trade creates jobs.' },
      { word: 'interact', meaning: 'tương tác', breakdown: 'inter + act', example: 'Students interact in group tasks.' },
      { word: 'interview', meaning: 'phỏng vấn', breakdown: 'inter + view', example: 'The interview lasted thirty minutes.' },
      { word: 'interconnected', meaning: 'liên kết với nhau', breakdown: 'inter + connected', example: 'Modern economies are interconnected.' }
    ]
  },
  {
    id: 'prefix-trans',
    type: 'prefix',
    part: 'trans-',
    meaning: 'across; change',
    note: 'Chỉ sự đi xuyên qua, vượt qua hoặc biến đổi.',
    examples: [
      { word: 'transport', meaning: 'vận chuyển', breakdown: 'trans + port', example: 'Public transport reduces traffic.' },
      { word: 'transform', meaning: 'biến đổi', breakdown: 'trans + form', example: 'AI can transform education.' },
      { word: 'translate', meaning: 'dịch', breakdown: 'trans + late', example: 'Translate the sentence into Vietnamese.' },
      { word: 'transfer', meaning: 'chuyển giao', breakdown: 'trans + fer', example: 'Transfer the file to Drive.' }
    ]
  },
  {
    id: 'prefix-auto',
    type: 'prefix',
    part: 'auto-',
    meaning: 'self; automatic',
    note: 'Chỉ sự tự thân hoặc tự động.',
    examples: [
      { word: 'automatic', meaning: 'tự động', breakdown: 'auto + matic', example: 'The app saves data automatically.' },
      { word: 'autobiography', meaning: 'tự truyện', breakdown: 'auto + biography', example: 'She wrote an autobiography.' },
      { word: 'autopilot', meaning: 'chế độ lái tự động', breakdown: 'auto + pilot', example: 'The plane used autopilot.' },
      { word: 'auto-save', meaning: 'tự lưu', breakdown: 'auto + save', example: 'Auto-save prevents data loss.' }
    ]
  },
  {
    id: 'suffix-er',
    type: 'suffix',
    part: '-er / -or',
    meaning: 'person or thing that does something',
    note: 'Biến động từ thành danh từ chỉ người/vật thực hiện hành động.',
    examples: [
      { word: 'teacher', meaning: 'giáo viên', breakdown: 'teach + er', example: 'A teacher explains new words.' },
      { word: 'speaker', meaning: 'người nói, loa', breakdown: 'speak + er', example: 'The speaker talks clearly.' },
      { word: 'creator', meaning: 'người tạo ra', breakdown: 'create + or', example: 'The creator updated the app.' },
      { word: 'actor', meaning: 'diễn viên', breakdown: 'act + or', example: 'The actor spoke naturally.' }
    ]
  },
  {
    id: 'suffix-tion',
    type: 'suffix',
    part: '-tion / -sion',
    meaning: 'action; process; result',
    note: 'Tạo danh từ trừu tượng chỉ hành động, quá trình hoặc kết quả.',
    examples: [
      { word: 'education', meaning: 'giáo dục', breakdown: 'educate + tion', example: 'Education changes lives.' },
      { word: 'decision', meaning: 'quyết định', breakdown: 'decide + sion', example: 'The decision was difficult.' },
      { word: 'connection', meaning: 'sự kết nối', breakdown: 'connect + tion', example: 'The connection failed.' },
      { word: 'revision', meaning: 'sự ôn/sửa lại', breakdown: 'revise + sion', example: 'Revision improves writing.' }
    ]
  },
  {
    id: 'suffix-ment',
    type: 'suffix',
    part: '-ment',
    meaning: 'result; state; process',
    note: 'Biến động từ thành danh từ chỉ quá trình hoặc kết quả.',
    examples: [
      { word: 'development', meaning: 'sự phát triển', breakdown: 'develop + ment', example: 'Development takes time.' },
      { word: 'improvement', meaning: 'sự cải thiện', breakdown: 'improve + ment', example: 'Daily review brings improvement.' },
      { word: 'agreement', meaning: 'sự đồng ý, thỏa thuận', breakdown: 'agree + ment', example: 'They reached an agreement.' },
      { word: 'movement', meaning: 'sự chuyển động', breakdown: 'move + ment', example: 'The movement was slow.' }
    ]
  },
  {
    id: 'suffix-able',
    type: 'suffix',
    part: '-able / -ible',
    meaning: 'can be; suitable for',
    note: 'Tạo tính từ chỉ khả năng có thể làm được.',
    examples: [
      { word: 'readable', meaning: 'dễ đọc, có thể đọc được', breakdown: 'read + able', example: 'The paragraph is readable.' },
      { word: 'flexible', meaning: 'linh hoạt', breakdown: 'flex + ible', example: 'Flexible learning helps busy students.' },
      { word: 'visible', meaning: 'có thể nhìn thấy', breakdown: 'vis + ible', example: 'The button is clearly visible.' },
      { word: 'manageable', meaning: 'có thể quản lý được', breakdown: 'manage + able', example: 'The task is manageable.' }
    ]
  },
  {
    id: 'suffix-less',
    type: 'suffix',
    part: '-less',
    meaning: 'without',
    note: 'Tạo tính từ mang nghĩa không có điều gì đó.',
    examples: [
      { word: 'careless', meaning: 'bất cẩn', breakdown: 'care + less', example: 'Careless typing causes mistakes.' },
      { word: 'homeless', meaning: 'vô gia cư', breakdown: 'home + less', example: 'The city supports homeless people.' },
      { word: 'hopeless', meaning: 'vô vọng', breakdown: 'hope + less', example: 'The situation is not hopeless.' },
      { word: 'meaningless', meaning: 'vô nghĩa', breakdown: 'meaning + less', example: 'Words are meaningless without context.' }
    ]
  },
  {
    id: 'suffix-ful',
    type: 'suffix',
    part: '-ful',
    meaning: 'full of; having',
    note: 'Tạo tính từ mang nghĩa có nhiều hoặc đầy điều gì đó.',
    examples: [
      { word: 'useful', meaning: 'hữu ích', breakdown: 'use + ful', example: 'This method is useful.' },
      { word: 'careful', meaning: 'cẩn thận', breakdown: 'care + ful', example: 'Be careful with spelling.' },
      { word: 'hopeful', meaning: 'đầy hy vọng', breakdown: 'hope + ful', example: 'She felt hopeful about the exam.' },
      { word: 'powerful', meaning: 'mạnh mẽ', breakdown: 'power + ful', example: 'A powerful example helps memory.' }
    ]
  },
  {
    id: 'suffix-ly',
    type: 'suffix',
    part: '-ly',
    meaning: 'in a certain way',
    note: 'Thường biến tính từ thành trạng từ chỉ cách thức.',
    examples: [
      { word: 'quickly', meaning: 'nhanh chóng', breakdown: 'quick + ly', example: 'She answered quickly.' },
      { word: 'clearly', meaning: 'rõ ràng', breakdown: 'clear + ly', example: 'The speaker talks clearly.' },
      { word: 'slowly', meaning: 'chậm rãi', breakdown: 'slow + ly', example: 'Play the audio slowly.' },
      { word: 'naturally', meaning: 'một cách tự nhiên', breakdown: 'natural + ly', example: 'Try to speak naturally.' }
    ]
  },
  {
    id: 'suffix-ize',
    type: 'suffix',
    part: '-ize',
    meaning: 'make; become',
    note: 'Biến danh từ/tính từ thành động từ mang nghĩa làm cho trở thành.',
    examples: [
      { word: 'modernize', meaning: 'hiện đại hóa', breakdown: 'modern + ize', example: 'The city modernized its transport system.' },
      { word: 'organize', meaning: 'tổ chức, sắp xếp', breakdown: 'organ + ize', example: 'Organize words by prefix.' },
      { word: 'summarize', meaning: 'tóm tắt', breakdown: 'summary + ize', example: 'Summarize the listening passage.' },
      { word: 'prioritize', meaning: 'ưu tiên', breakdown: 'priority + ize', example: 'Prioritize daily review.' }
    ]
  }
];
