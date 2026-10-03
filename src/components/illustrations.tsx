import { cn } from "@/lib/utils";

/**
 * Decorative vector graphics. All are inline SVG (no image requests), hidden
 * from screen readers, and sized by the caller through `className`.
 */

const SPARKLE = "M0-10C1.5-3 3-1.5 10 0 3 1.5 1.5 3 0 10-1.5 3-3 1.5-10 0-3-1.5-1.5-3 0-10Z";

/** Faint dot grid used as a texture on dark panels. */
export function DotPattern({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={cn("pointer-events-none absolute inset-0 size-full", className)}>
      <defs>
        <pattern id="dot-grid" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
        <linearGradient id="dot-fade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="dot-mask">
          <rect width="100%" height="100%" fill="url(#dot-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" mask="url(#dot-mask)" />
    </svg>
  );
}

/** A chat window with bubbles: the product in one picture. For dark backgrounds. */
export function ChatScene({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 320 220" fill="none" className={className}>
      <defs>
        <radialGradient id="chat-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ef4444" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chat-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="chat-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
      </defs>

      <circle cx="210" cy="90" r="110" fill="url(#chat-glow)" />
      {/* orbit rings */}
      <circle cx="165" cy="110" r="104" stroke="#fff" strokeOpacity="0.07" />
      <circle cx="165" cy="110" r="82" stroke="#fff" strokeOpacity="0.05" strokeDasharray="3 7" />

      {/* window */}
      <rect x="70" y="22" width="192" height="178" rx="22" fill="url(#chat-window)" stroke="#fff" strokeOpacity="0.2" />
      <circle cx="98" cy="50" r="13" fill="url(#chat-blue)" />
      <path d="M92.5 51.5c1.6 2.4 3.4 3.5 5.5 3.5s3.900-1.1 5.5-3.500" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="108" cy="59" r="4" fill="#00c057" stroke="#22232a" strokeWidth="2" />
      <rect x="120" y="42" width="72" height="6" rx="3" fill="#fff" fillOpacity="0.75" />
      <rect x="120" y="54" width="42" height="5" rx="2.5" fill="#fff" fillOpacity="0.3" />
      <path d="M70 76h192" stroke="#fff" strokeOpacity="0.1" />

      {/* assistant bubble */}
      <rect x="86" y="88" width="122" height="32" rx="13" fill="#fff" fillOpacity="0.13" />
      <rect x="98" y="99" width="78" height="5" rx="2.5" fill="#fff" fillOpacity="0.7" />
      <rect x="98" y="108" width="48" height="4" rx="2" fill="#fff" fillOpacity="0.35" />
      {/* customer bubble */}
      <rect x="140" y="128" width="106" height="28" rx="13" fill="url(#chat-blue)" />
      <rect x="152" y="139" width="70" height="5" rx="2.5" fill="#fff" fillOpacity="0.9" />
      {/* typing indicator */}
      <rect x="86" y="164" width="54" height="24" rx="12" fill="#fff" fillOpacity="0.13" />
      <circle cx="102" cy="176" r="3" fill="#fff" fillOpacity="0.8" />
      <circle cx="113" cy="176" r="3" fill="#fff" fillOpacity="0.55" />
      <circle cx="124" cy="176" r="3" fill="#fff" fillOpacity="0.3" />

      {/* floating chips */}
      <rect x="236" y="56" width="62" height="34" rx="12" fill="#fff" />
      <circle cx="253" cy="73" r="8" fill="#e7f8ee" />
      <path d="m249.500 73 2.500 2.500 4.500-5" stroke="#00873d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="266" y="68" width="24" height="4" rx="2" fill="#1b1b20" fillOpacity="0.75" />
      <rect x="266" y="76" width="16" height="4" rx="2" fill="#1b1b20" fillOpacity="0.25" />

      <rect x="24" y="126" width="56" height="36" rx="12" fill="#fff" fillOpacity="0.1" stroke="#fff" strokeOpacity="0.18" />
      <text x="52" y="149" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff" fontFamily="inherit">
        ع A
      </text>

      <path d={SPARKLE} transform="translate(44 62) scale(1.1)" fill="#fbbf24" />
      <path d={SPARKLE} transform="translate(286 150) scale(0.7)" fill="#fbbf24" fillOpacity="0.8" />
      <path d={SPARKLE} transform="translate(60 196) scale(0.45)" fill="#fff" fillOpacity="0.5" />
    </svg>
  );
}

/** Website, file and FAQ flowing into the assistant: how the knowledge base works. For dark backgrounds. */
export function KnowledgeScene({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 320 200" fill="none" className={className}>
      <defs>
        <radialGradient id="kb-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ef4444" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kb-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="kb-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <circle cx="236" cy="100" r="96" fill="url(#kb-glow)" />

      {/* connectors from each source to the assistant */}
      <path d="M112 44C160 44 170 100 206 100" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.500" strokeDasharray="4 5" />
      <path d="M112 100h94" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.500" strokeDasharray="4 5" />
      <path d="M112 156C160 156 170 100 206 100" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.500" strokeDasharray="4 5" />
      <circle cx="160" cy="62" r="3" fill="#fbbf24" />
      <circle cx="150" cy="100" r="3" fill="#fca5a5" />
      <circle cx="160" cy="138" r="3" fill="#00c057" />

      {/* website */}
      <rect x="24" y="22" width="88" height="44" rx="12" fill="url(#kb-glass)" stroke="#fff" strokeOpacity="0.2" />
      <circle cx="46" cy="44" r="11" stroke="#fca5a5" strokeWidth="2" />
      <path d="M35 44h22M46 33c-5 4-5 18 0 22M46 33c5 4 5 18 0 22" stroke="#fca5a5" strokeWidth="1.500" />
      <rect x="66" y="37" width="34" height="5" rx="2.500" fill="#fff" fillOpacity="0.7" />
      <rect x="66" y="47" width="22" height="4" rx="2" fill="#fff" fillOpacity="0.3" />

      {/* file */}
      <rect x="24" y="78" width="88" height="44" rx="12" fill="url(#kb-glass)" stroke="#fff" strokeOpacity="0.2" />
      <path d="M38 89h11l6 6v16a2 2 0 0 1-2 2H38a2 2 0 0 1-2-2V91a2 2 0 0 1 2-2Z" fill="#fff" fillOpacity="0.9" />
      <path d="M40 101h11M40 106h8" stroke="#b91c1c" strokeWidth="1.500" strokeLinecap="round" />
      <rect x="66" y="93" width="30" height="5" rx="2.500" fill="#fff" fillOpacity="0.7" />
      <rect x="66" y="103" width="36" height="4" rx="2" fill="#fff" fillOpacity="0.3" />

      {/* FAQ */}
      <rect x="24" y="134" width="88" height="44" rx="12" fill="url(#kb-glass)" stroke="#fff" strokeOpacity="0.2" />
      <circle cx="46" cy="156" r="11" fill="#fbbf24" />
      <path d="M42.500 153.500a3.500 3.500 0 1 1 5 3.200c-1 .500-1.500 1.100-1.500 2.300" stroke="#1b1b20" strokeWidth="2" strokeLinecap="round" />
      <circle cx="46" cy="162.500" r="1.200" fill="#1b1b20" />
      <rect x="66" y="149" width="36" height="5" rx="2.500" fill="#fff" fillOpacity="0.7" />
      <rect x="66" y="159" width="24" height="4" rx="2" fill="#fff" fillOpacity="0.3" />

      {/* assistant */}
      <circle cx="240" cy="100" r="44" fill="#fff" fillOpacity="0.06" stroke="#fff" strokeOpacity="0.18" />
      <circle cx="240" cy="100" r="30" fill="url(#kb-blue)" />
      <path d="M228 103c3.500 5 7.500 7.500 12 7.500s8.500-2.500 12-7.500" stroke="#fff" strokeWidth="3.500" strokeLinecap="round" />
      <circle cx="231" cy="92" r="2.500" fill="#fff" />
      <circle cx="249" cy="92" r="2.500" fill="#fff" />
      <circle cx="263" cy="121" r="7" fill="#00c057" stroke="#1b1b20" strokeWidth="3" />

      <path d={SPARKLE} transform="translate(290 46) scale(0.9)" fill="#fbbf24" />
      <path d={SPARKLE} transform="translate(204 170) scale(0.5)" fill="#fff" fillOpacity="0.55" />
      <path d={SPARKLE} transform="translate(296 150) scale(0.5)" fill="#fbbf24" fillOpacity="0.7" />
    </svg>
  );
}

/** An inbox tray with chat bubbles floating out of it. For light backgrounds (inbox empty states). */
export function InboxScene({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 150" fill="none" className={className}>
      <defs>
        <linearGradient id="in-tray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#fff1f0" />
        </linearGradient>
        <linearGradient id="in-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="134" rx="74" ry="8" fill="#1b1b20" fillOpacity="0.05" />
      <circle cx="100" cy="70" r="58" fill="#fff1f0" fillOpacity="0.7" />

      {/* bubbles */}
      <rect x="34" y="26" width="76" height="30" rx="13" fill="#fff" stroke="#d4d4d7" strokeWidth="1.500" />
      <rect x="46" y="36" width="42" height="5" rx="2.500" fill="#1b1b20" fillOpacity="0.55" />
      <rect x="46" y="45" width="26" height="4" rx="2" fill="#1b1b20" fillOpacity="0.2" />
      <rect x="96" y="50" width="74" height="28" rx="13" fill="url(#in-blue)" />
      <rect x="108" y="61" width="44" height="5" rx="2.500" fill="#fff" fillOpacity="0.9" />
      <circle cx="166" cy="50" r="9" fill="#00c057" stroke="#fff" strokeWidth="3" />
      <path d="m162 50 3 3 5-5.500" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* tray */}
      <path d="M38 92h30l7 12h50l7-12h30l10 26a6 6 0 0 1-5.600 8H33.600A6 6 0 0 1 28 118Z" fill="url(#in-tray)" stroke="#fecaca" strokeWidth="1.500" strokeLinejoin="round" />
      <path d="M38 92 54 70h92l16 22" stroke="#fecaca" strokeWidth="1.500" strokeLinejoin="round" />
      <rect x="84" y="111" width="32" height="5" rx="2.500" fill="#dc2626" fillOpacity="0.35" />

      <path d={SPARKLE} transform="translate(26 44) scale(0.7)" fill="#fbbf24" />
      <path d={SPARKLE} transform="translate(180 96) scale(0.5)" fill="#fbbf24" fillOpacity="0.8" />
      <path d={SPARKLE} transform="translate(126 22) scale(0.45)" fill="#00c057" fillOpacity="0.7" />
    </svg>
  );
}

/** A document rising into a cloud: the file drop zone. For light backgrounds. */
export function UploadScene({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 140 100" fill="none" className={className}>
      <defs>
        <linearGradient id="up-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fee2e2" />
          <stop offset="1" stopColor="#fff8f7" />
        </linearGradient>
        <linearGradient id="up-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      {/* cloud */}
      <path
        d="M38 78c-12 0-21-8.500-21-19.500 0-10 7.500-18 17.500-19.300C38 27 49 19 62 19c14.500 0 26.500 9.500 29.500 22.500C103 42 112 50 112 60.500 112 70.500 104 78 93.500 78Z"
        fill="url(#up-cloud)"
        stroke="#fecaca"
        strokeWidth="1.500"
      />
      {/* back sheet */}
      <rect x="76" y="34" width="30" height="38" rx="5" transform="rotate(10 76 34)" fill="#fff" stroke="#d4d4d7" strokeWidth="1.500" />
      {/* front sheet */}
      <rect x="46" y="30" width="34" height="44" rx="6" fill="#fff" stroke="#c5c8d0" strokeWidth="1.500" />
      <rect x="53" y="39" width="14" height="4" rx="2" fill="#dc2626" fillOpacity="0.85" />
      <rect x="53" y="48" width="20" height="3" rx="1.500" fill="#1b1b20" fillOpacity="0.18" />
      <rect x="53" y="55" width="16" height="3" rx="1.500" fill="#1b1b20" fillOpacity="0.12" />
      <rect x="53" y="62" width="19" height="3" rx="1.500" fill="#1b1b20" fillOpacity="0.18" />
      {/* arrow badge */}
      <circle cx="88" cy="72" r="14" fill="url(#up-blue)" stroke="#fff" strokeWidth="3" />
      <path d="M88 79V66m-5.500 5 5.500-5.500 5.500 5.500" stroke="#fff" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" />
      <path d={SPARKLE} transform="translate(26 30) scale(0.6)" fill="#fbbf24" />
      <path d={SPARKLE} transform="translate(118 36) scale(0.45)" fill="#00c057" fillOpacity="0.75" />
    </svg>
  );
}

/** Stacked documents with a magnifier: used for the empty knowledge base. For light backgrounds. */
export function DocsScene({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 140" fill="none" className={className}>
      <ellipse cx="100" cy="124" rx="70" ry="8" fill="#1b1b20" fillOpacity="0.05" />
      <rect x="46" y="22" width="78" height="96" rx="12" transform="rotate(-9 46 22)" fill="#fff1f0" />
      <rect x="66" y="14" width="80" height="100" rx="12" fill="#fff" stroke="#d4d4d7" strokeWidth="1.5" />
      <rect x="78" y="30" width="38" height="7" rx="3.500" fill="#dc2626" fillOpacity="0.85" />
      <rect x="78" y="46" width="56" height="5" rx="2.500" fill="#1b1b20" fillOpacity="0.18" />
      <rect x="78" y="57" width="48" height="5" rx="2.500" fill="#1b1b20" fillOpacity="0.12" />
      <rect x="78" y="68" width="54" height="5" rx="2.500" fill="#1b1b20" fillOpacity="0.18" />
      <rect x="78" y="79" width="30" height="5" rx="2.500" fill="#1b1b20" fillOpacity="0.12" />
      <circle cx="140" cy="88" r="20" fill="#fff" stroke="#dc2626" strokeWidth="4" />
      <path d="m154.500 103 14 14" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />
      <path d="M132 88h16M140 80v16" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.35" />
      <path d={SPARKLE} transform="translate(44 34) scale(0.8)" fill="#fbbf24" />
      <path d={SPARKLE} transform="translate(170 40) scale(0.5)" fill="#00c057" fillOpacity="0.7" />
    </svg>
  );
}

/** Circular progress with content (usually an icon) in the middle. */
export function ProgressRing({
  value,
  max,
  color,
  size = 52,
  children,
}: {
  value: number;
  max: number;
  /** Stroke colour of the filled arc. */
  color: string;
  size?: number;
  children?: React.ReactNode;
}) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        width={size}
        height={size}
        className="-rotate-90"
      >
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeOpacity="0.1" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center" style={{ color }}>
        {children}
      </span>
    </span>
  );
}
