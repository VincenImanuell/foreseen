import type { SVGProps } from "react";

/** Shared monoline icon set for the landing page's step/feature grids —
 *  replaces emoji glyphs with intentional, currentColor strokes so the
 *  icon tint follows each card's accent instead of rendering as flat
 *  platform emoji art. 24×24 viewBox, 1.75px stroke, round joins. */
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

/** Two players meeting at a table — matchmaking. */
export function MatchmakeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="9.5" cy="12" r="6" />
      <circle cx="14.5" cy="12" r="6" />
    </Icon>
  );
}

/** Magnifying glass — scouting an opponent's history. */
export function ScoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.4 15.4 20 20" />
    </Icon>
  );
}

/** Padlock — sealing a move as a hash. */
export function CommitIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </Icon>
  );
}

/** Open eye — revealing the sealed move. Echoes the Foreseen brand mark. */
export function RevealIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </Icon>
  );
}

/** Ascending bars — behavioral profiling / move-distribution stats. */
export function ProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5 20V13" />
      <path d="M12 20V7" />
      <path d="M19 20v-6.5" />
    </Icon>
  );
}

/** Shield with a star — soulbound rank badges. */
export function RankIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 19 6v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6Z" />
      <path d="M12 9.25 12.9 11l1.9.28-1.4 1.33.33 1.9L12 13.6l-1.72.9.33-1.9-1.4-1.33 1.9-.28Z" />
    </Icon>
  );
}

/** Shield with a keyhole — commit–reveal fairness. */
export function FairnessIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 19 6v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6Z" />
      <circle cx="12" cy="10.75" r="1.6" />
      <path d="M12 12.35 12 15" />
    </Icon>
  );
}

/** Chain links — on-chain history that can't be hidden or faked. */
export function ChainIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="8.5" width="8" height="7" rx="3.5" />
      <rect x="12.5" y="8.5" width="8" height="7" rx="3.5" />
    </Icon>
  );
}

/** Balance scale — skill, not gambling. */
export function ScaleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 4v16" />
      <path d="M7 20h10" />
      <path d="M4.5 8.5h6M13.5 8.5h6" />
      <path d="M4.5 8.5 2.5 13a2.5 2.5 0 0 0 4.9 0Z" />
      <path d="M19.5 8.5 17.5 13a2.5 2.5 0 0 0 4.9 0Z" />
    </Icon>
  );
}
