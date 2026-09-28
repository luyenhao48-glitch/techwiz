import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * DragonFireEmbersEffect - Hiệu ứng Tàn Lửa Rồng & Hơi Thở Rồng (House of the Dragon)
 * Cực đỉnh (PEAK):
 * 1. Rising Dragon Embers & Sparks với ánh sáng động và đuôi lửa (Glowing Embers).
 * 2. Phun lửa Dracarys bùng nổ khi click màn hình hoặc click nút "Phun Lửa Rồng (Dracarys)".
 * 3. Hợp âm gầm rồng Sub-bass & tiếng lửa cháy xèo xèo chân thực qua Web Audio API.
 * 4. Chữ cổ Valyrian "DRACARYS!" & "FIRE & BLOOD" bay lượn với hiệu ứng phát quang.
 */
export default function DragonFireEmbersEffect({ autoStart = true }) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(autoStart);
  const [burstCount, setBurstCount] = useState(0);
  const animFrameIdRef = useRef(null);
  const audioCtxRef = useRef(null);
  const triggerRef = useRef(null);

  // Bảng màu ngọn lửa House Targaryen
  const fireColors = [
    { primary: '#ff3838', glow: 'rgba(255, 56, 56, 0.9)', name: 'Ruby Flame' },
    { primary: '#ff9f1a', glow: 'rgba(255, 159, 26, 0.9)', name: 'Ember Gold' },
    { primary: '#ff5252', glow: 'rgba(255, 82, 82, 0.9)', name: 'Dragon Blood' },
    { primary: '#ffd32a', glow: 'rgba(255, 211, 42, 0.95)', name: 'Sunfyre Gold' },
    { primary: '#ff793f', glow: 'rgba(255, 121, 63, 0.9)', name: 'Caraxes Orange' },
  ];

  // Phát âm thanh tiếng lửa rồng bùng cháy & tiếng gầm sub-bass qua Web Audio API
  const playDragonRoarSound = useCallback((type = 'dracarys') => {
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

      if (type === 'dracarys') {
        // 1. Tiếng gầm sub-bass trầm sâu (Dragon Chest Rumble)
        const rumble = ctx.createOscillator();
        const rumbleGain = ctx.createGain();
        rumble.type = 'sawtooth';
        rumble.frequency.setValueAtTime(70, now);
        rumble.frequency.exponentialRampToValueAtTime(28, now + 0.65);

        // Filter âm trầm
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);
        filter.frequency.exponentialRampToValueAtTime(60, now + 0.65);

        rumbleGain.gain.setValueAtTime(0.12, now);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        rumble.connect(filter);
        filter.connect(rumbleGain);
        rumbleGain.connect(ctx.destination);

        rumble.start(now);
        rumble.stop(now + 0.65);

        // 2. Tiếng lửa bùng cháy xèo xèo (Flame Breath Whoosh & Crackle)
        const bufferSize = ctx.sampleRate * 0.55;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(850, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(240, now + 0.55);
        noiseFilter.Q.setValueAtTime(3.0, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.09, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        whiteNoise.start(now);
        whiteNoise.stop(now + 0.55);
      } else if (type === 'toggle') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.2);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio optional
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Danh sách các tàn tro bay lượn (Ambient Floating Embers)
    const emberCount = 65;
    const embers = [];
    for (let i = 0; i < emberCount; i++) {
      const col = fireColors[Math.floor(Math.random() * fireColors.length)];
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3.2 + 1.2,
        speedY: -(Math.random() * 1.6 + 0.7),
        speedX: (Math.random() - 0.5) * 0.9,
        swaySpeed: Math.random() * 0.035 + 0.015,
        swayAmount: Math.random() * 1.8 + 0.6,
        swayAngle: Math.random() * Math.PI * 2,
        color: col.primary,
        glow: col.glow,
        opacity: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.045 + 0.02,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Danh sách các vụ nổ tia lửa rồng tương tác (Interactive Dracarys Flame Bursts)
    const bursts = [];
    const shockwaves = [];
    const floatingRunes = [];

    // Hàm kích nổ tia lửa rồng
    const triggerFlameAt = (x, y) => {
      playDragonRoarSound('dracarys');
      setBurstCount((prev) => prev + 1);

      // 1. Phun trào chùm tia lửa (Sparks)
      const sparkCount = 48;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8.5 + 3.0;
        const col = fireColors[Math.floor(Math.random() * fireColors.length)];
        bursts.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.8,
          gravity: 0.14,
          size: Math.random() * 3.8 + 2.0,
          color: col.primary,
          glow: col.glow,
          life: 1.0,
          decay: Math.random() * 0.022 + 0.015,
        });
      }

      // 2. Vòng sóng xung kích ngọn lửa (Fire Shockwave)
      shockwaves.push({
        x,
        y,
        radius: 10,
        maxRadius: Math.random() * 50 + 65,
        opacity: 0.9,
        color: '#ff9f1a',
      });

      // 3. Phù hiệu ngọn lửa "DRACARYS!" hoặc "FIRE & BLOOD"
      const titles = ['🔥 DRACARYS!', '⚔️ FIRE & BLOOD', '🐉 HOUSE TARGARYEN', '🔥 VALYRIAN FIRE'];
      floatingRunes.push({
        x,
        y: y - 20,
        text: titles[Math.floor(Math.random() * titles.length)],
        opacity: 1.0,
        scale: 0.9,
        vy: -1.4,
      });
    };

    triggerRef.current = triggerFlameAt;

    // Lắng nghe click trên hero container
    const heroContainer = canvas.parentElement;
    const handleContainerClick = (e) => {
      // Tránh cướp click của các nút bấm điều khiển
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('select')) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      triggerFlameAt(clickX, clickY);
    };

    // Lắng nghe custom event từ nút bấm "Phun Lửa Rồng (Dracarys)"
    const handleCustomTrigger = () => {
      // Bắn ngẫu nhiên ở khu vực trung tâm hero banner
      const centerX = width * 0.5 + (Math.random() - 0.5) * 200;
      const centerY = height * 0.5 + (Math.random() - 0.5) * 100;
      triggerFlameAt(centerX, centerY);
    };

    if (heroContainer) {
      heroContainer.addEventListener('click', handleContainerClick);
    }
    window.addEventListener('fv-trigger-dracarys', handleCustomTrigger);

    // Animation Loop 60fps
    let time = 0;
    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      // 1. Render Ambient Floating Embers
      for (let i = 0; i < embers.length; i++) {
        const em = embers[i];
        em.swayAngle += em.swaySpeed;
        em.x += Math.sin(em.swayAngle) * em.swayAmount + em.speedX;
        em.y += em.speedY;

        // Tái tạo khi bay quá màn hình
        if (em.y < -20 || em.x < -20 || em.x > width + 20) {
          em.y = height + 10;
          em.x = Math.random() * width;
        }

        const currentOpacity = Math.max(0.12, em.opacity + Math.sin(time * 3 + em.pulseOffset) * 0.28);

        ctx.save();
        ctx.globalAlpha = currentOpacity;
        ctx.shadowBlur = em.size * 4;
        ctx.shadowColor = em.glow;
        ctx.fillStyle = em.color;

        ctx.beginPath();
        ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
        ctx.fill();

        // Lõi vàng rực
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(em.x, em.y, em.size * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 2. Render Fire Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 3.2;
        sw.opacity -= 0.035;

        if (sw.opacity <= 0) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = sw.opacity;
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 3.0;
        ctx.shadowBlur = 22;
        ctx.shadowColor = sw.color;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Render Flame Sparks (Bursts)
      for (let i = bursts.length - 1; i >= 0; i--) {
        const sp = bursts[i];
        sp.vy += sp.gravity;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= sp.decay;

        if (sp.life <= 0) {
          bursts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = sp.life;
        ctx.shadowBlur = 16;
        ctx.shadowColor = sp.glow;
        ctx.fillStyle = sp.color;

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
        ctx.fill();

        // Lõi trắng sáng
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, (sp.size * sp.life) * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 4. Render Floating Dragon Runes (Dracarys!)
      for (let i = floatingRunes.length - 1; i >= 0; i--) {
        const fr = floatingRunes[i];
        fr.y += fr.vy;
        fr.scale = Math.min(1.2, fr.scale + 0.02);
        fr.opacity -= 0.015;

        if (fr.opacity <= 0) {
          floatingRunes.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = fr.opacity;
        ctx.font = 'bold 16px "Cinzel Decorative", "Cinzel", serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(255, 71, 87, 0.95)';
        ctx.fillStyle = '#ffd32a';
        ctx.fillText(fr.text, fr.x, fr.y);
        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (heroContainer) {
        heroContainer.removeEventListener('click', handleContainerClick);
      }
      window.removeEventListener('fv-trigger-dracarys', handleCustomTrigger);
    };
  }, [isActive, playDragonRoarSound]);

  const handleToggle = (e) => {
    e.stopPropagation();
    const nextState = !isActive;
    setIsActive(nextState);
    playDragonRoarSound('toggle');
  };

  return (
    <>
      {/* Canvas tàn lửa rồng toàn màn hình trên Hero Banner */}
      {isActive && (
        <canvas
          ref={canvasRef}
          className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
          style={{ zIndex: 3, pointerEvents: 'none' }}
        />
      )}

      {/* Nút Bật/Tắt Hiệu Ứng Dragon Fire & Embers trên Eyebrow */}
      <button
        type="button"
        onClick={handleToggle}
        className="badge rounded-pill px-3 py-1.5 text-white small d-inline-flex align-items-center gap-1.5 border-0 fv-dragon-fx-badge"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #d63031 0%, #e17055 50%, #f39c12 100%)'
            : 'rgba(255, 255, 255, 0.12)',
          boxShadow: isActive
            ? '0 0 16px rgba(214, 48, 49, 0.65), 0 2px 8px rgba(0, 0, 0, 0.4)'
            : 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          backdropFilter: 'blur(8px)',
        }}
        title={
          isActive
            ? (isVi ? 'Nhấn để tắt hiệu ứng tàn lửa rồng' : 'Click to disable dragon fire effect')
            : (isVi ? 'Nhấn để kích hoạt hiệu ứng tàn lửa rồng & âm thanh Dracarys' : 'Click to enable dragon fire & Dracarys audio')
        }
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>🐉</span>
        <span className="fw-bold">
          {isVi ? 'Dragon Fire FX' : 'Dragon Fire FX'}: {isActive ? (isVi ? 'BẬT' : 'ON') : (isVi ? 'TẮT' : 'OFF')}
        </span>
        {isActive && (
          <span
            className="badge rounded-pill px-2 py-0.5 small"
            style={{
              background: '#1e272e',
              color: '#ffd32a',
              fontSize: '0.68rem',
              letterSpacing: '0.5px',
              border: '1px solid rgba(255, 211, 42, 0.4)',
            }}
          >
            {burstCount > 0 ? `${burstCount} 🔥` : 'DRACARYS 🔥'}
          </span>
        )}
      </button>
    </>
  );
}
