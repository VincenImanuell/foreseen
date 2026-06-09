/**
 * The Foreseen eye mark — a clean SVG (no baked-in wordmark, so it never gets
 * clipped by a circular crop). The "Foreseen" wordmark is rendered as separate
 * text wherever it's needed. Scales crisp at any size; optional oracle glow halo.
 */
export function Logo({
  size = 40,
  glow = true,
  className = "",
}: {
  size?: number;
  glow?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-grid place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-oracle-purple/40 blur-xl animate-glowPulse"
        />
      )}
      <svg
        role="img"
        aria-label="Foreseen"
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        className="relative"
        style={{ width: size, height: size }}
      >
        <defs>
          <linearGradient id="fsGold" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F6DA92" />
            <stop offset="1" stopColor="#C8962F" />
          </linearGradient>
        </defs>

        {/* eye outline (vesica) */}
        <path
          d="M4 32 Q 32 8 60 32 Q 32 56 4 32 Z"
          stroke="url(#fsGold)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* iris rings */}
        <circle cx="32" cy="32" r="15" stroke="url(#fsGold)" strokeWidth="1.5" opacity="0.85" />
        <circle
          cx="32"
          cy="32"
          r="11.5"
          stroke="#5EEAD4"
          strokeWidth="1.4"
          strokeDasharray="0.8 2.4"
          opacity="0.85"
        />
        <circle cx="32" cy="32" r="8" stroke="url(#fsGold)" strokeWidth="1.4" />

        {/* hexagonal iris core */}
        <path d="M32 26 L37 29 L37 35 L32 38 L27 35 L27 29 Z" fill="url(#fsGold)" />

        {/* cyan corner accents */}
        <path d="M4 32 H 12" stroke="#5EEAD4" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M60 32 H 52" stroke="#5EEAD4" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}
