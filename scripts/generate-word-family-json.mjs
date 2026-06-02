import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'public', 'word-families');
mkdirSync(outDir, { recursive: true });

const topics = [
  ['daily-life', 'Daily Life', 'Sinh hoạt hằng ngày'],
  ['school', 'School', 'Trường học'],
  ['work', 'Work', 'Công việc'],
  ['travel', 'Travel', 'Du lịch'],
  ['health', 'Health', 'Sức khỏe'],
  ['technology', 'Technology', 'Công nghệ'],
  ['business', 'Business', 'Kinh doanh'],
  ['environment', 'Environment', 'Môi trường'],
  ['society', 'Society', 'Xã hội'],
  ['academic', 'Academic', 'Học thuật']
];

const families = `
act|action|active|act|actively|hành động
adapt|adaptation|adaptable|adapt|adaptably|thích nghi
adjust|adjustment|adjustable|adjust|adjustably|điều chỉnh
admire|admiration|admirable|admire|admirably|ngưỡng mộ
advise|advice|advisable|advise|advisably|khuyên
analyze|analysis|analytical|analyze|analytically|phân tích
apply|application|applicable|apply|applicably|áp dụng
arrange|arrangement|arranged|arrange|arrangedly|sắp xếp
assess|assessment|assessable|assess|assessably|đánh giá
assist|assistance|assistant|assist|assistively|hỗ trợ
attend|attendance|attentive|attend|attentively|chú ý/tham dự
benefit|benefit|beneficial|benefit|beneficially|có lợi
calculate|calculation|calculable|calculate|calculably|tính toán
care|care|careful|care|carefully|cẩn thận
change|change|changeable|change|changeably|thay đổi
communicate|communication|communicative|communicate|communicatively|giao tiếp
compare|comparison|comparative|compare|comparatively|so sánh
compete|competition|competitive|compete|competitively|cạnh tranh
complete|completion|complete|complete|completely|hoàn thành
concentrate|concentration|concentrated|concentrate|concentratedly|tập trung
connect|connection|connected|connect|connectedly|kết nối
consider|consideration|considerate|consider|considerately|cân nhắc
create|creation|creative|create|creatively|sáng tạo
decide|decision|decisive|decide|decisively|quyết định
define|definition|definite|define|definitely|định nghĩa
deliver|delivery|deliverable|deliver|deliverably|giao/nộp
depend|dependence|dependent|depend|dependently|phụ thuộc
describe|description|descriptive|describe|descriptively|mô tả
design|design|designed|design|designedly|thiết kế
develop|development|developed|develop|developmentally|phát triển
differ|difference|different|differ|differently|khác nhau
discuss|discussion|discussable|discuss|discussably|thảo luận
educate|education|educational|educate|educationally|giáo dục
effect|effect|effective|effect|effectively|tác động
emphasize|emphasis|emphatic|emphasize|emphatically|nhấn mạnh
encourage|encouragement|encouraging|encourage|encouragingly|khuyến khích
enjoy|enjoyment|enjoyable|enjoy|enjoyably|thưởng thức
evaluate|evaluation|evaluative|evaluate|evaluatively|đánh giá
explain|explanation|explanatory|explain|explanatorily|giải thích
explore|exploration|exploratory|explore|exploratorily|khám phá
express|expression|expressive|express|expressively|diễn đạt
fail|failure|failed|fail|failingly|thất bại
focus|focus|focused|focus|focusedly|tập trung
grow|growth|growing|grow|growingly|tăng trưởng
help|help|helpful|help|helpfully|giúp đỡ
identify|identification|identifiable|identify|identifiably|nhận diện
imagine|imagination|imaginative|imagine|imaginatively|tưởng tượng
improve|improvement|improved|improve|improvingly|cải thiện
include|inclusion|inclusive|include|inclusively|bao gồm
inform|information|informative|inform|informatively|cung cấp thông tin
innovate|innovation|innovative|innovate|innovatively|đổi mới
instruct|instruction|instructive|instruct|instructively|hướng dẫn
interact|interaction|interactive|interact|interactively|tương tác
interpret|interpretation|interpretive|interpret|interpretively|diễn giải
learn|learning|learned|learn|learnedly|học
manage|management|manageable|manage|manageably|quản lý
measure|measurement|measurable|measure|measurably|đo lường
motivate|motivation|motivated|motivate|motivationally|tạo động lực
move|movement|movable|move|movably|di chuyển
observe|observation|observant|observe|observantly|quan sát
organize|organization|organized|organize|organizationally|tổ chức
participate|participation|participatory|participate|participatively|tham gia
perform|performance|performative|perform|performatively|thực hiện
persuade|persuasion|persuasive|persuade|persuasively|thuyết phục
plan|plan|planned|plan|plannedly|lập kế hoạch
predict|prediction|predictable|predict|predictably|dự đoán
prepare|preparation|prepared|prepare|preparedly|chuẩn bị
present|presentation|presentable|present|presentably|trình bày
prevent|prevention|preventive|prevent|preventively|ngăn chặn
produce|production|productive|produce|productively|sản xuất
protect|protection|protective|protect|protectively|bảo vệ
question|question|questionable|question|questionably|đặt câu hỏi
react|reaction|reactive|react|reactively|phản ứng
recognize|recognition|recognizable|recognize|recognizably|nhận ra
recommend|recommendation|recommendable|recommend|recommendably|đề xuất
reduce|reduction|reduced|reduce|reductively|giảm
reflect|reflection|reflective|reflect|reflectively|suy ngẫm
relate|relation|related|relate|relatedly|liên hệ
remember|memory|memorable|remember|memorably|ghi nhớ
repair|repair|repairable|repair|repairably|sửa chữa
research|research|researchable|research|researchably|nghiên cứu
respond|response|responsive|respond|responsively|phản hồi
revise|revision|revised|revise|revisedly|ôn/sửa lại
select|selection|selective|select|selectively|lựa chọn
solve|solution|solvable|solve|solvably|giải quyết
specialize|specialization|specialized|specialize|specially|chuyên môn hóa
strengthen|strength|strong|strengthen|strongly|tăng cường
study|study|studious|study|studiously|học tập
succeed|success|successful|succeed|successfully|thành công
support|support|supportive|support|supportively|hỗ trợ
teach|teaching|teachable|teach|teachably|dạy
transform|transformation|transformative|transform|transformatively|biến đổi
translate|translation|translatable|translate|translatably|dịch
understand|understanding|understandable|understand|understandably|hiểu
use|use|useful|use|usefully|sử dụng
vary|variation|variable|vary|variably|biến đổi
visualize|visualization|visual|visualize|visually|hình dung
write|writing|written|write|writerly|viết
listen|listening|listenable|listen|listeningly|lắng nghe
practice|practice|practical|practice|practically|luyện tập
`.trim().split('\n').map((line) => {
  const [root, noun, adjective, verb, adverb, meaning] = line.split('|');
  return { root, noun, adjective, verb, adverb, meaning };
});

const suffixOf = (word) => {
  const match = word.match(/(tion|sion|ment|ness|ity|ance|ence|ing|able|ible|ive|al|ous|ful|less|ed|ly|ize|ise|ate|fy)$/);
  return match ? `-${match[1]}` : 'nhìn vị trí trong câu';
};

for (const [topicId, topicName, topicVi] of topics) {
  const entries = families.map((item, index) => ({
    id: `${topicId}-${String(index + 1).padStart(3, '0')}`,
    topic: topicName,
    topicVi,
    root: item.root,
    meaningVi: item.meaning,
    forms: {
      noun: item.noun,
      adjective: item.adjective,
      verb: item.verb,
      adverb: item.adverb
    },
    recognition: {
      noun: `Danh từ thường đứng sau a/an/the, sau tính từ, hoặc có đuôi ${suffixOf(item.noun)}.`,
      adjective: `Tính từ thường đứng trước danh từ hoặc sau be/seem/feel, hay có đuôi ${suffixOf(item.adjective)}.`,
      verb: `Động từ thường đi sau chủ ngữ hoặc sau to/modal verbs, có thể nhận biết qua dạng hành động "${item.verb}".`,
      adverb: `Trạng từ thường bổ nghĩa cho động từ/tính từ/câu, thường có đuôi ${suffixOf(item.adverb)}.`
    },
    examples: {
      noun: `The ${item.noun} is important in ${topicName.toLowerCase()}.`,
      adjective: `This is a ${item.adjective} example for ${topicName.toLowerCase()}.`,
      verb: `Learners can ${item.verb} this idea in ${topicName.toLowerCase()}.`,
      adverb: `Use it ${item.adverb} when talking about ${topicName.toLowerCase()}.`
    }
  }));

  writeFileSync(join(outDir, `${topicId}.json`), JSON.stringify(entries, null, 2), 'utf8');
}

writeFileSync(
  join(outDir, 'index.json'),
  JSON.stringify(topics.map(([id, name, vi]) => ({ id, name, vi, file: `/word-families/${id}.json`, count: families.length })), null, 2),
  'utf8'
);
