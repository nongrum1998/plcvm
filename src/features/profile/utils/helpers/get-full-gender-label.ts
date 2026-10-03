export function getFullGenderLabel(value: 'M' | 'F') {
  return value === 'M' ? 'Male' : value === 'F' ? 'Female' : 'Other';
}
