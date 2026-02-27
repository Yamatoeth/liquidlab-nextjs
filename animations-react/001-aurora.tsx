import { useEffect, useRef, useState, useCallback } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  if (!hex) return null;
  const m = hex.replace("#", "");
  const bigint = parseInt(m, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerpVal(a, b, t) { return a + (b - a) * t; }
function lerpColor(c1, c2, t) {
  if (!c1) return c2 ? c2.slice() : null;
  if (!c2) return c1.slice();
  return [
    Math.round(lerpVal(c1[0], c2[0], t)),
    Math.round(lerpVal(c1[1], c2[1], t)),
    Math.round(lerpVal(c1[2], c2[2], t)),
  ];
}

// ─── Base orbs ──────────────────────────────────────────────────────────────
const BASE_ORBS = [
  { x: 0.2, y: 0.3, r: 0.55, color: [120, 80, 255],  speed: 0.0008, phase: 0 },
  { x: 0.8, y: 0.7, r: 0.50, color: [240, 60, 200],  speed: 0.0011, phase: 2 },
  { x: 0.5, y: 0.5, r: 0.45, color: [60, 200, 255],  speed: 0.0006, phase: 4 },
  { x: 0.3, y: 0.8, r: 0.40, color: [100, 255, 180], speed: 0.0009, phase: 1 },
  { x: 0.7, y: 0.2, r: 0.38, color: [255, 140, 80],  speed: 0.0007, phase: 3 },
];

// ─── Default control params ──────────────────────────────────────────────────
const DEFAULT_PARAMS = {
  speed:          1,
  trail:          0.18,
  intensity:      1,
  mouseInfluence: 0.18,
  particleSize:   1,
  offsetY:        0,
  particleCount:  BASE_ORBS.length,
  hueShift:       0,
  enableGlow:     true,
  colorA:         null,
  colorB:         null,
  colorC:         null,
};

// ─── Slider control component ────────────────────────────────────────────────
function Slider({ label, name, min, max, step = 0.01, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
        <span>{label}</span>
        <span style={{ color: "rgba(255,255,255,0.7)" }}>{typeof value === "number" ? value.toFixed(2) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(name, Number(e.target.value))}
        style={{ width: "100%", accentColor: "#a78bfa", cursor: "pointer" }}
      />
    </div>
  );
}

// ─── Color picker component ──────────────────────────────────────────────────
function ColorPicker({ label, name, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", flex: 1 }}>{label}</span>
      <input
        type="color"
        value={value || "#7050ff"}
        onChange={e => onChange(name, e.target.value)}
        style={{ width: 32, height: 24, border: "none", background: "none", cursor: "pointer", borderRadius: 4 }}
      />
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function AuroraAmbient() {
  const canvasRef = useRef(null);
  const [toggleHover, setToggleHover] = useState(false);
  const [resetHover, setResetHover]   = useState(false);
  const stateRef  = useRef({
    time: 0,
    mouse: { x: 0.5, y: 0.5 },
    target: { x: 0.5, y: 0.5 },
    renderOrbs: BASE_ORBS.map((b, i) => ({ ...b, baseIndex: i })),
    baseOrbs: BASE_ORBS.map(b => ({ ...b, color: b.color.slice() })),
    appliedParticleCount: BASE_ORBS.length,
    displayParams: { ...DEFAULT_PARAMS },
    displayColorA: null,
    displayColorB: null,
    params: { ...DEFAULT_PARAMS },
    rafId: null,
  });

  const [uiParams, setUiParams] = useState({ ...DEFAULT_PARAMS });
  const [showControls, setShowControls] = useState(false);

  // Sync uiParams → stateRef.params
  useEffect(() => {
    const s = stateRef.current;
    s.params = { ...uiParams };

    // Update base orb colors directly for snappy color response
    if (uiParams.colorA) { const rgb = hexToRgb(uiParams.colorA); if (rgb) s.baseOrbs[0].color = rgb; }
    if (uiParams.colorB) { const rgb = hexToRgb(uiParams.colorB); if (rgb) s.baseOrbs[1].color = rgb; }
    if (uiParams.colorC) { const rgb = hexToRgb(uiParams.colorC); if (rgb) s.baseOrbs[2].color = rgb; }
  }, [uiParams]);

  const handleChange = useCallback((name, value) => {
    setUiParams(prev => ({ ...prev, [name]: value }));
  }, []);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Mouse / touch
  useEffect(() => {
    const s = stateRef.current;
    const onMove = e => {
      s.target.x = e.clientX / window.innerWidth;
      s.target.y = e.clientY / window.innerHeight;
    };
    const onTouch = e => {
      s.target.x = e.touches[0].clientX / window.innerWidth;
      s.target.y = e.touches[0].clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const s      = stateRef.current;

    let debounceTimer = null;
    let pendingParticleCount = s.appliedParticleCount;

    function draw() {
      const { params } = s;
      const W = canvas.width;
      const H = canvas.height;

      const speed         = clamp(Number(params.speed         || 1),    0.1, 5);
      const trail         = clamp(Number(params.trail         || 0.18), 0.01, 1);
      const intensity     = clamp(Number(params.intensity     || 1),    0, 3);
      const mouseInfluence= clamp(Number(params.mouseInfluence|| 0.18), 0, 1);

      s.time += speed;

      s.mouse.x += (s.target.x - s.mouse.x) * 0.04;
      s.mouse.y += (s.target.y - s.mouse.y) * 0.04;

      // Particle count debounce
      const reqCount = Math.max(1, Math.min(2000, Math.floor(Number(params.particleCount) || BASE_ORBS.length)));
      if (reqCount !== pendingParticleCount) {
        pendingParticleCount = reqCount;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          s.appliedParticleCount = pendingParticleCount;
          debounceTimer = null;
        }, 200);
      }

      // Regenerate orbs if count changed
      if (s.renderOrbs.length !== s.appliedParticleCount) {
        const next = [];
        for (let i = 0; i < s.appliedParticleCount; i++) {
          const b = BASE_ORBS[i % BASE_ORBS.length];
          next.push({
            x: b.x + (Math.random() - 0.5) * 0.08,
            y: b.y + (Math.random() - 0.5) * 0.08,
            phase: b.phase + Math.random() * 6.28,
            baseIndex: i % BASE_ORBS.length,
          });
        }
        s.renderOrbs = next;
      }

      // Lerp display params
      const LF = 0.22;
      const dp = s.displayParams;
      dp.speed        = lerpVal(dp.speed,        clamp(Number(params.speed        || 1),    0.1, 5),    LF);
      dp.intensity    = lerpVal(dp.intensity,    clamp(Number(params.intensity    || 1),    0, 3),      LF);
      dp.particleSize = lerpVal(dp.particleSize, clamp(Number(params.particleSize || 1),    0.2, 3),    LF);
      dp.offsetY      = lerpVal(dp.offsetY,      clamp(Number(params.offsetY      || 0),    -0.5, 0.5), LF);
      dp.hueShift     = lerpVal(dp.hueShift,     clamp(Number(params.hueShift     || 0),    0, 360),    LF);
      dp.enableGlow   = params.enableGlow !== false;

      if (params.colorA) s.displayColorA = lerpColor(s.displayColorA, hexToRgb(String(params.colorA)), LF) || s.displayColorA;
      if (params.colorB) s.displayColorB = lerpColor(s.displayColorB, hexToRgb(String(params.colorB)), LF) || s.displayColorB;

      ctx.fillStyle = `rgba(4,4,10,${trail})`;
      ctx.fillRect(0, 0, W, H);

      const sizeFactor  = dp.particleSize;
      const speedFactor = dp.speed;
      const enableGlow  = dp.enableGlow;

      for (let i = 0; i < s.renderOrbs.length; i++) {
        const inst = s.renderOrbs[i];
        const base = s.baseOrbs[inst.baseIndex !== undefined ? inst.baseIndex : i % BASE_ORBS.length];

        const orbSpeed = (base.speed || 0.0008) * speedFactor;
        const drift    = Math.sin(s.time * orbSpeed * 1000 + inst.phase) * 0.12;
        const driftY   = Math.cos(s.time * orbSpeed * 800  + inst.phase) * 0.10;

        const mx = (s.mouse.x - 0.5) * mouseInfluence * (i % 2 === 0 ?  1 : -1);
        const my = (s.mouse.y - 0.5) * (mouseInfluence * 0.78) * (i % 2 === 0 ? -1 : 1);

        const cx     = (inst.x + drift  + mx) * W;
        const cy     = (inst.y + driftY + my + (dp.offsetY || 0)) * H;
        const radius = base.r * Math.min(W, H) * sizeFactor;

        let color = (base.color && base.color.slice()) || [200, 200, 200];
        if (s.displayColorA && i % 2 === 0) color = s.displayColorA;
        if (s.displayColorB && i % 2 === 1) color = s.displayColorB;
        if (dp.hueShift) {
          const [h, sat, l] = rgbToHsl(color[0], color[1], color[2]);
          color = hslToRgb((h + dp.hueShift + 360) % 360, sat, l);
        }

        const [r, g, b] = color;
        const alpha = (0.13 + Math.sin(s.time * 0.02 + inst.phase) * 0.04)
                      * (enableGlow ? intensity : 0.0001);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.4})`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * 1.2, radius * 0.8, s.time * 0.001 + inst.phase, 0, Math.PI * 2);
        ctx.fill();
      }

      s.rafId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      if (s.rafId) cancelAnimationFrame(s.rafId);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#04040a", overflow: "hidden" }}>
      {/* Canvas */}
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

      {/* Label */}
      <div style={{
        position: "fixed", bottom: 24, left: 24,
        fontFamily: "'Courier New', monospace",
        fontSize: 11, letterSpacing: "0.15em",
        color: "rgba(255,255,255,0.25)",
        textTransform: "uppercase",
        pointerEvents: "none",
      }}>
        Aurora Ambient · Move cursor
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setShowControls(v => !v)}
        style={{
          position: "fixed", top: 20, right: 20,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: toggleHover ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
          fontFamily: "'Courier New', monospace",
          fontSize: 11, letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "8px 16px",
          borderRadius: 6,
          cursor: "pointer",
          backdropFilter: "blur(12px)",
          transition: "all 0.2s",
        }}
        onMouseEnter={() => setToggleHover(true)}
        onMouseLeave={() => setToggleHover(false)}
      >
        {showControls ? "✕ Close" : "⚙ Controls"}
      </button>

      {/* Control panel */}
      {showControls && (
        <div style={{
          position: "fixed", top: 60, right: 20,
          width: 260,
          background: "rgba(8,8,20,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "20px 18px",
          backdropFilter: "blur(24px)",
          display: "flex", flexDirection: "column", gap: 16,
          fontFamily: "'Courier New', monospace",
          overflowY: "auto",
          maxHeight: "calc(100vh - 100px)",
        }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 10 }}>
            Parameters
          </div>

          <Slider label="Speed"          name="speed"          min={0.1} max={5}   step={0.01} value={uiParams.speed}          onChange={handleChange} />
          <Slider label="Trail"          name="trail"          min={0.01}max={1}   step={0.01} value={uiParams.trail}          onChange={handleChange} />
          <Slider label="Intensity"      name="intensity"      min={0}   max={3}   step={0.01} value={uiParams.intensity}      onChange={handleChange} />
          <Slider label="Mouse Influence"name="mouseInfluence" min={0}   max={1}   step={0.01} value={uiParams.mouseInfluence} onChange={handleChange} />
          <Slider label="Particle Size"  name="particleSize"   min={0.2} max={3}   step={0.01} value={uiParams.particleSize}   onChange={handleChange} />
          <Slider label="Offset Y"       name="offsetY"        min={-0.5}max={0.5} step={0.01} value={uiParams.offsetY}        onChange={handleChange} />
          <Slider label="Hue Shift"      name="hueShift"       min={0}   max={360} step={1}    value={uiParams.hueShift}       onChange={handleChange} />
          <Slider label="Particle Count" name="particleCount"  min={1}   max={20}  step={1}    value={uiParams.particleCount}  onChange={handleChange} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ColorPicker label="Color A" name="colorA" value={uiParams.colorA} onChange={handleChange} />
            <ColorPicker label="Color B" name="colorB" value={uiParams.colorB} onChange={handleChange} />
            <ColorPicker label="Color C" name="colorC" value={uiParams.colorC} onChange={handleChange} />
          </div>

          {/* Glow toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", flex: 1 }}>Enable Glow</span>
            <button
              onClick={() => handleChange("enableGlow", !uiParams.enableGlow)}
              style={{
                padding: "4px 12px",
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.15)",
                background: uiParams.enableGlow ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.05)",
                color: uiParams.enableGlow ? "#a78bfa" : "rgba(255,255,255,0.35)",
                fontSize: 10, letterSpacing: "0.1em",
                fontFamily: "'Courier New', monospace",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {uiParams.enableGlow ? "On" : "Off"}
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={() => setUiParams({ ...DEFAULT_PARAMS })}
            style={{
              marginTop: 4,
              padding: "8px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: resetHover ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
              fontSize: 10, letterSpacing: "0.1em",
              fontFamily: "'Courier New', monospace",
              cursor: "pointer",
              textTransform: "uppercase",
              transition: "all 0.2s",
            }}
            onMouseEnter={() => setResetHover(true)}
            onMouseLeave={() => setResetHover(false)}
          >
            ↺ Reset
          </button>
        </div>
      )}
    </div>
  );
}