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
    note: 'Dùng khi muốn nói làm lại, xảy ra lại, hoặc quay về trạng thái trước.',
    examples: [
      { word: 'replay', meaning: 'phát lại', breakdown: 're + play', example: 'Replay the audio and write what you hear.' },
      { word: 'review', meaning: 'ôn lại, xem lại', breakdown: 're + view', example: 'Review the vocabulary before the test.' },
      { word: 'rewrite', meaning: 'viết lại', breakdown: 're + write', example: 'Rewrite the sentence in your own words.' },
      { word: 'reconnect', meaning: 'kết nối lại', breakdown: 're + connect', example: 'Reconnect Google Drive if syncing fails.' },
      { word: 'rebuild', meaning: 'xây dựng lại', breakdown: 're + build', example: 'The team rebuilt the old system.' }
    ]
  },
  {
    id: 'prefix-un',
    type: 'prefix',
    part: 'un-',
    meaning: 'not; opposite; reverse',
    note: 'Thường phủ định tính từ hoặc đảo ngược hành động.',
    examples: [
      { word: 'unhappy', meaning: 'không vui', breakdown: 'un + happy', example: 'He felt unhappy with his score.' },
      { word: 'unfair', meaning: 'không công bằng', breakdown: 'un + fair', example: 'The rule seems unfair to beginners.' },
      { word: 'unlock', meaning: 'mở khóa', breakdown: 'un + lock', example: 'Upload audio to unlock full practice.' },
      { word: 'undo', meaning: 'hoàn tác', breakdown: 'un + do', example: 'You can undo your last edit.' },
      { word: 'unclear', meaning: 'không rõ ràng', breakdown: 'un + clear', example: 'The instruction is unclear.' }
    ]
  },
  {
    id: 'prefix-dis',
    type: 'prefix',
    part: 'dis-',
    meaning: 'not; opposite; away',
    note: 'Tạo nghĩa phủ định, trái ngược hoặc tách rời.',
    examples: [
      { word: 'disagree', meaning: 'không đồng ý', breakdown: 'dis + agree', example: 'I disagree with that answer.' },
      { word: 'disconnect', meaning: 'ngắt kết nối', breakdown: 'dis + connect', example: 'Do not disconnect during upload.' },
      { word: 'disappear', meaning: 'biến mất', breakdown: 'dis + appear', example: 'The folder disappeared from the list.' },
      { word: 'disadvantage', meaning: 'bất lợi', breakdown: 'dis + advantage', example: 'One disadvantage is the cost.' },
      { word: 'dishonest', meaning: 'không trung thực', breakdown: 'dis + honest', example: 'Dishonest behavior breaks trust.' }
    ]
  },
  {
    id: 'prefix-mis',
    type: 'prefix',
    part: 'mis-',
    meaning: 'wrongly; badly',
    note: 'Dùng khi làm sai, hiểu sai, đọc sai hoặc dùng sai.',
    examples: [
      { word: 'misread', meaning: 'đọc nhầm', breakdown: 'mis + read', example: 'I misread the instruction.' },
      { word: 'misunderstand', meaning: 'hiểu lầm', breakdown: 'mis + understand', example: 'Do not misunderstand the speaker.' },
      { word: 'mispronounce', meaning: 'phát âm sai', breakdown: 'mis + pronounce', example: 'Learners often mispronounce this word.' },
      { word: 'misuse', meaning: 'dùng sai', breakdown: 'mis + use', example: 'Do not misuse formal words.' },
      { word: 'mislead', meaning: 'làm hiểu nhầm', breakdown: 'mis + lead', example: 'The title may mislead readers.' }
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
      { word: 'preschool', meaning: 'mầm non', breakdown: 'pre + school', example: 'Preschool education supports early learning.' },
      { word: 'pretest', meaning: 'bài kiểm tra trước', breakdown: 'pre + test', example: 'A pretest shows your current level.' }
    ]
  },
  {
    id: 'prefix-post',
    type: 'prefix',
    part: 'post-',
    meaning: 'after',
    note: 'Chỉ điều xảy ra sau một thời điểm hoặc sự kiện.',
    examples: [
      { word: 'postwar', meaning: 'sau chiến tranh', breakdown: 'post + war', example: 'Postwar cities needed rebuilding.' },
      { word: 'postgraduate', meaning: 'sau đại học', breakdown: 'post + graduate', example: 'She is a postgraduate student.' },
      { word: 'postpone', meaning: 'trì hoãn', breakdown: 'post + pone', example: 'They postponed the meeting.' },
      { word: 'postscript', meaning: 'tái bút', breakdown: 'post + script', example: 'He added a postscript to the letter.' },
      { word: 'posttest', meaning: 'bài kiểm tra sau', breakdown: 'post + test', example: 'The posttest measured improvement.' }
    ]
  },
  {
    id: 'prefix-over',
    type: 'prefix',
    part: 'over-',
    meaning: 'too much; above',
    note: 'Diễn tả sự quá mức hoặc nằm ở phía trên.',
    examples: [
      { word: 'overwork', meaning: 'làm việc quá sức', breakdown: 'over + work', example: 'Overwork can harm your health.' },
      { word: 'overthink', meaning: 'suy nghĩ quá nhiều', breakdown: 'over + think', example: 'Do not overthink every mistake.' },
      { word: 'overuse', meaning: 'lạm dụng', breakdown: 'over + use', example: 'People overuse smartphones.' },
      { word: 'overcrowded', meaning: 'quá đông', breakdown: 'over + crowded', example: 'The train was overcrowded.' },
      { word: 'overestimate', meaning: 'đánh giá quá cao', breakdown: 'over + estimate', example: 'We overestimated the time needed.' }
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
      { word: 'underdeveloped', meaning: 'kém phát triển', breakdown: 'under + developed', example: 'Some regions remain underdeveloped.' },
      { word: 'underused', meaning: 'chưa được dùng đủ', breakdown: 'under + used', example: 'This feature is underused.' }
    ]
  },
  {
    id: 'prefix-inter',
    type: 'prefix',
    part: 'inter-',
    meaning: 'between; among',
    note: 'Chỉ sự kết nối hoặc tương tác giữa nhiều người, nơi, quốc gia hoặc hệ thống.',
    examples: [
      { word: 'international', meaning: 'quốc tế', breakdown: 'inter + national', example: 'International trade creates jobs.' },
      { word: 'interact', meaning: 'tương tác', breakdown: 'inter + act', example: 'Students interact in group tasks.' },
      { word: 'interview', meaning: 'phỏng vấn', breakdown: 'inter + view', example: 'The interview lasted thirty minutes.' },
      { word: 'interconnected', meaning: 'liên kết với nhau', breakdown: 'inter + connected', example: 'Modern economies are interconnected.' },
      { word: 'interpersonal', meaning: 'giữa người với người', breakdown: 'inter + personal', example: 'Interpersonal skills matter at work.' }
    ]
  },
  {
    id: 'prefix-intra',
    type: 'prefix',
    part: 'intra-',
    meaning: 'within; inside',
    note: 'Chỉ điều xảy ra bên trong cùng một nhóm, nơi hoặc hệ thống.',
    examples: [
      { word: 'intranet', meaning: 'mạng nội bộ', breakdown: 'intra + net', example: 'The company uses an intranet.' },
      { word: 'intracity', meaning: 'trong nội thành', breakdown: 'intra + city', example: 'Intracity buses are cheap.' },
      { word: 'intramural', meaning: 'trong cùng trường/tổ chức', breakdown: 'intra + mural', example: 'Students joined an intramural game.' },
      { word: 'intravenous', meaning: 'trong tĩnh mạch', breakdown: 'intra + venous', example: 'The medicine was given intravenously.' },
      { word: 'intrapersonal', meaning: 'trong nội tâm cá nhân', breakdown: 'intra + personal', example: 'Intrapersonal reflection supports learning.' }
    ]
  },
  {
    id: 'prefix-trans',
    type: 'prefix',
    part: 'trans-',
    meaning: 'across; through; change',
    note: 'Chỉ sự đi qua, vượt qua hoặc biến đổi.',
    examples: [
      { word: 'transport', meaning: 'vận chuyển', breakdown: 'trans + port', example: 'Public transport reduces traffic.' },
      { word: 'transform', meaning: 'biến đổi', breakdown: 'trans + form', example: 'AI can transform education.' },
      { word: 'translate', meaning: 'dịch', breakdown: 'trans + late', example: 'Translate the sentence into Vietnamese.' },
      { word: 'transfer', meaning: 'chuyển giao', breakdown: 'trans + fer', example: 'Transfer the file to Drive.' },
      { word: 'transatlantic', meaning: 'xuyên Đại Tây Dương', breakdown: 'trans + Atlantic', example: 'They took a transatlantic flight.' }
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
      { word: 'autosave', meaning: 'tự lưu', breakdown: 'auto + save', example: 'Autosave prevents data loss.' },
      { word: 'autocorrect', meaning: 'tự sửa lỗi', breakdown: 'auto + correct', example: 'Autocorrect changed the word.' }
    ]
  },
  {
    id: 'prefix-co',
    type: 'prefix',
    part: 'co- / com- / con-',
    meaning: 'together; with',
    note: 'Chỉ sự cùng làm, cùng tồn tại hoặc kết hợp.',
    examples: [
      { word: 'coworker', meaning: 'đồng nghiệp', breakdown: 'co + worker', example: 'My coworker helped me revise.' },
      { word: 'cooperate', meaning: 'hợp tác', breakdown: 'co + operate', example: 'Teams cooperate to solve problems.' },
      { word: 'combine', meaning: 'kết hợp', breakdown: 'com + bine', example: 'Combine listening and writing practice.' },
      { word: 'connect', meaning: 'kết nối', breakdown: 'con + nect', example: 'Connect the ideas clearly.' },
      { word: 'coexist', meaning: 'cùng tồn tại', breakdown: 'co + exist', example: 'Old and new methods can coexist.' }
    ]
  },
  {
    id: 'prefix-de',
    type: 'prefix',
    part: 'de-',
    meaning: 'remove; reduce; reverse',
    note: 'Chỉ gỡ bỏ, làm giảm hoặc đảo ngược trạng thái.',
    examples: [
      { word: 'decrease', meaning: 'giảm', breakdown: 'de + crease', example: 'Errors decrease with practice.' },
      { word: 'decode', meaning: 'giải mã', breakdown: 'de + code', example: 'Learners decode unfamiliar words.' },
      { word: 'deactivate', meaning: 'vô hiệu hóa', breakdown: 'de + activate', example: 'Do not deactivate the API.' },
      { word: 'deforest', meaning: 'phá rừng', breakdown: 'de + forest', example: 'Deforestation harms wildlife.' },
      { word: 'devalue', meaning: 'làm giảm giá trị', breakdown: 'de + value', example: 'Inflation can devalue money.' }
    ]
  },
  {
    id: 'prefix-anti',
    type: 'prefix',
    part: 'anti-',
    meaning: 'against; opposing',
    note: 'Chỉ sự chống lại hoặc ngăn điều gì đó.',
    examples: [
      { word: 'antivirus', meaning: 'chống vi-rút', breakdown: 'anti + virus', example: 'Install antivirus software.' },
      { word: 'antiwar', meaning: 'phản chiến', breakdown: 'anti + war', example: 'The antiwar speech was powerful.' },
      { word: 'antibiotic', meaning: 'thuốc kháng sinh', breakdown: 'anti + biotic', example: 'Antibiotics treat bacterial infections.' },
      { word: 'antisocial', meaning: 'chống đối xã hội, ít giao tiếp', breakdown: 'anti + social', example: 'He seemed antisocial at first.' },
      { word: 'antioxidant', meaning: 'chất chống oxy hóa', breakdown: 'anti + oxidant', example: 'Fruits contain antioxidants.' }
    ]
  },
  {
    id: 'prefix-pro',
    type: 'prefix',
    part: 'pro-',
    meaning: 'for; forward; in favor of',
    note: 'Chỉ sự ủng hộ hoặc hướng về phía trước.',
    examples: [
      { word: 'proactive', meaning: 'chủ động', breakdown: 'pro + active', example: 'Be proactive in your learning.' },
      { word: 'proceed', meaning: 'tiếp tục, tiến hành', breakdown: 'pro + ceed', example: 'Proceed to the next lesson.' },
      { word: 'promote', meaning: 'thúc đẩy, quảng bá', breakdown: 'pro + mote', example: 'Reading promotes vocabulary growth.' },
      { word: 'pro-democracy', meaning: 'ủng hộ dân chủ', breakdown: 'pro + democracy', example: 'They joined a pro-democracy group.' },
      { word: 'progress', meaning: 'tiến bộ', breakdown: 'pro + gress', example: 'Your progress is visible.' }
    ]
  },
  {
    id: 'prefix-sub',
    type: 'prefix',
    part: 'sub-',
    meaning: 'under; below; secondary',
    note: 'Chỉ vị trí dưới, cấp phụ hoặc một phần nhỏ trong tổng thể.',
    examples: [
      { word: 'subway', meaning: 'tàu điện ngầm', breakdown: 'sub + way', example: 'The subway is crowded.' },
      { word: 'subtitle', meaning: 'phụ đề', breakdown: 'sub + title', example: 'Watch the video with subtitles.' },
      { word: 'subtopic', meaning: 'chủ đề phụ', breakdown: 'sub + topic', example: 'Each paragraph has one subtopic.' },
      { word: 'submarine', meaning: 'tàu ngầm', breakdown: 'sub + marine', example: 'A submarine travels underwater.' },
      { word: 'substandard', meaning: 'dưới tiêu chuẩn', breakdown: 'sub + standard', example: 'The work was substandard.' }
    ]
  },
  {
    id: 'prefix-super',
    type: 'prefix',
    part: 'super-',
    meaning: 'above; beyond; very',
    note: 'Chỉ mức cao hơn, vượt trội hoặc rất mạnh.',
    examples: [
      { word: 'supermarket', meaning: 'siêu thị', breakdown: 'super + market', example: 'She bought food at the supermarket.' },
      { word: 'superpower', meaning: 'siêu cường, siêu năng lực', breakdown: 'super + power', example: 'The country became a superpower.' },
      { word: 'superhuman', meaning: 'phi thường', breakdown: 'super + human', example: 'The task required superhuman effort.' },
      { word: 'supervise', meaning: 'giám sát', breakdown: 'super + vise', example: 'The teacher supervised the exam.' },
      { word: 'superfast', meaning: 'siêu nhanh', breakdown: 'super + fast', example: 'The new internet is superfast.' }
    ]
  },
  {
    id: 'prefix-micro',
    type: 'prefix',
    part: 'micro-',
    meaning: 'small',
    note: 'Chỉ kích thước rất nhỏ hoặc phạm vi nhỏ.',
    examples: [
      { word: 'microphone', meaning: 'micro', breakdown: 'micro + phone', example: 'Use a microphone to record clearly.' },
      { word: 'microscope', meaning: 'kính hiển vi', breakdown: 'micro + scope', example: 'A microscope shows tiny details.' },
      { word: 'microchip', meaning: 'vi mạch', breakdown: 'micro + chip', example: 'A microchip stores data.' },
      { word: 'microloan', meaning: 'khoản vay nhỏ', breakdown: 'micro + loan', example: 'A microloan helped her business.' },
      { word: 'microlearning', meaning: 'học theo phần nhỏ', breakdown: 'micro + learning', example: 'Microlearning fits busy schedules.' }
    ]
  },
  {
    id: 'prefix-macro',
    type: 'prefix',
    part: 'macro-',
    meaning: 'large; overall',
    note: 'Chỉ quy mô lớn hoặc góc nhìn tổng thể.',
    examples: [
      { word: 'macroeconomics', meaning: 'kinh tế vĩ mô', breakdown: 'macro + economics', example: 'Macroeconomics studies national economies.' },
      { word: 'macrolevel', meaning: 'cấp độ lớn', breakdown: 'macro + level', example: 'We need a macrolevel view.' },
      { word: 'macrocosm', meaning: 'thế giới lớn', breakdown: 'macro + cosm', example: 'The city is a macrocosm of society.' },
      { word: 'macroscopic', meaning: 'có thể thấy bằng mắt thường', breakdown: 'macro + scopic', example: 'The change is macroscopic.' },
      { word: 'macrotrend', meaning: 'xu hướng lớn', breakdown: 'macro + trend', example: 'Remote work is a macrotrend.' }
    ]
  },
  {
    id: 'prefix-multi',
    type: 'prefix',
    part: 'multi-',
    meaning: 'many; multiple',
    note: 'Chỉ nhiều loại, nhiều phần hoặc nhiều người.',
    examples: [
      { word: 'multilingual', meaning: 'đa ngôn ngữ', breakdown: 'multi + lingual', example: 'A multilingual app helps more learners.' },
      { word: 'multitask', meaning: 'làm nhiều việc cùng lúc', breakdown: 'multi + task', example: 'Do not multitask while listening.' },
      { word: 'multicultural', meaning: 'đa văn hóa', breakdown: 'multi + cultural', example: 'The city is multicultural.' },
      { word: 'multimedia', meaning: 'đa phương tiện', breakdown: 'multi + media', example: 'Lessons use multimedia resources.' },
      { word: 'multiplayer', meaning: 'nhiều người chơi', breakdown: 'multi + player', example: 'The game has multiplayer mode.' }
    ]
  },
  {
    id: 'prefix-bi',
    type: 'prefix',
    part: 'bi-',
    meaning: 'two; twice',
    note: 'Chỉ số lượng hai hoặc xảy ra hai lần.',
    examples: [
      { word: 'bicycle', meaning: 'xe đạp', breakdown: 'bi + cycle', example: 'A bicycle has two wheels.' },
      { word: 'bilingual', meaning: 'song ngữ', breakdown: 'bi + lingual', example: 'She is bilingual in English and Vietnamese.' },
      { word: 'biweekly', meaning: 'hai tuần một lần hoặc tuần hai lần', breakdown: 'bi + weekly', example: 'We have biweekly meetings.' },
      { word: 'bilateral', meaning: 'song phương', breakdown: 'bi + lateral', example: 'The two countries signed a bilateral agreement.' },
      { word: 'binary', meaning: 'nhị phân', breakdown: 'bi + nary', example: 'Computers use binary code.' }
    ]
  },
  {
    id: 'prefix-semi',
    type: 'prefix',
    part: 'semi-',
    meaning: 'half; partly',
    note: 'Chỉ một nửa hoặc một phần.',
    examples: [
      { word: 'semicircle', meaning: 'nửa vòng tròn', breakdown: 'semi + circle', example: 'Draw a semicircle.' },
      { word: 'semifinal', meaning: 'bán kết', breakdown: 'semi + final', example: 'The team reached the semifinal.' },
      { word: 'semiautomatic', meaning: 'bán tự động', breakdown: 'semi + automatic', example: 'The process is semiautomatic.' },
      { word: 'semiconscious', meaning: 'nửa tỉnh nửa mê', breakdown: 'semi + conscious', example: 'He was semiconscious after the accident.' },
      { word: 'semiprofessional', meaning: 'bán chuyên nghiệp', breakdown: 'semi + professional', example: 'She is a semiprofessional player.' }
    ]
  },
  {
    id: 'prefix-non',
    type: 'prefix',
    part: 'non-',
    meaning: 'not; without',
    note: 'Tạo nghĩa không phải hoặc không có, thường trung tính hơn un-/in-.',
    examples: [
      { word: 'nonfiction', meaning: 'phi hư cấu', breakdown: 'non + fiction', example: 'He reads nonfiction books.' },
      { word: 'nonsense', meaning: 'vô nghĩa', breakdown: 'non + sense', example: 'That explanation is nonsense.' },
      { word: 'nonprofit', meaning: 'phi lợi nhuận', breakdown: 'non + profit', example: 'She works for a nonprofit.' },
      { word: 'nonverbal', meaning: 'không lời', breakdown: 'non + verbal', example: 'Gestures are nonverbal signals.' },
      { word: 'nonstop', meaning: 'không dừng', breakdown: 'non + stop', example: 'They worked nonstop.' }
    ]
  },
  {
    id: 'prefix-in',
    type: 'prefix',
    part: 'in- / im- / il- / ir-',
    meaning: 'not',
    note: 'Phủ định tính từ; đổi dạng theo âm đầu: impossible, illegal, irregular.',
    examples: [
      { word: 'incorrect', meaning: 'không đúng', breakdown: 'in + correct', example: 'The answer is incorrect.' },
      { word: 'impossible', meaning: 'không thể', breakdown: 'im + possible', example: 'It is not impossible if you practice.' },
      { word: 'illegal', meaning: 'bất hợp pháp', breakdown: 'il + legal', example: 'The action was illegal.' },
      { word: 'irregular', meaning: 'không đều, bất quy tắc', breakdown: 'ir + regular', example: 'English has irregular verbs.' },
      { word: 'invisible', meaning: 'vô hình', breakdown: 'in + visible', example: 'The border is invisible.' }
    ]
  },
  {
    id: 'prefix-ex',
    type: 'prefix',
    part: 'ex-',
    meaning: 'former; out of',
    note: 'Chỉ người/vật cũ trước đây hoặc hướng ra ngoài.',
    examples: [
      { word: 'ex-president', meaning: 'cựu tổng thống', breakdown: 'ex + president', example: 'The ex-president gave a speech.' },
      { word: 'ex-wife', meaning: 'vợ cũ', breakdown: 'ex + wife', example: 'He met his ex-wife.' },
      { word: 'export', meaning: 'xuất khẩu', breakdown: 'ex + port', example: 'The country exports coffee.' },
      { word: 'exit', meaning: 'lối ra', breakdown: 'ex + it', example: 'Find the nearest exit.' },
      { word: 'exclude', meaning: 'loại trừ', breakdown: 'ex + clude', example: 'Do not exclude weaker students.' }
    ]
  },
  {
    id: 'prefix-fore',
    type: 'prefix',
    part: 'fore-',
    meaning: 'before; front',
    note: 'Chỉ điều ở phía trước hoặc xảy ra trước.',
    examples: [
      { word: 'forecast', meaning: 'dự báo', breakdown: 'fore + cast', example: 'The weather forecast was accurate.' },
      { word: 'forehead', meaning: 'trán', breakdown: 'fore + head', example: 'He touched his forehead.' },
      { word: 'foresee', meaning: 'thấy trước, dự đoán', breakdown: 'fore + see', example: 'Nobody could foresee the problem.' },
      { word: 'foreword', meaning: 'lời nói đầu', breakdown: 'fore + word', example: 'Read the foreword first.' },
      { word: 'foreground', meaning: 'tiền cảnh', breakdown: 'fore + ground', example: 'The tree is in the foreground.' }
    ]
  },
  {
    id: 'prefix-tele',
    type: 'prefix',
    part: 'tele-',
    meaning: 'far; distance',
    note: 'Liên quan tới khoảng cách xa hoặc truyền thông từ xa.',
    examples: [
      { word: 'telephone', meaning: 'điện thoại', breakdown: 'tele + phone', example: 'He answered the telephone.' },
      { word: 'television', meaning: 'truyền hình', breakdown: 'tele + vision', example: 'Television changed entertainment.' },
      { word: 'telework', meaning: 'làm việc từ xa', breakdown: 'tele + work', example: 'Many people telework from home.' },
      { word: 'telemedicine', meaning: 'y tế từ xa', breakdown: 'tele + medicine', example: 'Telemedicine saves travel time.' },
      { word: 'telescope', meaning: 'kính thiên văn', breakdown: 'tele + scope', example: 'A telescope helps us see distant stars.' }
    ]
  },
  {
    id: 'prefix-mono',
    type: 'prefix',
    part: 'mono-',
    meaning: 'one; single',
    note: 'Chỉ một hoặc đơn nhất.',
    examples: [
      { word: 'monolingual', meaning: 'đơn ngữ', breakdown: 'mono + lingual', example: 'A monolingual dictionary uses one language.' },
      { word: 'monologue', meaning: 'độc thoại', breakdown: 'mono + logue', example: 'The actor performed a monologue.' },
      { word: 'monochrome', meaning: 'một màu', breakdown: 'mono + chrome', example: 'The photo is monochrome.' },
      { word: 'monopoly', meaning: 'độc quyền', breakdown: 'mono + poly', example: 'The company had a monopoly.' },
      { word: 'monorail', meaning: 'tàu một ray', breakdown: 'mono + rail', example: 'The airport has a monorail.' }
    ]
  },
  {
    id: 'prefix-poly',
    type: 'prefix',
    part: 'poly-',
    meaning: 'many',
    note: 'Chỉ nhiều hoặc đa dạng.',
    examples: [
      { word: 'polyglot', meaning: 'người biết nhiều thứ tiếng', breakdown: 'poly + glot', example: 'A polyglot can speak many languages.' },
      { word: 'polygon', meaning: 'đa giác', breakdown: 'poly + gon', example: 'A triangle is a polygon.' },
      { word: 'polytechnic', meaning: 'bách khoa', breakdown: 'poly + technic', example: 'He studies at a polytechnic college.' },
      { word: 'polytheism', meaning: 'đa thần giáo', breakdown: 'poly + theism', example: 'Polytheism has many gods.' },
      { word: 'polymer', meaning: 'polyme', breakdown: 'poly + mer', example: 'Plastic is often made from polymers.' }
    ]
  },
  {
    id: 'prefix-circum',
    type: 'prefix',
    part: 'circum-',
    meaning: 'around',
    note: 'Chỉ sự bao quanh hoặc đi vòng quanh.',
    examples: [
      { word: 'circumstance', meaning: 'hoàn cảnh', breakdown: 'circum + stance', example: 'The decision depends on the circumstance.' },
      { word: 'circumference', meaning: 'chu vi', breakdown: 'circum + ference', example: 'Measure the circumference of the circle.' },
      { word: 'circumnavigate', meaning: 'đi vòng quanh', breakdown: 'circum + navigate', example: 'They circumnavigated the globe.' },
      { word: 'circumspect', meaning: 'thận trọng', breakdown: 'circum + spect', example: 'Be circumspect with personal data.' },
      { word: 'circumvent', meaning: 'né tránh, đi đường vòng', breakdown: 'circum + vent', example: 'They tried to circumvent the rule.' }
    ]
  },
  {
    id: 'suffix-er',
    type: 'suffix',
    part: '-er / -or',
    meaning: 'person or thing that does something',
    note: 'Biến động từ thành danh từ chỉ người hoặc vật thực hiện hành động.',
    examples: [
      { word: 'teacher', meaning: 'giáo viên', breakdown: 'teach + er', example: 'A teacher explains new words.' },
      { word: 'speaker', meaning: 'người nói, loa', breakdown: 'speak + er', example: 'The speaker talks clearly.' },
      { word: 'creator', meaning: 'người tạo ra', breakdown: 'create + or', example: 'The creator updated the app.' },
      { word: 'actor', meaning: 'diễn viên', breakdown: 'act + or', example: 'The actor spoke naturally.' },
      { word: 'translator', meaning: 'người dịch', breakdown: 'translate + or', example: 'The translator checked the text.' }
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
      { word: 'revision', meaning: 'sự ôn/sửa lại', breakdown: 'revise + sion', example: 'Revision improves writing.' },
      { word: 'discussion', meaning: 'cuộc thảo luận', breakdown: 'discuss + ion', example: 'The discussion was useful.' }
    ]
  },
  {
    id: 'suffix-ment',
    type: 'suffix',
    part: '-ment',
    meaning: 'result; state; process',
    note: 'Biến động từ thành danh từ chỉ quá trình, trạng thái hoặc kết quả.',
    examples: [
      { word: 'development', meaning: 'sự phát triển', breakdown: 'develop + ment', example: 'Development takes time.' },
      { word: 'improvement', meaning: 'sự cải thiện', breakdown: 'improve + ment', example: 'Daily review brings improvement.' },
      { word: 'agreement', meaning: 'sự đồng ý, thỏa thuận', breakdown: 'agree + ment', example: 'They reached an agreement.' },
      { word: 'movement', meaning: 'sự chuyển động', breakdown: 'move + ment', example: 'The movement was slow.' },
      { word: 'achievement', meaning: 'thành tựu', breakdown: 'achieve + ment', example: 'Passing the exam was an achievement.' }
    ]
  },
  {
    id: 'suffix-able',
    type: 'suffix',
    part: '-able / -ible',
    meaning: 'can be; suitable for',
    note: 'Tạo tính từ chỉ khả năng có thể làm được hoặc phù hợp để làm.',
    examples: [
      { word: 'readable', meaning: 'dễ đọc', breakdown: 'read + able', example: 'The paragraph is readable.' },
      { word: 'flexible', meaning: 'linh hoạt', breakdown: 'flex + ible', example: 'Flexible learning helps busy students.' },
      { word: 'visible', meaning: 'có thể nhìn thấy', breakdown: 'vis + ible', example: 'The button is clearly visible.' },
      { word: 'manageable', meaning: 'có thể quản lý được', breakdown: 'manage + able', example: 'The task is manageable.' },
      { word: 'predictable', meaning: 'có thể dự đoán', breakdown: 'predict + able', example: 'The ending was predictable.' }
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
      { word: 'meaningless', meaning: 'vô nghĩa', breakdown: 'meaning + less', example: 'Words are meaningless without context.' },
      { word: 'speechless', meaning: 'không nói nên lời', breakdown: 'speech + less', example: 'The result left her speechless.' }
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
      { word: 'powerful', meaning: 'mạnh mẽ', breakdown: 'power + ful', example: 'A powerful example helps memory.' },
      { word: 'colorful', meaning: 'nhiều màu sắc', breakdown: 'color + ful', example: 'The chart is colorful.' }
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
      { word: 'naturally', meaning: 'một cách tự nhiên', breakdown: 'natural + ly', example: 'Try to speak naturally.' },
      { word: 'carefully', meaning: 'một cách cẩn thận', breakdown: 'careful + ly', example: 'Listen carefully to the ending.' }
    ]
  },
  {
    id: 'suffix-ize',
    type: 'suffix',
    part: '-ize / -ise',
    meaning: 'make; become',
    note: 'Biến danh từ hoặc tính từ thành động từ mang nghĩa làm cho trở thành.',
    examples: [
      { word: 'modernize', meaning: 'hiện đại hóa', breakdown: 'modern + ize', example: 'The city modernized its transport system.' },
      { word: 'organize', meaning: 'tổ chức, sắp xếp', breakdown: 'organ + ize', example: 'Organize words by prefix.' },
      { word: 'summarize', meaning: 'tóm tắt', breakdown: 'summary + ize', example: 'Summarize the listening passage.' },
      { word: 'prioritize', meaning: 'ưu tiên', breakdown: 'priority + ize', example: 'Prioritize daily review.' },
      { word: 'specialize', meaning: 'chuyên môn hóa', breakdown: 'special + ize', example: 'She specializes in linguistics.' }
    ]
  },
  {
    id: 'suffix-al',
    type: 'suffix',
    part: '-al',
    meaning: 'related to',
    note: 'Tạo tính từ mang nghĩa liên quan đến điều gì.',
    examples: [
      { word: 'national', meaning: 'thuộc quốc gia', breakdown: 'nation + al', example: 'This is a national exam.' },
      { word: 'personal', meaning: 'cá nhân', breakdown: 'person + al', example: 'Keep personal data private.' },
      { word: 'cultural', meaning: 'thuộc văn hóa', breakdown: 'culture + al', example: 'Cultural context matters.' },
      { word: 'natural', meaning: 'tự nhiên', breakdown: 'nature + al', example: 'Speak in a natural way.' },
      { word: 'digital', meaning: 'kỹ thuật số', breakdown: 'digit + al', example: 'Digital tools support learning.' }
    ]
  },
  {
    id: 'suffix-ity',
    type: 'suffix',
    part: '-ity / -ty',
    meaning: 'state; quality',
    note: 'Tạo danh từ chỉ trạng thái hoặc phẩm chất.',
    examples: [
      { word: 'ability', meaning: 'khả năng', breakdown: 'able + ity', example: 'Listening ability improves with practice.' },
      { word: 'quality', meaning: 'chất lượng', breakdown: 'qual + ity', example: 'Audio quality is important.' },
      { word: 'security', meaning: 'bảo mật', breakdown: 'secure + ity', example: 'Security protects user data.' },
      { word: 'activity', meaning: 'hoạt động', breakdown: 'active + ity', example: 'The activity trains memory.' },
      { word: 'responsibility', meaning: 'trách nhiệm', breakdown: 'responsible + ity', example: 'Learning is your responsibility.' }
    ]
  },
  {
    id: 'suffix-ness',
    type: 'suffix',
    part: '-ness',
    meaning: 'state; condition',
    note: 'Biến tính từ thành danh từ chỉ trạng thái.',
    examples: [
      { word: 'happiness', meaning: 'hạnh phúc', breakdown: 'happy + ness', example: 'Happiness is hard to define.' },
      { word: 'darkness', meaning: 'bóng tối', breakdown: 'dark + ness', example: 'The room was in darkness.' },
      { word: 'kindness', meaning: 'lòng tốt', breakdown: 'kind + ness', example: 'Kindness builds trust.' },
      { word: 'weakness', meaning: 'điểm yếu', breakdown: 'weak + ness', example: 'Identify your weakness in listening.' },
      { word: 'awareness', meaning: 'nhận thức', breakdown: 'aware + ness', example: 'Awareness improves learning choices.' }
    ]
  },
  {
    id: 'suffix-ist',
    type: 'suffix',
    part: '-ist',
    meaning: 'person who practices or believes',
    note: 'Chỉ người theo một nghề, môn học, niềm tin hoặc hoạt động.',
    examples: [
      { word: 'artist', meaning: 'nghệ sĩ', breakdown: 'art + ist', example: 'The artist painted a portrait.' },
      { word: 'scientist', meaning: 'nhà khoa học', breakdown: 'science + ist', example: 'The scientist tested a theory.' },
      { word: 'pianist', meaning: 'người chơi piano', breakdown: 'piano + ist', example: 'The pianist practiced daily.' },
      { word: 'journalist', meaning: 'nhà báo', breakdown: 'journal + ist', example: 'The journalist asked questions.' },
      { word: 'optimist', meaning: 'người lạc quan', breakdown: 'optim + ist', example: 'An optimist expects good results.' }
    ]
  },
  {
    id: 'suffix-ism',
    type: 'suffix',
    part: '-ism',
    meaning: 'belief; system; practice',
    note: 'Chỉ học thuyết, niềm tin, hệ thống hoặc phong cách.',
    examples: [
      { word: 'realism', meaning: 'chủ nghĩa hiện thực', breakdown: 'real + ism', example: 'Realism appears in many novels.' },
      { word: 'tourism', meaning: 'du lịch', breakdown: 'tour + ism', example: 'Tourism supports local jobs.' },
      { word: 'capitalism', meaning: 'chủ nghĩa tư bản', breakdown: 'capital + ism', example: 'Capitalism shapes modern economies.' },
      { word: 'minimalism', meaning: 'chủ nghĩa tối giản', breakdown: 'minimal + ism', example: 'Minimalism reduces visual noise.' },
      { word: 'bilingualism', meaning: 'song ngữ', breakdown: 'bilingual + ism', example: 'Bilingualism benefits the brain.' }
    ]
  },
  {
    id: 'suffix-ive',
    type: 'suffix',
    part: '-ive',
    meaning: 'having the nature of; tending to',
    note: 'Tạo tính từ chỉ đặc tính hoặc xu hướng.',
    examples: [
      { word: 'active', meaning: 'chủ động, năng động', breakdown: 'act + ive', example: 'Active practice beats passive reading.' },
      { word: 'creative', meaning: 'sáng tạo', breakdown: 'create + ive', example: 'Creative examples are easier to remember.' },
      { word: 'effective', meaning: 'hiệu quả', breakdown: 'effect + ive', example: 'Dictation is an effective method.' },
      { word: 'expensive', meaning: 'đắt đỏ', breakdown: 'expense + ive', example: 'The course is expensive.' },
      { word: 'responsive', meaning: 'phản hồi nhanh', breakdown: 'respond + sive', example: 'The app should be responsive.' }
    ]
  },
  {
    id: 'suffix-ous',
    type: 'suffix',
    part: '-ous / -ious',
    meaning: 'full of; having qualities of',
    note: 'Tạo tính từ chỉ có đặc điểm hoặc đầy tính chất nào đó.',
    examples: [
      { word: 'dangerous', meaning: 'nguy hiểm', breakdown: 'danger + ous', example: 'The road is dangerous at night.' },
      { word: 'famous', meaning: 'nổi tiếng', breakdown: 'fame + ous', example: 'The speaker is famous.' },
      { word: 'curious', meaning: 'tò mò', breakdown: 'cur + ious', example: 'Curious learners ask questions.' },
      { word: 'various', meaning: 'đa dạng', breakdown: 'vary + ous', example: 'The app has various exercises.' },
      { word: 'serious', meaning: 'nghiêm túc', breakdown: 'seri + ous', example: 'She is serious about English.' }
    ]
  },
  {
    id: 'suffix-en',
    type: 'suffix',
    part: '-en',
    meaning: 'make; become',
    note: 'Biến tính từ thành động từ mang nghĩa làm cho trở nên.',
    examples: [
      { word: 'strengthen', meaning: 'tăng cường', breakdown: 'strength + en', example: 'Daily listening strengthens memory.' },
      { word: 'widen', meaning: 'mở rộng', breakdown: 'wide + en', example: 'Reading widens your vocabulary.' },
      { word: 'shorten', meaning: 'rút ngắn', breakdown: 'short + en', example: 'Shorten the sentence.' },
      { word: 'darken', meaning: 'làm tối', breakdown: 'dark + en', example: 'Clouds darkened the sky.' },
      { word: 'soften', meaning: 'làm mềm', breakdown: 'soft + en', example: 'Soften your tone.' }
    ]
  },
  {
    id: 'suffix-ship',
    type: 'suffix',
    part: '-ship',
    meaning: 'state; skill; relationship',
    note: 'Tạo danh từ chỉ trạng thái, kỹ năng, vai trò hoặc quan hệ.',
    examples: [
      { word: 'friendship', meaning: 'tình bạn', breakdown: 'friend + ship', example: 'Friendship requires trust.' },
      { word: 'leadership', meaning: 'khả năng lãnh đạo', breakdown: 'leader + ship', example: 'Leadership grows through practice.' },
      { word: 'membership', meaning: 'tư cách thành viên', breakdown: 'member + ship', example: 'Membership gives extra access.' },
      { word: 'partnership', meaning: 'quan hệ đối tác', breakdown: 'partner + ship', example: 'The partnership was successful.' },
      { word: 'scholarship', meaning: 'học bổng', breakdown: 'scholar + ship', example: 'She won a scholarship.' }
    ]
  },
  {
    id: 'suffix-hood',
    type: 'suffix',
    part: '-hood',
    meaning: 'state; period; group',
    note: 'Chỉ giai đoạn, trạng thái hoặc nhóm người.',
    examples: [
      { word: 'childhood', meaning: 'tuổi thơ', breakdown: 'child + hood', example: 'Childhood memories are strong.' },
      { word: 'neighborhood', meaning: 'khu phố', breakdown: 'neighbor + hood', example: 'The neighborhood is quiet.' },
      { word: 'brotherhood', meaning: 'tình anh em', breakdown: 'brother + hood', example: 'The team built brotherhood.' },
      { word: 'adulthood', meaning: 'tuổi trưởng thành', breakdown: 'adult + hood', example: 'Adulthood brings responsibility.' },
      { word: 'likelihood', meaning: 'khả năng xảy ra', breakdown: 'likely + hood', example: 'The likelihood of success increased.' }
    ]
  },
  {
    id: 'suffix-ant',
    type: 'suffix',
    part: '-ant / -ent',
    meaning: 'person or thing; having quality',
    note: 'Có thể tạo danh từ chỉ người/vật hoặc tính từ chỉ đặc điểm.',
    examples: [
      { word: 'assistant', meaning: 'trợ lý', breakdown: 'assist + ant', example: 'The assistant organized files.' },
      { word: 'student', meaning: 'học sinh, sinh viên', breakdown: 'stud + ent', example: 'Each student wrote a sentence.' },
      { word: 'important', meaning: 'quan trọng', breakdown: 'import + ant', example: 'Pronunciation is important.' },
      { word: 'different', meaning: 'khác nhau', breakdown: 'differ + ent', example: 'These words have different meanings.' },
      { word: 'participant', meaning: 'người tham gia', breakdown: 'participate + ant', example: 'Each participant answered quickly.' }
    ]
  },
  {
    id: 'suffix-ary',
    type: 'suffix',
    part: '-ary / -ory',
    meaning: 'related to; place for',
    note: 'Tạo tính từ hoặc danh từ liên quan tới chức năng, nơi chốn hoặc tính chất.',
    examples: [
      { word: 'library', meaning: 'thư viện', breakdown: 'liber + ary', example: 'The library is quiet.' },
      { word: 'dictionary', meaning: 'từ điển', breakdown: 'diction + ary', example: 'Use a dictionary for pronunciation.' },
      { word: 'temporary', meaning: 'tạm thời', breakdown: 'tempor + ary', example: 'This is a temporary solution.' },
      { word: 'introductory', meaning: 'mở đầu, nhập môn', breakdown: 'introduce + ory', example: 'Take an introductory course first.' },
      { word: 'compulsory', meaning: 'bắt buộc', breakdown: 'compulse + ory', example: 'Attendance is compulsory.' }
    ]
  },
  {
    id: 'suffix-logy',
    type: 'suffix',
    part: '-logy',
    meaning: 'study of',
    note: 'Chỉ ngành học hoặc lĩnh vực nghiên cứu.',
    examples: [
      { word: 'biology', meaning: 'sinh học', breakdown: 'bio + logy', example: 'Biology studies living things.' },
      { word: 'psychology', meaning: 'tâm lý học', breakdown: 'psycho + logy', example: 'Psychology explains behavior.' },
      { word: 'technology', meaning: 'công nghệ', breakdown: 'techno + logy', example: 'Technology changes education.' },
      { word: 'sociology', meaning: 'xã hội học', breakdown: 'socio + logy', example: 'Sociology studies society.' },
      { word: 'ecology', meaning: 'sinh thái học', breakdown: 'eco + logy', example: 'Ecology studies ecosystems.' }
    ]
  },
  {
    id: 'suffix-graph',
    type: 'suffix',
    part: '-graph / -gram',
    meaning: 'write; record; drawing',
    note: 'Liên quan tới ghi chép, vẽ, bản ghi hoặc hình ảnh.',
    examples: [
      { word: 'autograph', meaning: 'chữ ký', breakdown: 'auto + graph', example: 'She asked for his autograph.' },
      { word: 'photograph', meaning: 'bức ảnh', breakdown: 'photo + graph', example: 'The photograph was clear.' },
      { word: 'paragraph', meaning: 'đoạn văn', breakdown: 'para + graph', example: 'Write one paragraph.' },
      { word: 'diagram', meaning: 'sơ đồ', breakdown: 'dia + gram', example: 'The diagram explains the process.' },
      { word: 'program', meaning: 'chương trình', breakdown: 'pro + gram', example: 'The program stores data.' }
    ]
  },
  {
    id: 'suffix-phobia',
    type: 'suffix',
    part: '-phobia',
    meaning: 'fear of',
    note: 'Chỉ nỗi sợ hoặc ác cảm mạnh với điều gì.',
    examples: [
      { word: 'acrophobia', meaning: 'sợ độ cao', breakdown: 'acro + phobia', example: 'Acrophobia makes climbing hard.' },
      { word: 'claustrophobia', meaning: 'sợ không gian kín', breakdown: 'claustro + phobia', example: 'He has claustrophobia in elevators.' },
      { word: 'xenophobia', meaning: 'bài ngoại', breakdown: 'xeno + phobia', example: 'Education can reduce xenophobia.' },
      { word: 'technophobia', meaning: 'sợ công nghệ', breakdown: 'techno + phobia', example: 'Technophobia makes online learning harder.' },
      { word: 'hydrophobia', meaning: 'sợ nước', breakdown: 'hydro + phobia', example: 'Hydrophobia can be treated.' }
    ]
  }
];
