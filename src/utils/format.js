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
  let digits = String(value || "").replace(/[^0-9]/g, "");

  // 0090... yazılırsa 90... formatına çevir.
  if (digits.startsWith("00")) digits = digits.slice(2);

  // Türkiye numaraları için WhatsApp'ın istediği format: 905XXXXXXXXX
  if (digits.startsWith("0") && digits.length === 11) digits = `90${digits.slice(1)}`;
  if (digits.startsWith("5") && digits.length === 10) digits = `90${digits}`;

  return digits;
}

export function phoneHref(value = "") {
  const digits = slugPhone(value);
  return digits ? `+${digits}` : "";
}
