"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function QrCode({ url, size = 180 }: { url: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, { width: size, margin: 1 });
  }, [url, size]);

  return <canvas ref={canvasRef} className="rounded-xl" />;
}
