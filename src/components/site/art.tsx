import type { FeatureKey } from "@/content/site";
import { LOGO_BUBBLE, LOGO_SPARK } from "@/lib/logo";
import type { IndustrySlug } from "@/lib/site-routes";
import { cn } from "@/lib/utils";

/**
 * Spot illustrations for the public site: one per feature, industry and setup step.
 * They replace icon chips. All share one drawing style (a soft blue tile, white cards,
 * brand-blue shapes, an amber accent), are inline SVG so nothing is downloaded, and are
 * hidden from screen readers because the text beside them says the same thing.
 */

const BLUE = "var(--primary)";
const INK = "#1b1b20";
const AMBER = "#fbbf24";
const GREEN = "#00c057";
const LINE = "#bfdbfe";
const TINT = "#dbeafe";
const PALE = "#eff4ff";
const SPARKLE = "M0-10C1.5-3 3-1.5 10 0 3 1.5 1.5 3 0 10-1.5 3-3 1.5-10 0-3-1.5-1.5-3 0-10Z";

type ArtProps = { className?: string };

function Art({ className, children }: ArtProps & { children: React.ReactNode }) {
  return (
    <svg aria-hidden viewBox="0 0 120 96" fill="none" className={cn("h-24 w-[7.5rem] shrink-0", className)}>
      <rect x="4" y="8" width="112" height="80" rx="24" fill={PALE} />
      {children}
    </svg>
  );
}

const Spark = ({ x, y, size = 0.6, fill = AMBER }: { x: number; y: number; size?: number; fill?: string }) => (
  <path d={SPARKLE} transform={`translate(${x} ${y}) scale(${size})`} fill={fill} />
);

/** Head and shoulders. */
const Person = ({ x, y, fill = INK }: { x: number; y: number; fill?: string }) => (
  <>
    <circle cx={x} cy={y - 5} r="5" fill={fill} />
    <path d={`M${x - 8.5} ${y + 12}a8.500 8.500 0 0 1 17 0Z`} fill={fill} />
  </>
);

// ---------------------------------------------------------------- features

/** A document, and an answer bubble with a tick: answers come from the business's own information. */
function GroundedArt(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x="20" y="20" width="42" height="54" rx="8" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <rect x="28" y="30" width="18" height="5" rx="2.5" fill={BLUE} />
      <rect x="28" y="41" width="26" height="4" rx="2" fill={INK} fillOpacity="0.18" />
      <rect x="28" y="49" width="20" height="4" rx="2" fill={INK} fillOpacity="0.12" />
      <rect x="28" y="57" width="14" height="4" rx="2" fill={INK} fillOpacity="0.18" />
      <path d="M58 38h34a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H74l-8 7v-7h-8a8 8 0 0 1-8-8V46a8 8 0 0 1 8-8Z" fill={BLUE} />
      <path d="m65 53 6 6 13-13" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <Spark x={98} y={24} />
    </Art>
  );
}

/** Two speech bubbles in different scripts and a globe: replies in the customer's language. */
function LanguagesArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M22 22h36a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H38l-8 7v-7h-8a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8Z" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <text x="40" y="45" textAnchor="middle" fontSize="20" fontWeight="700" fill={INK} fontFamily="inherit">
        A
      </text>
      <path d="M62 42h36a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8h-8v7l-8-7H62a8 8 0 0 1-8-8V50a8 8 0 0 1 8-8Z" fill={BLUE} />
      <text x="80" y="65" textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff" fontFamily="inherit">
        ع
      </text>
      <circle cx="92" cy="26" r="9" fill="#fff" stroke={AMBER} strokeWidth="2.5" />
      <path d="M83.500 26h17M92 17.500c-4 3-4 14 0 17M92 17.500c4 3 4 14 0 17" stroke={AMBER} strokeWidth="1.600" />
    </Art>
  );
}

/** A contact card with a plus badge: a chat became a lead. */
function LeadsArt(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x="16" y="28" width="78" height="46" rx="10" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <circle cx="37" cy="51" r="12" fill={TINT} />
      <circle cx="37" cy="47" r="4" fill={BLUE} />
      <path d="M30 58a7 7 0 0 1 14 0Z" fill={BLUE} />
      <rect x="56" y="41" width="28" height="5" rx="2.5" fill={INK} fillOpacity="0.7" />
      <rect x="56" y="51" width="20" height="4" rx="2" fill={INK} fillOpacity="0.22" />
      <rect x="56" y="59" width="24" height="4" rx="2" fill={BLUE} fillOpacity="0.55" />
      <circle cx="93" cy="29" r="12" fill={GREEN} stroke={PALE} strokeWidth="3" />
      <path d="M93 23v12M87 29h12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </Art>
  );
}

/** The assistant passing the conversation to a person. */
function HandoverArt(props: ArtProps) {
  return (
    <Art {...props}>
      <circle cx="34" cy="48" r="18" fill={BLUE} />
      <Spark x={34} y={48} size={1} fill="#fff" />
      <path d="M57 48h10" stroke={BLUE} strokeWidth="2.500" strokeLinecap="round" strokeDasharray="1 5.500" />
      <path d="m64 42 6 6-6 6" stroke={BLUE} strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="88" cy="48" r="17" fill="#fff" stroke={AMBER} strokeWidth="3" />
      <Person x={88} y={47} />
      <circle cx="101" cy="35" r="5" fill={GREEN} stroke={PALE} strokeWidth="2" />
    </Art>
  );
}

/** A list of conversations with one selected. */
function InboxArt(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x="20" y="19" width="80" height="60" rx="10" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <circle cx="32" cy="32" r="5" fill={TINT} />
      <rect x="42" y="28" width="30" height="4" rx="2" fill={INK} fillOpacity="0.6" />
      <rect x="42" y="35" width="20" height="3" rx="1.5" fill={INK} fillOpacity="0.2" />
      <rect x="80" y="29" width="14" height="6" rx="3" fill={AMBER} />
      <rect x="24" y="42" width="72" height="14" rx="6" fill={PALE} />
      <circle cx="32" cy="49" r="5" fill={BLUE} />
      <rect x="42" y="45" width="34" height="4" rx="2" fill={BLUE} />
      <rect x="42" y="52" width="22" height="3" rx="1.5" fill={INK} fillOpacity="0.2" />
      <circle cx="89" cy="49" r="3" fill={BLUE} />
      <circle cx="32" cy="67" r="5" fill={TINT} />
      <rect x="42" y="63" width="26" height="4" rx="2" fill={INK} fillOpacity="0.6" />
      <rect x="42" y="70" width="18" height="3" rx="1.5" fill={INK} fillOpacity="0.2" />
      <rect x="80" y="64" width="14" height="6" rx="3" fill={GREEN} fillOpacity="0.85" />
    </Art>
  );
}

/** A bar chart with a rising line: what customers ask. */
function InsightsArt(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x="18" y="19" width="84" height="60" rx="10" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <rect x="29" y="55" width="11" height="16" rx="3" fill={LINE} />
      <rect x="46" y="45" width="11" height="26" rx="3" fill="#93c5fd" />
      <rect x="63" y="50" width="11" height="21" rx="3" fill={LINE} />
      <rect x="80" y="34" width="11" height="37" rx="3" fill={BLUE} />
      <path d="M30 46 51 35l17 6 18-14" stroke={AMBER} strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="86" cy="27" r="4" fill={AMBER} stroke="#fff" strokeWidth="2" />
    </Art>
  );
}

/** A web page with the chat window and its launcher in the corner. */
function WidgetArt(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x="16" y="18" width="84" height="58" rx="10" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <path d="M16 31h84" stroke={LINE} strokeWidth="1.5" />
      <circle cx="25" cy="24.500" r="2.200" fill={LINE} />
      <circle cx="32" cy="24.500" r="2.200" fill={LINE} />
      <circle cx="39" cy="24.500" r="2.200" fill={LINE} />
      <rect x="25" y="39" width="30" height="5" rx="2.5" fill={INK} fillOpacity="0.5" />
      <rect x="25" y="49" width="22" height="4" rx="2" fill={INK} fillOpacity="0.15" />
      <rect x="25" y="57" width="26" height="4" rx="2" fill={INK} fillOpacity="0.15" />
      <rect x="62" y="37" width="30" height="24" rx="6" fill={PALE} stroke={LINE} strokeWidth="1.5" />
      <rect x="67" y="43" width="14" height="3.500" rx="1.75" fill={BLUE} fillOpacity="0.45" />
      <rect x="73" y="50" width="14" height="3.500" rx="1.75" fill={BLUE} />
      <circle cx="96" cy="72" r="11" fill={BLUE} stroke={PALE} strokeWidth="3" />
      <path d="M92.500 67h7a2.500 2.500 0 0 1 2.500 2.500v3a2.500 2.500 0 0 1-2.500 2.500h-3.500l-3 2.500V75a2.500 2.500 0 0 1-2-2.500v-3a2.500 2.500 0 0 1 1.500-2.500Z" fill="#fff" />
    </Art>
  );
}

/** A shield with a tick and a small padlock. */
function SecurityArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M60 16 88 26v20c0 17-11 28-28 34-17-6-28-17-28-34V26Z" fill={BLUE} />
      <path d="M60 16 88 26v20c0 17-11 28-28 34Z" fill="#fff" fillOpacity="0.14" />
      <path d="m47 47 9 9 17-18" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="94" cy="68" r="11" fill={AMBER} stroke={PALE} strokeWidth="3" />
      <rect x="89.500" y="67" width="9" height="7" rx="1.800" fill={INK} />
      <path d="M91.500 67v-2a2.500 2.500 0 0 1 5 0v2" stroke={INK} strokeWidth="1.800" />
    </Art>
  );
}

export const FEATURE_ART: Record<FeatureKey, (props: ArtProps) => React.ReactElement> = {
  grounded: GroundedArt,
  bilingual: LanguagesArt,
  leads: LeadsArt,
  handover: HandoverArt,
  inbox: InboxArt,
  insights: InsightsArt,
  widget: WidgetArt,
  security: SecurityArt,
};

// ---------------------------------------------------------------- industries

/** A clipboard with a medical cross and a pulse. */
function ClinicArt(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x="34" y="21" width="52" height="60" rx="10" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <rect x="50" y="16" width="20" height="10" rx="5" fill={BLUE} />
      <path d="M56 36h8v8h8v8h-8v8h-8v-8h-8v-8h8Z" fill={BLUE} />
      <rect x="46" y="68" width="28" height="4" rx="2" fill={INK} fillOpacity="0.18" />
      <circle cx="93" cy="34" r="12" fill="#fff" stroke={AMBER} strokeWidth="2.500" />
      <path d="M85.500 34h3.500l2-4.500 3.500 9 2-4.500h4" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Art>
  );
}

/** Two buildings and a map pin. */
function RealEstateArt(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x="30" y="22" width="26" height="56" rx="5" fill={BLUE} />
      {[30, 40, 50, 60].map((y) => (
        <g key={y} fill="#fff" fillOpacity="0.85">
          <rect x="36" y={y} width="5" height="5" rx="1" />
          <rect x="45" y={y} width="5" height="5" rx="1" />
        </g>
      ))}
      <rect x="58" y="42" width="28" height="36" rx="5" fill="#93c5fd" />
      <rect x="64" y="50" width="6" height="6" rx="1" fill="#fff" />
      <rect x="74" y="50" width="6" height="6" rx="1" fill="#fff" />
      <rect x="69" y="64" width="7" height="14" rx="2" fill="#1d4ed8" />
      <path d="M20 78h80" stroke={INK} strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
      <path d="M94 16a11 11 0 0 1 11 11c0 7.500-11 17-11 17S83 34.500 83 27a11 11 0 0 1 11-11Z" fill={AMBER} />
      <circle cx="94" cy="27" r="4" fill="#fff" />
    </Art>
  );
}

/** Open scissors. */
function SalonArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M46 40 94 64M46 56 94 32" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <circle cx="37" cy="36" r="9" fill={PALE} stroke={BLUE} strokeWidth="4" />
      <circle cx="37" cy="60" r="9" fill={PALE} stroke={BLUE} strokeWidth="4" />
      <circle cx="66" cy="48" r="3.500" fill={AMBER} />
      <Spark x={94} y={78} size={0.5} />
      <Spark x={24} y={22} size={0.45} fill={BLUE} />
    </Art>
  );
}

/** A plate between a fork and a knife. */
function RestaurantArt(props: ArtProps) {
  return (
    <Art {...props}>
      <circle cx="60" cy="48" r="24" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <circle cx="60" cy="48" r="15" fill={TINT} />
      <Spark x={60} y={48} size={0.85} />
      <path d="M21 26v11a5 5 0 0 0 10 0V26M26 26v46" stroke={BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M98 72V26c-5 4-8 12-8 22h8" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Art>
  );
}

/** A car and its key. */
function CarRentalArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M18 74h84" stroke={INK} strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 62v-8a6 6 0 0 1 5-6l9-2 8-12a6 6 0 0 1 5-3h20a6 6 0 0 1 5 2l10 13 9 2a6 6 0 0 1 5 6v8a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3Z" fill={BLUE} />
      <path d="M47 45l5-8h8v8ZM64 37h5l6 8H64Z" fill={TINT} />
      <circle cx="40" cy="65" r="8" fill={INK} />
      <circle cx="40" cy="65" r="3" fill="#fff" />
      <circle cx="80" cy="65" r="8" fill={INK} />
      <circle cx="80" cy="65" r="3" fill="#fff" />
      <circle cx="97" cy="27" r="11" fill={AMBER} stroke={PALE} strokeWidth="3" />
      <circle cx="93.500" cy="27" r="3" stroke={INK} strokeWidth="2" />
      <path d="M96.500 27h6.500M101 27v3" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </Art>
  );
}

/** A shopping bag with an offer tag. */
function RetailArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M36 37h48l4 39a4 4 0 0 1-4 4H36a4 4 0 0 1-4-4Z" fill={BLUE} />
      <path d="M48 44V32a12 12 0 0 1 24 0v12" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <Spark x={60} y={61} size={0.9} fill="#fff" />
      <circle cx="94" cy="30" r="11" fill={AMBER} stroke={PALE} strokeWidth="3" />
      <text x="94" y="34.500" textAnchor="middle" fontSize="12" fontWeight="700" fill={INK} fontFamily="inherit">
        %
      </text>
    </Art>
  );
}

export const INDUSTRY_ART: Record<IndustrySlug, (props: ArtProps) => React.ReactElement> = {
  clinics: ClinicArt,
  "real-estate": RealEstateArt,
  salons: SalonArt,
  restaurants: RestaurantArt,
  "car-rental": CarRentalArt,
  retail: RetailArt,
};

// ---------------------------------------------------------------- setup steps and the handover relay

/** Website, file and FAQ flowing into the assistant. */
function SourcesArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M50 28c13 0 11 20 24 20M50 48h24M50 68c13 0 11-20 24-20" stroke="#93c5fd" strokeWidth="1.500" strokeDasharray="3 4" />
      <rect x="14" y="20" width="36" height="16" rx="8" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <circle cx="24" cy="28" r="4" stroke={BLUE} strokeWidth="1.600" />
      <path d="M20 28h8M24 24c-2 2-2 6 0 8" stroke={BLUE} strokeWidth="1.200" />
      <rect x="32" y="26" width="12" height="4" rx="2" fill={INK} fillOpacity="0.4" />
      <rect x="14" y="40" width="36" height="16" rx="8" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <rect x="20.500" y="43.500" width="7" height="9" rx="1.800" fill={BLUE} />
      <rect x="32" y="46" width="12" height="4" rx="2" fill={INK} fillOpacity="0.4" />
      <rect x="14" y="60" width="36" height="16" rx="8" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <circle cx="24" cy="68" r="4.500" fill={AMBER} />
      <rect x="32" y="66" width="12" height="4" rx="2" fill={INK} fillOpacity="0.4" />
      <g transform="translate(74 32)">
        <rect width="32" height="32" rx="9" fill={BLUE} />
        <path d={LOGO_BUBBLE} fill="#fff" />
        <path d={LOGO_SPARK} fill={BLUE} />
      </g>
    </Art>
  );
}

/** A code window with one highlighted line, and a tick. */
function CodeArt(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x="16" y="20" width="84" height="54" rx="10" fill={INK} />
      <circle cx="26" cy="29" r="2.200" fill="#fff" fillOpacity="0.3" />
      <circle cx="33" cy="29" r="2.200" fill="#fff" fillOpacity="0.3" />
      <circle cx="40" cy="29" r="2.200" fill="#fff" fillOpacity="0.3" />
      <path d="m31 43-6 5.500 6 5.500M85 43l6 5.500-6 5.500" stroke="#93c5fd" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="37" y="46" width="18" height="5" rx="2.5" fill={AMBER} />
      <rect x="59" y="46" width="20" height="5" rx="2.5" fill="#fff" fillOpacity="0.75" />
      <rect x="26" y="62" width="30" height="4" rx="2" fill="#fff" fillOpacity="0.22" />
      <circle cx="96" cy="72" r="11" fill={GREEN} stroke={PALE} strokeWidth="3" />
      <path d="m91 72 3.500 3.500 6.500-7" stroke="#fff" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" />
    </Art>
  );
}

/** A short conversation, the assistant typing, and a team member standing by. */
function ChatArt(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x="48" y="19" width="52" height="18" rx="9" fill={BLUE} />
      <rect x="58" y="26" width="32" height="4" rx="2" fill="#fff" fillOpacity="0.9" />
      <rect x="20" y="41" width="56" height="18" rx="9" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <rect x="30" y="48" width="36" height="4" rx="2" fill={INK} fillOpacity="0.5" />
      <rect x="20" y="63" width="32" height="15" rx="7.5" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <circle cx="30" cy="70.500" r="2.200" fill={BLUE} />
      <circle cx="36" cy="70.500" r="2.200" fill={BLUE} fillOpacity="0.6" />
      <circle cx="42" cy="70.500" r="2.200" fill={BLUE} fillOpacity="0.3" />
      <circle cx="92" cy="66" r="13" fill={AMBER} stroke={PALE} strokeWidth="3" />
      <Person x={92} y={64} />
    </Art>
  );
}

/** A bell with a count: the team is told. */
function AlertArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M60 22a17 17 0 0 1 17 17v11l6 11H37l6-11V39a17 17 0 0 1 17-17Z" fill={AMBER} />
      <path d="M53 66a7 7 0 0 0 14 0Z" fill={INK} />
      <path d="M28 34c-3 6-3 13 0 19M92 34c3 6 3 13 0 19" stroke={BLUE} strokeWidth="2.500" strokeLinecap="round" />
      <circle cx="78" cy="27" r="10" fill={BLUE} stroke={PALE} strokeWidth="3" />
      <text x="78" y="31.500" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" fontFamily="inherit">
        1
      </text>
    </Art>
  );
}

/** The three setup steps, in order. */
export const STEP_ART = [SourcesArt, CodeArt, ChatArt];
/** The three stages of a handover, in order: the AI answers, the team is told, a person steps in. */
export const RELAY_ART = [GroundedArt, AlertArt, HandoverArt];

/** Plan size as a stack of chat bubbles: one, two or three. */
export function PlanArt({ level, className }: { level: 1 | 2 | 3; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 56 48" fill="none" className={cn("h-12 w-14 shrink-0", className)}>
      {level >= 3 && <rect x="20" y="2" width="34" height="18" rx="9" fill="currentColor" fillOpacity="0.25" />}
      {level >= 2 && <rect x="11" y="13" width="34" height="18" rx="9" fill="currentColor" fillOpacity="0.5" />}
      <path d="M11 24h16a9 9 0 0 1 9 9 9 9 0 0 1-9 9H14l-6 5v-6.500A9 9 0 0 1 2 33a9 9 0 0 1 9-9Z" fill="currentColor" />
      <Spark x={19} y={33} size={0.5} fill={AMBER} />
    </svg>
  );
}

/** The UAE flag, for the footer. Drawn here because flag emoji do not render on Windows. */
export function UaeFlag({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 16" className={cn("h-3.5 w-[1.3rem] shrink-0 rounded-[3px]", className)}>
      <rect width="24" height="16" fill="#fff" />
      <rect x="6" width="18" height="5.340" fill="#00843d" />
      <rect x="6" y="10.660" width="18" height="5.340" fill="#000" />
      <rect width="6" height="16" fill="#c8102e" />
    </svg>
  );
}
