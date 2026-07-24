import { useEffect, useRef } from 'react';

const POOL_SIZE     = 80;
const MIN_DISTANCE  = 20;
const EXPAND_FROM   = 10;
const EXPAND_TO     = 400;
const AGE_INCREMENT = 0.028;

export default function RippleTrail() {
  const poolRef     = useRef([]);
  const ripplesRef  = useRef(
    Array.from({ length: POOL_SIZE }, () => ({ active: false, x: 0, y: 0, age: 0 }))
  );
  const nextIndexRef = useRef(0);
  const lastPosRef   = useRef({ x: 0, y: 0 });
  const rafRef       = useRef(0);

  useEffect(() => {
    // Spawn a ripple when cursor moves far enough
    const handleMouseMove = (e) => {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      
      // Ignore if hovering over navbar, menu, or main CTA buttons
      if (e.target?.closest?.('.topnav-center, .menu-toggle, .menu-panel, .scroll-hint, .finale-btn')) {
        return;
      }

      if (Math.sqrt(dx * dx + dy * dy) < MIN_DISTANCE) return;

      lastPosRef.current = { x: e.clientX, y: e.clientY };
      const idx = nextIndexRef.current % POOL_SIZE;
      ripplesRef.current[idx] = { active: true, x: e.clientX, y: e.clientY, age: 0 };
      nextIndexRef.current++;
    };

    // Single rAF loop — advances every active ripple by AGE_INCREMENT per frame
    const animate = () => {
      const ripples = ripplesRef.current;
      const pool    = poolRef.current;

      for (let i = 0; i < POOL_SIZE; i++) {
        const r  = ripples[i];
        const el = pool[i];
        if (!el) continue;

        if (r.active) {
          r.age += AGE_INCREMENT;
          if (r.age >= 1) {
            r.active = false;
            el.style.opacity = '0';
            continue;
          }
          const size    = EXPAND_FROM + r.age * (EXPAND_TO - EXPAND_FROM);
          const opacity = 1 - Math.pow(r.age, 1.2); // ease-out opacity curve
          el.style.width   = `${size}px`;
          el.style.height  = `${size}px`;
          el.style.left    = `${r.x - size / 2}px`;
          el.style.top     = `${r.y - size / 2}px`;
          el.style.opacity = `${opacity}`;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    const handleTouchMove = (e) => {
      if (!e.touches[0]) return;
      const touch = e.touches[0];
      const dx = touch.clientX - lastPosRef.current.x;
      const dy = touch.clientY - lastPosRef.current.y;
      
      if (e.target?.closest?.('.topnav-center, .menu-toggle, .menu-panel, .scroll-hint, .finale-btn')) return;
      if (Math.sqrt(dx * dx + dy * dy) < MIN_DISTANCE) return;

      lastPosRef.current = { x: touch.clientX, y: touch.clientY };
      const idx = nextIndexRef.current % POOL_SIZE;
      ripplesRef.current[idx] = { active: true, x: touch.clientX, y: touch.clientY, age: 0 };
      nextIndexRef.current++;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, pointerEvents: 'none' }}>
      <svg style={{ display: 'none' }}>
        <filter id="liquid-trail">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="30"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      {/* Pre-created pool — each div is one possible ring */}
      {Array.from({ length: POOL_SIZE }, (_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) poolRef.current[i] = el; }}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            opacity: 0,
            backdropFilter: 'url(#liquid-trail) blur(1px)',
            WebkitBackdropFilter: 'url(#liquid-trail) blur(1px)',
            // Inner glow + outer blue haze
       //     boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1), 0 0 15px rgba(147,197,253,0.15)',
            willChange: 'transform, opacity, width, height, left, top',
          }}
        />
      ))}
    </div>
  );
}
