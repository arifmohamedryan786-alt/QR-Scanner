import { ScanHistoryItem } from "@/types";

const HISTORY_KEY = "qr_studio_history_v1";
const TAB_KEY = "qr_studio_active_tab_v1";
const THEME_KEY = "qr_studio_theme_v1";
const MAX_HISTORY = 10;

export function getStoredTab(): "scan" | "generate" {
  if (typeof window === "undefined") return "scan";
  try {
    const val = localStorage.getItem(TAB_KEY);
    if (val === "scan" || val === "generate") {
      return val;
    }
  } catch (e) {
    console.warn("Could not read stored tab from localStorage", e);
  }
  return "scan";
}

export function setStoredTab(tab: "scan" | "generate"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TAB_KEY, tab);
  } catch (e) {
    console.warn("Could not save tab to localStorage", e);
  }
}

export function getStoredHistory(): ScanHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_HISTORY);
    }
  } catch (e) {
    console.warn("Could not read scan history from localStorage", e);
  }
  return [];
}

export function addStoredHistoryItem(item: Omit<ScanHistoryItem, "id" | "timestamp">): ScanHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredHistory();
    // Don't duplicate consecutive identical scans
    if (current.length > 0 && current[0].text === item.text) {
      return current;
    }
    const newItem: ScanHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...current.filter((i) => i.text !== item.text)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Could not add history item to localStorage", e);
    return [];
  }
}

export function removeStoredHistoryItem(id: string): ScanHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Could not remove history item from localStorage", e);
    return [];
  }
}

export function clearStoredHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.warn("Could not clear scan history from localStorage", e);
  }
}

export type Theme = "light" | "dark" | "system";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const val = localStorage.getItem(THEME_KEY);
    if (val === "light" || val === "dark" || val === "system") {
      return val;
    }
  } catch (e) {
    console.warn("Could not read theme from localStorage", e);
  }
  return "system";
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.warn("Could not save theme to localStorage", e);
  }
}

