export interface DiffToken {
  text: string;
  type: 'correct' | 'missing' | 'extra';
  studentText?: string;
}

/**
 * Normalizes a word string for high-accuracy phonetic dictionary comparison
 * by removing major punctuation marks and turning it lowercase.
 */
function normalizeForComparison(w: string): string {
  if (!w) return '';
  return w
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, "")
    .trim();
}

/**
 * Computes word-by-word diff alignment using Longest Common Subsequence (LCS) dynamic programming.
 */
export function computeWordDiff(correctText: string, studentText: string): DiffToken[] {
  const correctWords = correctText.trim().split(/\s+/).filter(Boolean);
  const studentWords = studentText.trim().split(/\s+/).filter(Boolean);

  const n = correctWords.length;
  const m = studentWords.length;

  // Initialize DP table
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (normalizeForComparison(correctWords[i - 1]) === normalizeForComparison(studentWords[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to assemble correct alignment tokens
  const diffs: DiffToken[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalizeForComparison(correctWords[i - 1]) === normalizeForComparison(studentWords[j - 1])) {
      diffs.unshift({
        text: correctWords[i - 1],
        type: 'correct',
        studentText: studentWords[j - 1]
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Extra word written by student
      diffs.unshift({
        text: studentWords[j - 1],
        type: 'extra',
        studentText: studentWords[j - 1]
      });
      j--;
    } else {
      // Word missing in student's transcription
      diffs.unshift({
        text: correctWords[i - 1],
        type: 'missing'
      });
      i--;
    }
  }

  return diffs;
}

/**
 * Calculates raw similarity accuracy percentage (0 - 100)
 */
export function calculateAccuracy(correctText: string, studentText: string): number {
  const correctWords = correctText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, "").split(/\s+/).filter(Boolean);
  const studentWords = studentText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, "").split(/\s+/).filter(Boolean);
  
  if (correctWords.length === 0) return studentWords.length === 0 ? 100 : 0;
  
  // Use LCS number of matching entries
  const n = correctWords.length;
  const m = studentWords.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (correctWords[i - 1] === studentWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const matchesCount = dp[n][m];
  
  // Accuracy = matches / maxLength * 100 or weighted score
  const accuracy = Math.round((matchesCount / n) * 100);
  return Math.min(100, Math.max(0, accuracy));
}
