/** The Foreseen eye mark with an oracle glow halo. */
export function Logo({
  size = 40,
  glow = true,
  className = "",
  eyeOnly = false,
}: {
  size?: number;
  glow?: boolean;
  className?: string;
  /** Use the text-free eye mark (no "FORESEEN" wordmark) — for large floating logos. */
  eyeOnly?: boolean;
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={eyeOnly ? "/foreseen-eye.svg" : "/foreseen-eye.jpg"}
        alt="Foreseen"
        width={size}
        height={size}
        className="relative rounded-full object-cover ring-1 ring-white/15"
        style={{ width: size, height: size }}
      />
    </span>
  );
}
