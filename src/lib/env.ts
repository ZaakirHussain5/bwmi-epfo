import fs from "node:fs";
import path from "node:path";

export interface AssistantEnv {
  apiKey: string;
  model: string;
  transcribeModel: string;
  ttsModel: string;
  ttsVoice: string;
  openaiConfigured: boolean;
}

function parseEnvLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex < 1) {
    return null;
  }
  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function readEnvFromFiles(key: string): string {
  const cwd = process.cwd();
  const envPaths = [path.join(cwd, ".env.local"), path.join(cwd, ".env")];

  for (const filePath of envPaths) {
    try {
      if (!fs.existsSync(/* turbopackIgnore: true */ filePath)) {
        continue;
      }
      const content = fs.readFileSync(/* turbopackIgnore: true */ filePath, "utf8");
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const parsed = parseEnvLine(line);
        if (parsed?.key === key) {
          return parsed.value.trim();
        }
      }
    } catch {
      // ignore parse/read errors and continue to other files
    }
  }

  return "";
}

function readEnvValue(key: string, fallback: string): string {
  const runtimeValue = process.env[key]?.trim() ?? "";
  if (runtimeValue) {
    return runtimeValue;
  }
  const fileValue = readEnvFromFiles(key);
  return fileValue || fallback;
}

export function getAssistantEnv(): AssistantEnv {
  const apiKey = readEnvValue("OPENAI_API_KEY", "");

  return {
    apiKey,
    model: readEnvValue("OPENAI_MODEL", "gpt-5.6"),
    transcribeModel: readEnvValue("OPENAI_TRANSCRIBE_MODEL", "whisper-1"),
    ttsModel: readEnvValue("OPENAI_TTS_MODEL", "gpt-4o-mini-tts"),
    ttsVoice: readEnvValue("OPENAI_TTS_VOICE", "alloy"),
    openaiConfigured: Boolean(apiKey),
  };
}
