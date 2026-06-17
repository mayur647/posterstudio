/** Shared prop shapes for the poster components. */

export interface CalendarTile {
  emoji: string;
  name: string;
  /** "THU" */
  weekday: string;
  /** "JUN 25" */
  monthDay: string;
  /** "6:00 PM" or "" */
  time: string;
  /** "FREE" / "₹600" */
  price: string;
}

export interface Logos {
  nomadgao: string;
  hotpot: string;
}

export interface CalendarPosterProps {
  /** Fixed brand title — does not shuffle. */
  title: string;
  /** "JUN 22 – 28" */
  dateRange: string;
  tiles: CalendarTile[];
  /** Brand logo URLs; defaults to the bundled assets. */
  logos?: Logos;
}

export interface EventPosterProps {
  dateChip: { dow: string; md: string };
  title: string;
  description: string;
  time: string;
  where: string;
  price: string;
  /** Background image URL (already resolved from the event type's library). */
  bgUrl: string | null;
  /** Brand logo URLs; defaults to the bundled assets. */
  logos?: Logos;
}

export const LOGO_NOMADGAO = "/logos/nomadgao.png";
export const LOGO_HOTPOT = "/logos/hotpot-house.png";
export const DEFAULT_LOGOS: Logos = {
  nomadgao: LOGO_NOMADGAO,
  hotpot: LOGO_HOTPOT,
};

/** Top + bottom scrim so chips/title read on light photos. */
export const PHOTO_SCRIM =
  "linear-gradient(to top,rgba(38,28,20,.68) 0%,rgba(38,28,20,.30) 33%,rgba(38,28,20,.15) 58%,rgba(38,28,20,.52) 100%)";
