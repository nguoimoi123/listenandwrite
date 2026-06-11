import fs from 'node:fs';

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/import-toeic-vocabulary.mjs <input-tsv> <output-ts>');
  process.exit(1);
}

const source = fs.readFileSync(inputPath, 'utf8')
  .replace(/\r\n/g, '\n')
  .replace(/\r/g, '\n');

function parseTsv(input) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (ch === '"') {
      if (inQuotes && input[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === '\t' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' && !inQuotes) {
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  return rows;
}

function normalize(value) {
  return (value || '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function getPartOfSpeech(rawWord) {
  const match = rawWord.match(/\(([^)]+)\)\s*$/);
  return match ? match[1].trim() : '';
}

function getCleanWord(rawWord) {
  return normalize(rawWord)
    .replace(/\s*\((?:N|V|Adj|Adv|Phrase|N\/V|V\/N|N\/Adj|Adj\/N|V\/Adj|N,?\s*V|V,?\s*N)[^)]*\)\s*$/i, '')
    .trim();
}

function extractMeaning(notes) {
  const cleaned = normalize(notes);
  if (!cleaned) return '';

  const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean);
  const meaningLines = [];

  for (const line of lines) {
    if (/^(Synonyms|Collocation\/Prep|Notes|Source):/i.test(line)) break;
    meaningLines.push(line.replace(/^Nghĩa:\s*/i, '').trim());
  }

  return meaningLines.join('\n').trim() || cleaned.replace(/^Nghĩa:\s*/i, '').trim();
}

const rows = parseTsv(source).slice(1);
const seen = new Set();
const vocabulary = [];

for (const row of rows) {
  const [rawWord = '', definition = '', example1 = '', example2 = '', phonetic = '', notes = ''] = row;
  const word = getCleanWord(rawWord);

  if (!word) continue;

  const key = word.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);

  const partOfSpeech = getPartOfSpeech(rawWord);
  const tags = ['TOEIC 800+'];
  if (partOfSpeech) tags.push(partOfSpeech);
  if (/phrase/i.test(partOfSpeech) || /\s/.test(word)) tags.push('Phrase');

  vocabulary.push({
    id: `toeic-800-${String(vocabulary.length + 1).padStart(3, '0')}`,
    word,
    phonetic: normalize(phonetic),
    definition: normalize(definition),
    translate: extractMeaning(notes),
    example: normalize(example1),
    exampleTranslate: normalize(example2),
    category: 'TOEIC 800+',
    box: 1,
    tags: Array.from(new Set(tags))
  });
}

const output = `import type { VocabularyWord } from '../App';\n\nexport const TOEIC_VOCABULARY_VERSION = 'toeic-800-2026-06-11';\n\nexport const toeicVocabulary: VocabularyWord[] = ${JSON.stringify(vocabulary, null, 2)};\n`;

fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Wrote ${vocabulary.length} TOEIC vocabulary words to ${outputPath}`);
