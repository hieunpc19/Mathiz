import "server-only";

import { createHash } from "node:crypto";
import AdmZip from "adm-zip";

export type ParsedQuestion = {
  code: string;
  category: string;
  points: number;
  answer: string;
  sourcePage: number | null;
  bodyMd: string;
  options: Array<{ id: string; label: string; text: string }>;
  assetNames: string[];
};

export type ParsedExamPackage = {
  packageId: string;
  title: string;
  competition: string;
  round: string | null;
  schoolYear: string | null;
  languages: string[];
  rightsNote: string | null;
  questionCount: number;
  maxScore: number;
  sourceFileName: string | null;
  sourceHash: string;
  rawMarkdown: string;
  questions: ParsedQuestion[];
  assets: Array<{ name: string; data: Buffer; mimeType: string; sha256: string }>;
};

function scalar(frontmatter: string, key: string) {
  const match = frontmatter.match(
    new RegExp(`^${key}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\n#]+))`, "m"),
  );
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim() || null;
}

function stringArray(frontmatter: string, key: string) {
  const raw = scalar(frontmatter, key);
  if (!raw?.startsWith("[") || !raw.endsWith("]")) return [];
  return raw
    .slice(1, -1)
    .split(",")
    .map((value) => value.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

function questionAttribute(attributes: string, key: string) {
  return attributes.match(new RegExp(`${key}="([^"]+)"`))?.[1] ?? null;
}

function assetReferences(markdown: string) {
  return Array.from(markdown.matchAll(/\]\(assets\/([^)]+)\)/g), (match) =>
    match[1].replace(/\\/g, "/"),
  );
}

function parseQuestions(markdown: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const matcher = /:::question\{([^}]+)\}\s*([\s\S]*?)\s*:::choices\s*([\s\S]*?)\s*:::\s*:::/g;

  for (const match of markdown.matchAll(matcher)) {
    const attributes = match[1];
    const bodyMd = match[2].trim();
    const choices = match[3].trim();
    const code = questionAttribute(attributes, "id");
    const answer = questionAttribute(attributes, "answer");
    const points = Number(questionAttribute(attributes, "points"));

    if (!code || !answer || !Number.isFinite(points)) {
      throw new Error("Khối câu hỏi thiếu id, answer hoặc points hợp lệ.");
    }

    const options = Array.from(
      choices.matchAll(/^\s*-\s*([A-D])\.\s+(.+)$/gm),
      (choice) => ({ id: choice[1], label: choice[1], text: choice[2].trim() }),
    );

    if (options.length !== 4) {
      throw new Error(`${code}: cần đúng bốn lựa chọn A-D.`);
    }

    const combinedMarkdown = `${bodyMd}\n${options.map((option) => option.text).join("\n")}`;
    questions.push({
      code,
      category: questionAttribute(attributes, "category") ?? "other",
      points,
      answer,
      sourcePage: Number(questionAttribute(attributes, "source_page")) || null,
      bodyMd,
      options,
      assetNames: [...new Set(assetReferences(combinedMarkdown))],
    });
  }

  return questions;
}

function mimeType(name: string) {
  if (name.toLowerCase().endsWith(".png")) return "image/png";
  if (/\.jpe?g$/i.test(name)) return "image/jpeg";
  if (name.toLowerCase().endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

export function parseExamPackage(zipPath: string): ParsedExamPackage {
  const archiveData = new AdmZip(zipPath).toBuffer();
  const zip = new AdmZip(archiveData);
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory);
  const manifestEntry = entries.find((entry) => entry.entryName.endsWith("/manifest.json"));

  if (!manifestEntry) throw new Error("ZIP không có manifest.json.");
  const manifest = JSON.parse(manifestEntry.getData().toString("utf8")) as {
    schemaVersion?: string;
    packageId?: string;
    entry?: string;
    assetDirectory?: string;
    source?: { fileName?: string };
  };

  if (manifest.schemaVersion !== "1.0" || !manifest.packageId || !manifest.entry) {
    throw new Error("Manifest không hợp lệ hoặc schema chưa được hỗ trợ.");
  }

  const root = manifestEntry.entryName.slice(0, -"manifest.json".length);
  const markdownEntry = zip.getEntry(`${root}${manifest.entry}`);
  if (!markdownEntry) throw new Error(`Không tìm thấy ${manifest.entry}.`);

  const rawMarkdown = markdownEntry.getData().toString("utf8");
  const frontmatterMatch = rawMarkdown.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) throw new Error("exam.md không có YAML frontmatter.");
  const frontmatter = frontmatterMatch[1];
  const questions = parseQuestions(rawMarkdown);
  const expectedCount = Number(scalar(frontmatter, "question_count"));

  if (!questions.length || questions.length !== expectedCount) {
    throw new Error(`Số câu parse được (${questions.length}) khác khai báo (${expectedCount}).`);
  }

  const declaredAssets = new Set(questions.flatMap((question) => question.assetNames));
  const assetRoot = `${root}${manifest.assetDirectory ?? "assets"}/`;
  const assets = entries
    .filter((entry) => entry.entryName.startsWith(assetRoot))
    .map((entry) => {
      const name = entry.entryName.slice(assetRoot.length);
      const data = entry.getData();
      return {
        name,
        data,
        mimeType: mimeType(name),
        sha256: createHash("sha256").update(data).digest("hex"),
      };
    });

  const availableAssets = new Set(assets.map((asset) => asset.name));
  for (const name of declaredAssets) {
    if (!availableAssets.has(name)) throw new Error(`Thiếu asset: ${name}.`);
  }

  const maxScore = questions.reduce((sum, question) => sum + question.points, 0);
  return {
    packageId: manifest.packageId,
    title: scalar(frontmatter, "title") ?? manifest.packageId,
    competition: scalar(frontmatter, "competition") ?? "TIMO",
    round: scalar(frontmatter, "round"),
    schoolYear: scalar(frontmatter, "school_year"),
    languages: stringArray(frontmatter, "languages"),
    rightsNote: scalar(frontmatter, "rights_note"),
    questionCount: questions.length,
    maxScore,
    sourceFileName: manifest.source?.fileName ?? null,
    sourceHash: createHash("sha256").update(archiveData).digest("hex"),
    rawMarkdown,
    questions,
    assets,
  };
}
