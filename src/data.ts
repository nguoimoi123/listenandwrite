import { Lesson, VocabularyItem } from './types';

export const initialLessons: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'A Small Accident at the Gym',
    level: 'Intermediate',
    topic: 'Daily life',
    durationSeconds: 45,
    transcript: 'Today, after sitting and coding all day for my Flutter project, I decided to go work out. I was running on the machine when I turned around to get my water bottle. Then I bumped into a younger student. He lost control and fell over. He almost knocked the weight rack over. I quickly bent down to help him up. Luckily, he could get up by himself. After finishing my workout, I came back to my room.',
    vietnameseTranslation: 'Hôm nay, sau khi ngồi một chỗ lập trình cả ngày cho dự án Flutter của mình, tôi quyết định đi tập thể dục. Tôi đang chạy trên máy tập chạy bộ thì quay lại để lấy chai nước của mình. Lúc đó tôi đã va phải một bạn sinh viên khóa dưới. Bạn ấy bị mất thăng bằng và ngã nhào. Bạn ấy suýt nữa thì làm đổ cả giá đựng tạ. Tôi nhanh chóng cúi người xuống để đỡ bạn ấy dậy. May mắn thay, bạn ấy có thể tự đứng dậy được. Sau khi hoàn thành buổi tập, tôi trở về phòng.',
    createdDate: '2026-05-24',
    status: 'In Progress',
    listenCount: 2,
    rewriteCount: 1,
    bestScore: 82,
    studentLastRewrite: 'Today I sat coding Flutter all day, so I decided to work out. While I was runing on machine, I turned to get water bottle. I bumped into a junior student. He lost balance and fell down. He almost knocked weight rack down. I bent down to help him. Fortunately he got up by himself. Then I went home after workout.',
    sections: [
      {
        id: 'sec-1-1',
        english: 'Today, after sitting and coding all day for my Flutter project, I decided to go work out.',
        vietnamese: 'Hôm nay, sau khi ngồi lập trình cả ngày cho dự án Flutter của mình, tôi quyết định đi tập thể dục.',
        context: 'Người nói thiết lập bối cảnh ban đầu: cả ngày mệt mỏi vì ngồi làm việc trước máy tính, dẫn đến quyết định đi vận động để giải tỏa.',
        vocabulary: [
          { word: 'after sitting and coding', meaning: 'sau khi ngồi viết mã/lập trình' },
          { word: 'decided to go work out', meaning: 'quyết định đi tập thể dục/thể hình' }
        ]
      },
      {
        id: 'sec-1-2',
        english: 'I was running on the machine when I turned around to get my water bottle.',
        vietnamese: 'Tôi đang chạy trên máy (chạy bộ) thì quay lại để lấy chai nước.',
        context: 'Sử dụng thì Quá khứ tiếp diễn kết hợp Quá khứ đơn (was running... when I turned) để diễn tả hành động đang xảy ra thì có một hành động khác xen vào.',
        vocabulary: [
          { word: 'was running on the machine', meaning: 'đang chạy trên máy chạy bộ' },
          { word: 'turned around to get', meaning: 'quay ngoắt lại để lấy' }
        ]
      },
      {
        id: 'sec-1-3',
        english: 'Then I bumped into a younger student. He lost control and fell over.',
        vietnamese: 'Sau đó tôi va vào một bạn sinh viên trẻ tuổi hơn. Cậu ấy mất tự chủ/thăng bằng và ngã nhào.',
        context: 'Tình huống bất ngờ xảy ra khi đang chạy nhưng không chú ý. Bump into là một phrasal verb cực kỳ phổ biến trong giao tiếp hàng ngày.',
        vocabulary: [
          { word: 'bumped into', meaning: 'vô tình đụng/va vào ai đó' },
          { word: 'lost control', meaning: 'mất kiểm soát/mất thăng bằng' },
          { word: 'fell over', meaning: 'ngã lộn nhào, ngã xuống sàn' }
        ]
      },
      {
        id: 'sec-1-4',
        english: 'He almost knocked the weight rack over. I quickly bent down to help him up.',
        vietnamese: 'Cậu ấy suýt chút nữa đã xô đổ cả giá để tạ. Tôi nhanh chóng cúi người xuống đỡ cậu ấy dậy.',
        context: 'Tả lại chuỗi hành động khẩn trương. Động từ tách rời "knock over" (làm ngã/đổ) và "help up" (đỡ ai đứng dậy) được lồng ghép rất tự nhiên.',
        vocabulary: [
          { word: 'knocked ... over', meaning: 'làm đổ, xô ngã cái gì đó' },
          { word: 'bent down', meaning: 'khom người, cúi người xuống' },
          { word: 'help him up', meaning: 'giúp đỡ ai đó đứng dậy' }
        ]
      },
      {
        id: 'sec-1-5',
        english: 'Luckily, he could get up by himself. After finishing my workout, I came back to my room.',
        vietnamese: 'May thay, cậu ấy có thể tự mình đứng dậy được. Sau khi hoàn thành buổi tập, tôi trở về phòng.',
        context: 'Kết thúc câu chuyện một cách nhẹ nhàng. Không có chấn thương nghiêm trọng xảy ra, người nói hoàn thành bài tập rồi kết thúc một ngày.',
        vocabulary: [
          { word: 'by himself', meaning: 'bởi chính bản thân cậu ấy (tự mình)' },
          { word: 'get up', meaning: 'đứng dậy, ngồi dậy' }
        ]
      }
    ],
    vocabularies: [
      {
        id: 'v-1',
        word: 'work out',
        ipa: '/wɜːrk aʊt/',
        vietnamese: 'tập thể dục, tập thể hình, luyện tập thể chất',
        contextUsage: 'Nói về việc đi tập gym hoặc tập thể dục nâng cao sức khỏe.',
        exampleSentence: 'I try to work out at least three times a week to stay fit.',
        status: 'Learning',
        topic: 'Daily life',
        level: 'Intermediate'
      },
      {
        id: 'v-2',
        word: 'bump into',
        ipa: '/bʌmp ˈɪntuː/',
        vietnamese: 'tình cờ va phải, vô tình gặp mặt ai đó',
        contextUsage: 'Có thể dùng nghĩa đen (va chạm thể xác) hoặc nghĩa bóng (tình cờ gặp người quen trên đường).',
        exampleSentence: 'Guess who I bumped into at the supermarket yesterday? It was our primary teacher!',
        status: 'Learning',
        topic: 'Daily life',
        level: 'Intermediate'
      },
      {
        id: 'v-3',
        word: 'knock over',
        ipa: '/nɑːk ˈoʊvər/',
        vietnamese: 'làm đổ, làm ngã rạp một vật gì đó',
        contextUsage: 'Thường dùng khi vô tình xô đẩy làm rơi đổ đồ vật đứng thẳng.',
        exampleSentence: 'The cat jumped onto the table and knocked my mug of coffee over.',
        status: 'New',
        topic: 'Daily life',
        level: 'Intermediate'
      },
      {
        id: 'v-4',
        word: 'bent down',
        ipa: '/bent daʊn/',
        vietnamese: 'cúi người, khom lưng xuống',
        contextUsage: 'Hành động cúi người xuống để nhặt đồ hoặc tiếp cận mặt đất.',
        exampleSentence: 'The man bent down to tie his shoelace before joining the race.',
        status: 'New',
        topic: 'Daily life',
        level: 'Intermediate'
      },
      {
        id: 'v-5',
        word: 'lost control',
        ipa: '/lɔːst kənˈtroʊl/',
        vietnamese: 'mất kiểm soát, mất thăng bằng',
        contextUsage: 'Khi không còn khả năng giữ thăng bằng cơ thể hoặc điều khiển phương tiện.',
        exampleSentence: 'The driver lost control of the car on the icy road.',
        status: 'Mastered',
        topic: 'Daily life',
        level: 'Intermediate'
      },
      {
        id: 'v-6',
        word: 'fell over',
        ipa: '/fel ˈoʊvər/',
        vietnamese: 'ngã lộn nhào, ngã xuống đất',
        contextUsage: 'Mất thăng bằng dẫn đến việc toàn thân ngã ra đất.',
        exampleSentence: 'He tripped over a small rock and fell over on the sidewalk.',
        status: 'New',
        topic: 'Daily life',
        level: 'Intermediate'
      },
      {
        id: 'v-7',
        word: 'help someone up',
        ipa: '/help ˈsʌmwʌn ʌp/',
        vietnamese: 'đỡ ai đó đứng lên, đứng dậy',
        contextUsage: 'Hành động giúp đỡ kéo người khác dậy sau khi họ bị ngã.',
        exampleSentence: 'She slipped on the wet floor, so I reached out my hand and helped her up.',
        status: 'Learning',
        topic: 'Daily life',
        level: 'Intermediate'
      }
    ],
    quizzes: [
      {
        id: 'q-1-1',
        question: 'What did the speaker do right before deciding to go work out?',
        options: [
          'He was playing soccer with his younger students.',
          'He sat and coded his Flutter project all day long.',
          'He went to a restaurant to get a water bottle.',
          'He went shopping for sports gear.'
        ],
        correctAnswer: 1,
        explanation: 'The transcript states: "after sitting and coding all day for my Flutter project, I decided to go work out."'
      },
      {
        id: 'q-1-2',
        question: 'Who did the speaker bump into while running on the machine?',
        options: [
          'His Flutter project coach.',
          'A younger student.',
          'An old friend from school.',
          'A fitness instructor.'
        ],
        correctAnswer: 1,
        explanation: 'He mentions: "Then I bumped into a younger student. He lost control and fell over."'
      },
      {
        id: 'q-1-3',
        question: 'What luckily happened in the end?',
        options: [
          'The weight rack fell down but did not hit anyone.',
          'The younger student was rescued by the trainers.',
          'The younger student was able to get up by himself.',
          'The speaker coded a new fitness app.'
        ],
        correctAnswer: 2,
        explanation: 'The transcript says: "Luckily, he could get up by himself."'
      }
    ],
    fillBlanks: [
      {
        id: 'f-1-1',
        sentenceWithBlank: 'Today, after sitting and coding all day, I decided to go _______.',
        blankValue: 'work out',
        clue: 'Two words phrasal verb. Means doing exercise at the gym.'
      },
      {
        id: 'f-1-2',
        sentenceWithBlank: 'I was running on the machine when I turned around to get my _______.',
        blankValue: 'water bottle',
        clue: 'Something you drink from during workouts.'
      },
      {
        id: 'f-1-3',
        sentenceWithBlank: 'Then I _______ a younger student. He lost control and fell over.',
        blankValue: 'bumped into',
        clue: 'Phrasal verb in past tense. Means accidentally crashed or ran into someone.'
      }
    ],
    sentenceOrdering: [
      {
        id: 'o-1-1',
        scrambledSegments: [
          'to go work out.',
          'I decided',
          'Today, after sitting and coding',
          'all day for my Flutter project,'
        ],
        correctOrder: [
          'Today, after sitting and coding',
          'all day for my Flutter project,',
          'I decided',
          'to go work out.'
        ],
        solution: 'Today, after sitting and coding all day for my Flutter project, I decided to go work out.'
      },
      {
        id: 'o-1-2',
        scrambledSegments: [
          'when I turned around',
          'to get my water bottle.',
          'on the machine',
          'I was running'
        ],
        correctOrder: [
          'I was running',
          'on the machine',
          'when I turned around',
          'to get my water bottle.'
        ],
        solution: 'I was running on the machine when I turned around to get my water bottle.'
      }
    ],
    dictations: [
      {
        id: 'd-1-1',
        audioText: 'I was running on the machine when I turned around to get my water bottle.',
        clue: 'Gợi ý: Nói về hành động chạy trên máy và lấy bình nước.'
      },
      {
        id: 'd-1-2',
        audioText: 'He almost knocked the weight rack over.',
        clue: 'Gợi ý: Suýt làm ngã cái giá đựng tạ nặng.'
      }
    ]
  },
  {
    id: 'lesson-2',
    title: 'Ordering Specialty Coffee in Seattle',
    level: 'Beginner',
    topic: 'Conversation',
    durationSeconds: 30,
    transcript: 'Good morning! Welcome to Seattle Roasters. What can I get started for you today? Hello, I would like to order a large caramel macchiato with oat milk please. Sure! Would you like that hot or iced? Hot, and please make it extra hot with less sweet syrup if possible. You got it! That will be six dollars and fifty cents. Cash or card?',
    vietnameseTranslation: 'Chào buổi sáng! Chào mừng quý khách đến với Seattle Roasters. Tôi có thể lấy đồ uống gì để khởi đầu ngày mới cho bạn hôm nay? Xin chào, tôi muốn gọi một ly caramel macchiato cỡ lớn với sữa yến mạch. Chắc chắn rồi! Quý khách muốn uống nóng hay đá ạ? Nóng ạ, và phiền bạn làm thật nóng giúp tôi và sủ dụng ít siro ngọt hơn nếu được nhé. Nhất trí ạ! Của quý khách hết sáu đô la năm mươi xu. Thanh toán tiền mặt hay quẹt thẻ ạ?',
    createdDate: '2026-05-25',
    status: 'Not Started',
    listenCount: 0,
    rewriteCount: 0,
    sections: [
      {
        id: 'sec-2-1',
        english: 'Good morning! Welcome to Seattle Roasters. What can I get started for you today?',
        vietnamese: 'Chào buổi sáng! Chào mừng quý khách đến với Seattle Roasters. Tôi có thể chuẩn bị món gì cho anh/chị hôm nay?',
        context: 'Lưu loát mở đầu cuộc hội thoại chào khách chuẩn dịch vụ của một cửa hàng cà phê nổi tiếng tại Mỹ.',
        vocabulary: [
          { word: 'Welcome to', meaning: 'Chào mừng quý khách đến với' },
          { word: 'get started for you', meaning: 'chuẩn bị, bắt đầu làm cho bạn' }
        ]
      },
      {
        id: 'sec-2-2',
        english: 'Hello, I would like to order a large caramel macchiato with oat milk please.',
        vietnamese: 'Xin chào, tôi muốn đặt một cốc caramel macchiato lớn dùng sữa yến mạch.',
        context: 'Cách lịch sự để gọi món: "I would like to order...". Việc thay thế sữa bò bằng oat milk (sữa yến mạch) là xu thế hiện nay.',
        vocabulary: [
          { word: 'would like to order', meaning: 'muốn gọi món/đặt hàng' },
          { word: 'oat milk', meaning: 'sữa yến mạch' }
        ]
      },
      {
        id: 'sec-2-3',
        english: 'Sure! Would you like that hot or iced? Hot, and please make it extra hot with less sweet syrup if possible.',
        vietnamese: 'Chắc chắn rồi! Quý khách dùng nóng hay đá ạ? Nóng, và vui lòng làm thật nóng cùng với ít siro ngọt hơn nếu được nhé.',
        context: 'Hỏi về tùy chọn pha chế (hot or iced). Khách hàng đưa ra các customize chi tiết: "extra hot" (siêu nóng) và "less sweet syrup" (ít siro ngọt hơn).',
        vocabulary: [
          { word: 'hot or iced', meaning: 'nóng hay đá' },
          { word: 'extra hot', meaning: 'nóng hơn bình thường' },
          { word: 'less sweet syrup', meaning: 'ít siro ngọt hơn' }
        ]
      },
      {
        id: 'sec-2-4',
        english: 'You got it! That will be six dollars and fifty cents. Cash or card?',
        vietnamese: 'Có ngay ạ! Tổng cộng hết sáu đô-la và năm mươi xu. Bạn thanh toán bằng tiền mặt hay thẻ?',
        context: 'Xác nhận dịch vụ và báo hóa đơn thanh toán trực tiếp. "You got it!" là cụm từ rất thân thiện để nói "Tôi hiểu rồi / Sẽ làm ngay".',
        vocabulary: [
          { word: 'You got it', meaning: 'Bạn hiểu thế là đúng rồi / Nhất trí luôn' },
          { word: 'Cash or card', meaning: 'Thẻ hay tiền mặt' }
        ]
      }
    ],
    vocabularies: [
      {
        id: 'v-2-1',
        word: 'What can I get started for you',
        ipa: '/wʌt kæn aɪ ɡet ˈstɑːrtɪd fɔːr juː/',
        vietnamese: 'Tôi có thể chuẩn bị/lấy món gì khai vị/đồ uống cho bạn trước?',
        contextUsage: 'Mẫu câu dịch vụ ăn uống thân mật nhưng lịch sự để bắt đầu lấy order.',
        exampleSentence: 'Welcome! What can I get started for you tonight? Some drinks to begin?',
        status: 'New',
        topic: 'Conversation',
        level: 'Beginner'
      },
      {
        id: 'v-2-2',
        word: 'oat milk',
        ipa: '/oʊt mɪlk/',
        vietnamese: 'sữa yến mạch',
        contextUsage: 'Sữa chay phổ biến chiết xuất từ hạt yến mạch, rất được chuộng trong đồ uống Starbucks.',
        exampleSentence: 'I prefer my latte with oat milk because it tastes creamier.',
        status: 'New',
        topic: 'Conversation',
        level: 'Beginner'
      },
      {
        id: 'v-2-3',
        word: 'You got it',
        ipa: '/juː ɡɑːt ɪt/',
        vietnamese: 'Nhất trí, hiểu rồi, làm theo ý bạn ngay',
        contextUsage: 'Nói để xác nhận sẽ đáp ứng một yêu cầu cụ thể một cách nhiệt tình.',
        exampleSentence: '"Can you clean the table, please?" - "You got it, boss!"',
        status: 'New',
        topic: 'Conversation',
        level: 'Beginner'
      }
    ],
    quizzes: [
      {
        id: 'q-2-1',
        question: 'Which establishment is the conversation taking place?',
        options: [
          'Seattle Bookstore',
          'Seattle Roasters Cafe',
          'A grocery shop near Seattle',
          'An airport lounge'
        ],
        correctAnswer: 1,
        explanation: 'The clerk says: "Welcome to Seattle Roasters."'
      },
      {
        id: 'q-2-2',
        question: 'What customization did the customer request for their milk option?',
        options: [
          'Soy milk',
          'Regular whole milk',
          'Oat milk',
          'Almond milk'
        ],
        correctAnswer: 2,
        explanation: 'The customer orders a macchiato "with oat milk please."'
      },
      {
        id: 'q-2-3',
        question: 'How much does the specialty coffee cost?',
        options: [
          '$5.50',
          '$6.50',
          '$6.15',
          '$4.50'
        ],
        correctAnswer: 1,
        explanation: 'The clerk states: "That will be six dollars and fifty cents ($6.50)."'
      }
    ],
    fillBlanks: [
      {
        id: 'f-2-1',
        sentenceWithBlank: 'I would like to order a large caramel macchiato with _______ milk please.',
        blankValue: 'oat',
        clue: 'Kind of vegan milk derived from cereal grains.'
      }
    ],
    sentenceOrdering: [],
    dictations: []
  },
  {
    id: 'lesson-3',
    title: 'An Urgent Business Presentation',
    level: 'Advanced',
    topic: 'Work',
    durationSeconds: 65,
    transcript: 'Team, we need to wrap up our quarterly financial reviews immediately because our chief executive scheduled brief progress pitches. I cannot stress enough how vital it is to articulate our key sales wins and mitigate potential risks about the supply chain disruption. Please collaborate to refine the slideshow before noon so we can avoid rushing at the eleventh hour.',
    vietnameseTranslation: 'Cả nhóm, chúng ta cần hoàn thiện báo cáo tài chính quý ngay lập tức vì tổng giám đốc đã lên lịch cho các buổi thuyết trình tiến độ ngắn gọn. Tôi không thể nhấn mạnh hết tầm quan trọng của việc giải thích rõ ràng các thắng lợi doanh thu then chốt và giảm thiểu các rủi ro tiềm tàng liên quan đến việc đứt gãy chuỗi cung ứng. Hãy hợp tác để tinh chỉnh slide trình chiếu trước buổi trưa nhằm tránh sự vội vã cập rập vào phút chót.',
    createdDate: '2026-05-25',
    status: 'Not Started',
    listenCount: 0,
    rewriteCount: 0,
    sections: [
      {
        id: 'sec-3-1',
        english: 'Team, we need to wrap up our quarterly financial reviews immediately because our chief executive scheduled brief progress pitches.',
        vietnamese: 'Cả nhóm, chúng ta cần hoàn chỉnh báo cáo tài chính theo quý ngay lập tức bởi vì tổng giám đốc điều hành vừa sắp xếp cuộc họp báo cáo nhanh về tiến trình.',
        context: 'Giọng điệu khẩn trương nơi công sở. "Wrap up" có nghĩa là hoàn thành, đóng gói một công việc.',
        vocabulary: [
          { word: 'wrap up', meaning: 'hoàn thành, kết thúc, gói gọn' },
          { word: 'chief executive', meaning: 'giám đốc điều hành, tổng giám đốc' }
        ]
      },
      {
        id: 'sec-3-2',
        english: 'I cannot stress enough how vital it is to articulate our key sales wins and mitigate potential risks about the supply chain disruption.',
        vietnamese: 'Tôi không thể nhấn mạnh hết tầm quan trọng của việc trình bày lưu loát các chiến thắng doanh thu lớn và làm giảm thiểu các rủi ro tiềm tàng từ việc đứt gãy chuỗi cung ứng.',
        context: 'Sử dụng cấp từ vựng cao (advanced) như articulate (phát âm rõ rực, lập luận trôi chảy), mitigate (giảm bớt tác hại), disruption (sự đứt gãy/gián đoạn).',
        vocabulary: [
          { word: 'cannot stress enough', meaning: 'không thể nhấn mạnh thêm nữa (cực kỳ nhấn mạnh)' },
          { word: 'articulate', meaning: 'phát biểu gãy gọn, truyền đạt rõ nghĩa' },
          { word: 'mitigate', meaning: 'giảm nhẹ, xoa dịu, giảm tác hại' },
          { word: 'disruption', meaning: 'sự gián đoạn, sự đứt gãy sụp đổ' }
        ]
      },
      {
        id: 'sec-3-3',
        english: 'Please collaborate to refine the slideshow before noon so we can avoid rushing at the eleventh hour.',
        vietnamese: 'Làm ơn hãy cùng nhau hợp tác rà soát tinh chỉnh lại bài thuyết trình trước buổi trưa để chúng ta tránh phải vắt chân lên cổ chạy vào giờ chót.',
        context: 'Kêu gọi đội nhóm phối hợp gấp. "At the eleventh hour" là một thành ngữ cực kỳ thông dụng thể hiện thời khắc chuẩn bị kết thúc, sát nút.',
        vocabulary: [
          { word: 'refine', meaning: 'gọt giũa tinh xảo, sửa đổi tốt hơn' },
          { word: 'at the eleventh hour', meaning: 'vào phút chót, ngay sát giờ chót' }
        ]
      }
    ],
    vocabularies: [
      {
        id: 'v-3-1',
        word: 'at the eleventh hour',
        ipa: '/æt ðə ɪˈlevənθ ˈaʊər/',
        vietnamese: 'vào giờ chót, cận kề giờ chót, phút áp chót',
        contextUsage: 'Thành ngữ miêu tả việc diễn ra muộn màng, ngay sát thời gian kết thúc hoặc hạn chót cực kỳ gấp rút.',
        exampleSentence: 'The business deal was saved at the eleventh hour by a new wealthy investor.',
        status: 'New',
        topic: 'Work',
        level: 'Advanced'
      },
      {
        id: 'v-3-2',
        word: 'mitigate',
        ipa: '/ˈmɪtɪɡeɪt/',
        vietnamese: 'giảm nhẹ, xoa dịu, hạn chế tối đa thiệt hại',
        contextUsage: 'Hành động làm giảm sự nghiêm trọng, tiêu cực hay mức độ phá hủy của vấn đề rủi ro.',
        exampleSentence: 'We installed double-paned glass windows to mitigate the loud noise from the freeway.',
        status: 'New',
        topic: 'Work',
        level: 'Advanced'
      },
      {
        id: 'v-3-3',
        word: 'articulate',
        ipa: '/ɑːrˈtɪkjuleɪt/',
        vietnamese: 'diễn đạt trôi chảy, lưu loát, rõ ràng mạch lạc',
        contextUsage: 'Khi diễn thuyết, miêu tả một ý tưởng hay hoặc lập luận rất sáng sủa, dễ thuyết phục người khác.',
        exampleSentence: 'She is a highly articulate speaker who can convince large audiences layout out details clearly.',
        status: 'New',
        topic: 'Work',
        level: 'Advanced'
      }
    ],
    quizzes: [
      {
        id: 'q-3-1',
        question: 'Why does the team need to complete the financial reviews immediately?',
        options: [
          'Because the company received a tax audit notice.',
          'Because the chief executive scheduled progress pitches.',
          'Because the project is losing global sales momentum.',
          'Because the offices are closing early for holidays.'
        ],
        correctAnswer: 1,
        explanation: 'The transcript says: "wrap up quarterly financial reviews immediately because our chief executive scheduled brief progress pitches."'
      }
    ],
    fillBlanks: [],
    sentenceOrdering: [],
    dictations: []
  }
];

export const mockDefaultStats = {
  lessonsLearned: 3,
  minutesListened: 142,
  totalRewrites: 18,
  averageScore: 84,
  vocabularyLearned: 19,
  dailyGoalMinutes: 20,
  currentStreak: 5,
  streakDates: ['2026-05-21', '2026-05-22', '2026-05-23', '2026-05-24', '2026-05-25']
};
