"use client";

import { useRef, useState, useEffect } from "react";
import { PenTool, Type, Trash2 } from "lucide-react";

interface Props {
  onSignatureChange: (dataUrl: string | null) => void;
}

export default function SignaturePad({ onSignatureChange }: Props) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedText, setTypedText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      onSignatureChange(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange(null);
  };

  const handleTypedSignature = (text: string) => {
    setTypedText(text);
    if (!text.trim()) {
      onSignatureChange(null);
      return;
    }
    // Render typed text to canvas for export
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 100);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "italic 36px 'Georgia', cursive";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 16, 50);
    onSignatureChange(canvas.toDataURL("image/png"));
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Signature
      </p>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setMode("draw")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mode === "draw"
              ? "bg-accent/20 text-accent"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <PenTool className="w-3 h-3" /> Draw
        </button>
        <button
          onClick={() => setMode("type")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mode === "type"
              ? "bg-accent/20 text-accent"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Type className="w-3 h-3" /> Type
        </button>
      </div>

      {mode === "draw" ? (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            className="w-full rounded-lg bg-white cursor-crosshair border border-zinc-200"
            style={{ touchAction: "none", height: "100px" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          <button
            onClick={clearCanvas}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90 text-zinc-400 hover:text-red-400 transition"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <p className="text-[10px] text-zinc-600 mt-1.5">
            Draw your signature above
          </p>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={typedText}
            onChange={(e) => handleTypedSignature(e.target.value)}
            placeholder="Type your full name..."
            className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-accent"
          />
          {typedText && (
            <div className="mt-2 bg-white rounded-lg p-3 border border-zinc-100">
              <p
                className="text-2xl text-zinc-800"
                style={{ fontFamily: "Georgia, cursive", fontStyle: "italic" }}
              >
                {typedText}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
