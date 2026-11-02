# QR Studio

A complete, production-ready, 100% client-side QR Code Scanner and Generator built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

Everything processes locally in your browser using WebAssembly and client-side JavaScript. There is **no backend, no database, no API keys, and no tracking**, ensuring complete user privacy and zero maintenance costs when hosted on platforms like Vercel.

---

## ✨ Features

### 🔍 QR Code Scanner
- **Live Camera Scanning**: High-performance camera scanner using `html5-qrcode`. Defaults to the rear/environment camera on smartphones with an instant camera-switch toggle if multiple cameras are detected.
- **Image File Drag & Drop**: Drag and drop or browse any image (PNG, JPG, WebP, GIF, SVG) to decode QR codes instantly using `jsqr`.
- **Smart Payload Recognition**: Automatically parses and identifies the decoded content type:
  - 🌐 **Web URLs (HTTP / HTTPS)**: Displays domain with safe external link opening (`rel="noopener noreferrer"`). Links are **never** auto-opened for security.
  - 📶 **Wi-Fi Networks**: Decodes network SSID, authentication type (WPA/WEP/Open), and password with a show/hide toggle and one-click password copy.
  - ✉️ **Email**: Parses recipient email, subject line, and body message with a one-click "Compose Email" shortcut.
  - 📞 **Phone Numbers**: Recognizes international phone formats with a one-click "Call Number" shortcut.
  - 📝 **Plain Text**: Formats any plain text message or arbitrary payload.
- **Scan History**: Keeps the last 10 scans in `localStorage` (with error-safe wrappers). Includes quick copy, per-item deletion, and a "Clear history" button.
- **User-Friendly Diagnostics**: Clear visual notices for permission denied, camera not found, camera busy, unsupported image, or insecure context.
- **Safe Lifecycle Management**: Dynamically imported with `ssr: false`; automatically turns off the camera stream when switching tabs or navigating away to preserve battery and privacy.

### 🎨 QR Code Generator
- **Multi-Type Payloads**: Dedicated tabs for **Text/URL**, **Wi-Fi** (SSID, password, encryption type, hidden flag), **Email** (recipient, subject, body), and **Phone**.
- **Instant Live Preview**: Re-renders in real time as you type.
- **Customizable Resolutions**: Export at 200px (thumbnail), 300px (standard), 500px (HD), or 1000px (print-ready).
- **Custom Color Palettes**: Pick custom foreground and background colors, choose from curated one-click presets, or swap colors with one click.
- **WCAG Contrast Warning**: Built-in luminance calculator checks color contrast and warns you if the combination may be difficult for camera scanners to read.
- **Error Correction Levels**: Selectable from L (~7%), M (~15%), Q (~25%), to H (~30% damage recovery).
- **Export Formats**:
  - Download as **PNG**
  - Download as **SVG** (crisp vector for high-end print)
  - **Copy Image to Clipboard** for instant pasting into Slack, Figma, docs, or emails.

### 📱 UI & Accessibility
- **Mobile-First Responsive Design**: Optimized for iOS Safari, Android Chrome, tablets, and desktops.
- **Dark Mode**: Automatically respects system theme preference by default with an instant manual toggle (System / Dark / Light).
- **Accessible**: Screen-reader friendly with `aria-live` announcements for scanned results, full keyboard navigation, and visible focus indicators.
- **Persisted State**: Remembers the last used tab and theme preference across sessions using safe `try/catch` `localStorage`.

---

## 🚀 Local Setup & Development

### Prerequisites
- Node.js 18.18+ or 20+ (tested on Node v20 & v22)
- npm 9+ or pnpm / yarn

### 1. Clone the repository
```bash
git clone https://github.com/arifmohamedryan786-alt/QR-Scanner.git
cd QR-Scanner
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build, Ship & Auto-Push Commands
- **`npm run ship`**: Builds the project, stages all changes, commits, and pushes directly to `main` so Vercel redeploys immediately.
- **`npm run autopush`**: Background watcher script that watches `src/` and `public/`, debounces for 20 seconds after the last edit, and automatically commits and pushes to `main`.

> **Note on Camera Testing**: Web browsers only grant camera access in a **secure context** (`https://` or `localhost`). When testing on `localhost:3000`, the camera will work directly on your development machine. To test camera scanning on a physical smartphone during local development, use an HTTPS tunnel (e.g., `npx localtunnel --port 3000` or Cloudflare Tunnel) or deploy to Vercel.

---

## 🌐 Deploying to Vercel

QR Studio is fully optimized for zero-configuration deployment to Vercel.

### Step-by-Step Instructions:
1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Under **"Import Git Repository"**, select `arifmohamedryan786-alt/QR-Scanner`.
4. Leave all settings at their defaults:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Environment Variables**: None required (QR Studio is 100% client-side).
5. Click **"Deploy"**.
6. Once deployment finishes (typically under 60 seconds), your site will be live at a `.vercel.app` domain with automatic HTTPS and global edge delivery.

---

## 🧪 Testing Checklist on Live URL

When testing on your phone or desktop at the deployed HTTPS URL:
- [ ] **Camera Permission**: Click "Start Camera" on mobile and confirm the permission dialog prompt appears.
- [ ] **Rear Camera**: Verify the rear camera activates by default on a phone.
- [ ] **Switch Camera**: If testing on a phone with multiple cameras, tap "Switch Camera" to verify switching between lenses.
- [ ] **Scan QR**: Scan a standard website QR and verify the URL card displays with "Copy Result" and "Open Link".
- [ ] **Wi-Fi QR**: Scan a Wi-Fi QR code and verify SSID and password are formatted with the show/hide password toggle.
- [ ] **Upload Image Scan**: Switch to "Upload Image", drop/browse an image containing a QR code, and verify instant decoding.
- [ ] **Scan History**: Check that recent scans appear in the "Recent Scans" history list and can be copied or cleared.
- [ ] **QR Generation**:
  - Create a Wi-Fi or URL code in the "Generate" tab.
  - Test the color picker and ensure the contrast warning appears when selecting low-contrast colors (e.g., light yellow on white).
  - Test downloading as PNG and SVG.
  - Test "Copy Image to Clipboard".
- [ ] **Theme Toggle**: Switch between Dark, Light, and System mode.
- [ ] **Tab Memory**: Refresh the page to ensure your last active tab is remembered.

---

## 📄 License
MIT

