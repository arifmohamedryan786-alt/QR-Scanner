"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, CameraOff, RefreshCw, AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";
import { Html5Qrcode, CameraDevice } from "html5-qrcode";

interface CameraScannerProps {
  onScanSuccess: (data: string) => void;
  active: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onScanSuccess, active }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSecure, setIsSecure] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "html5qr-reader-container";

  // Check secure context
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".localhost");
      if (!window.isSecureContext && !isLocalhost) {
        setIsSecure(false);
        setErrorMessage(
          "Camera access requires a secure HTTPS connection. Please use an HTTPS URL or localhost."
        );
      }
    }
  }, []);

  // Safe scanner cleanup
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn("Notice: Error while stopping camera", err);
      }
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.warn("Notice: Error while clearing scanner container", err);
      }
    }
    setIsScanning(false);
    setIsStarting(false);
  }, []);

  // Fetch cameras
  const discoverCameras = useCallback(async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);

        // Prefer rear/environment camera by label or fallback to first
        const backCamera = devices.find(
          (c) =>
            c.label.toLowerCase().includes("back") ||
            c.label.toLowerCase().includes("rear") ||
            c.label.toLowerCase().includes("environment")
        );
        setSelectedCameraId(backCamera ? backCamera.id : devices[devices.length - 1].id);
      } else {
        setErrorMessage("No video cameras found on your device.");
      }
    } catch (err: unknown) {
      console.warn("Camera enumeration error:", err);
      // May happen before permission is granted; startScanner with facingMode will prompt
    }
  }, []);

  const startScanner = useCallback(async (cameraIdToUse?: string) => {
    setErrorMessage(null);
    setIsStarting(true);

    if (typeof window === "undefined") return;

    try {
      // Clean up previous scanner instance if any
      await stopScanner();

      const scanner = new Html5Qrcode(containerId, { verbose: false });
      scannerRef.current = scanner;

      // Select camera: rear camera preference
      const cameraConfig = cameraIdToUse
        ? { deviceId: { exact: cameraIdToUse } }
        : { facingMode: "environment" };

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const edge = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.75);
          return { width: Math.max(edge, 200), height: Math.max(edge, 200) };
        },
        aspectRatio: 1.0,
      };

      await scanner.start(
        cameraConfig,
        qrConfig,
        (decodedText) => {
          if (decodedText) {
            onScanSuccess(decodedText);
          }
        },
        () => {
          // Frame by frame scanning non-matches (silent)
        }
      );

      setIsScanning(true);
      setIsStarting(false);

      // Re-query cameras now that permission has been granted so labels are populated
      await discoverCameras();
    } catch (err: unknown) {
      console.error("Camera startup failed:", err);
      setIsStarting(false);
      setIsScanning(false);

      const errString = String(err);
      if (
        errString.includes("NotAllowedError") ||
        errString.includes("Permission denied") ||
        errString.includes("PermissionDeniedError")
      ) {
        setErrorMessage(
          "Camera permission denied. Please allow camera access in your browser site permissions and try again."
        );
      } else if (
        errString.includes("NotFoundError") ||
        errString.includes("Requested device not found")
      ) {
        setErrorMessage("No camera found on your device. Please verify your camera is plugged in.");
      } else if (
        errString.includes("NotReadableError") ||
        errString.includes("Source unavailable")
      ) {
        setErrorMessage(
          "Camera is currently busy or in use by another tab or app. Please close other camera apps."
        );
      } else if (
        errString.includes("OverconstrainedError") ||
        errString.includes("ConstraintNotSatisfiedError")
      ) {
        // Fallback: try starting without constraint
        try {
          if (scannerRef.current) {
            await scannerRef.current.start(
              { facingMode: "user" },
              { fps: 15, aspectRatio: 1.0 },
              (text) => onScanSuccess(text),
              () => {}
            );
            setIsScanning(true);
            return;
          }
        } catch {
          setErrorMessage("Could not initialize camera with requested constraints.");
        }
      } else {
        setErrorMessage(
          "Could not start the camera. Please check camera permissions or try uploading an image instead."
        );
      }
    }
  }, [discoverCameras, onScanSuccess, stopScanner]);

  // Switch camera toggle
  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCam = cameras[nextIndex];
    setSelectedCameraId(nextCam.id);
    if (isScanning) {
      await startScanner(nextCam.id);
    }
  };

  // Teardown when unmounted or tab inactive
  useEffect(() => {
    if (!active) {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [active, stopScanner]);

  return (
    <div className="w-full space-y-4">
      {/* Scanner Viewport Card */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-200 dark:border-slate-800 aspect-square max-h-[420px] mx-auto flex items-center justify-center shadow-inner">
        {/* html5-qrcode video container */}
        <div id={containerId} className="w-full h-full object-cover" />

        {/* Viewfinder Target Graphic (Overlaid while scanning) */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Darkened overlay mask around reticle */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-indigo-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />

              {/* Animated Laser Sweep */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_#818cf8] animate-laser" />

              <div className="absolute -bottom-8 left-0 right-0 text-center">
                <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-black/75 text-white/90 backdrop-blur-sm">
                  Align QR code inside frame
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Idle / Off Placeholder State */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/80 backdrop-blur-sm z-10">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 mb-4 shadow-lg">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Live Camera Scanner</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              Point your camera at any QR code to scan.
            </p>
            <button
              onClick={() => startScanner(selectedCameraId || undefined)}
              disabled={isStarting || !isSecure}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/25 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isStarting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Starting Camera...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Camera</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons Bar (when scanning) */}
      {isScanning && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={stopScanner}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <CameraOff className="w-4 h-4" />
            <span>Stop Camera</span>
          </button>

          {cameras.length > 1 && (
            <button
              onClick={switchCamera}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Switch camera"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Switch Camera ({cameras.length})</span>
            </button>
          )}
        </div>
      )}

      {/* Error Banners */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div className="space-y-1">
            <p className="font-semibold">Camera Notice</p>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {!isSecure && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="font-semibold">Insecure Context Detected</p>
            <p className="leading-relaxed">
              Browsers restrict camera hardware access to secure contexts (HTTPS or localhost). Once deployed to Vercel, HTTPS is provided automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
