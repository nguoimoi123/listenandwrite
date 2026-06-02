import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'public', 'word-families');
mkdirSync(outDir, { recursive: true });

const topics = [
  { id: 'daily-life', name: 'Daily Life', vi: 'Sinh hoạt hằng ngày' },
  { id: 'school', name: 'School', vi: 'Trường học' },
  { id: 'work', name: 'Work', vi: 'Công việc' },
  { id: 'travel', name: 'Travel', vi: 'Du lịch' },
  { id: 'health', name: 'Health', vi: 'Sức khỏe' },
  { id: 'technology', name: 'Technology', vi: 'Công nghệ' },
  { id: 'business', name: 'Business', vi: 'Kinh doanh' },
  { id: 'environment', name: 'Environment', vi: 'Môi trường' },
  { id: 'society', name: 'Society', vi: 'Xã hội' },
  { id: 'academic', name: 'Academic', vi: 'Học thuật' }
];

const domainRoots = {
  'daily-life': 'cook clean shop budget commute exercise relax decorate repair organize schedule plan prepare wash iron fold recycle garden host greet socialize message call text browse stream read journal nap snack shower dress tidy vacuum mop polish pack unpack store arrange queue order dine commute rest hydrate stretch meditate babysit pet-sit carpool refill declutter donate bargain compare purchase return exchange subscribe unsubscribe charge recharge maintain assemble install replace fix label sort prioritize multitask celebrate invite visit commute cycle walk drive park navigate save spend borrow lend share cookout picnic renovate furnish dust launder groom moisturize shave brew',
  school: 'study revise memorize quiz test examine grade tutor lecture research outline draft cite submit enroll register attend participate debate present calculate experiment observe measure diagram summarize annotate highlight underline proofread edit translate interpret practice recite spell pronounce discuss collaborate brainstorm classify compare contrast infer predict solve demonstrate formulate evaluate reflect journal question answer schedule major minor graduate specialize intern scholarship counsel discipline monitor supervise accredit remediate mentor coach assess benchmark review revise compile publish exhibit compete rehearse perform survey map chart graph code simulate model prototype archive borrow shelve index catalog photocopy laminate print staple bind',
  work: 'hire recruit onboard train delegate supervise manage lead coordinate schedule report brief present negotiate email message call meet collaborate prioritize troubleshoot document automate optimize review approve reject escalate resolve invoice reimburse budget forecast audit comply file archive benchmark evaluate appraise promote resign transfer relocate outsource contract consult invoice prototype ship deliver maintain repair configure deploy monitor secure analyze strategize streamline standardize mentor coach brief debrief assign track measure target launch plan estimate roadmap sprint iterate test validate interview screen compensate bonus commission license certify insure litigate mediate arbitrate',
  travel: 'book reserve confirm cancel reschedule depart arrive board land transfer check-in check-out navigate explore tour hike camp backpack cruise fly sail drive ride rent refuel park queue pack unpack declare inspect stamp exchange withdraw tip bargain photograph film translate interpret insure vaccinate quarantine migrate immigrate emigrate lodge hostel dine sample sightsee sunbathe snorkel dive surf ski trek climb commute transit detour reroute delay upgrade downgrade reimburse complain recommend review map locate orient wander discover visit cross return depart roam shuttle taxi bus train ferry cruise camp picnic souvenir budget itinerate backpack photograph navigate',
  health: 'diagnose treat heal recover prevent vaccinate screen scan test prescribe medicate hydrate nourish diet exercise stretch strengthen rehabilitate rest sleep breathe monitor measure weigh assess consult refer admit discharge operate anesthetize stitch bandage disinfect sanitize sterilize quarantine isolate infect transmit protect counsel support meditate relax detox supplement digest absorb metabolize circulate respirate cough sneeze bleed bruise swell ache pain cramp fracture sprain strain burn itch inflame immunize donate transfuse transplant biopsy x-ray ultrasound resuscitate triage nurse care bathe feed mobilize vaccinate screen detoxify stabilize cleanse moisturize',
  technology: 'code program compile debug deploy configure install uninstall upgrade patch update automate digitize encrypt decrypt authenticate authorize login logout backup restore sync stream upload download cache render index search query filter sort paginate scrape crawl parse tokenize embed train infer prompt generate simulate model prototype virtualize containerize orchestrate monitor log trace profile optimize refactor test lint bundle minify transpile host route proxy firewall secure scan detect block compress decompress serialize deserialize integrate migrate scale shard replicate clone fork merge commit push pull build release license subscribe meter bill tokenize classify cluster rank recommend',
  business: 'market advertise brand price sell purchase procure invoice bill quote tender negotiate contract partner compete benchmark position differentiate segment target survey pitch launch promote distribute retail wholesale franchise license monetize invest fundraise budget allocate forecast audit account transact insure bank trade export import outsource consult analyze optimize strategize innovate scale expand merge acquire retain convert prospect subscribe renew cancel refund reimburse expense tax comply regulate patent trademark warehouse package ship deliver manufacture prototype onboard train delegate supervise evaluate appraise compensate commission bonus report brief present network upsell cross-sell discount markup profit',
  environment: 'conserve preserve protect restore reforest afforest plant compost recycle reuse reduce repair refill monitor measure sample survey map clean filter purify desalinate irrigate harvest cultivate pollinate biodegrade decompose contaminate pollute emit absorb sequester offset regulate enforce ban conserve educate campaign protest lobby remediate adapt mitigate warm cool flood drought erode sediment drain recharge restore revegetate habitat shelter migrate breed nest graze forage photosynthesize evaporate condense precipitate forecast model assess audit certify conserve insulate weatherize electrify decarbonize compost recycle upcycle landfill incinerate mine drill extract refine spill leak contain clean',
  society: 'vote elect govern legislate regulate protest campaign advocate lobby represent organize volunteer donate support shelter educate employ train house feed include exclude integrate migrate immigrate settle police patrol investigate arrest prosecute defend sentence pardon mediate reconcile negotiate celebrate worship mourn marry divorce adopt parent socialize communicate network publish broadcast report censor debate discriminate tolerate empower marginalize urbanize gentrify relocate survey census register tax subsidize insure assist counsel rehabilitate resettle unionize strike bargain petition reform democratize centralize decentralize mobilize coordinate collaborate commemorate preserve document archive',
  academic: 'research hypothesize theorize analyze synthesize evaluate critique review cite reference paraphrase quote annotate summarize outline draft revise edit proofread publish present defend argue infer deduce induce compare contrast classify categorize define describe explain demonstrate calculate compute model simulate experiment observe measure sample survey interview transcribe code quantify qualify validate replicate reproduce generalize interpret contextualize conceptualize operationalize triangulate correlate regress predict estimate control randomize blind peer-review archive index catalog retrieve synthesize abstract formulate investigate examine explore assess benchmark meta-analyze theorize historicize problematize standardize normalize visualize graph tabulate'
};

const fallbackRoots = {
  'daily-life': 'breakfast lunch dinner commute chore errand laundry grocery meal routine appointment calendar reminder neighborhood household pantry wardrobe recipe leftover delivery takeaway caffeine skincare hairstyle budget coupon receipt',
  school: 'homework classroom textbook notebook worksheet syllabus semester campus library laboratory timetable deadline rubric portfolio seminar thesis thesis-defense enrollment attendance transcript diploma faculty dormitory cafeteria',
  work: 'workflow workplace deadline payroll timesheet coworker stakeholder manager client deliverable milestone meeting agenda minutes memo dashboard backlog ticket incident handover policy procedure',
  travel: 'passport visa baggage luggage customs terminal gate airline runway hotel motel resort landmark museum beach mountain border embassy currency itinerary excursion accommodation reservation',
  health: 'symptom clinic hospital pharmacy dosage tablet capsule therapy pulse heartbeat pressure glucose cholesterol allergy infection injury wellness fitness nutrition immunity emergency ambulance',
  technology: 'server client browser database algorithm interface endpoint repository framework library package dependency runtime latency bandwidth protocol credential dashboard pipeline webhook',
  business: 'revenue margin asset liability equity capital shareholder customer vendor supplier inventory cashflow ledger balance-sheet income-statement receipt purchase-order salesforce pipeline',
  environment: 'climate biodiversity ecosystem watershed wetland forest ocean atmosphere emission carbon methane plastic waste wildlife soil drought wildfire conservation sustainability',
  society: 'community citizen household family neighborhood culture tradition identity inequality poverty welfare justice policy election parliament council mayor resident population',
  academic: 'methodology literature dataset variable framework paradigm epistemology ontology bibliography appendix journal conference discipline faculty dissertation citation plagiarism peer-review'
};

const nounSuffixes = ['tion', 'ment', 'ing', 'ance', 'ence', 'al', 'y', 'ure', 'age', 'ity'];
const adjectiveSuffixes = ['able', 'ive', 'al', 'ed', 'ing', 'ous', 'ary', 'ic', 'ful', 'ant'];

function cleanRoot(root) {
  return root.trim().toLowerCase();
}

function stem(root) {
  if (root.endsWith('e') && root.length > 4) return root.slice(0, -1);
  return root;
}

function nounForm(root, index) {
  const suffix = nounSuffixes[index % nounSuffixes.length];
  const base = stem(root);
  if (suffix === 'ing') return root.endsWith('e') ? `${base}ing` : `${root}ing`;
  if (suffix === 'y') return root.endsWith('e') ? `${base}y` : `${root}y`;
  return `${base}${suffix}`;
}

function adjectiveForm(root, index) {
  const suffix = adjectiveSuffixes[index % adjectiveSuffixes.length];
  const base = stem(root);
  if (suffix === 'ed') return root.endsWith('e') ? `${base}d` : `${root}ed`;
  if (suffix === 'ing') return root.endsWith('e') ? `${base}ing` : `${root}ing`;
  return `${base}${suffix}`;
}

function adverbForm(adjective) {
  if (adjective.endsWith('able')) return `${adjective.slice(0, -1)}y`;
  if (adjective.endsWith('ic')) return `${adjective}ally`;
  if (adjective.endsWith('y')) return `${adjective.slice(0, -1)}ily`;
  return `${adjective}ly`;
}

function uniqueRoots(topicId) {
  const roots = domainRoots[topicId].split(/\s+/).map(cleanRoot).filter(Boolean);
  const fallback = (fallbackRoots[topicId] || '').split(/\s+/).map(cleanRoot).filter(Boolean);
  return Array.from(new Set([...roots, ...fallback])).slice(0, 100);
}

function entryFor(topic, root, index) {
  const noun = nounForm(root, index);
  const adjective = adjectiveForm(root, index);
  const adverb = adverbForm(adjective);

  return {
    id: `${topic.id}-${String(index + 1).padStart(3, '0')}`,
    topic: topic.name,
    topicVi: topic.vi,
    root,
    meaningVi: `nhóm từ "${root}" thường gặp trong chủ đề ${topic.vi}`,
    forms: {
      noun,
      adjective,
      verb: root,
      adverb
    },
    recognition: {
      noun: `Danh từ thường đứng sau a/an/the, sau tính từ, hoặc làm chủ ngữ/tân ngữ; ở nhóm này chú ý dạng "${noun}".`,
      adjective: `Tính từ thường đứng trước danh từ hoặc sau be/seem/feel; ở nhóm này chú ý dạng "${adjective}".`,
      verb: `Động từ thường đi sau chủ ngữ, sau to hoặc modal verbs; ở nhóm này chú ý động từ "${root}".`,
      adverb: `Trạng từ thường bổ nghĩa cho động từ/tính từ/cả câu; ở nhóm này chú ý dạng "${adverb}".`
    },
    examples: {
      noun: `The ${noun} is important in ${topic.name.toLowerCase()}.`,
      adjective: `This is a ${adjective} case in ${topic.name.toLowerCase()}.`,
      verb: `People often ${root} when working with ${topic.name.toLowerCase()} topics.`,
      adverb: `The speaker explained it ${adverb} in a ${topic.name.toLowerCase()} context.`
    }
  };
}

for (const topic of topics) {
  const roots = uniqueRoots(topic.id);
  if (roots.length !== 100) {
    throw new Error(`${topic.id} has ${roots.length} unique roots, expected 100`);
  }

  const entries = roots.map((root, index) => entryFor(topic, root, index));
  writeFileSync(join(outDir, `${topic.id}.json`), JSON.stringify(entries, null, 2), 'utf8');
}

writeFileSync(
  join(outDir, 'index.json'),
  JSON.stringify(topics.map((topic) => ({ ...topic, file: `/word-families/${topic.id}.json`, count: 100 })), null, 2),
  'utf8'
);
