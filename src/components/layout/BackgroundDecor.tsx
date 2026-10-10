export function BackgroundDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-gold/10 blur-[100px] sm:h-[450px] sm:w-[650px] lg:w-[800px] lg:blur-[140px]" />
      <div className="absolute -right-20 top-1/3 h-[350px] w-[280px] rounded-full bg-brand-olive/10 blur-[100px] sm:h-[550px] sm:w-[450px] lg:blur-[140px]" />
      <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
        <path d="M-100 180 C 250 120, 450 280, 850 160 C 1150 70, 1350 240, 1600 180" stroke="#CBB07E" strokeOpacity="0.25" strokeDasharray="6 8" />
        <path d="M-100 240 C 220 180, 480 340, 880 220 C 1180 130, 1380 300, 1600 240" stroke="#CBB07E" strokeWidth="1.2" strokeOpacity="0.3" />
        <path d="M-100 300 C 190 240, 510 400, 910 280 C 1210 190, 1410 360, 1600 300" stroke="#CBB07E" strokeOpacity="0.2" />
        <path d="M-100 380 C 160 320, 540 470, 940 350 C 1240 260, 1440 430, 1600 370" stroke="#CBB07E" strokeWidth="1.2" strokeOpacity="0.35" />
        <path d="M-100 460 C 130 400, 570 540, 970 420 C 1270 330, 1470 500, 1600 440" stroke="#CBB07E" strokeOpacity="0.2" />
        <path d="M-100 760 C 280 680, 620 860, 1030 720 C 1330 620, 1520 800, 1600 740" stroke="#CBB07E" strokeWidth="1.5" strokeOpacity="0.35" />
        <text x="320" y="225" fill="#CBB07E" fillOpacity="0.4" fontSize="9" fontFamily="monospace" letterSpacing="2">COTA +142.5m</text>
        <text x="960" y="335" fill="#CBB07E" fillOpacity="0.4" fontSize="9" fontFamily="monospace" letterSpacing="2">COTA +168.0m</text>
        <text x="580" y="750" fill="#CBB07E" fillOpacity="0.4" fontSize="9" fontFamily="monospace" letterSpacing="2">DESLINDE SUR · EL CONVENTO</text>
      </svg>
    </div>
  );
}
