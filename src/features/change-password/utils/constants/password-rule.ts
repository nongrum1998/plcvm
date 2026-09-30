type RuleKey = 'minLength' | 'upper' | 'lower' | 'digit' | 'special';

interface RequirementRule {
  key: RuleKey;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: RequirementRule[] = [
  {
    key: 'minLength',
    label: 'At least 8 characters long',
    test: (value) => value.length >= 8,
  },
  {
    key: 'upper',
    label: 'At least one uppercase letter (A-Z)',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: 'lower',
    label: 'At least one lowercase letter (a-z)',
    test: (value) => /[a-z]/.test(value),
  },
  {
    key: 'digit',
    label: 'At least one numeric digit (0-9)',
    test: (value) => /[0-9]/.test(value),
  },
  {
    key: 'special',
    label: 'At least one special character (!@#%^&*)',
    test: (value) => /[!@#%^&*(),.?":{}|<>]/.test(value),
  },
];
