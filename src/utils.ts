import { readdir, stat } from "fs/promises";
import * as path from "path"

export async function getSize(filePath: string): Promise<number> {
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      return stats.size / (1024 * 1024);
    }

    let totalSize = 0;

    const files: string[] = await readdir(filePath);

    for (const file of files) {
      const fileFullPath = path.join(filePath, file);

      if ((await stat(fileFullPath)).isDirectory()) {
        totalSize += await getSize(fileFullPath);
      } else {
        totalSize += (await stat(fileFullPath)).size;
      }
    }

    return totalSize / (1024 * 1024);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}