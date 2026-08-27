import { EPF_KNOWLEDGE_ARTICLES, type KnowledgeArticle } from "./epf-kb";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "my",
  "me",
  "to",
  "of",
  "and",
  "for",
  "in",
  "on",
  "what",
  "how",
  "where",
  "why",
  "can",
  "i",
  "do",
  "with",
  "this",
  "that",
]);

const TOKEN_SYNONYMS: Record<string, string[]> = {
  pf: ["epf", "provident", "fund"],
  epf: ["pf", "provident", "fund"],
  eps: ["pension"],
  uan: ["universal", "account", "number"],
  kyc: ["verification", "identity", "aadhaar", "pan"],
  claim: ["withdrawal", "settlement", "advance", "form31"],
  transfer: ["job", "employer", "member", "id"],
  interest: ["rate", "credit"],
  ticket: ["grievance", "support", "complaint"],
};

function normalizeToken(token: string) {
  if (token.endsWith("ing") && token.length > 5) {
    return token.slice(0, -3);
  }
  if (token.endsWith("ed") && token.length > 4) {
    return token.slice(0, -2);
  }
  if (token.endsWith("s") && token.length > 3) {
    return token.slice(0, -1);
  }
  return token;
}

export function tokenize(value: string) {
  const tokens = value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .map((token) => normalizeToken(token))
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const synonym of TOKEN_SYNONYMS[token] ?? []) {
      expanded.add(synonym);
    }
  }
  return [...expanded];
}

export function scoreArticle(article: KnowledgeArticle, queryTokens: string[]) {
  const haystack = `${article.title} ${article.tags.join(" ")} ${article.body}`.toLowerCase();
  return queryTokens.reduce((score, token) => {
    if (article.tags.some((tag) => tag.includes(token) || token.includes(tag))) {
      return score + 3;
    }
    if (article.title.toLowerCase().includes(token)) {
      return score + 2;
    }
    if (haystack.includes(token)) {
      return score + 1;
    }
    return score;
  }, 0);
}

export function retrieveKnowledge(query: string, limit = 3): KnowledgeArticle[] {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) {
    return EPF_KNOWLEDGE_ARTICLES.slice(0, limit);
  }

  return [...EPF_KNOWLEDGE_ARTICLES]
    .map((article) => ({ article, score: scoreArticle(article, queryTokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.article);
}
