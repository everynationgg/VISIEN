'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, Check, Sparkles, RefreshCw } from 'lucide-react';

interface ColorWheelPickerProps {
  onSelectPalette: (paletteSummary: string) => void;
  onCancel?: () => void;
}

interface PaletteSlot {
  label: string;
  hex: string;
}

const PRESETS = [
  { name: 'Obsidian Gold', colors: ['#0B0B0F', '#D4AF37', '#1F1F28'] },
  { name: 'Cyber Violet', colors: ['#0A0A0E', '#7C3AED', '#C4B5FD'] },
  { name: 'Linear Cobalt', colors: ['#0B0F19', '#3B82F6', '#93C5FD'] },
  { name: 'Warm Contemporary', colors: ['#FAF8F5', '#EA580C', '#78350F'] },
  { name: 'Emerald Luxe', colors: ['#061E14', '#10B981', '#A7F3D0'] },
];

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({
  onSelectPalette,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hue, setHue] = useState<number>(265); // Default violet
  const [saturation, setSaturation] = useState<number>(85);
  const [lightness, setLightness] = useState<number>(55);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [palette, setPalette] = useState<PaletteSlot[]>([
    { label: 'Primary Accent', hex: '#7C3AED' },
  ]);

  const activeHex = hslToHex(hue, saturation, lightness);

  // Draw the radial hue wheel on canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const outerRadius = center - 8;
    const innerRadius = center - 36;

    ctx.clearRect(0, 0, size, size);

    // Draw circular ring with 360 angular gradient segments
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = ((angle - 1) * Math.PI) / 180;
      const endAngle = ((angle + 1) * Math.PI) / 180;

      ctx.beginPath();
      ctx.arc(center, center, outerRadius, startAngle, endAngle, false);
      ctx.arc(center, center, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = `hsl(${angle}, ${saturation}%, ${lightness}%)`;
      ctx.fill();
    }

    // Draw active selector indicator on the ring
    const rad = (hue * Math.PI) / 180;
    const thumbRadius = (outerRadius + innerRadius) / 2;
    const thumbX = center + thumbRadius * Math.cos(rad);
    const thumbY = center + thumbRadius * Math.sin(rad);

    ctx.beginPath();
    ctx.arc(thumbX, thumbY, 11, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = activeHex;
    ctx.stroke();

    // Center preview circle
    ctx.beginPath();
    ctx.arc(center, center, innerRadius - 10, 0, 2 * Math.PI);
    ctx.fillStyle = activeHex;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();
  }, [hue, saturation, lightness, activeHex]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const updateAngleFromCoord = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg < 0) deg += 360;

    setHue(Math.round(deg));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateAngleFromCoord(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    updateAngleFromCoord(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const addCurrentColor = () => {
    if (palette.length >= 3) return;
    const nextSlot =
      palette.length === 1 ? 'Background' : 'Highlight';
    setPalette([...palette, { label: nextSlot, hex: activeHex }]);
  };

  const removeSlot = (index: number) => {
    const updated = palette.filter((_, i) => i !== index);
    setPalette(updated);
  };

  const applyPreset = (presetColors: string[]) => {
    const labels = ['Primary Accent', 'Background', 'Highlight'];
    setPalette(
      presetColors.map((hex, i) => ({
        label: labels[i] || `Color ${i + 1}`,
        hex,
      }))
    );
  };

  const handleConfirm = () => {
    if (palette.length === 0) return;
    const summary = palette.map((p) => `${p.label}: ${p.hex}`).join(', ');
    onSelectPalette(`Brand Palette [${summary}]`);
  };

  return (
    <div className="color-wheel-container" ref={containerRef}>
      <div className="wheel-header">
        <div className="wheel-title-row">
          <Sparkles size={16} className="sparkle-icon" />
          <span className="wheel-title">Interactive Brand Palette Builder</span>
        </div>
        <p className="wheel-subtitle">
          Drag the ring to pick up to 3 colors, or choose a signature luxury preset.
        </p>
      </div>

      <div className="wheel-interactive-area">
        {/* Canvas Radial Wheel */}
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={240}
            height={240}
            className="color-wheel-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
          <div className="active-hex-badge" style={{ borderColor: activeHex }}>
            <span className="active-hex-dot" style={{ backgroundColor: activeHex }} />
            <span className="active-hex-text">{activeHex}</span>
          </div>
        </div>

        {/* Tone Slider Controls */}
        <div className="slider-controls">
          <div className="slider-group">
            <div className="slider-header">
              <span>Brightness / Shade</span>
              <span>{lightness}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={90}
              value={lightness}
              onChange={(e) => setLightness(Number(e.target.value))}
              className="tone-slider"
            />
          </div>

          <button
            type="button"
            className="btn-add-color"
            onClick={addCurrentColor}
            disabled={palette.length >= 3}
          >
            <Plus size={15} />
            <span>
              {palette.length >= 3 ? 'Palette Full (3/3)' : `Add Color to Palette (${palette.length}/3)`}
            </span>
          </button>
        </div>
      </div>

      {/* Palette Tray */}
      <div className="palette-tray">
        <div className="tray-label">Your Custom Palette ({palette.length}/3):</div>
        <div className="palette-slots">
          {palette.map((slot, idx) => (
            <div key={idx} className="palette-badge" style={{ borderColor: slot.hex }}>
              <span className="badge-dot" style={{ backgroundColor: slot.hex }} />
              <div className="badge-text-group">
                <span className="badge-slot-label">{slot.label}</span>
                <span className="badge-hex">{slot.hex}</span>
              </div>
              <button
                type="button"
                className="badge-remove-btn"
                onClick={() => removeSlot(idx)}
                title="Remove color"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          {palette.length === 0 && (
            <span className="tray-empty-hint">Pick a color on the wheel and tap Add.</span>
          )}
        </div>
      </div>

      {/* Signature Presets */}
      <div className="presets-area">
        <div className="presets-label">1-Tap Signature Presets:</div>
        <div className="presets-pills">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              className="preset-btn"
              onClick={() => applyPreset(p.colors)}
            >
              <div className="preset-dots">
                {p.colors.map((c, ci) => (
                  <span key={ci} className="preset-dot" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="wheel-actions">
        {onCancel && (
          <button type="button" className="wheel-cancel-btn" onClick={onCancel}>
            Skip / Custom Text
          </button>
        )}
        <button
          type="button"
          className="wheel-confirm-btn"
          onClick={handleConfirm}
          disabled={palette.length === 0}
        >
          <Check size={16} />
          <span>Confirm Palette ({palette.length} color{palette.length > 1 ? 's' : ''})</span>
        </button>
      </div>

      <style jsx>{`
        .color-wheel-container {
          background: rgba(14, 14, 22, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 12px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.15);
          max-width: 480px;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .wheel-header {
          margin-bottom: 16px;
        }

        .wheel-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #DDD6FE;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }

        .sparkle-icon {
          color: #A78BFA;
        }

        .wheel-subtitle {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          margin: 4px 0 0 0;
          line-height: 1.4;
        }

        .wheel-interactive-area {
          display: flex;
          align-items: center;
          gap: 18px;
          justify-content: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .canvas-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .color-wheel-canvas {
          touch-action: none;
          cursor: crosshair;
          border-radius: 50%;
          filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4));
        }

        .active-hex-badge {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 4px 12px;
        }

        .active-hex-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          box-shadow: 0 0 8px currentColor;
        }

        .active-hex-text {
          font-family: monospace;
          font-size: 13px;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 0.5px;
        }

        .slider-controls {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 180px;
          flex: 1;
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tone-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, #000, #888, #fff);
          outline: none;
        }

        .tone-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 2px solid #7C3AED;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }

        .btn-add-color {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.4);
          color: #DDD6FE;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-add-color:hover:not(:disabled) {
          background: rgba(139, 92, 246, 0.35);
          border-color: #8B5CF6;
        }

        .btn-add-color:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .palette-tray {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 14px;
          margin-bottom: 14px;
        }

        .tray-label {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .palette-slots {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .palette-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid;
          border-radius: 10px;
          padding: 5px 10px;
        }

        .badge-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        .badge-text-group {
          display: flex;
          flex-direction: column;
        }

        .badge-slot-label {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .badge-hex {
          font-family: monospace;
          font-size: 12px;
          font-weight: 700;
          color: #FFFFFF;
        }

        .badge-remove-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .badge-remove-btn:hover {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .tray-empty-hint {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        .presets-area {
          margin-bottom: 16px;
        }

        .presets-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 6px;
          font-weight: 600;
        }

        .presets-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .preset-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.85);
          font-size: 11px;
          padding: 5px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .preset-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .preset-dots {
          display: flex;
          gap: 3px;
        }

        .preset-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .wheel-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          align-items: center;
        }

        .wheel-cancel-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          cursor: pointer;
          padding: 8px 12px;
        }

        .wheel-cancel-btn:hover {
          color: #FFFFFF;
        }

        .wheel-confirm-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          border: none;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
          transition: all 0.2s ease;
        }

        .wheel-confirm-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6);
        }

        .wheel-confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
