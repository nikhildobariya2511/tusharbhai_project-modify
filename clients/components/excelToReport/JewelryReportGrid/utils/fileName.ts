// utils/fileName.ts
export type BuildNameOptions = {
  /** If provided, used as the root (e.g. report number). Otherwise "batch" */
  root?: string;
  /** If true, omit the root and return only the timestamp */
  timestampOnly?: boolean;
  /** Provide a specific date (useful for tests). Defaults to now. */
  date?: Date;
};

/** Sanitize a string so it's safe for filenames on most OSes. */
export function sanitizeFilename(name: string) {
  return (
    String(name ?? "")
      .trim()
      // Replace whitespace groups with underscore
      .replace(/\s+/g, "_")
      // Remove everything except letters, numbers, underscore, dot and hyphen
      // (we purposely disallow slashes, colons, etc.)
      .replace(/[^\w.\-]/g, "")
      // remove multiple underscores
      .replace(/_+/g, "_")
      // trim underscores/dots/hyphens at ends
      .replace(/^[_\-.]+|[_\-.]+$/g, "")
  );
}

/** Format a Date in Asia/Kolkata (IST) as: dd-mm-yyyy-hh-mmam-IST (filename-safe) */
export function formatDateForFilename(date: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const parts = fmt
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type && p.value) acc[p.type] = p.value;
      return acc;
    }, {});

  const day = parts.day ?? "00";
  const month = parts.month ?? "00";
  const year = parts.year ?? "0000";
  let hour = parts.hour ?? "00"; // 01..12
  const minute = parts.minute ?? "00";
  const second = parts.second ?? "00";
  const ampm = (parts.dayPeriod ?? "AM").toLowerCase(); // am | pm

  if (hour.length === 1) hour = "0" + hour;

  // Example: 21-11-2025-08-05am-IST
  return `${day}-${month}-${year}-${hour}-${minute}-${second}-${ampm}`;
}

/** Build a safe filename root (root + '_' + timestamp) or just timestamp if requested */
export function buildFileNameRoot(opts: BuildNameOptions = {}) {
  const date = new Date();
  const ts = formatDateForFilename(date);

  //   if (opts.timestampOnly)
  return ts;

  //   const rawRoot = String(opts.root ?? "batch");
  //   const safeRoot = sanitizeFilename(rawRoot) || "batch";
  //   return `${safeRoot}_${ts}`;
}
