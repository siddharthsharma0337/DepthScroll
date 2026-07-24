import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import useStore from '../store/useStore';
import './StaggeredMenu.css';

// ── Edit your nav links here ──────────────────────────────────────────────────
const menuItems = [
 { label: 'Home',             href: '/' },
 { label: 'Our Fleet',        href: '/fleet' },
 { label: 'Membership',       href: '/membership' },
 { label: 'Regattas & Events',href: '/events' },
 { label: 'Academy',          href: '/academy' },
 { label: 'Contact',          href: '/contact' },
];

// ── Edit your social links here ───────────────────────────────────────────────
const socialItems = [
 { label: 'Instagram', href: 'https://instagram.com/yourhandle' },
 { label: 'Facebook',  href: 'https://facebook.com/yourpage' },
 { label: 'Twitter',   href: 'https://twitter.com/yourhandle' },
];

export default function StaggeredMenu({ isOpen, onToggle }) {
 const currentScene  = useStore((s) => s.currentScene);
 const panelRef      = useRef(null);
 const prelayer1Ref  = useRef(null);
 const prelayer2Ref  = useRef(null);
 const navItemsRef   = useRef([]);
 const socialsRef    = useRef(null);
 const menuLabelRef  = useRef(null);
 const closeLabelRef = useRef(null);
 const overlayRef    = useRef(null);
 const tlRef         = useRef(null);

 const animateOpen = useCallback(() => {
   const tl = gsap.timeline();
   tlRef.current = tl;

   // Blur the background overlay
   tl.to(overlayRef.current, { autoAlpha: 1, backdropFilter: 'blur(12px)', duration: 1, ease: 'expo.inOut' }, 0);

   // Swap label: MENU slides up, CLOSE follows
   tl.to(menuLabelRef.current,  { y: '-100%', duration: 0.5, ease: 'expo.inOut' }, 0);
   tl.to(closeLabelRef.current, { y: '-100%', duration: 0.5, ease: 'expo.inOut' }, 0);

   // Pre-layers flash in (staggered)
   tl.to(prelayer1Ref.current, { x: '0%', duration: 1, ease: 'expo.inOut' }, 0);
   tl.to(prelayer2Ref.current, { x: '0%', duration: 1, ease: 'expo.inOut' }, 0.05);

   // Main panel slides in
   tl.to(panelRef.current, { x: '0%', duration: 1, ease: 'expo.inOut' }, 0.1);

   // Nav items stagger up from below their clip container
   const items = navItemsRef.current.filter(Boolean);
   tl.fromTo(items,
     { yPercent: 120, rotate: 6, opacity: 0 },
     { yPercent: 0, rotate: 0, opacity: 1, duration: 1, stagger: 0.06, ease: 'expo.out' },
     0.5
   );

   // Socials fade in
   tl.fromTo(socialsRef.current,
     { opacity: 0, y: 20 },
     { opacity: 1, y: 0, duration: 1, ease: 'expo.out' },
     0.7
   );
 }, []);

 const animateClose = useCallback(() => {
   const tl = gsap.timeline();
   tlRef.current = tl;

   // Swap label back
   tl.to(menuLabelRef.current,  { y: '0%', duration: 0.5, ease: 'expo.inOut' });
   tl.to(closeLabelRef.current, { y: '0%', duration: 0.5, ease: 'expo.inOut' }, '<');

   // Socials exit
   tl.to(socialsRef.current, { opacity: 0, y: 20, duration: 0.4, ease: 'expo.inOut' }, 0);
   
   // Nav items exit (dropping down)
   const items = navItemsRef.current.filter(Boolean);
   tl.to(items, { yPercent: 120, rotate: -6, opacity: 0, duration: 0.4, stagger: 0.03, ease: 'expo.inOut' }, 0);

   // Panel slides out
   tl.to(panelRef.current, { x: '100%', duration: 1, ease: 'expo.inOut' }, 0.1);
   
   // Pre-layers slide out trailing behind
   tl.to(prelayer2Ref.current, { x: '100%', duration: 1, ease: 'expo.inOut' }, 0.15);
   tl.to(prelayer1Ref.current, { x: '100%', duration: 1, ease: 'expo.inOut' }, 0.2);

   // Fade out background blur
   tl.to(overlayRef.current, { autoAlpha: 0, backdropFilter: 'blur(0px)', duration: 1, ease: 'expo.inOut' }, 0.2);
 }, []);

 useEffect(() => {
   tlRef.current?.kill(); // always kill the previous timeline before starting a new one
   if (isOpen) animateOpen();
   else        animateClose();
 }, [isOpen, animateOpen, animateClose]);

 return (
   <div className="staggered-menu">
     {/* Toggle button */}
     <button className={`menu-toggle ${isOpen ? 'is-open' : ''} ${currentScene > 1 ? 'dark-theme' : ''}`} onClick={onToggle}>
       <span className="menu-toggle-label">
         <span ref={menuLabelRef}>MENU</span>
         <span ref={closeLabelRef} style={{ top: '100%' }}>CLOSE</span>
       </span>
       <span className="menu-toggle-icon">+</span>
     </button>

     {/* Invisible overlay — clicking outside closes the menu */}
     <div ref={overlayRef} className="menu-overlay" onClick={isOpen ? onToggle : undefined} />

     {/* Colour pre-layers */}
     <div ref={prelayer1Ref} className="menu-prelayer menu-prelayer-1" />
     <div ref={prelayer2Ref} className="menu-prelayer menu-prelayer-2" />

     {/* Main panel */}
     <div ref={panelRef} className="menu-panel">
       <ul className="menu-nav">
         {menuItems.map((item, i) => (
           <li key={item.label} ref={(el) => { navItemsRef.current[i] = el; }}>
             <a 
               href={item.href} 
               className="no-magnetic" 
               onClick={(e) => {
                 if (item.href !== '/') e.preventDefault();
               }}
             >
               {item.label}
             </a>
           </li>
         ))}
       </ul>

       <div ref={socialsRef} className="menu-socials" style={{ opacity: 0 }}>
         <div className="menu-socials-title">Socials</div>
         <div className="menu-socials-links">
           {socialItems.map((s) => (
             <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="no-magnetic" onClick={(e) => e.preventDefault()}>{s.label}</a>
           ))}
         </div>
       </div>
     </div>
   </div>
 );
}
