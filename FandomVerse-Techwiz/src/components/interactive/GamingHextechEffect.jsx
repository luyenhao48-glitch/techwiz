import React, { useEffect, useRef, useState } from 'react';

/**
 * GamingHextechEffect - Hiệu ứng Tinh thể Ma kỹ Hextech & Cyber eSports Độc quyền
 * 
 * Tính năng đặc biệt:
 * 1. Hextech Energy Crystals & Floating Cyber Motes: Các hạt năng lượng Hextech (Cyan, Vàng kim, Lam điện)
 *    và các ký tự lục giác ma kỹ bay bổng lơ lửng theo chiều sâu 3D.
 * 2. Critical Strike & Hextech Nova Burst: Click bất cứ đâu để kích hoạt sóng xung kích năng lượng
 *    kèm 36 tia lửa nổ tung 360° và dòng chữ chiến tích eSports huyền thoại (CRITICAL HIT!, PENTAKILL!, VICTORY!, LEVEL UP!).
 * 3. Âm thanh năng lượng Hextech Sci-Fi chân thực qua Web Audio API.
 * 4. Tương tác mượt mà 60 FPS, không cản trở nút bấm hay video.
 */
export default function GamingHextechEffect({ autoStart = true }) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(autoStart);
  const animFrameIdRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Danh hiệu eSports / Hextech nổi bật khi click
  const combatTitles = [
    { text: 'CRITICAL STRIKE!', sub: 'CHÍ MẠNG 100%', color: '#00ffcc' },
    { text: 'PENTAKILL!', sub: 'QUÉT SẠCH CHIẾN TRƯỜNG', color: '#ff4757' },
    { text: 'HEXTECH OVERLOAD!', sub: 'QUÁ TẢI NĂNG LƯỢNG', color: '#ffd32a' },
    { text: 'VICTORY!', sub: 'CHIẾN THẮNG TUYỆT ĐỐI', color: '#0be881' },
    { text: 'LEVEL UP: MAX!', sub: 'CƯỜNG HÓA KỸ NĂNG', color: '#4bcffa' },
    { text: 'ACE!', sub: 'HẠ GỤC TOÀN ĐỘI', color: '#ffa801' },
  ];

  // Âm thanh Hextech & Sci-Fi Chime
  const playGamingSfx = (type = 'burst') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'burst') {
        // Tiếng kích nổ năng lượng Hextech (Laser Pulse + Shimmer Crystal)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(650, now);
        osc1.frequency.exponentialRampToValueAtTime(130, now + 0.22);
        gain1.gain.setValueAtTime(0.07, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.25);

        // Chuông điện tử thăng hoa
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1400, now);
        osc2.frequency.exponentialRampToValueAtTime(2400, now + 0.3);
        gain2.gain.setValueAtTime(0.03, now);
        gain2.gain.exponentialRampToValueAtTime(0.0005, now + 0.3);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.3);
      } else if (type === 'toggle') {
        // Tiếng kích hoạt hệ thống Cyber Matrix
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch {
      // Audio optional
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Bảng màu Hextech LoL: Neon Cyan, Vàng kim Hextech, Xanh Lam Điện, Ngọc Lục Bảo, Trắng Tinh Khiết
    const hextechPalette = [
      { r: 0, g: 255, b: 204 },    // Neon Cyan
      { r: 79, g: 172, b: 254 },   // Hextech Electric Blue
      { r: 255, g: 211, b: 42 },   // Piltover Gold
      { r: 0, g: 184, b: 148 },    // Zaun Emerald
      { r: 255, g: 255, b: 255 },  // Pure Nova
    ];

    // ==========================================
    // 1. CÁC HẠT NĂNG LƯỢNG HEXTECH LƠ LỬNG
    // ==========================================
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));
    const motes = [];
    for (let i = 0; i < particleCount; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.4 + 1.0,
        vy: -(Math.random() * 0.6 + 0.2),
        vx: (Math.random() - 0.5) * 0.4,
        color: hextechPalette[Math.floor(Math.random() * hextechPalette.length)],
        pulseSpeed: Math.random() * 0.035 + 0.015,
        phase: Math.random() * Math.PI * 2,
        maxAlpha: Math.random() * 0.55 + 0.3,
        isHex: Math.random() < 0.25, // 25% là ký hiệu hình lục giác ma kỹ
      });
    }

    // ==========================================
    // 2. TƯƠNG TÁC CLICK: SÓNG XUNG KÍCH & TIA LỬA NỔ
    // ==========================================
    const shockwaves = [];
    const burstSparks = [];
    const floatingBadges = [];
    const cursorDust = [];

    // Vẽ hình lục giác (Hexagon)
    const drawHexagon = (context, x, y, r) => {
      context.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const hx = x + Math.cos(a) * r;
        const hy = y + Math.sin(a) * r;
        if (i === 0) context.moveTo(hx, hy);
        else context.lineTo(hx, hy);
      }
      context.closePath();
    };

    const createHextechBurst = (clickX, clickY) => {
      // 1. Sóng xung kích Hextech kép (Cyan + Gold)
      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 6,
        maxRadius: Math.min(width * 0.28, 160),
        alpha: 0.95,
        color: '0, 255, 204',
        width: 3.5,
        isHex: true,
      });
      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 2,
        maxRadius: Math.min(width * 0.22, 120),
        alpha: 0.8,
        color: '255, 211, 42',
        width: 2.2,
        isHex: false,
      });

      // 2. 36 tia năng lượng Hextech nổ tung 360 độ
      const count = 36;
      for (let i = 0; i < count; i++) {
        const rad = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        const speed = Math.random() * 7.0 + 3.0;
        const col = hextechPalette[Math.floor(Math.random() * hextechPalette.length)];
        burstSparks.push({
          x: clickX,
          y: clickY,
          prevX: clickX,
          prevY: clickY,
          vx: Math.cos(rad) * speed,
          vy: Math.sin(rad) * speed,
          color: col,
          size: Math.random() * 2.8 + 1.2,
          life: 1.0,
          decay: Math.random() * 0.025 + 0.016,
          gravity: 0.1,
        });
      }

      // 3. Huy hiệu chiến tích eSports bay lên
      const chosenBadge = combatTitles[Math.floor(Math.random() * combatTitles.length)];
      floatingBadges.push({
        x: clickX,
        y: clickY - 25,
        text: chosenBadge.text,
        sub: chosenBadge.sub,
        color: chosenBadge.color,
        vy: -0.9,
        alpha: 1.0,
        decay: 0.012, // Kéo dài thời gian hiển thị (~1.4s) để nhìn rõ và mãn nhãn
        scale: 0.4,
      });

      playGamingSfx('burst');
    };

    // Auto welcome badge sau 800ms khi vừa vào trang Gaming
    const welcomeTimer = setTimeout(() => {
      shockwaves.push({
        x: width * 0.5,
        y: height * 0.35,
        radius: 8,
        maxRadius: 180,
        alpha: 0.9,
        color: '0, 255, 204',
        width: 3,
        isHex: true,
      });
      floatingBadges.push({
        x: width * 0.5,
        y: height * 0.35,
        text: 'HEXTECH PROTOCOL: ONLINE',
        sub: '⚡ CLICK VÀO MÀN HÌNH ĐỂ KÍCH NỔ CRITICAL STRIKE ⚡',
        color: '#00ffcc',
        vy: -0.6,
        alpha: 1.0,
        decay: 0.009,
        scale: 0.4,
      });
    }, 800);

    const handlePointerDown = (e) => {
      if (e.target && e.target.closest && e.target.closest('.gaming-fx-toggle-btn')) {
        return;
      }
      createHextechBurst(e.clientX, e.clientY);
    };
    window.addEventListener('pointerdown', handlePointerDown);

    // Di chuyển chuột tạo bụi sao Hextech
    const handleMouseMove = (e) => {
      if (Math.random() < 0.45) {
        const col = hextechPalette[Math.floor(Math.random() * hextechPalette.length)];
        cursorDust.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 2.2 + 1.0,
          vx: (Math.random() - 0.5) * 1.4,
          vy: (Math.random() - 0.5) * 1.4 - 0.3,
          color: col,
          life: 1.0,
          decay: Math.random() * 0.035 + 0.02,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ==========================================
    // RENDER LOOP (60 FPS)
    // ==========================================
    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 16.66, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // --- 1. VẼ CÁC HẠT NĂNG LƯỢNG HEXTECH LƠ LỬNG ---
      motes.forEach((m) => {
        m.y += m.vy * dt;
        m.x += (m.vx + Math.sin(time * 0.002 + m.phase) * 0.3) * dt;

        if (m.y < -20) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -20) m.x = width + 10;
        if (m.x > width + 20) m.x = -10;

        const alpha = Math.sin(time * m.pulseSpeed + m.phase) * 0.28 + m.maxAlpha;
        if (alpha <= 0.02) return;

        ctx.save();
        if (m.isHex) {
          // Lục giác ma kỹ Hextech nhỏ lấp lánh
          ctx.strokeStyle = `rgba(${m.color.r}, ${m.color.g}, ${m.color.b}, ${alpha * 0.85})`;
          ctx.lineWidth = 1.2;
          drawHexagon(ctx, m.x, m.y, m.size * 2.8);
          ctx.stroke();
        } else {
          // Hạt phát sáng
          const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size * 3.5);
          glow.addColorStop(0, `rgba(${m.color.r}, ${m.color.g}, ${m.color.b}, ${alpha * 0.9})`);
          glow.addColorStop(0.5, `rgba(${m.color.r}, ${m.color.g}, ${m.color.b}, ${alpha * 0.25})`);
          glow.addColorStop(1, `rgba(${m.color.r}, ${m.color.g}, ${m.color.b}, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size * 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.3)})`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size * 0.65, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // --- 2. VẼ SÓNG XUNG KÍCH HEXTECH (SHOCKWAVES) ---
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += (sw.maxRadius - sw.radius) * 0.16 * dt + 1.5;
        sw.alpha -= 0.024 * dt;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(${sw.color}, ${Math.max(0, sw.alpha)})`;
        ctx.lineWidth = sw.width * sw.alpha;
        ctx.shadowColor = `rgba(${sw.color}, 0.9)`;
        ctx.shadowBlur = 14;

        if (sw.isHex) {
          drawHexagon(ctx, sw.x, sw.y, sw.radius);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // --- 3. VẼ TIA LỬA NỔ TUNG 360 ĐỘ (BURST SPARKS) ---
      for (let b = burstSparks.length - 1; b >= 0; b--) {
        const sp = burstSparks[b];
        sp.prevX = sp.x;
        sp.prevY = sp.y;
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.vx *= 0.93;
        sp.vy *= 0.93;
        sp.vy += sp.gravity * dt;
        sp.life -= sp.decay * dt;

        if (sp.life <= 0) {
          burstSparks.splice(b, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(${sp.color.r}, ${sp.color.g}, ${sp.color.b}, ${sp.life * 0.95})`;
        ctx.lineWidth = sp.size * sp.life;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sp.prevX, sp.prevY);
        ctx.lineTo(sp.x, sp.y);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${sp.life})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * 0.6 * sp.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // --- 4. VẼ HUY HIỆU CHIẾN TÍCH ESPORTS (CRITICAL HIT / PENTAKILL) ---
      for (let f = floatingBadges.length - 1; f >= 0; f--) {
        const badge = floatingBadges[f];
        badge.y += badge.vy * dt;
        badge.alpha -= badge.decay * dt;
        badge.scale = Math.min(1.0, badge.scale + 0.15 * dt);

        if (badge.alpha <= 0) {
          floatingBadges.splice(f, 1);
          continue;
        }

        ctx.save();
        ctx.translate(badge.x, badge.y);
        ctx.scale(badge.scale, badge.scale);

        // Khung nền đen bán trong suốt
        ctx.fillStyle = `rgba(7, 10, 20, ${badge.alpha * 0.85})`;
        ctx.strokeStyle = badge.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = badge.color;
        // Tính toán kích thước hộp linh hoạt theo độ dài chữ
        ctx.font = '900 13px "Orbitron", "Rajdhani", sans-serif';
        const titleW = ctx.measureText(badge.text).width;
        ctx.font = '700 8.5px "Share Tech Mono", monospace';
        const subW = ctx.measureText(badge.sub).width;
        const boxW = Math.max(170, titleW + 36, subW + 28);
        const boxH = 36;

        ctx.beginPath();
        ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        // Tiêu đề
        ctx.font = '900 13px "Orbitron", "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = badge.color;
        ctx.fillText(badge.text, 0, -4);

        // Phụ đề
        ctx.font = '700 8.5px "Share Tech Mono", monospace';
        ctx.fillStyle = `rgba(255, 255, 255, ${badge.alpha * 0.9})`;
        ctx.fillText(badge.sub, 0, 9);
        ctx.restore();
      }

      // --- 5. BỤI SAO CON TRỎ CHUỘT ---
      for (let c = cursorDust.length - 1; c >= 0; c--) {
        const cd = cursorDust[c];
        cd.x += cd.vx * dt;
        cd.y += cd.vy * dt;
        cd.life -= cd.decay * dt;

        if (cd.life <= 0) {
          cursorDust.splice(c, 1);
          continue;
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${cd.color.r}, ${cd.color.g}, ${cd.color.b}, ${cd.life * 0.85})`;
        ctx.arc(cd.x, cd.y, cd.size * cd.life, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      clearTimeout(welcomeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isActive]);

  const handleToggle = () => {
    setIsActive(!isActive);
    playGamingSfx('toggle');
  };

  return (
    <>
      {isActive && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 90,
          }}
        />
      )}

      {/* Nút Toggle Hextech Gaming FX chuẩn eSports */}
      <button
        type="button"
        className="gaming-fx-toggle-btn btn btn-sm rounded-pill d-inline-flex align-items-center gap-2 border-0"
        style={{
          position: 'relative',
          background: isActive
            ? 'linear-gradient(135deg, #00cec9, #0984e3)'
            : 'rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          fontFamily: 'var(--font-gaming-title, "Rajdhani", sans-serif)',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          padding: '5px 13px',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          boxShadow: isActive
            ? '0 0 16px rgba(0, 206, 201, 0.6), 0 3px 10px rgba(0, 0, 0, 0.35)'
            : '0 2px 6px rgba(0, 0, 0, 0.2)',
        }}
        onClick={handleToggle}
        title={isActive ? 'Nhấp để Tắt hiệu ứng Hextech Gaming (Mẹo: Click vào màn hình để kích nổ Critical Strike!)' : 'Bật hiệu ứng Hextech Gaming'}
      >
        <span style={{ fontSize: '0.9rem' }}>{isActive ? '⚡' : '🎮'}</span>
        <span>{isActive ? 'Hextech Gaming FX: BẬT' : 'Gaming FX: Tắt'}</span>
        {isActive && (
          <span
            className="badge rounded-pill bg-dark text-info px-1.5 py-0.5"
            style={{ fontSize: '0.62rem', fontFamily: 'var(--font-gaming-mono, "Share Tech Mono", monospace)' }}
          >
            CRITICAL FX ⚡
          </span>
        )}
      </button>
    </>
  );
}
