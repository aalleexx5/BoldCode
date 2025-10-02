export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length === 0) return '';
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  if (cleaned.length <= 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};

export const validatePhoneNumber = (value: string): { isValid: boolean; error?: string } => {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length === 0) {
    return { isValid: true };
  }

  if (cleaned.length < 10) {
    return {
      isValid: false,
      error: 'Phone number must have 10 digits (e.g., 714-270-8047)'
    };
  }

  if (cleaned.length > 10) {
    return {
      isValid: false,
      error: 'Phone number has too many digits. Expected format: 714-270-8047'
    };
  }

  return { isValid: true };
};
