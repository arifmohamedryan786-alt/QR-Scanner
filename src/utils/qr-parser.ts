import {
  QrParseResult,
  ParsedWifi,
  ParsedEmail,
  ParsedPhone,
  WifiFormData,
  EmailFormData,
} from "@/types";

/**
 * Escapes characters for standard WiFi QR code format
 */
function escapeWifiField(str: string): string {
  return str.replace(/([\\;,:"])/g, "\\$1");
}

/**
 * Unescapes characters from WiFi QR code format
 */
function unescapeWifiField(str: string): string {
  return str.replace(/\\([\\;,:"])/g, "$1");
}

/**
 * Parses a standard WIFI: string
 * Example: WIFI:T:WPA;S:MyNetwork;P:Secret123;H:false;;
 */
export function parseWifiString(data: string): ParsedWifi | null {
  if (!data.startsWith("WIFI:") && !data.startsWith("wifi:")) {
    return null;
  }

  const content = data.slice(5);
  const result: ParsedWifi = { ssid: "" };

  // Match key-value pairs like T:WPA; or S:MyNetwork;
  // Accounts for escaped characters like \; or \\
  const regex = /([STPHB]):((?:\\;|[^;])*);/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    const val = unescapeWifiField(match[2]);

    switch (key) {
      case "S":
        result.ssid = val;
        break;
      case "P":
        result.password = val;
        break;
      case "T":
        result.encryption = val.toUpperCase() as "WPA" | "WEP" | "nopass";
        break;
      case "H":
        result.hidden = val.toLowerCase() === "true";
        break;
    }
  }

  if (!result.ssid) {
    return null;
  }

  return result;
}

/**
 * Parses mailto: or MATMSG: format
 */
export function parseEmailString(data: string): ParsedEmail | null {
  // mailto: format
  if (data.toLowerCase().startsWith("mailto:")) {
    const urlStr = data;
    try {
      const url = new URL(urlStr);
      const to = url.pathname || "";
      const subject = url.searchParams.get("subject") || undefined;
      const body = url.searchParams.get("body") || undefined;
      return { to, subject, body };
    } catch {
      // Fallback simple parsing
      const parts = data.slice(7).split("?");
      const to = parts[0];
      const params = new URLSearchParams(parts[1] || "");
      return {
        to,
        subject: params.get("subject") || undefined,
        body: params.get("body") || undefined,
      };
    }
  }

  // MATMSG format: MATMSG:TO:user@example.com;SUB:Hello;BODY:World;;
  if (data.startsWith("MATMSG:")) {
    const toMatch = data.match(/TO:([^;]+);/i);
    const subMatch = data.match(/SUB:([^;]*);/i);
    const bodyMatch = data.match(/BODY:([^;]*);;/i) || data.match(/BODY:([^;]*);/i);

    if (toMatch && toMatch[1]) {
      return {
        to: toMatch[1],
        subject: subMatch ? subMatch[1] : undefined,
        body: bodyMatch ? bodyMatch[1] : undefined,
      };
    }
  }

  // Raw email pattern
  const rawEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (rawEmailRegex.test(data.trim())) {
    return { to: data.trim() };
  }

  return null;
}

/**
 * Parses tel: or phone number
 */
export function parsePhoneString(data: string): ParsedPhone | null {
  if (data.toLowerCase().startsWith("tel:")) {
    const phone = data.slice(4).trim();
    if (phone.length > 0) {
      return { phone };
    }
  }

  // Strict phone number pattern: optional +, followed by digits, spaces, hyphens, parentheses (7 to 18 chars)
  const phoneRegex = /^(\+?\d{1,4}?[-.\s]?(\(?\d{1,4}?\)?)[-.\s]?)?[\d\s.-]{6,15}$/;
  const cleanCandidate = data.trim();
  // Ensure it has at least 6 digits and contains mostly phone characters
  const digitsOnly = cleanCandidate.replace(/\D/g, "");
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15 && phoneRegex.test(cleanCandidate)) {
    // Avoid classifying plain numbers like random large integers or product codes as phone
    if (cleanCandidate.startsWith("+") || cleanCandidate.includes("-") || cleanCandidate.includes(" ")) {
      return { phone: cleanCandidate };
    }
  }

  return null;
}

/**
 * Parses a raw string and detects its semantic type
 */
export function detectQrType(raw: string): QrParseResult {
  const trimmed = raw.trim();

  // 1. Check for WiFi
  const wifi = parseWifiString(trimmed);
  if (wifi) {
    return {
      raw,
      type: "wifi",
      parsedWifi: wifi,
    };
  }

  // 2. Check for Email
  const email = parseEmailString(trimmed);
  if (email) {
    return {
      raw,
      type: "email",
      parsedEmail: email,
    };
  }

  // 3. Check for Phone
  const phone = parsePhoneString(trimmed);
  if (phone) {
    return {
      raw,
      type: "phone",
      parsedPhone: phone,
    };
  }

  // 4. Check for URL (only http:// or https://)
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsedUrl = new URL(trimmed);
      if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
        return {
          raw,
          type: "url",
          url: parsedUrl.href,
        };
      }
    } catch {
      // not a valid URL
    }
  }

  // 5. Default to plain text
  return {
    raw,
    type: "text",
  };
}

/**
 * Builds standard WiFi QR format string
 */
export function buildWifiQrString(wifi: WifiFormData): string {
  const enc = wifi.encryption === "nopass" ? "nopass" : wifi.encryption;
  let str = `WIFI:T:${enc};S:${escapeWifiField(wifi.ssid)};`;
  if (wifi.encryption !== "nopass" && wifi.password) {
    str += `P:${escapeWifiField(wifi.password)};`;
  }
  if (wifi.hidden) {
    str += "H:true;";
  }
  str += ";";
  return str;
}

/**
 * Builds standard mailto URL string
 */
export function buildEmailQrString(email: EmailFormData): string {
  const params = new URLSearchParams();
  if (email.subject.trim()) params.append("subject", email.subject.trim());
  if (email.body.trim()) params.append("body", email.body.trim());
  const paramStr = params.toString();
  return `mailto:${email.to.trim()}${paramStr ? `?${paramStr}` : ""}`;
}

/**
 * Builds standard tel: URL string
 */
export function buildPhoneQrString(phone: string): string {
  return `tel:${phone.trim()}`;
}

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleaned.length !== 6) return null;
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates relative luminance according to WCAG 2.1 specs
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates contrast ratio between two hex colors (e.g. 21:1 for black on white)
 */
export function calculateContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 21; // fallback safe

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (brighter + 0.05) / (darker + 0.05);
}
