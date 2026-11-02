#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const WATCH_DIRS = ["src", "public"];
const DEBOUNCE_MS = 20000; // 20 seconds

let debounceTimer = null;
let pendingChanges = new Set();

function log(msg) {
  const time = new Date().toLocaleTimeString();
  console.log(`[autopush ${time}] ${msg}`);
}

function runGitAutoPush() {
  debounceTimer = null;
  pendingChanges.clear();

  try {
    // Check if there are any changes (staged, unstaged, or untracked)
    const status = execSync("git status --porcelain", {
      cwd: rootDir,
      encoding: "utf8",
    }).trim();

    if (!status) {
      log("No git changes detected to commit. Skipping.");
      return;
    }

    log("Detected changes, staging and committing...");
    execSync("git add -A", { cwd: rootDir, stdio: "inherit" });

    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    const commitMsg = `auto: save changes ${timestamp}`;

    execSync(`git commit -m "${commitMsg}"`, { cwd: rootDir, stdio: "inherit" });
    log(`Committed: "${commitMsg}"`);

    log("Pushing to origin main...");
    execSync("git push origin main", { cwd: rootDir, stdio: "inherit" });
    log("Successfully pushed changes to origin main!");
  } catch (err) {
    console.error(`[autopush] Error during auto-commit/push:`, err.message);
  }
}

function handleChange(eventType, filename, dir) {
  if (!filename) return;
  // Ignore temporary files or editor files
  if (filename.includes(".DS_Store") || filename.endsWith("~") || filename.startsWith(".")) {
    return;
  }

  const relPath = path.join(dir, filename);
  pendingChanges.add(relPath);

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  log(`Change detected in ${relPath} (${eventType}). Scheduling push in 20s...`);
  debounceTimer = setTimeout(runGitAutoPush, DEBOUNCE_MS);
}

log("Starting autopush watcher...");
for (const dirName of WATCH_DIRS) {
  const dirPath = path.join(rootDir, dirName);
  if (fs.existsSync(dirPath)) {
    try {
      fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
        handleChange(eventType, filename, dirName);
      });
      log(`Watching directory: ${dirName}/`);
    } catch (e) {
      console.warn(`Could not watch ${dirName} recursively:`, e.message);
    }
  } else {
    log(`Directory not found (skipped): ${dirName}/`);
  }
}

log("Watcher is active. Changes in src/ and public/ will auto-push 20s after the last edit.");
