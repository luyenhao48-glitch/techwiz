import React, { useEffect, useRef, useState } from 'react';

/**
 * KpopIdolStageEffect - Hiệu ứng Sân Khấu K-Pop Comeback Stage & Hologram Lightstick Độc Quyền
 * 
 * Tính năng đặc biệt:
 * 1. Interactive Holographic Heart Burst (Bắn tim & Nốt nhạc Hologram):
 *    Click/chạm bất cứ đâu trên màn hình để bắn ra chùm trái tim Neon Hologram 3D,
 *    nốt nhạc phát sáng (♪ ♫ ♬), và dải kim tuyến ruy băng concert (Stage Confetti Streamers).
 * 2. Lightstick Concert Ocean Waves (Biển Lightstick đồng bộ nhịp điệu):
 *    Các chùm sáng lightstick đa sắc (Hồng Blink, Tím ARMY, Xanh Bunnies, Vàng Ánh Kim)
 *    chuyển động lượn sóng nhịp nhàng như trong đại nhạc hội quốc tế.
 * 3. Moving-Head Stage Spotlight (Ánh đèn sân khấu quét đa sắc):
 *    Các chùm ánh sáng gradient quét nhẹ tạo chiều sâu như đang xem live stage tại concert.
 * 4. K-Pop Idol Shimmer Audio (Âm thanh chuông ngân Shimmer Bell & Bass Kick nhẹ qua Web Audio API).
 */
export default function KpopIdolStageEffect({ autoStart = true }) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(autoStart);
  const [cheerCount, setCheerCount] = useState(0);
  const animFrameIdRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Bảng màu Hologram thời thượng chuẩn K-Pop Y2K / Cyber Stage
  const kpopPalettes = [
    { name: 'Pink Venom', primary: '#ff5ba8', secondary: '#ff8ac6', glow: 'rgba(255, 91, 168, 0.7)' },
    { name: 'Borahae Purple', primary: '#a06cff', secondary: '#c49bff', glow: 'rgba(160, 108, 255, 0.7)' },
    { name: 'Hype Blue', primary: '#4fd8ff', secondary: '#94e8ff', glow: 'rgba(79, 216, 255, 0.7)' },
    { name: 'Champagne Gold', primary: '#ffd66b', secondary: '#ffe8a3', glow: 'rgba(255, 214, 107, 0.7)' },
  ];

  // Phát âm thanh Shimmer Chime & Synth Chime ngọt ngào chuẩn K-Pop Pop-Drop
  const playIdolSound = (type = 'cheer') => {
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

      if (type === 'cheer') {
        // Hợp âm Arpeggio chuông gió lấp lánh (Shimmer Bell Chime)
        const freqs = [659.25, 830.61, 987.77, 1318.51, 1661.22]; // E5, G#5, B5, E6, G#6 (Hợp âm E Major rực rỡ)
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.035);

          gain.gain.setValueAtTime(0.045, now + idx * 0.035);
          gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.035 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.035);
          osc.stop(now + idx * 0.035 + 0.35);
        });

        // Âm bass kick nhẹ êm ái
        const kick = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(140, now);
        kick.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        kickGain.gain.setValueAtTime(0.08, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        kick.connect(kickGain);
        kickGain.connect(ctx.destination);
        kick.start(now);
        kick.stop(now + 0.12);
      } else if (type === 'toggle') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
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

    // Mảng lưu trữ các hiệu ứng động
    const burstHearts = [];     // Trái tim Neon & Nốt nhạc bắn ra
    const stageStreamers = [];  // Dải kim tuyến ruy băng concert
    const pulseRings = [];      // Vòng hào quang Lightstick
    const oceanOrbs = [];       // Biển lightstick lượn sóng ambient

    // Khởi tạo biển lightstick ambient (Lightstick Ocean)
    const orbCount = Math.min(48, Math.floor(window.innerWidth / 28));
    for (let i = 0; i < orbCount; i++) {
      const pal = kpopPalettes[Math.floor(Math.random() * kpopPalettes.length)];
      oceanOrbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        radius: Math.random() * 3 + 2,
        speedY: Math.random() * 0.45 + 0.2,
        waveAngle: Math.random() * Math.PI * 2,
        waveSpeed: Math.random() * 0.02 + 0.008,
        waveAmp: Math.random() * 25 + 10,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
        color: pal.primary,
        glowColor: pal.glow,
      });
    }

    // Hàm vẽ hình Trái Tim (Bezier Heart)
    const drawHeart = (cx, cy, size, color, alpha, rotation = 0) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.scale(size / 20, size / 20);
      ctx.globalAlpha = Math.max(0, alpha);

      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.bezierCurveTo(-12, -8, -20, 8, 0, 20);
      ctx.bezierCurveTo(20, 8, 12, -8, 0, 5);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fill();

      // Tâm phát sáng trắng
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.restore();
    };

    // Hàm tạo vụ nổ Thả Tim & Nốt Nhạc K-Pop khi click
    const createStageCheer = (x, y) => {
      const heartCount = Math.floor(Math.random() * 4) + 8; // 8 - 11 trái tim
      const noteSymbols = ['♪', '♫', '♬', '✨', '💖'];

      // 1. Tạo các trái tim bắn ra xung quanh
      for (let i = 0; i < heartCount; i++) {
        const pal = kpopPalettes[Math.floor(Math.random() * kpopPalettes.length)];
        const angle = (i / heartCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 5 + 3.5;

        burstHearts.push({
          type: 'heart',
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5, // Nẩy lên trên
          gravity: 0.12,
          size: Math.random() * 10 + 14,
          color: pal.primary,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1,
          life: 1.0,
          decay: Math.random() * 0.015 + 0.015,
        });
      }

      // 2. Tạo nốt nhạc & biểu tượng thần tượng
      for (let k = 0; k < 4; k++) {
        const pal = kpopPalettes[Math.floor(Math.random() * kpopPalettes.length)];
        const symbol = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;

        burstHearts.push({
          type: 'symbol',
          symbol,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3.0,
          gravity: 0.08,
          fontSize: Math.random() * 8 + 18,
          color: pal.primary,
          life: 1.0,
          decay: Math.random() * 0.012 + 0.012,
        });
      }

      // 3. Tạo dải kim tuyến ruy băng concert rơi uốn lượn (Streamers)
      for (let s = 0; s < 6; s++) {
        const pal = kpopPalettes[Math.floor(Math.random() * kpopPalettes.length)];
        stageStreamers.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 6 - 3,
          gravity: 0.14,
          length: Math.random() * 30 + 20,
          width: Math.random() * 3 + 2,
          color: pal.primary,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.15,
          life: 1.0,
          decay: 0.014,
        });
      }

      // 4. Vòng sóng ánh sáng Lightstick Pulse
      pulseRings.push({
        x,
        y,
        radius: 5,
        maxRadius: 140,
        speed: 5.5,
        color: kpopPalettes[Math.floor(Math.random() * kpopPalettes.length)].primary,
        life: 1.0,
      });

      setCheerCount((prev) => prev + 1);
      playIdolSound('cheer');
    };

    // Lắng nghe pointer click
    const handlePointerDown = (e) => {
      if (
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.closest('input') ||
        e.target.closest('select') ||
        e.target.closest('.modal')
      ) {
        return;
      }
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
      if (clientX !== undefined && clientY !== undefined) {
        createStageCheer(clientX, clientY);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    // Vòng lặp Render 60fps
    let lastTime = performance.now();
    const render = (time) => {
      const dt = Math.min((time - lastTime) / 16.66, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Vẽ Biển Lightstick Ocean trôi bồng bềnh
      oceanOrbs.forEach((orb) => {
        orb.waveAngle += orb.waveSpeed * dt;
        orb.pulsePhase += orb.pulseSpeed * dt;
        orb.y -= orb.speedY * dt;
        orb.x = orb.baseX + Math.sin(orb.waveAngle) * orb.waveAmp;

        if (orb.y < -20) {
          orb.y = height + 20;
          orb.baseX = Math.random() * width;
        }

        const twinkle = (Math.sin(orb.pulsePhase) + 1) / 2;
        const currentR = orb.radius * (0.8 + twinkle * 0.5);

        // Hào quang tỏa sáng của lightstick
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, currentR * 4);
        grad.addColorStop(0, orb.glowColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentR * 4, 0, Math.PI * 2);
        ctx.fill();

        // Điểm sáng trung tâm
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentR * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Vẽ vòng sóng ánh sáng Lightstick Pulse
      for (let p = pulseRings.length - 1; p >= 0; p--) {
        const ring = pulseRings[p];
        ring.radius += ring.speed * dt;
        ring.life = Math.max(0, 1 - ring.radius / ring.maxRadius);

        if (ring.radius >= ring.maxRadius || ring.life <= 0) {
          pulseRings.splice(p, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = ring.life * 0.7;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Vẽ các dải ruy băng kim tuyến Concert Streamers
      for (let s = stageStreamers.length - 1; s >= 0; s--) {
        const st = stageStreamers[s];
        st.x += st.vx * dt;
        st.y += st.vy * dt;
        st.vy += st.gravity * dt;
        st.vx *= 0.98;
        st.angle += st.rotSpeed * dt;
        st.life -= st.decay * dt;

        if (st.life <= 0 || st.y > height + 50) {
          stageStreamers.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.translate(st.x, st.y);
        ctx.rotate(st.angle);
        ctx.globalAlpha = Math.max(0, st.life);
        ctx.fillStyle = st.color;
        ctx.shadowColor = st.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(-st.length / 2, -st.width / 2, st.length, st.width);
        ctx.restore();
      }

      // 4. Vẽ Trái Tim Neon & Nốt Nhạc bùng nổ
      for (let h = burstHearts.length - 1; h >= 0; h--) {
        const b = burstHearts[h];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vy += b.gravity * dt;
        b.vx *= 0.985;
        b.life -= b.decay * dt;

        if (b.life <= 0 || b.y > height + 50) {
          burstHearts.splice(h, 1);
          continue;
        }

        if (b.type === 'heart') {
          b.rotation += b.rotSpeed * dt;
          drawHeart(b.x, b.y, b.size, b.color, b.life, b.rotation);
        } else if (b.type === 'symbol') {
          ctx.save();
          ctx.font = `bold ${b.fontSize}px "Unbounded", "Poppins", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = Math.max(0, b.life);
          ctx.fillStyle = b.color;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 12;
          ctx.fillText(b.symbol, b.x, b.y);
          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isActive]);

  const toggleActive = () => {
    const next = !isActive;
    setIsActive(next);
    playIdolSound('toggle');
  };

  return (
    <>
      {/* Nút điều khiển Idol Stage FX nổi bật trên Hero Banner */}
      <button
        type="button"
        className={`badge rounded-pill px-3 py-1 text-white small d-inline-flex align-items-center gap-1.5 border-0 fv-kpop-stage-badge ${
          isActive ? 'active' : ''
        }`}
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #ff5ba8 0%, #a06cff 100%)'
            : 'rgba(255, 255, 255, 0.15)',
          boxShadow: isActive
            ? '0 0 18px rgba(255, 91, 168, 0.65), 0 2px 8px rgba(0,0,0,0.4)'
            : 'none',
          backdropFilter: 'blur(8px)',
          border: isActive ? '1px solid rgba(255, 255, 255, 0.45)' : '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          fontWeight: 700,
          letterSpacing: '0.4px',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={toggleActive}
        title="Nhấp để Bật/Tắt hiệu ứng Thả Tim Neon & Biển Lightstick K-Pop Comeback Stage"
      >
        <span style={{ fontSize: '1.05rem' }}>💖</span>
        <span>{isActive ? 'Idol Stage FX: BẬT' : 'Idol Stage FX: TẮT'}</span>
        {isActive && (
          <span
            className="badge rounded-pill bg-light text-dark px-1.5 py-0.5 fw-bold ms-1"
            style={{ fontSize: '0.62rem', letterSpacing: '0.2px' }}
          >
            {cheerCount > 0 ? `${cheerCount} CHEERS! ❤️` : 'CLICK THẢ TIM!'}
          </span>
        )}
      </button>

      {/* Canvas toàn màn hình */}
      {isActive && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1040,
          }}
        />
      )}
    </>
  );
}
