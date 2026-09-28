import React, { useEffect, useRef, useState } from 'react';

/**
 * MangaActionEffect - Hiệu ứng Truyện Tranh Manga Shonen Độc Quyền (Shūchūsen & Onomatopoeia FX)
 * 
 * Tính năng đặc biệt:
 * 1. Katana Ink Slash & Comic Star Impact: Click/chạm bất cứ đâu để tung nhát chém mực Katana siêu tốc,
 *    kèm ngôi sao va chạm manga và hiệu ứng chữ tượng thanh Onomatopoeia kinh điển (ドンッ, ズバッ, ドドド, SLASH!!).
 * 2. Manga Speed Lines (Shūchūsen - 集中線): Các đường kẻ tốc độ hành động kịch tính chuẩn Shonen Jump.
 * 3. Chữ tượng thanh lơ lửng (Floating Manga SFX): Các ký tự âm thanh tiếng Nhật huyền thoại (ドドドド, ゴゴゴゴ, ドキドキ).
 * 4. Hạt mực Sumi-e & Ink Splatters: Các giọt mực đen và đỏ manga bắn tóe chân thực theo quán tính.
 * 5. Âm thanh chém Katana (Manga Sword Slash SFX) chân thực qua Web Audio API.
 */
export default function MangaActionEffect({ autoStart = true }) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(autoStart);
  const animFrameIdRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Danh sách chữ tượng thanh Onomatopoeia kinh điển trong Manga Shonen
  const mangaSFXList = [
    { text: 'ドンッ!!', sub: 'DON!!', color: '#ff3838' },     // Va chạm cực mạnh, xuất hiện chấn động
    { text: 'ズバッ!!', sub: 'ZUBA!!', color: '#ff9f1a' },    // Nhát chém Katana sắc bén
    { text: 'ドドドド', sub: 'DODODO', color: '#e84118' },    // Áp lực sấm sét, JoJo Menacing
    { text: 'バァァン!!', sub: 'BAAAN!!', color: '#0984e3' },  // Vụ nổ hoành tráng
    { text: 'ゴゴゴゴ', sub: 'GOGOGO', color: '#8c7ae6' },    // Khí chất đe dọa, rung chuyển
    { text: 'SLASH!!', sub: '斬', color: '#ff4757' },         // Nhát chém kiếm
    { text: 'BOOM!!', sub: '轟', color: '#ffa502' },          // Nổ lớn
    { text: 'BAM!!', sub: '撃', color: '#2ed573' },           // Đòn tấn công mãnh liệt
  ];

  // Âm thanh chém kiếm Katana & Lật trang truyện manga chuẩn Studio
  const playMangaSfx = (type = 'slash') => {
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

      if (type === 'slash') {
        // Tiếng vút gió xé không khí của nhát chém Katana (Blade Whoosh + Metal Ring)
        // 1. Tiếng gió vút
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);

        // 2. Tiếng đanh thép kiếm vang (Steel ring chime)
        const steel = ctx.createOscillator();
        const steelGain = ctx.createGain();
        steel.type = 'sine';
        steel.frequency.setValueAtTime(1800, now);
        steel.frequency.exponentialRampToValueAtTime(3200, now + 0.25);
        steelGain.gain.setValueAtTime(0.04, now);
        steelGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.25);
        steel.connect(steelGain);
        steelGain.connect(ctx.destination);
        steel.start(now);
        steel.stop(now + 0.25);
      } else if (type === 'toggle') {
        // Tiếng lật sách truyện Manga
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
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

    // ==========================================
    // 1. CHỮ TƯỢNG THANH LƠ LỬNG (AMBIENT MANGA SFX)
    // ==========================================
    const floatingSFX = [];
    const ambientSFXTexts = ['ドドドド', 'ゴゴゴゴ', 'ドキドキ', 'シーン', 'ザワ…'];
    const sfxCount = Math.min(6, Math.floor(window.innerWidth / 220));

    for (let i = 0; i < sfxCount; i++) {
      floatingSFX.push({
        x: Math.random() * width,
        y: Math.random() * height,
        text: ambientSFXTexts[Math.floor(Math.random() * ambientSFXTexts.length)],
        vy: -(Math.random() * 0.45 + 0.15),
        vx: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 10 + 18,
        alpha: Math.random() * 0.25 + 0.15,
        rotation: (Math.random() - 0.5) * 0.3,
        rotSpeed: (Math.random() - 0.5) * 0.008,
      });
    }

    // ==========================================
    // 2. GIỌT MỰC SUMI-E & HẠT TÀN MỰC
    // ==========================================
    const inkDrops = [];
    const dropCount = Math.min(30, Math.floor(window.innerWidth / 45));
    for (let i = 0; i < dropCount; i++) {
      inkDrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        vy: -(Math.random() * 0.5 + 0.2),
        vx: (Math.random() - 0.5) * 0.3,
        color: Math.random() < 0.25 ? '#ff3838' : '#ffffff',
        alpha: Math.random() * 0.45 + 0.2,
      });
    }

    // ==========================================
    // 3. DANH SÁCH NHÁT CHÉM KATANA & COMIC IMPACT
    // ==========================================
    const slashes = [];
    const impactStars = [];
    const burstInks = [];

    // Hàm tạo nhát chém Katana siêu tốc khi click
    const createMangaSlash = (clickX, clickY) => {
      // Góc chém chéo ngẫu nhiên chuẩn anime katana
      const angle = (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 4 + (Math.random() - 0.5) * 0.3);
      const length = Math.min(width * 0.45, 340);

      // Điểm bắt đầu và kết thúc của đường chém
      const startX = clickX - Math.cos(angle) * (length * 0.6);
      const startY = clickY - Math.sin(angle) * (length * 0.6);
      const endX = clickX + Math.cos(angle) * (length * 0.4);
      const endY = clickY + Math.sin(angle) * (length * 0.4);

      // Nhát chém katana
      slashes.push({
        startX,
        startY,
        endX,
        endY,
        clickX,
        clickY,
        life: 1.0,
        decay: 0.045,
        width: Math.random() * 3.5 + 3.0,
        color: Math.random() < 0.3 ? '#ff3838' : '#ffffff',
      });

      // Ngôi sao va chạm Manga Comic Star
      const randomSFX = mangaSFXList[Math.floor(Math.random() * mangaSFXList.length)];
      impactStars.push({
        x: clickX,
        y: clickY,
        radius: 0,
        maxRadius: Math.random() * 25 + 45,
        points: Math.floor(Math.random() * 4) + 8,
        sfx: randomSFX,
        life: 1.0,
        decay: 0.03,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
      });

      // 30 giọt mực bắn tung tóe theo nhát chém
      for (let i = 0; i < 30; i++) {
        const rad = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6.5 + 2.5;
        burstInks.push({
          x: clickX,
          y: clickY,
          prevX: clickX,
          prevY: clickY,
          vx: Math.cos(rad) * speed,
          vy: Math.sin(rad) * speed,
          size: Math.random() * 2.8 + 1.2,
          color: Math.random() < 0.35 ? '#ff3838' : '#ffffff',
          life: 1.0,
          decay: Math.random() * 0.03 + 0.02,
          gravity: 0.12,
        });
      }

      playMangaSfx('slash');
    };

    const handlePointerDown = (e) => {
      if (e.target && e.target.closest && e.target.closest('.manga-fx-toggle-btn')) {
        return;
      }
      createMangaSlash(e.clientX, e.clientY);
    };
    window.addEventListener('pointerdown', handlePointerDown);

    // ==========================================
    // RENDER LOOP MANGA (60 FPS)
    // ==========================================
    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 16.66, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // --- 1. VẼ CÁC GIỌT MỰC LƠ LỬNG ---
      inkDrops.forEach((drop) => {
        drop.y += drop.vy * dt;
        drop.x += drop.vx * dt;

        if (drop.y < -10) {
          drop.y = height + 10;
          drop.x = Math.random() * width;
        }
        if (drop.x < -10) drop.x = width + 10;
        if (drop.x > width + 10) drop.x = -10;

        ctx.beginPath();
        ctx.fillStyle = drop.color === '#ff3838'
          ? `rgba(255, 56, 56, ${drop.alpha})`
          : `rgba(255, 255, 255, ${drop.alpha})`;
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- 2. VẼ CHỮ TƯỢNG THANH LƠ LỬNG (AMBIENT MANGA SFX) ---
      floatingSFX.forEach((sfx) => {
        sfx.y += sfx.vy * dt;
        sfx.x += sfx.vx * dt;
        sfx.rotation += sfx.rotSpeed * dt;

        if (sfx.y < -50) {
          sfx.y = height + 40;
          sfx.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(sfx.x, sfx.y);
        ctx.rotate(sfx.rotation);
        ctx.font = `900 ${sfx.size}px "Dela Gothic One", "Bangers", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Viền đen truyện tranh
        ctx.strokeStyle = `rgba(17, 20, 26, ${sfx.alpha * 0.9})`;
        ctx.lineWidth = 3.5;
        ctx.strokeText(sfx.text, 0, 0);

        // Chữ trắng
        ctx.fillStyle = `rgba(255, 255, 255, ${sfx.alpha})`;
        ctx.fillText(sfx.text, 0, 0);
        ctx.restore();
      });

      // --- 3. VẼ NHÁT CHÉM KATANA (KATANA SLASH) ---
      for (let i = slashes.length - 1; i >= 0; i--) {
        const s = slashes[i];
        s.life -= s.decay * dt;

        if (s.life <= 0) {
          slashes.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.lineCap = 'round';

        // Ánh sáng loé ngoài (Glow)
        ctx.strokeStyle = s.color === '#ff3838'
          ? `rgba(255, 56, 56, ${s.life * 0.6})`
          : `rgba(255, 255, 255, ${s.life * 0.5})`;
        ctx.lineWidth = s.width * 2.8 * s.life;
        ctx.shadowColor = s.color === '#ff3838' ? '#ff3838' : '#ffffff';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(s.startX, s.startY);
        ctx.lineTo(s.endX, s.endY);
        ctx.stroke();

        // Lõi kiếm sắc bén màu trắng
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.life * 0.95})`;
        ctx.lineWidth = s.width * s.life;
        ctx.beginPath();
        ctx.moveTo(s.startX, s.startY);
        ctx.lineTo(s.endX, s.endY);
        ctx.stroke();
        ctx.restore();
      }

      // --- 4. VẼ NGÔI SAO VA CHẠM MANGA & CHỮ ONOMATOPOEIA ---
      for (let i = impactStars.length - 1; i >= 0; i--) {
        const star = impactStars[i];
        star.radius += (star.maxRadius - star.radius) * 0.22 * dt + 1.2;
        star.rotation += star.rotSpeed * dt;
        star.life -= star.decay * dt;

        if (star.life <= 0) {
          impactStars.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.rotation);

        // Vẽ ngôi sao va chạm nhọn (Comic Burst Star)
        const pts = star.points;
        const outerR = star.radius;
        const innerR = star.radius * 0.45;

        ctx.beginPath();
        for (let p = 0; p < pts * 2; p++) {
          const r = p % 2 === 0 ? outerR : innerR;
          const a = (p / (pts * 2)) * Math.PI * 2;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Nền ngôi sao vàng cam / trắng manga
        ctx.fillStyle = `rgba(255, 242, 0, ${star.life * 0.85})`;
        ctx.fill();

        // Viền đen đậm chất manga
        ctx.strokeStyle = `rgba(17, 20, 26, ${star.life * 0.95})`;
        ctx.lineWidth = 3.0;
        ctx.stroke();

        // Vẽ chữ âm thanh Onomatopoeia ở giữa ngôi sao
        ctx.rotate(-star.rotation); // Giữ chữ thăng bằng dễ đọc
        ctx.font = `900 ${Math.min(32, star.radius * 0.65)}px "Dela Gothic One", "Bangers", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Viền chữ đen dày
        ctx.strokeStyle = `rgba(17, 20, 26, ${star.life})`;
        ctx.lineWidth = 4.5;
        ctx.strokeText(star.sfx.text, 0, -4);

        // Ruột chữ đỏ rực hoặc cam
        ctx.fillStyle = star.sfx.color;
        ctx.fillText(star.sfx.text, 0, -4);

        // Subtitle tiếng anh / romaji nhỏ bên dưới
        ctx.font = `700 11px "Bangers", sans-serif`;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.life * 0.9})`;
        ctx.fillText(star.sfx.sub, 0, 14);

        ctx.restore();
      }

      // --- 5. VẼ GIỌT MỰC BẮN TOÉ (BURST INK PARTICLES) ---
      for (let i = burstInks.length - 1; i >= 0; i--) {
        const ink = burstInks[i];
        ink.prevX = ink.x;
        ink.prevY = ink.y;
        ink.x += ink.vx * dt;
        ink.y += ink.vy * dt;
        ink.vx *= 0.92;
        ink.vy *= 0.92;
        ink.vy += ink.gravity * dt;
        ink.life -= ink.decay * dt;

        if (ink.life <= 0) {
          burstInks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = ink.color === '#ff3838'
          ? `rgba(255, 56, 56, ${ink.life * 0.9})`
          : `rgba(255, 255, 255, ${ink.life * 0.9})`;
        ctx.lineWidth = ink.size * ink.life;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ink.prevX, ink.prevY);
        ctx.lineTo(ink.x, ink.y);
        ctx.stroke();
        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isActive]);

  const handleToggle = () => {
    setIsActive(!isActive);
    playMangaSfx('toggle');
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

      {/* Nút Toggle hiệu ứng Manga Shonen độc quyền */}
      <button
        type="button"
        className="manga-fx-toggle-btn btn btn-sm rounded-pill d-inline-flex align-items-center gap-2 border-0"
        style={{
          position: 'relative',
          background: isActive
            ? 'linear-gradient(135deg, #e17055, #d63031)'
            : 'rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          fontFamily: 'var(--font-manga-title, "Dela Gothic One", sans-serif)',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          padding: '5px 13px',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          boxShadow: isActive
            ? '0 0 16px rgba(225, 112, 85, 0.6), 0 3px 10px rgba(0, 0, 0, 0.35)'
            : '0 2px 6px rgba(0, 0, 0, 0.2)',
        }}
        onClick={handleToggle}
        title={isActive ? 'Nhấp để Tắt hiệu ứng Manga (Mẹo: Chạm/Click bất cứ đâu để chém Katana & kích hoạt SFX!)' : 'Bật hiệu ứng Manga Shonen'}
      >
        <span style={{ fontSize: '0.9rem' }}>{isActive ? '⚡' : '📖'}</span>
        <span>{isActive ? 'Manga Action FX: BẬT' : 'Manga FX: Tắt'}</span>
        {isActive && (
          <span
            className="badge rounded-pill bg-black text-warning px-1.5 py-0.5"
            style={{ fontSize: '0.62rem', fontFamily: 'var(--font-manga-display, "Bangers", cursive)' }}
          >
            SLASH & ドンッ!
          </span>
        )}
      </button>
    </>
  );
}
