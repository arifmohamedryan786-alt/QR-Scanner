export type ResultType = "url" | "wifi" | "email" | "phone" | "text";

export interface ParsedWifi {
  ssid: string;
  password?: string;
  encryption?: "WPA" | "WEP" | "nopass" | string;
  hidden?: boolean;
}

export interface ParsedEmail {
  to: string;
  subject?: string;
  body?: string;
}

export interface ParsedPhone {
  phone: string;
}

export interface QrParseResult {
  raw: string;
  type: ResultType;
  parsedWifi?: ParsedWifi;
  parsedEmail?: ParsedEmail;
  parsedPhone?: ParsedPhone;
  url?: string;
}

export interface ScanHistoryItem {
  id: string;
  text: string;
  type: ResultType;
  timestamp: number;
}

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type GeneratorType = "text" | "wifi" | "email" | "phone";

export interface WifiFormData {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

export interface EmailFormData {
  to: string;
  subject: string;
  body: string;
}

export interface PhoneFormData {
  phone: string;
}

export interface GeneratorSettings {
  type: GeneratorType;
  text: string;
  wifi: WifiFormData;
  email: EmailFormData;
  phone: PhoneFormData;
  size: number;
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
}

