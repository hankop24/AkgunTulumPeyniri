export const money = (value) => new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0
}).format(Number(value || 0));

export const normalizeText = (value = "") => String(value).trim().toLocaleLowerCase("tr-TR");

export function parseTags(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugPhone(value = "") {
  return String(value).replace(/[^0-9]/g, "");
}
