import { useState, useEffect, useId, useRef, type ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  usePresence,
  useScroll,
  useSpring,
  type Variants,
} from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Wallet,
  ShieldCheck,
  Power,
  Sparkles,
  Boxes,
  BookOpen,
  Cpu,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data — the agent's bounded-spend loop, told as five steps                  */
/* -------------------------------------------------------------------------- */

const chaptersData = [
  { name: "Grant a Budget", image: "/assets/grant.svg" },
  { name: "The Agent Reasons", image: "/assets/reason.svg" },
  { name: "Pay via x402", image: "/assets/pay.svg" },
  { name: "Settle Onchain", image: "/assets/settle.svg" },
  { name: "The Friday Brief", image: "/assets/brief.svg" },
];

const SPECIMEN_URL = "/assets/specimen.svg";

const NAV_LINKS = ["Product", "How it works", "Security", "Docs", "Launch"];

const ACTION_PILLS = [
  { icon: ShieldCheck, label: "Bounded" },
  { icon: Power, label: "Revocable" },
  { icon: Sparkles, label: "Multimodal" },
  { icon: Boxes, label: "Onchain" },
  { icon: BookOpen, label: "Learn More" },
];

/* -------------------------------------------------------------------------- */
/*  Animation primitives                                                       */
/* -------------------------------------------------------------------------- */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

const wordmarkLetter: Variants = {
  initial: { y: "120%", opacity: 0 },
  animate: {
    y: "0%",
    opacity: 1,
    transition: { duration: 1.1, ease: EASE },
  },
};

const headerStagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const logoStagger: Variants = {
  initial: { scale: 1.03 },
  animate: {
    scale: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.1 },
  },
};

const sidebarStagger = (delay: number): Variants => ({
  initial: {},
  animate: { transition: { staggerChildren: 0.15, delayChildren: delay } },
});

const pillStagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};

const pad = (n: number) => String(n).padStart(2, "0");

/* -------------------------------------------------------------------------- */
/*  Scroll-reveal system                                                       */
/* -------------------------------------------------------------------------- */

const VIEWPORT = { once: true, margin: "-80px" } as const;

const revealUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const revealStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
};

// fade + rise as it enters the viewport
function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// a hairline divider that draws itself in from the left
function DrawLine({ className }: { className?: string }) {
  return (
    <motion.div
      className={`origin-left ${className ?? ""}`}
      initial={{ scaleX: 0, opacity: 0.4 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1, ease: EASE }}
    />
  );
}

// thin top bar that tracks scroll progress through the page
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[100] h-[2px] w-full origin-left bg-gradient-to-r from-[#f97316] via-[#a855f7] to-[#3b82f6]"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  SlideNumber — vertical-slide animated numeral                              */
/* -------------------------------------------------------------------------- */

function SlideNumber({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex overflow-hidden align-bottom ${className ?? ""}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="inline-block tabular-nums"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  NetworkBackdrop — animated monochrome "onchain network" mesh (canvas)      */
/* -------------------------------------------------------------------------- */

function NetworkBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LINK_DIST = 150;
    let w = 0;
    let h = 0;
    let raf = 0;
    let nodes: { x: number; y: number; vx: number; vy: number }[] = [];

    const seed = () => {
      const count = Math.min(80, Math.max(26, Math.floor((w * h) / 17000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }));
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(17,17,17,${(1 - dist / LINK_DIST) * 0.1})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(17,17,17,0.16)";
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    resize();
    frame();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}

/* -------------------------------------------------------------------------- */
/*  SandTransitionImage — SVG-filter sand / particle dissolve                  */
/* -------------------------------------------------------------------------- */

function SandTransitionImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isPresent, safeToRemove] = usePresence();
  const filterId = `sand-${useId().replace(/:/g, "")}`;
  // progress: 0 = solid image, 1 = fully dissolved into "sand"
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const DURATION = 900;
    let raf = 0;
    let start = 0;

    const frame = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / DURATION, 1);

      if (isPresent) {
        // entering: quartic ease-out, progress 1 -> 0 (sand re-forms into image)
        const eased = 1 - Math.pow(1 - t, 4);
        setProgress(1 - eased);
      } else {
        // exiting: cubic ease, progress 0 -> 1 (image scatters into sand)
        setProgress(Math.pow(t, 3));
      }

      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else if (!isPresent) {
        safeToRemove?.();
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [isPresent, safeToRemove]);

  const dispScale = 150 * progress;
  const blur = 6 * progress;
  const alpha = Math.max(0, 1 - progress * 1.2);
  const dx = isPresent ? -30 * progress : 30 * progress;
  const dy = isPresent ? -80 * progress : 120 * progress;

  return (
    <>
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter
            id={filterId}
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.8"
              numOctaves={4}
              seed={4}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={dispScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="disp"
            />
            <feOffset in="disp" dx={dx} dy={dy} result="off" />
            <feGaussianBlur in="off" stdDeviation={blur} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${alpha} 0`}
            />
          </filter>
        </defs>
      </svg>
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        draggable={false}
        className={className}
        style={{ filter: `url(#${filterId})`, willChange: "filter" }}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Wordmark — DELEGATE.AI, each letter slides up                              */
/* -------------------------------------------------------------------------- */

function Wordmark() {
  const letters = "DELEGATE".split("");
  return (
    <motion.h1
      variants={logoStagger}
      className="flex items-end leading-[0.82]"
      aria-label="DeleGate.AI"
    >
      <span className="flex">
        {letters.map((ch, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.06em]">
            <motion.span
              variants={wordmarkLetter}
              className="inline-block text-[15.5vw] font-bold tracking-[-0.055em] md:text-[12vw]"
            >
              {ch}
            </motion.span>
          </span>
        ))}
      </span>
      <span className="inline-block overflow-hidden pb-[0.06em]">
        <motion.span
          variants={wordmarkLetter}
          className="ml-[0.15em] inline-block text-[5.5vw] font-medium tracking-tight text-gray-400 md:text-[4.2vw]"
        >
          .AI
        </motion.span>
      </span>
    </motion.h1>
  );
}

/* -------------------------------------------------------------------------- */
/*  Marquee — infinite scrolling strip of protocols / partners                 */
/* -------------------------------------------------------------------------- */

const MARQUEE_ITEMS = [
  "ERC-7715",
  "x402",
  "EIP-3009",
  "ERC-7710",
  "1Shot Relayer",
  "Base Mainnet",
  "USDC",
  "Venice AI",
  "MetaMask Smart Accounts",
];

function Marquee({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="relative w-full overflow-hidden border-y border-gray-200/80 py-7">
      <motion.div
        className="flex w-max items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, ease: "linear", repeat: Infinity }}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className="flex items-center whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.28em] text-gray-400"
          >
            <span className="px-8">{item}</span>
            <span className="text-gray-300">&bull;</span>
          </span>
        ))}
      </motion.div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#fcfcfc] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#fcfcfc] to-transparent" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  WalkingDino — a monochrome T-Rex silhouette that strolls across the hero   */
/* -------------------------------------------------------------------------- */

function WalkingDino() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-[9%] left-0 z-[1] w-[120px] md:w-[160px]"
      initial={{ x: "-18vw" }}
      animate={{ x: "112vw" }}
      transition={{
        duration: 30,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: 3,
        delay: 1.8,
      }}
    >
      <svg viewBox="0 0 220 150" className="dino-bob h-auto w-full">
        {/* body + head + tail */}
        <path
          d="M8 86 C28 81 52 75 72 61 C86 51 106 49 126 53 C139 51 147 47 155 41 C162 34 170 28 180 28 C193 28 205 33 209 43 C211 48 208 52 202 52 L185 52 C177 53 171 55 163 58 C157 66 155 74 151 82 C135 92 117 98 97 98 C84 98 72 95 64 88 C52 84 38 85 8 86 Z"
          fill="#1a1a1d"
        />
        {/* eye (negative space) */}
        <circle cx="190" cy="40" r="2.4" fill="#fcfcfc" />
        {/* tiny arm */}
        <path
          d="M150 78 C156 80 158 86 154 92 C151 96 146 95 144 90 C142 84 145 80 150 78 Z"
          fill="#0e0e10"
        />
        {/* back leg */}
        <g className="dino-leg dino-leg-back">
          <path
            d="M70 90 L66 120 L60 128 L76 128 L80 116 L84 92 Z"
            fill="#101012"
          />
        </g>
        {/* front leg */}
        <g className="dino-leg dino-leg-front">
          <path
            d="M94 92 L90 122 L84 130 L100 130 L104 118 L108 96 Z"
            fill="#1a1a1d"
          />
        </g>
      </svg>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                     */
/* -------------------------------------------------------------------------- */

const FOOTER_COL_A = ["Home", "Twitter", "Telegram", "Discord", "GitHub"];
const FOOTER_COL_B = ["Docs", "How it works", "Security"];

function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <footer className="relative w-full overflow-hidden bg-[#fcfcfc] px-6 pb-10 pt-20 md:px-16 md:pt-24">
      {/* top row */}
      <motion.div
        variants={revealStagger}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between"
      >
        {/* brand */}
        <motion.div variants={revealUp} className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0a0a0a]">
            <img
              src="/assets/lm-removebg-preview.png"
              alt=""
              className="h-7 w-7"
            />
          </span>
          <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-[#111]">
            DeleGate.AI
          </span>
        </motion.div>

        {/* link columns */}
        <motion.div variants={revealUp} className="flex gap-16 md:gap-28">
          {[FOOTER_COL_A, FOOTER_COL_B].map((col, ci) => (
            <ul key={ci} className="flex flex-col gap-4">
              {col.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-black"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </motion.div>

        {/* back to top */}
        <motion.button
          variants={revealUp}
          onClick={toTop}
          className="group flex items-center gap-2 self-start font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-black"
        >
          Back to top
          <span className="transition-transform duration-300 group-hover:-translate-y-1">
            ↑
          </span>
        </motion.button>
      </motion.div>

      {/* giant watermark */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 1.1, ease: EASE }}
        className="mt-16 w-full md:mt-12"
      >
        <h2 className="select-none text-center text-[17vw] font-bold leading-[0.8] tracking-[-0.04em] text-gray-200">
          DELEGATE
        </h2>
      </motion.div>

      {/* copyright */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        className="mt-6 text-center font-mono text-[11px] tracking-[0.15em] text-gray-400"
      >
        &copy; 2026 DeleGate.AI. All rights reserved.
      </motion.p>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  App                                                                        */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ambient network backdrop fades in after the hero text settles
  useEffect(() => {
    const t = setTimeout(() => setShowBackdrop(true), 2800);
    return () => clearTimeout(t);
  }, []);

  // steps auto-cycle
  useEffect(() => {
    const i = setInterval(() => {
      setActiveChapter((prev) => (prev + 1) % chaptersData.length);
    }, 3500);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="font-sans text-[#111]">
      <ScrollProgress />

      {/* ================================================================== */}
      {/*  SECTION 1 — HERO                                                   */}
      {/* ================================================================== */}
      <section className="relative flex min-h-screen w-full flex-col overflow-hidden">
        {/* 1D — ambient web3 network backdrop */}
        <AnimatePresence>
          {showBackdrop && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 z-0"
            >
              <NetworkBackdrop />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(0,0,0,0.045),transparent_62%)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1H — walking dinosaur asset */}
        <WalkingDino />

        {/* 1I — center brand mark (desktop only; on mobile the centre holds copy) */}
        <div className="pointer-events-none absolute left-1/2 top-[62%] z-[1] hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <div className="relative flex items-center justify-center">
            {/* pulsing neon halo */}
            <motion.div
              aria-hidden="true"
              className="absolute h-[150%] w-[150%] rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(168,85,247,0.22), rgba(249,115,22,0.12) 38%, rgba(96,165,250,0.08) 58%, transparent 72%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.55, 1, 0.55], scale: [0.94, 1.06, 0.94] }}
              transition={{
                opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }}
            />
            {/* sweeping sheen */}
            <motion.div
              aria-hidden="true"
              className="absolute h-[36%] w-[160%] rotate-[-18deg] rounded-full bg-white/40 blur-2xl mix-blend-overlay"
              initial={{ x: "-120%", opacity: 0 }}
              animate={{ x: ["-120%", "120%"], opacity: [0, 0.7, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                repeatDelay: 3.5,
                ease: "easeInOut",
                delay: 2,
              }}
            />
            {/* logo: float + layered neon glow + depth shadow */}
            <motion.img
              src="/assets/lm-removebg-preview.png"
              alt="DeleGate.AI mark"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
              transition={{
                opacity: { duration: 1.2, delay: 0.7, ease: "easeOut" },
                scale: { duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }}
              className="relative w-[340px] md:w-[380px] lg:w-[440px]"
              style={{
                filter:
                  "drop-shadow(0 0 16px rgba(168,85,247,0.50)) drop-shadow(0 0 42px rgba(249,115,22,0.22)) drop-shadow(0 26px 30px rgba(10,10,12,0.33))",
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* 1A/1B — header + sub-nav */}
        <motion.header
          variants={headerStagger}
          initial="initial"
          animate="animate"
          className="relative z-20 px-6 pt-6 md:px-16"
        >
          <Wordmark />

          {/* 1C — hamburger (mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="group absolute right-6 top-6 z-[60] flex flex-col gap-[6px] md:hidden"
          >
            <span
              className={`h-[1.5px] bg-black transition-all duration-300 ${
                isMobileMenuOpen
                  ? "w-8 translate-y-[3.75px] rotate-45"
                  : "w-8 group-hover:w-6"
              }`}
            />
            <span
              className={`h-[1.5px] bg-black transition-all duration-300 ${
                isMobileMenuOpen
                  ? "w-8 -translate-y-[3.75px] -rotate-45"
                  : "w-8 group-hover:w-10"
              }`}
            />
          </button>

          {/* sub-nav bar */}
          <motion.div
            variants={fadeUp}
            className="mt-8 flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-gray-800 md:text-[11px]"
          >
            {/* left — the three pillars */}
            <div className="w-[28%] leading-relaxed md:w-[15%]">
              <div>Bounded</div>
              <div>Revocable</div>
              <div>Multimodal</div>
            </div>

            {/* arrow */}
            <div className="hidden w-[5%] justify-center pt-[2px] md:flex">
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </div>

            {/* center tagline */}
            <div className="flex-1 pr-12 leading-relaxed md:w-[30%] md:flex-none md:pr-0">
              <span className="hidden md:inline">
                Your AI chief of staff for onchain money —
                <br />
                bounded, revocable, and finally
                <br />
                trustworthy.
              </span>
              <span className="md:hidden">
                Your AI chief of staff
                <br />
                for onchain money —
                <br />
                bounded, revocable,
                <br />
                and finally trustworthy.
              </span>
            </div>

            {/* arrow */}
            <div className="hidden w-[5%] justify-center pt-[2px] md:flex">
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </div>

            {/* right nav */}
            <nav className="hidden w-[15%] flex-col gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="transition-colors hover:text-black hover:underline"
                >
                  {link}
                </a>
              ))}
            </nav>
          </motion.div>

          {/* 1C — mobile menu overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute left-0 top-full z-50 w-full border-b border-gray-200 bg-[#fcfcfc] px-6 py-8 shadow-xl md:hidden"
              >
                <nav className="flex flex-col space-y-6">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link}
                      href="#"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-mono text-sm uppercase tracking-[0.2em] text-gray-800 transition-colors hover:text-black"
                    >
                      {link}
                    </a>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* 1E/1F — sidebars */}
        <div className="relative z-10 flex flex-1 justify-between">
          {/* 1E — left sidebar */}
          <motion.div
            variants={sidebarStagger(0.6)}
            initial="initial"
            animate="animate"
            className="mt-20 w-[340px] px-10 sm:mt-28 md:mt-32 md:px-16"
          >
            {/* section indicator */}
            <motion.div
              variants={fadeUp}
              className="mb-7 flex items-center gap-3 font-mono text-xs text-gray-700"
            >
              <span>01</span>
              <span className="h-[1.5px] w-16 bg-black/20" />
            </motion.div>

            {/* headline */}
            <motion.h2
              variants={fadeUp}
              className="text-[3.5rem] font-normal leading-[1] tracking-tight md:text-[5rem]"
            >
              BOUNDED
              <br />
              AUTONOMY
            </motion.h2>

            {/* description */}
            <motion.p
              variants={fadeUp}
              className="mt-6 w-[260px] text-[13px] leading-[1.6] text-gray-700 md:text-[14px]"
            >
              Give one AI agent a weekly USDC budget it can never overspend —
              bounded, revocable, and auditable onchain.
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp} className="mt-8">
              <button className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md border border-[#1a1a1a] bg-[#1a1a1a] px-6 py-3.5 shadow-sm transition-all duration-300 hover:-translate-y-[0.5px] hover:shadow-[3px_3px_0px_rgba(17,17,17,0.5)] active:translate-y-0 active:shadow-sm">
                {/* sliding panel */}
                <span className="absolute inset-0 -translate-x-[101%] bg-[#fcfcfc] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
                <span className="relative z-10 flex items-center gap-3">
                  <Wallet
                    size={18}
                    strokeWidth={2}
                    className="text-white transition-all duration-500 group-hover:-translate-y-1 group-hover:-rotate-12 group-hover:scale-110 group-hover:text-[#111]"
                  />
                  <span className="text-[15px] font-medium text-white transition-colors duration-300 group-hover:text-[#111]">
                    Launch App
                  </span>
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* 1F — right sidebar: permission spec card */}
          <motion.div
            variants={sidebarStagger(0.9)}
            initial="initial"
            animate="animate"
            className="mt-12 hidden w-[210px] flex-col gap-8 pr-10 md:mt-20 md:flex md:pr-16"
          >
            {/* specimen */}
            <motion.div variants={fadeUp}>
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest">
                ERC-7715 Permission
              </h3>
              <p className="mt-2 text-[12px] leading-[1.6] text-gray-600">
                MetaMask Smart Account
                <br />
                Base mainnet &middot; USDC
              </p>
            </motion.div>

            {/* stats */}
            <motion.div variants={fadeUp} className="flex flex-col gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                  Weekly Cap
                </div>
                <div className="text-[13px] font-medium">50 USDC</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                  Per Call
                </div>
                <div className="text-[13px] font-medium">30 USDC</div>
              </div>
            </motion.div>

            {/* view permission */}
            <motion.button
              variants={fadeUp}
              className="group flex items-center gap-3 text-left"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-400 transition-all duration-300 group-hover:border-black group-hover:bg-[#111]">
                <Plus
                  size={16}
                  strokeWidth={1.5}
                  className="text-[#111] transition-colors duration-300 group-hover:text-white"
                />
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
                View Permission
              </span>
            </motion.button>
          </motion.div>
        </div>

      </section>

      {/* ================================================================== */}
      {/*  SECTION 2 — HOW IT WORKS                                          */}
      {/* ================================================================== */}
      <section className="relative z-20 flex min-h-[75vh] w-full flex-col items-center bg-[#fcfcfc] pb-0 pt-24 md:min-h-screen md:pt-32">
        {/* 2A — label */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-12 font-mono text-[10px] tracking-[0.2em] md:text-[11px]"
        >
          [ <span className="text-gray-500">02</span> ]{" "}
          <span className="font-bold uppercase text-gray-900">How It Works</span>
        </motion.p>

        {/* 2B — heading */}
        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="max-w-[1000px] px-6 text-center text-[2.2rem] font-medium leading-[1.1] tracking-tight text-[#111] md:text-[3.5rem] lg:text-[4.2rem]"
        >
          Set a budget your agent can never exceed —
          <br className="hidden md:block" /> revocable onchain in a single tap.
        </motion.h2>

        {/* 2C — action pills */}
        <motion.div
          variants={pillStagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-10 mt-10 flex flex-wrap justify-center gap-3 px-6 md:mb-24 md:mt-16 md:gap-4"
        >
          {ACTION_PILLS.map(({ icon: Icon, label }) => (
            <motion.button
              key={label}
              variants={fadeUp}
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white/50 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-800 backdrop-blur-sm transition-colors duration-300 hover:border-black hover:bg-black hover:text-white"
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* 2D — marquee fills the band so it doesn't read empty */}
        <div className="mt-4 min-h-[40px] w-full md:mt-10 md:min-h-[80px]" />
        <Reveal className="w-full">
          <Marquee items={MARQUEE_ITEMS} />
        </Reveal>
        <div className="min-h-[120px] md:min-h-[220px]" />

        {/* 2E — bottom text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 1, ease: EASE }}
          className="pointer-events-none absolute bottom-0 left-0 hidden w-full justify-between px-8 pb-8 md:flex md:px-16 md:pb-12"
        >
          <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-gray-500">
            We don't just track spending.
          </span>
          <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-gray-500">
            DeleGate.AI &copy; 2026
          </span>
        </motion.div>
      </section>

      {/* ================================================================== */}
      {/*  SECTION 3 — THE DELEGATION (dark)                                 */}
      {/* ================================================================== */}
      <section className="relative z-30 flex w-full flex-col overflow-hidden bg-[#0a0a0a] text-white">
        {/* 3A — specimen showpiece (slowly rotating network) */}
        <motion.div
          initial={{ x: "-50%", y: "-65%", opacity: 0 }}
          whileInView={{ x: "-50%", y: "-78%", opacity: 1 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-0 z-0 w-[160vw] max-w-none md:w-[1100px]"
        >
          <motion.img
            src={SPECIMEN_URL}
            alt="Onchain delegation network"
            referrerPolicy="no-referrer"
            animate={{ rotate: 360 }}
            transition={{ duration: 64, ease: "linear", repeat: Infinity }}
            className="w-full"
          />
        </motion.div>

        {/* 3B — heading area */}
        <motion.div
          variants={revealStagger}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="relative z-10 mb-16 flex flex-col justify-between gap-10 px-8 pt-32 md:px-16 md:pt-48 xl:flex-row"
        >
          {/* left heading */}
          <motion.h2
            variants={revealUp}
            className="max-w-[860px] text-[1.8rem] font-medium leading-[1.15] tracking-tight text-white md:text-[3rem] lg:text-[3.8rem] xl:text-[4rem]"
          >
            Backed by onchain permissions
            <span className="mx-2 inline-flex translate-y-[-4px] gap-2 align-middle md:mx-4 md:gap-3">
              {[Wallet, Cpu, Power].map((Icon, i) => (
                <span
                  key={i}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 bg-black text-gray-400 transition-colors duration-300 hover:border-white hover:bg-white hover:text-black md:h-14 md:w-14"
                >
                  <Icon size={22} strokeWidth={1.5} />
                </span>
              ))}
            </span>
            you can revoke.
          </motion.h2>

          {/* right tagline + pills */}
          <motion.div
            variants={revealUp}
            className="flex flex-col items-start xl:items-end"
          >
            <p className="mb-6 font-mono text-[9px] uppercase leading-relaxed tracking-widest text-gray-400 md:text-[10px] xl:text-right">
              We don't just watch your money
              <br />
              the agent acts on it
            </p>
            <div className="flex flex-wrap gap-3">
              {["Bounded", "Revocable", "Auditable"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gray-600 px-5 py-2 font-mono text-[9px] uppercase tracking-widest text-gray-300 transition-colors duration-300 hover:border-white hover:bg-white hover:text-black"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* divider */}
        <DrawLine className="h-[1px] bg-gray-800" />

        {/* 3C — two-column panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative z-10 flex flex-col md:flex-row"
        >
          {/* left panel — step illustration */}
          <div className="relative flex min-h-[400px] w-full flex-col justify-between border-b border-gray-800 p-8 md:min-h-[500px] md:w-[35%] md:border-b-0 md:border-r">
            <div className="text-xl tracking-[0.3em] text-gray-500">///</div>

            <div className="relative flex-1">
              <AnimatePresence mode="wait">
                <SandTransitionImage
                  key={activeChapter}
                  src={chaptersData[activeChapter].image}
                  alt={chaptersData[activeChapter].name}
                  className="absolute inset-0 m-auto h-[80%] w-[80%] object-contain mix-blend-lighten"
                />
              </AnimatePresence>
            </div>

            <div className="font-mono text-[10px] uppercase tracking-widest">
              <SlideNumber
                value={pad(activeChapter + 1)}
                className="text-[#888]"
              />
              <span className="text-[#333]"> / </span>
              <span className="text-[#888]">{pad(chaptersData.length)}</span>
            </div>
          </div>

          {/* right panel — step list */}
          <div className="flex w-full flex-col md:w-[65%]">
            {/* top bar */}
            <div className="flex items-center justify-between border-b border-gray-800 p-8 font-mono text-[10px] uppercase tracking-widest text-gray-400">
              <span>Grant once. The agent does the rest.</span>
              <span className="flex items-center gap-1">
                Step{" "}
                <SlideNumber
                  value={pad(activeChapter + 1)}
                  className="text-white"
                />
              </span>
            </div>

            {/* list */}
            <motion.div
              variants={revealStagger}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
              className="px-8"
            >
              {chaptersData.map((chapter, i) => {
                const isActive = i === activeChapter;
                return (
                  <motion.button
                    key={chapter.name}
                    variants={revealUp}
                    onClick={() => setActiveChapter(i)}
                    className={`flex w-full items-center justify-between border-b border-gray-800/80 py-8 text-left transition-colors duration-300 ${
                      isActive ? "text-white" : "text-[#444] hover:text-[#999]"
                    }`}
                  >
                    <span className="text-2xl font-medium tracking-tight md:text-[2rem]">
                      {chapter.name}
                    </span>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.6, rotate: -25 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.6, rotate: -25 }}
                          transition={{ duration: 0.3, ease: EASE }}
                        >
                          <ArrowUpRight
                            size={22}
                            strokeWidth={1}
                            className="text-gray-400"
                          />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* divider */}
        <DrawLine className="h-[1px] bg-gray-800" />

        {/* 3D — section closer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8, ease: EASE }}
          className="bg-[#0a0a0a] px-8 py-8 font-mono text-[10px] uppercase tracking-widest text-gray-500"
        >
          Bounded &middot; Revocable &middot; Multimodal
        </motion.div>
      </section>

      {/* ================================================================== */}
      {/*  FOOTER                                                            */}
      {/* ================================================================== */}
      <Footer />
    </div>
  );
}
