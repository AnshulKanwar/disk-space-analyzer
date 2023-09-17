import { Action, ActionPanel, List } from "@raycast/api";
import * as path from "path"
import { useEffect, useState } from "react";
import { readdir, stat } from "fs/promises"

async function getSize(filePath: string): Promise<number> {
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

interface File {
  name: string;
  size: number;
}

export function Directory({ filePath }: { filePath: string }) {
  const [files, setFiles] = useState<File[]>([]);

  // TODO: use `useCallback()`
  const readDirectories = async () => {
    const fileNames = await readdir(filePath);

    fileNames.forEach(async (fileName) => {
      const size = await getSize(path.join(filePath, fileName));
      setFiles((prev) => [...prev, { name: fileName, size }]);
    });
  };

  useEffect(() => {
    readDirectories();
  }, []);

  return (
    <List>
      {files?.map(({ name, size }) => (
        <List.Item
          key={name}
          title={name}
          actions={
            <ActionPanel>
              <Action.Push title="Open" target={<Directory filePath={path.join(filePath, name)}/>} />
            </ActionPanel>
          }
          accessories={[{ text: `${size.toFixed(2)} MB` }]}
        />
      ))}
    </List>
  );
}
