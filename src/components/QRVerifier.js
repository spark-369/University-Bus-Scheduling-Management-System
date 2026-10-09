"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui";
import { FiSearch, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";

const QR_REGION_ID = "qr-reader";

export default function QRVerifier({ onVerify, verifyResult, onReset }) {
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  const startingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    startingRef.current = false;
    setScanning(false);
    setStarting(false);

    if (!scanner) return;

    try {
      // Only stop if it is actually running, otherwise stop() rejects.
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch (e) {
      // Ignore teardown errors — the component may already be unmounted.
    }
  }, []);

  // Always release the camera when the component unmounts.
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const startScanner = useCallback(async () => {
    // Guard against double-invocation (StrictMode / rapid clicks).
    if (startingRef.current || scannerRef.current) return;

    setError("");
    startingRef.current = true;
    setStarting(true);

    try {
      // Camera access requires a secure context (https or localhost).
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Camera is not available. Use HTTPS (or localhost) and a browser that supports camera access.",
        );
      }

      const element = document.getElementById(QR_REGION_ID);
      if (!element) {
        throw new Error("Scanner region is not ready. Please try again.");
      }

      const scanner = new Html5Qrcode(QR_REGION_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Success: stop the camera then hand the raw value back to the parent.
          stopScanner().finally(() => {
            if (onVerify) onVerify(decodedText);
          });
        },
        () => {
          // Per-frame decode misses are expected; ignore them.
        },
      );

      setScanning(true);
      setStarting(false);
    } catch (err) {
      // Roll back any partial initialisation and show a helpful message.
      const scanner = scannerRef.current;
      scannerRef.current = null;
      startingRef.current = false;
      setScanning(false);
      setStarting(false);

      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {
          // ignore
        }
      }

      const name = err?.name || "";
      let message = err?.message || "Unable to start the camera.";

      if (name === "NotAllowedError" || /permission/i.test(message)) {
        message =
          "Camera permission was denied. Allow camera access in your browser settings and try again.";
      } else if (
        name === "NotFoundError" ||
        /no camera|notfound/i.test(message)
      ) {
        message = "No camera was found on this device.";
      } else if (name === "NotReadableError") {
        message =
          "The camera is already in use by another application. Close it and try again.";
      }

      setError(message);
    }
  }, [onVerify, stopScanner]);

  const handleClose = async () => {
    await stopScanner();
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="space-y-4">
      {!verifyResult ? (
        <>
          <p className="text-sm text-slate-400">
            Click &quot;Start Scanner&quot; and point your camera at the QR code.
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!scanning ? (
            <Button
              onClick={startScanner}
              className="w-full"
              loading={starting}
              disabled={starting}
            >
              <FiSearch className="mr-2" />
              Start Scanner
            </Button>
          ) : (
            <Button
              onClick={stopScanner}
              variant="outline"
              className="w-full"
            >
              <FiX className="mr-2" />
              Stop Scanner
            </Button>
          )}

          {/* The html5-qrcode library renders the live video into this node. */}
          <div id={QR_REGION_ID} className="w-full overflow-hidden rounded-lg" />
        </>
      ) : verifyResult.success ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <FiCheck className="w-16 h-16 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-green-400">Valid Bus Pass</h3>
          <div className="bg-emerald-500/10 p-4 rounded-lg space-y-2 text-left ring-1 ring-emerald-500/30">
            <p>
              <span className="font-semibold">Pass Number:</span>{" "}
              {verifyResult.data.busPass?.passNumber}
            </p>
            <p>
              <span className="font-semibold">Passenger Name:</span>{" "}
              {verifyResult.data.busPass?.passengerName}
            </p>
            <p>
              <span className="font-semibold">Passenger ID:</span>{" "}
              {verifyResult.data.busPass?.passengerId}
            </p>
            <p>
              <span className="font-semibold">Valid Until:</span>{" "}
              {new Date(verifyResult.data.busPass?.endDate).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                },
              )}
            </p>
          </div>
          <Button onClick={handleClose} className="w-full">
            Scan Another
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <FiX className="w-16 h-16 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-400">Invalid Bus Pass</h3>
          <p className="text-slate-400">{verifyResult.error}</p>
          <Button onClick={handleClose} className="w-full">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
