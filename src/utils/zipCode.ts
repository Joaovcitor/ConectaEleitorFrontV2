export const normalizeZipCode = (value?: string | null) => (value ?? "").replace(/\D/g, "");

export const isValidZipCode = (value?: string | null) => normalizeZipCode(value).length === 8;

export const formatZipCode = (value?: string | null) => {
  const digits = normalizeZipCode(value);
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : value ?? "-";
};
