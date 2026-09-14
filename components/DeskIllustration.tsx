/**
 * Original line-art desk scene: plant, stacked books, laptop, coffee, a can,
 * an open notebook and a pen.
 *
 * Colour strategy: object fills are explicit CSS variables (--il-*) so the
 * artwork keeps its identity in both themes. Only the outlines follow the
 * theme, via `currentColor` inherited from the parent text colour. The SVG is
 * never inverted wholesale, which would turn the blue laptop grey and the
 * green leaves magenta.
 *
 * The steam wisps sit in their own group and are animated from globals.css
 * (`.steam-wisp`), which is switched off under prefers-reduced-motion.
 */
export const CAN_IMAGE_PATH = "/images/illustration/diet-coke-can.png";

/**
 * The can slot. When the real transparent PNG is committed at
 * CAN_IMAGE_PATH the illustration draws it with <image>; until then it falls
 * back to the drawn stand-in below so nothing renders broken.
 *
 * The box is anchored to the same desk surface as the mug (y + h = 252) and
 * matched to the supplied artwork's 256 x 420 ratio (0.6095). `xMidYMax meet` keeps
 * the artwork's own aspect ratio and pins its base to the desk, so whatever
 * the supplied file's exact proportions, it never distorts and the straw grows
 * upward inside the viewBox instead of clipping. It lives in SVG user units,
 * so it scales with the rest of the illustration.
 */
const CAN_BOX = { x: 424, y: 127, w: 76, h: 125 };

export default function DeskIllustration({
  className = "",
  canImage = null,
}: {
  className?: string;
  /** Path to the supplied can artwork, or null to draw the stand-in. */
  canImage?: string | null;
}) {
  return (
    <svg
      viewBox="0 0 505 380"
      className={className}
      role="img"
      aria-label="A hand-drawn desk scene: a leafy green plant on a stack of books labelled Ideas, Build and A kinder web; an open sky-blue laptop; a glass mug half full of coffee; a silver diet cola can; an open notebook; a pen; and a small framed poster reading A more thoughtful internet."
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="lidSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--il-laptop-hi)" />
          <stop offset="45%" stopColor="var(--il-laptop)" />
          <stop offset="100%" stopColor="var(--il-laptop-2)" />
        </linearGradient>
        <linearGradient id="baseSheen" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="var(--il-laptop)" />
          <stop offset="100%" stopColor="var(--il-laptop-2)" />
        </linearGradient>
        <linearGradient id="canSheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--il-can-2)" />
          <stop offset="22%" stopColor="var(--il-can-hi)" />
          <stop offset="55%" stopColor="var(--il-can)" />
          <stop offset="100%" stopColor="var(--il-can-2)" />
        </linearGradient>
      </defs>

      {/* ---------- sparkles ---------- */}
      <g fill="currentColor" stroke="none" opacity="0.85">
        <path d="M250,5 C251.65,13.25 252.75,14.35 261,16 C252.75,17.65 251.65,18.75 250,27 C248.35,18.75 247.25,17.65 239,16 C247.25,14.35 248.35,13.25 250,5 Z" />
        <path d="M212,48 C213.2,54 214,54.8 220,56 C214,57.2 213.2,58 212,64 C210.8,58 210,57.2 204,56 C210,54.8 210.8,54 212,48 Z" />
        <path d="M276,83 C277.05,88.25 277.75,88.95 283,90 C277.75,91.05 277.05,91.75 276,97 C274.95,91.75 274.25,91.05 269,90 C274.25,88.95 274.95,88.25 276,83 Z" />
      </g>

      {/* ---------- framed poster ---------- */}
      <g>
        <path
          d="M322,10 Q363,7 404,6 Q405,52 404,96 Q363,98 322,98 Q323,54 322,10 Z"
          fill="var(--il-surface)"
          strokeWidth="1.5"
        />
        <g fill="currentColor" stroke="none" fontFamily="var(--font-hand)" fontSize="13">
          <text x="331" y="30">A</text>
          <text x="331" y="45">more</text>
          <text x="331" y="60">thoughtful</text>
          <text x="331" y="75">internet</text>
        </g>
        <path d="M331,88 L352,88 M346.5,83 L352,88 L346.5,93" strokeWidth="1.2" />
      </g>

      {/* ---------- stacked books ---------- */}
      <g>
        <path d="M8,268 Q74,265 140,262 L140,288 Q74,291 8,294 Z" fill="var(--il-surface)" />
        <path d="M8,274 Q74,271 140,268" strokeWidth="0.9" opacity="0.55" />
        <path d="M14,244 Q80,241 146,238 L146,264 Q80,267 14,270 Z" fill="var(--il-surface)" />
        <path d="M14,250 Q80,247 146,244" strokeWidth="0.9" opacity="0.55" />
        <path d="M20,220 Q86,217 152,214 L152,240 Q86,243 20,246 Z" fill="var(--il-surface)" />
        <path d="M20,226 Q86,223 152,220" strokeWidth="0.9" opacity="0.55" />
        <g fill="currentColor" stroke="none" fontFamily="var(--font-hand)" fontSize="14">
          <text x="32" y="238">Ideas</text>
          <text x="26" y="262">Build</text>
          <text x="20" y="286">A kinder web</text>
        </g>
      </g>

      {/* ---------- plant ---------- */}
      <g>
        <g strokeWidth="1.3">
          <path d="M94,176 Q88,150 88,120" />
          <path d="M94,176 Q90,140 92,104" />
          <path d="M94,176 Q98,138 96,100" />
          <path d="M94,176 Q100,146 100,116" />
          <path d="M94,176 Q86,158 86,138" />
          <path d="M94,176 Q100,154 98,132" />
        </g>
        {/* leaves, three green tones so the foliage reads as natural */}
        <g strokeWidth="1.5">
          <path d="M88,120 Q79,72 30,68 Q39,116 88,120 Z" fill="var(--il-leaf-a)" />
          <path d="M92,104 Q103,59 62,36 Q51,81 92,104 Z" fill="var(--il-leaf-b)" />
          <path d="M96,100 Q137,78 124,34 Q83,56 96,100 Z" fill="var(--il-leaf-a)" />
          <path d="M100,116 Q143,120 158,80 Q115,76 100,116 Z" fill="var(--il-leaf-c)" />
          <path d="M86,138 Q57,110 22,130 Q51,158 86,138 Z" fill="var(--il-leaf-b)" />
          <path d="M98,132 Q119,161 152,146 Q131,117 98,132 Z" fill="var(--il-leaf-c)" />
        </g>
        {/* midribs and side veins */}
        <g strokeWidth="0.9" opacity="0.5">
          <path d="M88,120 Q59,94 30,68" />
          <path d="M62,98 L58,86 M50,88 L48,76" />
          <path d="M92,104 Q77,70 62,36" />
          <path d="M77,70 L64,66 M70,54 L58,52" />
          <path d="M96,100 Q110,67 124,34" />
          <path d="M110,67 L123,64 M117,50 L129,48" />
          <path d="M100,116 Q129,98 158,80" />
          <path d="M129,98 L127,110 M143,89 L142,100" />
          <path d="M86,138 Q54,134 22,130" />
          <path d="M54,134 L52,144 M38,132 L36,142" />
          <path d="M98,132 Q125,139 152,146" />
          <path d="M125,139 L124,150 M139,142 L138,152" />
        </g>
        {/* pot */}
        <path d="M62,180 Q94,174 126,178 L118,232 Q94,238 74,232 Z" fill="var(--il-pot)" />
        <path d="M62,180 Q94,174 126,178 L124,192 Q94,186 64,192 Z" fill="var(--il-pot-2)" stroke="none" />
        <path d="M64,192 Q94,186 124,190" strokeWidth="1.1" opacity="0.6" />
      </g>

      {/* ---------- laptop: sky-blue MacBook Air ---------- */}
      <g>
        {/* lid, seen from the back */}
        <path
          d="M152,152 Q225,143 298,134 Q304,174 310,214 Q237,223 164,232 Q158,192 152,152 Z"
          fill="url(#lidSheen)"
        />
        {/* soft specular sweep, kept faint so it still reads as drawn */}
        <path
          d="M170,160 Q212,154 256,148 Q228,192 202,220 Q186,192 170,160 Z"
          fill="var(--il-laptop-hi)"
          opacity="0.2"
          stroke="none"
        />
        {/* a small drawn apple, not a brand mark */}
        <g fill="var(--il-apple)" stroke="none">
          <path d="M231,180 C226,175 218.5,177 216.5,184 C214,193.5 221,204 227,204 C229.5,204 229.5,202.5 231,202.5 C232.5,202.5 232.5,204 235,204 C241,204 248,193.5 245.5,184 C243.5,177 236,175 231,180 Z" />
          <path d="M231.5,179 C231,173.5 233,169.5 238,168.5 C238.5,174 236,178.5 231.5,179 Z" />
        </g>
        {/* base */}
        <path
          d="M164,232 Q237,223 310,214 L331,231 Q258,240 186,250 Z"
          fill="url(#baseSheen)"
        />
        <path d="M186,250 L188,255 Q259,246 331,236 L331,231" strokeWidth="1.3" fill="var(--il-laptop-2)" />
        {/* trackpad */}
        <path
          d="M232,241 Q252,238.5 272,236 L275,240.5 Q254,243.5 234,246 Z"
          strokeWidth="1"
          opacity="0.6"
          fill="var(--il-laptop-hi)"
          fillOpacity="0.45"
        />
        {/* keys */}
        <g strokeWidth="0.9" opacity="0.45">
          <path d="M198,234 Q244,229 290,224" />
          <path d="M201,239 Q246,234 292,229" />
          <path d="M204,244 Q249,239 295,234" />
        </g>
      </g>

      {/* ---------- desk line ---------- */}
      <path d="M148,256 Q292,268 497,252" strokeWidth="1.2" opacity="0.4" />

      {/* ---------- coffee: glass mug, visibly half full ---------- */}
      <g>
        <g id="steam" strokeWidth="1.3" opacity="0.6">
          <path className="steam-wisp" d="M352,170 C346,162 358,156 352,148 C347,141 356,135 352,129" />
          <path className="steam-wisp" d="M366,168 C360,160 372,154 366,146 C361,139 370,133 366,127" />
          <path className="steam-wisp" d="M380,170 C374,162 386,156 380,148 C375,141 384,135 380,129" />
        </g>
        {/* handle sits behind the body */}
        <path d="M393,190 C408,188 415,197 412,207 C409,216 401,221 392,220" />
        {/*
          A lightly transparent cup, so the liquid level is legible. The
          surface sits at the midpoint of the body rather than at the brim,
          which is what makes it read as half full rather than full.
        */}
        <path
          d="M335,177 C334,205 340,234 348,241 Q365,249 382,241 C390,234 396,205 395,177 Q365,169 335,177 Z"
          fill="var(--il-glass)"
        />
        {/* coffee below the surface line */}
        <path
          d="M338,211 Q365,219 392,211 C391,227 386,237 380,241 Q365,248 350,241 C344,237 339,227 338,211 Z"
          fill="var(--il-coffee)"
          stroke="none"
        />
        {/* the liquid surface itself */}
        <path
          d="M338,211 Q365,203 392,211 Q365,219 338,211 Z"
          fill="var(--il-coffee-top)"
          stroke="none"
        />
        <path d="M338,211 Q365,203 392,211" strokeWidth="1.1" opacity="0.5" />
        {/* cup outline drawn over the fill */}
        <path
          d="M335,177 C334,205 340,234 348,241 Q365,249 382,241 C390,234 396,205 395,177 Q365,169 335,177 Z"
          fill="none"
        />
        <path d="M335,177 Q365,185 395,177" strokeWidth="1.2" opacity="0.75" />
        <path d="M344,188 Q342,205 346,222" strokeWidth="1" opacity="0.35" />
        <g
          fill="currentColor"
          stroke="none"
          fontFamily="var(--font-hand)"
          fontSize="10"
          textAnchor="middle"
          opacity="0.75"
        >
          <text x="365" y="195">Good Code</text>
          <text x="365" y="206">Better People</text>
        </g>
      </g>

      {/* ---------- diet cola can ---------- */}
      {canImage ? (
        <image
          href={canImage}
          x={CAN_BOX.x}
          y={CAN_BOX.y}
          width={CAN_BOX.w}
          height={CAN_BOX.h}
          preserveAspectRatio="xMidYMax meet"
        />
      ) : (
        <g>
        <g>
          <path
            d="M436,168 C436,160 433,155 457,155 C461,155 478,160 478,168 L478,238 C478,246 461,251 457,251 C433,251 436,246 436,238 Z"
            fill="url(#canSheen)"
          />
          {/*
            The band wraps the cylinder, so its edges curve with the surface.
            Plain lettering rather than the brand's script: this is a drawn
            stand-in for a diet cola can, not a reproduction of a logo.
          */}
          <path
            d="M436,188 Q457,195 478,188 L478,212 Q457,219 436,212 Z"
            fill="var(--il-red)"
            stroke="none"
          />
          <g fill="#ffffff" stroke="none" fontFamily="var(--font-hand)" fontSize="10" textAnchor="middle">
            <text x="447" y="201">Diet</text>
            <text x="447" y="212">Coke</text>
          </g>
          <path d="M436,188 Q457,195 478,188" strokeWidth="1" opacity="0.45" />
          <path d="M436,212 Q457,219 478,212" strokeWidth="1" opacity="0.45" />
          {/* lid */}
          <path d="M436,168 Q457,160 478,168 Q457,176 436,168 Z" fill="var(--il-can-2)" />
          <path d="M444,167 Q457,163 470,167" strokeWidth="1" opacity="0.55" />
          <circle cx="447" cy="168" r="2.6" fill="var(--il-can-hi)" strokeWidth="0.9" />
          {/* base and a soft vertical sheen */}
          <path d="M439,241 Q457,248 475,241" strokeWidth="1.1" opacity="0.45" />
          <path d="M445,178 L445,234" strokeWidth="3" stroke="var(--il-can-hi)" opacity="0.45" strokeLinecap="round" />
          <path
            d="M436,168 C436,160 433,155 457,155 C461,155 478,160 478,168 L478,238 C478,246 461,251 457,251 C433,251 436,246 436,238 Z"
            fill="none"
          />
        </g>
        </g>
      )}

      {/* ---------- open notebook ---------- */}
      <g>
        <path
          d="M212,280 Q155,287 98,296 Q103,319 108,342 Q164,333 220,324 Q216,302 212,280 Z"
          fill="var(--il-surface)"
        />
        <path
          d="M212,280 Q271,272 330,264 Q334,287 338,310 Q279,317 220,324 Q216,302 212,280 Z"
          fill="var(--il-surface)"
        />
        <path d="M110,347 Q165,338 221,329 Q280,322 339,315" strokeWidth="1.1" opacity="0.6" />
        <path d="M212,280 Q216,302 220,324" strokeWidth="1.1" opacity="0.7" />
        <g strokeWidth="0.9" opacity="0.45">
          <path d="M120,306 Q152,301 186,297" />
          <path d="M124,317 Q156,312 190,308" />
          <path d="M128,328 Q160,323 194,319" />
        </g>
        <g
          fill="currentColor"
          stroke="none"
          fontFamily="var(--font-hand)"
          fontSize="11"
          transform="rotate(-5 265 294)"
        >
          <text x="236" y="284">Same</text>
          <text x="236" y="294.5">Curiosity</text>
          <text x="236" y="305">Different</text>
          <text x="236" y="315.5">Day</text>
        </g>
      </g>

      {/* ---------- uni-ball Eye Fine ---------- */}
      {/*
        Drawn along the same diagonal the old pen used, from the cap end at
        the top-left down to the writing tip at the bottom-right. The barrel is
        a rotated group so the parts stay in line at any scale.
      */}
      <g transform="rotate(61 364 330)">
        {/* cap barrel */}
        <rect
          x="356"
          y="272"
          width="16"
          height="34"
          rx="4"
          fill="var(--il-pen-cap)"
        />
        {/* blue end plug */}
        <path
          d="M356,276 a4,4 0 0 1 4,-4 h8 a4,4 0 0 1 4,4 v3 h-16 Z"
          fill="var(--il-pen-blue)"
        />
        {/* pocket clip */}
        <path
          d="M369.5,278 v20 a2.4,2.4 0 0 1 -2.4,2.4"
          stroke="var(--il-pen-metal)"
          strokeWidth="2"
          fill="none"
        />
        {/* grip section, slightly paler than the cap */}
        <rect x="356" y="306" width="16" height="10" rx="2" fill="var(--il-pen-grip)" />
        {/* label band */}
        <rect x="356" y="316" width="16" height="30" rx="1.5" fill="var(--il-pen-label)" />
        {/*
          Lettering is drawn small on purpose: it should read as branding at
          normal display size without turning into a logo.
        */}
        <g transform="rotate(-90 364 331)">
          <text
            x="364"
            y="329"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontSize="6.2"
            fontWeight="700"
            fill="#ffffff"
            stroke="none"
          >
            uni-ball
          </text>
          <text
            x="364"
            y="336.5"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontSize="5.4"
            fill="var(--il-pen-blue)"
            stroke="none"
          >
            eye fine
          </text>
        </g>
        {/* lower barrel and cone */}
        <rect x="356" y="346" width="16" height="28" rx="2" fill="var(--il-pen-cap)" />
        <path d="M356,374 L364,392 L372,374 Z" fill="var(--il-pen-cap)" />
        <path d="M362.6,390 L364,398 L365.4,390 Z" fill="var(--il-pen-metal)" />
        {/* a single soft highlight down the barrel */}
        <path
          d="M359.5,278 L359.5,372"
          stroke="#ffffff"
          strokeOpacity="0.28"
          strokeWidth="2"
          fill="none"
        />
        {/* outlines last, so they sit over the fills */}
        <g strokeWidth="1.4">
          <rect x="356" y="272" width="16" height="102" rx="4" fill="none" />
          <path d="M356,306 h16 M356,316 h16 M356,346 h16" strokeWidth="1" opacity="0.65" />
          <path d="M356,374 L364,392 L372,374" fill="none" />
        </g>
      </g>

    </svg>
  );
}
