import "server-only";

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { parseExamPackage } from "@/lib/exams/package-parser";

const DATA_DIRECTORY = path.join(process.cwd(), "data");

export function resolvePackagePath(fileName: string) {
  if (
    path.basename(fileName) !== fileName ||
    !fileName.toLowerCase().endsWith(".zip")
  ) {
    throw new Error("Tên gói ZIP không hợp lệ.");
  }
  return path.join(DATA_DIRECTORY, fileName);
}

export async function listExamPackages() {
  const fileNames = (await readdir(DATA_DIRECTORY))
    .filter((fileName) => fileName.toLowerCase().endsWith(".zip"))
    .sort((a, b) => a.localeCompare(b));

  return Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = resolvePackagePath(fileName);
      const [fileStat, examPackage] = await Promise.all([
        stat(filePath),
        Promise.resolve().then(() => parseExamPackage(filePath)),
      ]);
      return {
        fileName,
        sizeBytes: fileStat.size,
        modifiedAt: fileStat.mtime.toISOString(),
        packageId: examPackage.packageId,
        title: examPackage.title,
        competition: examPackage.competition,
        round: examPackage.round,
        schoolYear: examPackage.schoolYear,
        languages: examPackage.languages,
        questionCount: examPackage.questionCount,
        maxScore: examPackage.maxScore,
        assetCount: examPackage.assets.length,
        valid: true,
      };
    }),
  );
}
