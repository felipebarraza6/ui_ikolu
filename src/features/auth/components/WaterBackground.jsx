import React, { useRef, useEffect } from "react";

/**
 * Fondo dinámico de partículas con líneas de conexión e interacción con mouse.
 *
 * Canvas-based: cientos de partículas con líneas de red que reaccionan al cursor.
 * - Partículas cercanas al mouse brillan más y crecen
 * - Líneas se dibujan desde partículas hacia el cursor
 * - Repulsión suave: las partículas se alejan levemente del mouse
 * - Glow sutil en la posición del cursor
 */
const WaterBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];
    let w, h;

    // Mouse tracking
    const mouse = { x: -9999, y: -9999, active: false };
    let mouseSmoothX = -9999;
    let mouseSmoothY = -9999;

    const isMobile = () => window.innerWidth < 768;
    const getParticleCount = () => (isMobile() ? 100 : 350);
    const CONNECTION_DISTANCE = 140;
    const MOUSE_RADIUS = 200;
    const MOUSE_REPEL_RADIUS = 100;
    const MOUSE_REPEL_FORCE = 0.4;

    const createParticles = () => {
      const count = getParticleCount();
      particles = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.12 + Math.random() * 0.3;
        const colorRoll = Math.random();
        let r, g, b, baseA;
        if (colorRoll < 0.55) {
          r = 255; g = 255; b = 255; baseA = 0.35 + Math.random() * 0.25;
        } else if (colorRoll < 0.82) {
          r = 58; g = 137; b = 210; baseA = 0.3 + Math.random() * 0.25;
        } else {
          r = 201; g = 217; b = 54; baseA = 0.25 + Math.random() * 0.2;
        }
        particles.push({
          x: Math.random() * (w || window.innerWidth),
          y: Math.random() * (h || window.innerHeight),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          baseRadius: 0.8 + Math.random() * 1.8,
          r, g, b, baseA,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.002 + Math.random() * 0.006,
          // For smooth glow transition
          glowIntensity: 0,
        });
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
    };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Smooth mouse follow
      if (mouse.active) {
        mouseSmoothX += (mouse.x - mouseSmoothX) * 0.12;
        mouseSmoothY += (mouse.y - mouseSmoothY) * 0.12;
      } else {
        mouseSmoothX += (-9999 - mouseSmoothX) * 0.05;
        mouseSmoothY += (-9999 - mouseSmoothY) * 0.05;
      }

      const mx = mouseSmoothX;
      const my = mouseSmoothY;

      // Update positions + mouse interaction
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += p.phaseSpeed;
        p.x += p.vx + Math.sin(p.phase) * 0.04;
        p.y += p.vy + Math.cos(p.phase) * 0.025;

        // Mouse repulsion
        if (mouse.active) {
          const dxm = p.x - mx;
          const dym = p.y - my;
          const distMouse = Math.sqrt(dxm * dxm + dym * dym);
          if (distMouse < MOUSE_REPEL_RADIUS && distMouse > 1) {
            const force = (1 - distMouse / MOUSE_REPEL_RADIUS) * MOUSE_REPEL_FORCE;
            p.x += (dxm / distMouse) * force;
            p.y += (dym / distMouse) * force;
          }
          // Glow intensity smoothly transitions
          if (distMouse < MOUSE_RADIUS) {
            const targetGlow = 1 - distMouse / MOUSE_RADIUS;
            p.glowIntensity += (targetGlow - p.glowIntensity) * 0.08;
          } else {
            p.glowIntensity += (0 - p.glowIntensity) * 0.04;
          }
        } else {
          p.glowIntensity += (0 - p.glowIntensity) * 0.03;
        }

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      // Draw connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(58, 137, 210, ${opacity})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      // Draw mouse connections (lines from particles to cursor)
      if (mouse.active) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dxm = p.x - mx;
          const dym = p.y - my;
          const distMouse = Math.sqrt(dxm * dxm + dym * dym);
          if (distMouse < MOUSE_RADIUS) {
            const opacity = (1 - distMouse / MOUSE_RADIUS) * 0.3;
            const gradient = ctx.createLinearGradient(p.x, p.y, mx, my);
            gradient.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${opacity * 0.6})`);
            gradient.addColorStop(1, `rgba(58, 137, 210, ${opacity})`);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const glow = p.glowIntensity;
        const drawRadius = p.baseRadius + glow * 3;
        const drawAlpha = p.baseA + glow * 0.5;

        // Glow halo for particles near mouse
        if (glow > 0.05) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, drawRadius + 6 * glow, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${glow * 0.15})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.min(drawAlpha, 1)})`;
        ctx.fill();
      }

      // Draw mouse glow
      if (mouse.active) {
        const glowGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
        glowGrad.addColorStop(0, "rgba(58, 137, 210, 0.08)");
        glowGrad.addColorStop(0.4, "rgba(201, 217, 54, 0.03)");
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(mx, my, 120, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Gradiente de profundidad */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(165deg, #031020 0%, #061d38 40%, #0a3150 75%, #0c4a6d 100%)",
        }}
      />

      {/* Brillo superficial tipo reflejo */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "65vw",
          height: "65vw",
          background:
            "radial-gradient(circle, rgba(58,137,210,0.22) 0%, rgba(12,60,95,0.08) 40%, rgba(0,0,0,0) 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-5%",
          right: "-15%",
          width: "50vw",
          height: "50vw",
          background:
            "radial-gradient(circle, rgba(201,217,54,0.1) 0%, rgba(12,60,95,0.06) 35%, rgba(0,0,0,0) 65%)",
          filter: "blur(90px)",
        }}
      />

      {/* Canvas de partículas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* Niebla/planicie inferior */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "25vh",
          background:
            "linear-gradient(180deg, rgba(3,16,32,0) 0%, rgba(3,16,32,0.4) 60%, rgba(3,16,32,0.7) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default WaterBackground;
