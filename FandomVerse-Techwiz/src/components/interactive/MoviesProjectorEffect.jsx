import React, { useEffect, useRef, useState } from 'react';

/**
 * MoviesProjectorEffect - Đỉnh Cao Hiệu Ứng Điện Ảnh Đa Vũ Trụ (PEAK Multiverse Cinema FX)
 * 
 * Tính năng đỉnh cao:
 * 1. Sling Ring Multiverse Portal: Vòng xoáy tàn lửa Doctor Strange quay tròn và bắn tia lửa theo quán tính.
 * 2. Click Nova Shockwave Burst: Chạm/Click bất cứ đâu sẽ tạo sóng xung kích vũ trụ lan tỏa + 36 tàn lửa nổ tung chân thực.
 * 3. Cosmic Meteors: Sao băng điện ảnh lướt vút qua bầu trời vũ trụ với đuôi sáng Anamorphic.
 * 4. 3D Bokeh Depth & Floating Embers: Tàn tro vàng rực và đốm sáng mờ ảo theo chiều sâu quang học chuẩn Hollywood.
 * 5. Tương tác mượt mà 60 FPS, không cản trở nút bấm, tối ưu trên cả PC và Mobile.
 */
export default function MoviesProjectorEffect({ autoStart = true }) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(autoStart);
  const animFrameIdRef = useRef(null);

  // Audio Context Ref
  const audioCtxRef = useRef(null);

  // Âm thanh điện ảnh chân thực (IMAX Sub-Bass + Portal Crystal Shimmer)
  const playCinemaSfx = (type = 'click') => {
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

      if (type === 'toggle') {
        // Âm thanh kích hoạt hệ thống rạp phim IMAX
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(isActive ? 55 : 440, now + 0.4);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'burst') {
        // Âm thanh Nova Shockwave: Tiếng bass rền êm tai + tiếng vút pha lê
        const oscSub = ctx.createOscillator();
        const gainSub = ctx.createGain();
        oscSub.type = 'sine';
        oscSub.frequency.setValueAtTime(90, now);
        oscSub.frequency.exponentialRampToValueAtTime(32, now + 0.35);
        gainSub.gain.setValueAtTime(0.07, now);
        gainSub.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        oscSub.connect(gainSub);
        gainSub.connect(ctx.destination);
        oscSub.start(now);
        oscSub.stop(now + 0.38);

        // Chuông pha lê cao
        const oscHi = ctx.createOscillator();
        const gainHi = ctx.createGain();
        oscHi.type = 'sine';
        oscHi.frequency.setValueAtTime(1200, now);
        oscHi.frequency.exponentialRampToValueAtTime(1800, now + 0.25);
        gainHi.gain.setValueAtTime(0.02, now);
        gainHi.gain.exponentialRampToValueAtTime(0.0005, now + 0.25);
        oscHi.connect(gainHi);
        gainHi.connect(ctx.destination);
        oscHi.start(now);
        oscHi.stop(now + 0.25);
      }
    } catch {
      // Audio is non-blocking enhancement
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

    // Bảng màu điện ảnh chuẩn Hollywood: Gold, Amber Fire, Marvel Crimson, Cosmic Blue, Diamond White
    const palette = [
      { r: 255, g: 195, b: 18 },  // Imperial Gold
      { r: 255, g: 130, b: 0 },   // Fiery Amber
      { r: 255, g: 71, b: 87 },   // Marvel Crimson
      { r: 72, g: 219, b: 251 },  // Multiverse Cyan
      { r: 255, g: 255, b: 255 }, // Nova White
    ];

    // ==========================================
    // 1. TÀN TRO VÀNG RỰC (CINEMATIC FLOATING EMBERS)
    // ==========================================
    const emberCount = Math.min(50, Math.floor(window.innerWidth / 30));
    const embers = [];
    for (let i = 0; i < emberCount; i++) {
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        vy: -(Math.random() * 0.65 + 0.2),
        vx: (Math.random() - 0.5) * 0.35,
        color: palette[Math.floor(Math.random() * (palette.length - 1))],
        pulseSpeed: Math.random() * 0.03 + 0.015,
        phase: Math.random() * Math.PI * 2,
        maxAlpha: Math.random() * 0.55 + 0.35,
      });
    }

    // ==========================================
    // 2. HIỆU ỨNG ĐỐM MỜ BOKEH QUANG HỌC (3D DEPTH)
    // ==========================================
    const bokehCount = Math.min(12, Math.floor(window.innerWidth / 120));
    const bokehOrbs = [];
    for (let i = 0; i < bokehCount; i++) {
      bokehOrbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 38 + 22,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        color: palette[Math.floor(Math.random() * 3)],
        alpha: Math.random() * 0.06 + 0.03,
      });
    }

    // ==========================================
    // 3. VÒNG XOÁY CỔNG ĐA VŨ TRỤ (SLING RING PORTAL)
    // ==========================================
    let portalAngle = 0;
    const portalSparks = [];

    // ==========================================
    // 4. SAO BĂNG ĐIỆN ẢNH (COSMIC SHOOTING STAR)
    // ==========================================
    let shootingStar = null;
    let nextShootingStarTime = performance.now() + 2000;

    // ==========================================
    // 5. NOVA SHOCKWAVES & BURST PARTICLES (TƯƠNG TÁC CLICK)
    // ==========================================
    const shockwaves = [];
    const burstParticles = [];
    const cursorParticles = [];

    // Hàm tạo vụ nổ Nova khi click
    const createNovaBurst = (originX, originY) => {
      // 2 vòng sóng xung kích kép lan tỏa (Vòng ngoài Gold rực rỡ + Vòng trong Cyan năng lượng)
      shockwaves.push({
        x: originX,
        y: originY,
        radius: 6,
        maxRadius: Math.min(width * 0.32, 180),
        alpha: 0.95,
        color: '255, 195, 18',
        width: 4.0,
        speed: 0.18,
      });
      shockwaves.push({
        x: originX,
        y: originY,
        radius: 2,
        maxRadius: Math.min(width * 0.25, 135),
        alpha: 0.85,
        color: '72, 219, 251',
        width: 2.8,
        speed: 0.14,
      });

      // 40 tia lửa nổ tung 360 độ cực đẹp với quán tính và rơi tự nhiên
      const count = 40;
      for (let i = 0; i < count; i++) {
        const rad = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        const speed = Math.random() * 7.5 + 3.2;
        const col = palette[Math.floor(Math.random() * palette.length)];
        burstParticles.push({
          x: originX,
          y: originY,
          prevX: originX,
          prevY: originY,
          vx: Math.cos(rad) * speed,
          vy: Math.sin(rad) * speed,
          color: col,
          life: 1.0,
          decay: Math.random() * 0.02 + 0.014,
          gravity: 0.14,
          size: Math.random() * 2.8 + 1.3,
        });
      }

      playCinemaSfx('burst');
    };

    // Bắt sự kiện click toàn trang
    const handlePointerDown = (e) => {
      // Bỏ qua nếu click trực tiếp vào nút toggle (đã có handler riêng)
      if (e.target && e.target.closest && e.target.closest('.movies-fx-toggle-btn')) {
        return;
      }
      createNovaBurst(e.clientX, e.clientY);
    };
    window.addEventListener('pointerdown', handlePointerDown);

    // Bắt di chuyển chuột để vẽ vệt bụi sao stardust
    const handleMouseMove = (e) => {
      if (Math.random() < 0.5) {
        const col = palette[Math.floor(Math.random() * palette.length)];
        cursorParticles.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          size: Math.random() * 2.2 + 1.0,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.4,
          color: col,
          life: 1.0,
          decay: Math.random() * 0.035 + 0.02,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ==========================================
    // RENDER LOOP (60 FPS CHUẨN HOLLYWOOD)
    // ==========================================
    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 16.66, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // --- LAYER 0: BOKEH DEPTH ORBS ---
      ctx.save();
      bokehOrbs.forEach((b) => {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < -b.radius) b.x = width + b.radius;
        if (b.x > width + b.radius) b.x = -b.radius;
        if (b.y < -b.radius) b.y = height + b.radius;
        if (b.y > height + b.radius) b.y = -b.radius;

        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        g.addColorStop(0, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${b.alpha})`);
        g.addColorStop(0.6, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${b.alpha * 0.4})`);
        g.addColorStop(1, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, 0)`);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // --- LAYER 1: ANAMORPHIC LENS FLARE VỆT NGANG ---
      const flareX = width * (0.35 + 0.3 * Math.sin(time * 0.0004));
      const flareY = height * 0.16;
      const flareWidth = Math.min(width * 0.65, 750);

      const flareGrad = ctx.createLinearGradient(flareX - flareWidth / 2, flareY, flareX + flareWidth / 2, flareY);
      flareGrad.addColorStop(0, 'rgba(72, 219, 251, 0)');
      flareGrad.addColorStop(0.3, 'rgba(72, 219, 251, 0.08)');
      flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.28)');
      flareGrad.addColorStop(0.7, 'rgba(255, 195, 18, 0.12)');
      flareGrad.addColorStop(1, 'rgba(255, 195, 18, 0)');

      ctx.save();
      ctx.fillStyle = flareGrad;
      ctx.fillRect(flareX - flareWidth / 2, flareY - 1, flareWidth, 2);

      // Điểm sáng trung tâm flare
      const centerGlow = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, 22);
      centerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      centerGlow.addColorStop(0.5, 'rgba(72, 219, 251, 0.18)');
      centerGlow.addColorStop(1, 'rgba(72, 219, 251, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(flareX, flareY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- LAYER 2: SLING RING MULTIVERSE PORTAL (DOCTOR STRANGE EFFECT) ---
      // Tọa độ cổng: Góc trên bên phải thanh lịch
      const portalCenter = {
        x: width > 992 ? width * 0.84 : width * 0.5,
        y: width > 992 ? height * 0.26 : height * 0.18,
        radius: width > 768 ? 72 : 52,
      };

      portalAngle += 0.038 * dt;

      // Sinh hạt tàn lửa bắn ra từ vành đai portal
      if (portalSparks.length < 55) {
        for (let k = 0; k < 2; k++) {
          const spawnAngle = portalAngle + (Math.random() - 0.5) * 0.8 + (k * Math.PI);
          const px = portalCenter.x + Math.cos(spawnAngle) * (portalCenter.radius + (Math.random() - 0.5) * 8);
          const py = portalCenter.y + Math.sin(spawnAngle) * (portalCenter.radius + (Math.random() - 0.5) * 8);

          // Vận tốc tiếp tuyến vòng xoay + bắn văng ra ngoài
          const tangent = spawnAngle + Math.PI / 2;
          const tangSpeed = Math.random() * 2.2 + 1.4;
          const radialSpeed = Math.random() * 1.6 + 0.4;

          portalSparks.push({
            x: px,
            y: py,
            prevX: px,
            prevY: py,
            vx: Math.cos(tangent) * tangSpeed + Math.cos(spawnAngle) * radialSpeed,
            vy: Math.sin(tangent) * tangSpeed + Math.sin(spawnAngle) * radialSpeed + 0.15,
            color: palette[Math.random() < 0.6 ? 0 : Math.random() < 0.5 ? 1 : 4],
            life: 1.0,
            decay: Math.random() * 0.035 + 0.022,
            size: Math.random() * 2.2 + 1.1,
          });
        }
      }

      // Vẽ tia sáng sparkler của Portal
      ctx.save();
      for (let i = portalSparks.length - 1; i >= 0; i--) {
        const ps = portalSparks[i];
        ps.prevX = ps.x;
        ps.prevY = ps.y;
        ps.x += ps.vx * dt;
        ps.y += ps.vy * dt;
        ps.vy += 0.04 * dt; // gravity
        ps.life -= ps.decay * dt;

        if (ps.life <= 0) {
          portalSparks.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(${ps.color.r}, ${ps.color.g}, ${ps.color.b}, ${ps.life * 0.9})`;
        ctx.lineWidth = ps.size * ps.life;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ps.prevX, ps.prevY);
        ctx.lineTo(ps.x, ps.y);
        ctx.stroke();

        // Lõi sáng trắng
        ctx.fillStyle = `rgba(255, 255, 255, ${ps.life})`;
        ctx.beginPath();
        ctx.arc(ps.x, ps.y, ps.size * 0.5 * ps.life, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vành hào quang ma thuật mờ ảo của portal
      const ringGrad = ctx.createRadialGradient(
        portalCenter.x, portalCenter.y, portalCenter.radius * 0.8,
        portalCenter.x, portalCenter.y, portalCenter.radius * 1.25
      );
      ringGrad.addColorStop(0, 'rgba(255, 195, 18, 0)');
      ringGrad.addColorStop(0.5, 'rgba(255, 195, 18, 0.14)');
      ringGrad.addColorStop(0.8, 'rgba(255, 130, 0, 0.08)');
      ringGrad.addColorStop(1, 'rgba(255, 130, 0, 0)');

      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.arc(portalCenter.x, portalCenter.y, portalCenter.radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Vành đai lửa ma thuật Sling Ring Doctor Strange quay tròn
      ctx.strokeStyle = 'rgba(255, 195, 18, 0.65)';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#ff9f1a';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(portalCenter.x, portalCenter.y, portalCenter.radius, portalAngle, portalAngle + Math.PI * 1.5);
      ctx.stroke();

      // Vành đai tia phụ đối xứng
      ctx.strokeStyle = 'rgba(255, 71, 87, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(portalCenter.x, portalCenter.y, portalCenter.radius + 3, -portalAngle, -portalAngle + Math.PI);
      ctx.stroke();
      ctx.restore();

      // --- LAYER 3: COSMIC SHOOTING STAR (SAO BĂNG ĐIỆN ẢNH) ---
      if (!shootingStar && time > nextShootingStarTime) {
        shootingStar = {
          x: Math.random() * width * 0.7 + width * 0.3,
          y: Math.random() * (height * 0.25) - 20,
          vx: -(Math.random() * 7 + 10),
          vy: Math.random() * 5 + 6,
          length: Math.random() * 90 + 70,
          life: 1.0,
          color: palette[Math.random() < 0.5 ? 3 : 0],
        };
      }

      if (shootingStar) {
        shootingStar.x += shootingStar.vx * dt;
        shootingStar.y += shootingStar.vy * dt;
        shootingStar.life -= 0.02 * dt;

        const tailX = shootingStar.x - shootingStar.vx * 4.5;
        const tailY = shootingStar.y - shootingStar.vy * 4.5;

        const starGrad = ctx.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
        starGrad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.life * 0.95})`);
        starGrad.addColorStop(0.2, `rgba(${shootingStar.color.r}, ${shootingStar.color.g}, ${shootingStar.color.b}, ${shootingStar.life * 0.7})`);
        starGrad.addColorStop(1, `rgba(${shootingStar.color.r}, ${shootingStar.color.g}, ${shootingStar.color.b}, 0)`);

        ctx.save();
        ctx.strokeStyle = starGrad;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.restore();

        if (shootingStar.life <= 0 || shootingStar.x < -100 || shootingStar.y > height + 100) {
          shootingStar = null;
          nextShootingStarTime = time + Math.random() * 3500 + 2500;
        }
      }

      // --- LAYER 4: FLOATING CINEMATIC EMBERS ---
      embers.forEach((p) => {
        p.y += p.vy * dt;
        p.x += (p.vx + Math.sin(time * 0.0018 + p.phase) * 0.35) * dt;

        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        const alpha = Math.sin(time * p.pulseSpeed + p.phase) * 0.28 + p.maxAlpha;
        if (alpha <= 0.02) return;

        const glowRadius = p.size * 3.4;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        glow.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.85})`);
        glow.addColorStop(0.5, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.25})`);
        glow.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.35)})`;
        ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- LAYER 5: INTERACTIVE NOVA SHOCKWAVES ---
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += (sw.maxRadius - sw.radius) * (sw.speed || 0.16) * dt + 1.5;
        sw.alpha -= 0.024 * dt;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(${sw.color}, ${Math.max(0, sw.alpha)})`;
        ctx.lineWidth = sw.width * sw.alpha;
        ctx.shadowColor = `rgba(${sw.color}, 0.85)`;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // --- LAYER 6: EXPLOSIVE NOVA BURST SPARKS ---
      for (let b = burstParticles.length - 1; b >= 0; b--) {
        const bp = burstParticles[b];
        bp.prevX = bp.x;
        bp.prevY = bp.y;
        bp.x += bp.vx * dt;
        bp.y += bp.vy * dt;
        bp.vx *= 0.94; // Ma sát không khí
        bp.vy *= 0.94;
        bp.vy += bp.gravity * dt; // Trọng lực nhẹ rơi xuống tự nhiên
        bp.life -= bp.decay * dt;

        if (bp.life <= 0) {
          burstParticles.splice(b, 1);
          continue;
        }

        // Vệt sáng theo quán tính
        ctx.save();
        ctx.strokeStyle = `rgba(${bp.color.r}, ${bp.color.g}, ${bp.color.b}, ${bp.life * 0.95})`;
        ctx.lineWidth = bp.size * bp.life;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bp.prevX, bp.prevY);
        ctx.lineTo(bp.x, bp.y);
        ctx.stroke();

        // Đầu tàn lửa lấp lánh
        ctx.fillStyle = `rgba(255, 255, 255, ${bp.life})`;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.size * 0.6 * bp.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // --- LAYER 7: CURSOR STARDUST TRAIL ---
      for (let c = cursorParticles.length - 1; c >= 0; c--) {
        const cp = cursorParticles[c];
        cp.x += cp.vx * dt;
        cp.y += cp.vy * dt;
        cp.life -= cp.decay * dt;

        if (cp.life <= 0) {
          cursorParticles.splice(c, 1);
          continue;
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${cp.color.r}, ${cp.color.g}, ${cp.color.b}, ${cp.life * 0.85})`;
        ctx.arc(cp.x, cp.y, cp.size * cp.life, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isActive]);

  const handleToggle = () => {
    setIsActive(!isActive);
    playCinemaSfx('toggle');
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

      {/* Nút Toggle chuẩn PEAK Điện Ảnh Đa Vũ Trụ */}
      <button
        type="button"
        className="movies-fx-toggle-btn btn btn-sm rounded-pill d-inline-flex align-items-center gap-2 border-0"
        style={{
          position: 'relative',
          background: isActive
            ? 'linear-gradient(135deg, rgba(255, 159, 26, 0.95), rgba(255, 71, 87, 0.95))'
            : 'rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          fontSize: '0.8rem',
          fontWeight: 700,
          padding: '6px 14px',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isActive
            ? '0 0 20px rgba(255, 159, 26, 0.6), 0 4px 14px rgba(0, 0, 0, 0.4)'
            : '0 2px 8px rgba(0, 0, 0, 0.25)',
          letterSpacing: '0.02em',
        }}
        onClick={handleToggle}
        title={isActive ? 'Nhấp để Tắt hiệu ứng Đa Vũ Trụ (Mẹo: Click vào màn hình để kích hoạt Nova Burst)' : 'Bật hiệu ứng Đa Vũ Trụ Điện Ảnh PEAK'}
      >
        <span
          style={{
            display: 'inline-block',
            animation: isActive ? 'spinPortal 3s linear infinite' : 'none',
            fontSize: '0.95rem',
          }}
        >
          {isActive ? '🌌' : '✨'}
        </span>
        <span>
          {isActive ? 'Multiverse Cinema FX: PEAK' : 'Hiệu Ứng Điện Ảnh: Tắt'}
        </span>
        {isActive && (
          <span
            className="badge rounded-pill bg-dark text-warning px-1.5 py-0.5"
            style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}
          >
            CLICK FX ✨
          </span>
        )}
      </button>

      <style>{`
        @keyframes spinPortal {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
