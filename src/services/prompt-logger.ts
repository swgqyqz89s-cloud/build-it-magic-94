// This module logs each prompt into a local file inside the project.
// IMPORTANT: This only works in dev mode with Vite (Node environment).

import { writeFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const LOG_FILE = "./prompt-log.txt";

export async function logPrompt(prompt: string) {
  try {
    const header =
      "\n\n================= NEW PROMPT =================\n" +
      new Date().toISOString() +
      "\n===============================================\n\n";

    if (!existsSync(LOG_FILE)) {
      await writeFile(LOG_FILE, header + prompt, "utf8");
    } else {
      await appendFile(LOG_FILE, header + prompt, "utf8");
    }

  } catch (err) {
    console.warn("❗ Prompt konnte nicht in Logdatei geschrieben werden:", err);
  }
}
