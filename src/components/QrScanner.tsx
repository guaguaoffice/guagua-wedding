"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type ScanResult =
  | { ok: true; alreadyCheckedIn: boolean; name: string; checkedInAt: Date }
  | { ok: false; error: string };

interface Props {
  onCheckin: (token: string) => Promise<ScanResult>;
  onClose: () => void;
}

export function QrScanner({ onCheckin, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processingRef = useRef(false);

  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const resetResult = useCallback(() => {
    setResult(null);
    processingRef.current = false;
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) { rafRef.current = requestAnimationFrame(tick); return; }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code && !processingRef.current) {
      const url = code.data;
      // 只處理本系統的報到連結
      const match = url.match(/\/checkin\/([a-f0-9-]{36})$/);
      if (match) {
        processingRef.current = true;
        const token = match[1];
        onCheckin(token).then((r) => {
          setResult(r);
          // 2.5 秒後自動清除，繼續掃下一位
          setTimeout(resetResult, 2500);
        });
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [onCheckin, resetResult]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(() => {
        setCameraError("無法開啟相機，請確認已授予相機權限。");
      });

    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [tick]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* 相機畫面 */}
      <video
        ref={videoRef}
        className="flex-1 w-full object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* 掃描框提示 */}
      {!cameraError && !result && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-56 h-56 border-2 border-white rounded-2xl opacity-70">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />
          </div>
        </div>
      )}

      {/* 底部提示文字 */}
      {!cameraError && !result && (
        <div className="absolute bottom-24 left-0 right-0 text-center text-white text-sm opacity-80">
          將賓客的報到 QR Code 對準框框
        </div>
      )}

      {/* 錯誤訊息 */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-8 text-center">
          <div>
            <p className="text-white text-base">{cameraError}</p>
            <button onClick={onClose} className="mt-4 btn btn-secondary">
              關閉
            </button>
          </div>
        </div>
      )}

      {/* 報到結果 overlay */}
      {result && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-card rounded-2xl px-8 py-7 text-center shadow-xl max-w-xs w-full mx-4">
            {result.ok ? (
              <>
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                    result.alreadyCheckedIn ? "bg-card-hover" : "bg-accent"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-7 h-7 fill-none ${
                      result.alreadyCheckedIn ? "stroke-text-soft" : "stroke-white"
                    }`}
                    strokeWidth={2.5}
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="font-bold text-xl mt-3">{result.name}</div>
                <div className={`text-sm mt-1 ${result.alreadyCheckedIn ? "text-text-soft" : "text-accent-hover font-semibold"}`}>
                  {result.alreadyCheckedIn
                    ? `已於 ${new Date(result.checkedInAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })} 報到過`
                    : "報到成功！"}
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center mx-auto">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-coral fill-none" strokeWidth={2}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>
                <div className="font-bold text-lg mt-3">無效的 QR Code</div>
                <div className="text-sm text-text-soft mt-1">{result.error}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 關閉按鈕 */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center text-xl"
      >
        ✕
      </button>
    </div>
  );
}
