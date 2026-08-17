export const parseStringArray = (value: any): string[] => {
  if (!value) return [];
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => (typeof item === "string" ? item.split(",") : item))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};
