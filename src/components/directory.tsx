import { Action, ActionPanel, Icon, List } from "@raycast/api";
import * as path from "path";
import { useEffect, useState } from "react";
import { readdir, stat } from "fs/promises";
import { getSize } from "../utils";
import { File } from "../types";

export function Directory({ filePath }: { filePath: string }) {
  const [files, setFiles] = useState<File[]>([]);

  // TODO: use `useCallback()`
  const readDirectories = async () => {
    const fileNames = await readdir(filePath);

    fileNames.forEach(async (fileName) => {
      const size = await getSize(path.join(filePath, fileName));
      const isDirectory = await (await stat(path.join(filePath, fileName))).isDirectory();
      setFiles((prev) => [...prev, { name: fileName, size, isDirectory }]);
    });
  };

  useEffect(() => {
    readDirectories();
  }, []);

  return (
    <List>
      {files?.map((file) => (
        <List.Item
          key={file.name}
          title={file.name}
          icon={file.isDirectory ? Icon.Folder : undefined}
          actions={
            <ActionPanel>
              {file.isDirectory && (
                <Action.Push title="Open" target={<Directory filePath={path.join(filePath, file.name)} />} />
              )}
              {/* TODO: Remove item from list when deleted */}
              <Action.Trash paths={path.join(filePath, file.name)} />
            </ActionPanel>
          }
          accessories={[{ text: `${file.size.toFixed(2)} MB` }]}
        />
      ))}
    </List>
  );
}
