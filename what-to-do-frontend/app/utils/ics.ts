export type ICSDownloadEvent = {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  url?: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatICSDateUTC(date: Date) {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function escapeICS(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function sanitizeFileName(value: string) {
  return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").trim() || "event";
}

function buildICSContent(event: ICSDownloadEvent) {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@yourapp.com`;
  const dtstamp = formatICSDateUTC(new Date());

  const descriptionParts = [
    event.description?.trim(),
    event.url?.trim(),
  ].filter(Boolean) as string[];

  const description = descriptionParts.join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YourApp//AI Activity Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatICSDateUTC(event.start)}`,
    `DTEND:${formatICSDateUTC(event.end)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `LOCATION:${escapeICS(event.location ?? "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

export function downloadICS(event: ICSDownloadEvent) {
  const icsContent = buildICSContent(event);
  const blob = new Blob([icsContent], {
    type: "text/calendar;charset=utf-8",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFileName(event.title)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
