import React, { useEffect, useRef, useState } from 'react';

/**
 * ComicsSpiderWebEffect - Hiệu ứng Tơ Nhện & Siêu Anh Hùng Truyện Tranh Comics Độc Quyền
 * 
 * Tính năng đặc biệt:
 * 1. Web-Shooter Interactive (Bắn tơ nhện tương tác):
 *    Click/chạm bất kỳ đâu trên màn hình để Spider-Man bắn ra một mạng nhện hình học phát sáng đa chiều (Spider-Web),
 *    với các sợi tơ neo (anchor threads) văng tỏa đàn hồi và tơ xoắn ốc (spiral web).
 * 2. Comic Action Onomatopoeia Popups (Chữ tượng thanh siêu anh hùng kinh điển):
 *    Mỗi lần click xuất hiện hiệu ứng nổ sao truyện tranh Comic Starburst kèm các từ Onomatopoeia
 *    huyền thoại của Marvel/DC: THWIP!!, POW!!, BAM!!, WHAM!!, KAPOW!!, BOOM!!, ZAP!!
 * 3. Spider-Sense Waves (Sóng Giác Quan Nhện):
 *    Các gợn sóng giác quan nhện màu đỏ/vàng lấp lánh cảnh báo nguy hiểm tỏa ra từ vị trí click.
 * 4. Ambient Floating Web Strands & Halftone Dust:
 *    Các sợi tơ nhện tơ lụa phát quang và bụi màu comic pop-art trôi nhẹ nhàng trong không gian.
 * 5. Web-Shooter SFX (Âm thanh "THWIP!" chuẩn studio qua Web Audio API không tốn tài nguyên mạng).
 */
export default function ComicsSpiderWebEffect({ autoStart = true }) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(autoStart);
  const [thwipCount, setThwipCount] = useState(0);
  const animFrameIdRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Danh sách từ tượng thanh hành động kinh điển trong truyện tranh Marvel / DC
  const comicWords = [
    { text: 'THWIP!!', sub: 'WEB SHOOT!', color: '#e74c3c', bg: '#f1c40f', borderColor: '#2c3e50' },
    { text: 'POW!!', sub: 'SMASH!', color: '#e67e22', bg: '#ffffff', borderColor: '#c0392b' },
    { text: 'BAM!!', sub: 'IMPACT!', color: '#9b59b6', bg: '#f39c12', borderColor: '#8e44ad' },
    { text: 'WHAM!!', sub: 'STRIKE!', color: '#2980b9', bg: '#f1c40f', borderColor: '#1c5980' },
    { text: 'KAPOW!!', sub: 'CRITICAL!', color: '#c0392b', bg: '#ffffff', borderColor: '#111111' },
    { text: 'BOOM!!', sub: 'EXPLOSION!', color: '#d35400', bg: '#f1c40f', borderColor: '#962d00' },
    { text: 'ZAP!!', sub: 'ENERGY!', color: '#f39c12', bg: '#3498db', borderColor: '#d35400' },
    { text: 'SWOOSH!!', sub: 'SWING!', color: '#16a085', bg: '#ffffff', borderColor: '#0e6655' },
  ];

  // Phát âm thanh THWIP bắn tơ nhện hoặc tiếng Comic Punch qua Web Audio API
  const playWebSound = (type = 'thwip') => {
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

      if (type === 'thwip') {
        // Tiếng bắn tơ Spider-Man "THWIP!!" (Air-compression snap + high-frequency zip)
        // 1. Tiếng xì nén khí áp lực cao
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200, now);
        filter.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
        filter.Q.setValueAtTime(4.0, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.12, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);

        // 2. Tiếng zip vút của sợi tơ phóng đi
        const zipOsc = ctx.createOscillator();
        const zipGain = ctx.createGain();
        zipOsc.type = 'sawtooth';
        zipOsc.frequency.setValueAtTime(800, now);
        zipOsc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
        zipOsc.frequency.exponentialRampToValueAtTime(450, now + 0.16);

        zipGain.gain.setValueAtTime(0.06, now);
        zipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        zipOsc.connect(zipGain);
        zipGain.connect(ctx.destination);
        zipOsc.start(now);
        zipOsc.stop(now + 0.16);
      } else if (type === 'toggle') {
        // Tiếng lật trang comic / kích hoạt tơ
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // Audio optional / graceful degradation
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
    const activeWebs = [];       // Các mạng nhện được bắn ra khi click
    const activeBursts = [];     // Chữ tượng thanh và sao nổ comic
    const ambientThreads = [];   // Các sợi tơ nhện trôi lơ lửng ambient

    // Khởi tạo các sợi tơ nhện ambient nhẹ nhàng
    const threadCount = Math.min(18, Math.floor(window.innerWidth / 90));
    for (let i = 0; i < threadCount; i++) {
      ambientThreads.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 120 + 80,
        angle: Math.random() * Math.PI - Math.PI / 2,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: Math.random() * 0.35 + 0.15,
        curve: Math.random() * 20 - 10,
        curveSpeed: Math.random() * 0.02 + 0.01,
        curvePhase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.35 + 0.15,
      });
    }

    // Hàm tạo 1 mạng nhện Spider-Web tại vị trí click (x, y)
    const createSpiderWeb = (x, y) => {
      const spokes = Math.floor(Math.random() * 3) + 7; // 7 - 9 nan tơ chính
      const maxRadius = Math.random() * 70 + 130;
      const rings = 5; // 5 vòng mạng nhện xoắn ốc

      // Các nan tơ hướng tâm
      const radialSpokes = [];
      for (let i = 0; i < spokes; i++) {
        const baseAngle = (i / spokes) * Math.PI * 2;
        const jitter = (Math.random() - 0.5) * 0.2;
        const angle = baseAngle + jitter;
        radialSpokes.push({
          angle,
          length: maxRadius * (0.8 + Math.random() * 0.4),
        });
      }

      // Các sợi tơ kéo dài neo vào 4 mép màn hình (Spider-Web Slings)
      const slingAnchors = [
        { tx: 0, ty: Math.random() * height },
        { tx: width, ty: Math.random() * height },
        { tx: Math.random() * width, ty: 0 },
        { tx: Math.random() * width, ty: height },
      ];

      activeWebs.push({
        x,
        y,
        radialSpokes,
        rings,
        maxRadius,
        slingAnchors,
        progress: 0,      // Tiến trình bắn tơ: 0 -> 1
        life: 1.0,        // Độ bền: 1 -> 0
        decay: 0.009,     // Tốc độ mờ dần
        spiderSenseRing: 0,
      });

      // Tạo chữ tượng thanh Comic Onomatopoeia
      const wordObj = comicWords[Math.floor(Math.random() * comicWords.length)];
      activeBursts.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y - 50 + (Math.random() - 0.5) * 20,
        text: wordObj.text,
        sub: wordObj.sub,
        color: wordObj.color,
        bg: wordObj.bg,
        borderColor: wordObj.borderColor,
        rotation: (Math.random() - 0.5) * 0.35,
        scale: 0.2,
        targetScale: Math.random() * 0.3 + 0.9,
        life: 1.0,
        decay: 0.016,
      });

      setThwipCount((prev) => prev + 1);
      playWebSound('thwip');
    };

    // Lắng nghe click / touch trên toàn cửa sổ để bắn tơ
    const handlePointerDown = (e) => {
      // Bỏ qua nếu click trực tiếp vào nút bấm hoặc link để tránh cản trở tương tác
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
        createSpiderWeb(clientX, clientY);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    // Vòng lặp Render Canvas 60fps
    let lastTime = performance.now();
    const render = (time) => {
      const dt = Math.min((time - lastTime) / 16.66, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Vẽ các sợi tơ nhện ambient lơ lửng
      ctx.save();
      ambientThreads.forEach((th) => {
        th.curvePhase += th.curveSpeed * dt;
        th.y += th.speedY * dt;
        th.x += th.speedX * dt;

        if (th.y > height + 50) {
          th.y = -50;
          th.x = Math.random() * width;
        }

        const midX = th.x + (Math.cos(th.angle) * th.length) / 2 + Math.sin(th.curvePhase) * th.curve;
        const midY = th.y + (Math.sin(th.angle) * th.length) / 2;
        const endX = th.x + Math.cos(th.angle) * th.length;
        const endY = th.y + Math.sin(th.angle) * th.length;

        ctx.strokeStyle = `rgba(255, 255, 255, ${th.alpha})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(th.x, th.y);
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.stroke();
      });
      ctx.restore();

      // 2. Vẽ các mạng nhện Spider-Web đang kích hoạt
      for (let i = activeWebs.length - 1; i >= 0; i--) {
        const web = activeWebs[i];
        if (web.progress < 1.0) {
          web.progress = Math.min(1.0, web.progress + 0.12 * dt);
        }
        web.life -= web.decay * dt;
        web.spiderSenseRing += 6 * dt;

        if (web.life <= 0) {
          activeWebs.splice(i, 1);
          continue;
        }

        ctx.save();
        const currentAlpha = Math.max(0, web.life * 0.9);

        // Hiệu ứng sóng Spider-Sense lan tỏa
        if (web.spiderSenseRing < 160) {
          const senseAlpha = (1 - web.spiderSenseRing / 160) * web.life * 0.6;
          ctx.strokeStyle = `rgba(255, 71, 87, ${senseAlpha})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(web.x, web.y, web.spiderSenseRing, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = `rgba(254, 202, 87, ${senseAlpha * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(web.x, web.y, Math.max(0, web.spiderSenseRing - 15), 0, Math.PI * 2);
          ctx.stroke();
        }

        // Vẽ các sợi tơ neo bắn ra 4 phía (Web Slings to edges)
        ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.65})`;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#00a8ff';
        ctx.shadowBlur = 8;
        web.slingAnchors.forEach((anc) => {
          const curTx = web.x + (anc.tx - web.x) * web.progress;
          const curTy = web.y + (anc.ty - web.y) * web.progress;
          ctx.beginPath();
          ctx.moveTo(web.x, web.y);
          ctx.lineTo(curTx, curTy);
          ctx.stroke();
        });

        // Vẽ các nan tơ hướng tâm của mạng nhện (Radial Spokes)
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.95})`;
        ctx.lineWidth = 1.5;

        const spokeEnds = [];
        web.radialSpokes.forEach((sp) => {
          const curLen = sp.length * web.progress;
          const endX = web.x + Math.cos(sp.angle) * curLen;
          const endY = web.y + Math.sin(sp.angle) * curLen;
          spokeEnds.push({ x: endX, y: endY, angle: sp.angle, len: curLen });

          ctx.beginPath();
          ctx.moveTo(web.x, web.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        });

        // Vẽ các vòng tơ mạng nhện đồng tâm (Spiral Web Rings)
        if (web.progress > 0.3) {
          const ringProgress = (web.progress - 0.3) / 0.7;
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.85})`;

          for (let r = 1; r <= web.rings; r++) {
            const frac = r / web.rings;
            if (frac > ringProgress) break;

            ctx.beginPath();
            for (let s = 0; s < spokeEnds.length; s++) {
              const curSp = spokeEnds[s];
              const nextSp = spokeEnds[(s + 1) % spokeEnds.length];

              const pt1X = web.x + Math.cos(curSp.angle) * curSp.len * frac;
              const pt1Y = web.y + Math.sin(curSp.angle) * curSp.len * frac;
              const pt2X = web.x + Math.cos(nextSp.angle) * nextSp.len * frac;
              const pt2Y = web.y + Math.sin(nextSp.angle) * nextSp.len * frac;

              // Điểm uốn võng tạo độ chùng sợi tơ tự nhiên
              const midX = (pt1X + pt2X) / 2 + (web.x - (pt1X + pt2X) / 2) * 0.18;
              const midY = (pt1Y + pt2Y) / 2 + (web.y - (pt1Y + pt2Y) / 2) * 0.18;

              if (s === 0) {
                ctx.moveTo(pt1X, pt1Y);
              }
              ctx.quadraticCurveTo(midX, midY, pt2X, pt2Y);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }

        // Tâm mạng nhện phát sáng
        ctx.fillStyle = `rgba(255, 71, 87, ${currentAlpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(web.x, web.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 3. Vẽ chữ Onomatopoeia Comic Starburst Popups
      for (let j = activeBursts.length - 1; j >= 0; j--) {
        const b = activeBursts[j];
        if (b.scale < b.targetScale) {
          b.scale += (b.targetScale - b.scale) * 0.35 * dt;
        }
        b.life -= b.decay * dt;
        b.y -= 0.8 * dt; // Bay nhẹ lên trên

        if (b.life <= 0) {
          activeBursts.splice(j, 1);
          continue;
        }

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rotation);
        ctx.scale(b.scale, b.scale);
        ctx.globalAlpha = Math.max(0, b.life);

        // Vẽ ngôi sao nổ Comic Starburst đa giác
        const numPoints = 14;
        const outerR = 64;
        const innerR = 34;
        ctx.beginPath();
        for (let p = 0; p < numPoints * 2; p++) {
          const r = p % 2 === 0 ? outerR : innerR;
          const a = (p / (numPoints * 2)) * Math.PI * 2;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = b.bg;
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = b.borderColor;
        ctx.stroke();

        // Đổ bóng 3D chữ phong cách Marvel
        ctx.font = '900 24px "Bangers", "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Lớp bóng đen 3D
        ctx.fillStyle = '#111111';
        ctx.fillText(b.text, 3, 3);

        // Lớp chữ chính
        ctx.fillStyle = b.color;
        ctx.fillText(b.text, 0, 0);

        // Viền chữ đậm
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#ffffff';
        ctx.strokeText(b.text, 0, 0);

        ctx.restore();
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
    playWebSound('toggle');
  };

  return (
    <>
      {/* Nút điều khiển Spider-Web FX nổi bật trên Hero Banner */}
      <button
        type="button"
        className={`badge rounded-pill px-3 py-1 text-white small d-inline-flex align-items-center gap-1.5 border-0 fv-comics-fx-badge ${
          isActive ? 'active' : ''
        }`}
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
            : 'rgba(255, 255, 255, 0.15)',
          boxShadow: isActive
            ? '0 0 16px rgba(231, 76, 60, 0.65), 0 2px 8px rgba(0,0,0,0.4)'
            : 'none',
          backdropFilter: 'blur(8px)',
          border: isActive ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          fontWeight: 700,
          letterSpacing: '0.4px',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={toggleActive}
        title="Nhấp để Bật/Tắt hiệu ứng Bắn Tơ Nhện & Onomatopoeia Comic FX"
      >
        <span style={{ fontSize: '1rem' }}>🕷️</span>
        <span>{isActive ? 'Spider-Web FX: BẬT' : 'Spider-Web FX: TẮT'}</span>
        {isActive && (
          <span
            className="badge rounded-pill bg-warning text-dark px-1.5 py-0.5 fw-bold ms-1"
            style={{ fontSize: '0.62rem', letterSpacing: '0.2px' }}
          >
            {thwipCount > 0 ? `${thwipCount} THWIP!` : 'CLICK BẮN TƠ!'}
          </span>
        )}
      </button>

      {/* Canvas tương tác toàn màn hình (Pointer-events: none để không cản trở cuộn trang) */}
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
