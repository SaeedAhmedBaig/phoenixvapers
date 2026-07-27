/**
 * @phoenix/utils/time — small date helpers shared by both front-ends.
 * No date library is added for this (none exists in the project yet);
 * a single relative-age helper doesn't warrant one.
 */

/**
 * Relative age of a timestamp, with a tone that escalates the longer
 * something has been waiting — used to flag admin queue items that have
 * sat too long (spec §25.2 exception-first dashboards).
 *
 * @param {string|Date} date
 * @returns {{ label: string, tone: "neutral"|"warning"|"destructive" }}
 */
export function formatAge(date) {
  const then = date instanceof Date ? date : new Date(date);
  const ms = Date.now() - then.getTime();
  const hours = ms / (1000 * 60 * 60);

  if (hours < 1) return { label: "just now", tone: "neutral" };
  if (hours < 24) return { label: `${Math.round(hours)}h`, tone: "neutral" };

  const days = hours / 24;
  if (days < 3) return { label: `${Math.round(days)}d`, tone: "warning" };
  return { label: `${Math.round(days)}d`, tone: "destructive" };
}
