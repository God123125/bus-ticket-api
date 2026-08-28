export const standardisePhone = (rawPhone: string): string => {
  // Normalize by stripping non-digits
  const clean = rawPhone.replace(/\D/g, "");

  // Cambodian numbers starting with 855
  if (clean.startsWith("855")) {
    const localPart = clean.slice(3); // e.g. 969474165
    // Format as +855 XX XXX XXX or 0XX XXX XXX
    if (localPart.length === 8) {
      // 2-digit prefix + 3 digits + 3 digits (e.g. +855 12 345 678)
      return `+855 ${localPart.slice(0, 2)} ${localPart.slice(2, 5)} ${localPart.slice(5)}`;
    } else if (localPart.length === 9) {
      // 3-digit prefix + 3 digits + 3 digits (e.g. +855 96 947 4165)
      return `+855 ${localPart.slice(0, 2)} ${localPart.slice(2, 5)} ${localPart.slice(5)}`;
    }
    return `+855 ${localPart}`;
  }

  return clean.startsWith("+") ? clean : `+${clean}`;
};
