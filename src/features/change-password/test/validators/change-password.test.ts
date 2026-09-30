import { ChangePasswrodSchema } from '@features/change-password/validators/change-password';

const validOldPassword = 'OldPassw0rd';
const validNewPassword = 'NewPassw0rd!';

const validPayload = {
  oldPassword: validOldPassword,
  newPassword: validNewPassword,
  confirmPassword: validNewPassword,
};

/** Parses a change-password payload and returns the parsed data when it is valid. */
const expectValid = (data: unknown) => {
  const result = ChangePasswrodSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Expected valid change password payload, got: ${JSON.stringify(result.error.issues)}`
    );
  }
  return result.data;
};

/** Parses a change-password payload and asserts it is invalid, optionally matching the first issue message. */
const expectInvalid = (data: unknown, message?: string) => {
  const result = ChangePasswrodSchema.safeParse(data);
  expect(result.success).toBeFalsy();
  if (message) {
    expect(result.error?.issues[0]?.message).toBe(message);
  }
};

describe('ChangePasswrodSchema - Valid Input', () => {
  it('accepts distinct old and new passwords with a matching confirmation', () => {
    expect(expectValid(validPayload)).toEqual(validPayload);
  });

  it('strips unknown keys from a valid change-password payload', () => {
    expectValid({ ...validPayload, rememberMe: true });
  });
});

describe('ChangePasswrodSchema - oldPassword', () => {
  describe('length boundaries', () => {
    it('accepts an old password of exactly 8 characters (minimum)', () => {
      expectValid({ ...validPayload, oldPassword: '12345678' });
    });

    it('accepts an old password of exactly 50 characters (maximum)', () => {
      expectValid({ ...validPayload, oldPassword: 'a'.repeat(50) });
    });

    it('rejects an old password shorter than 8 characters', () => {
      expectInvalid(
        { ...validPayload, oldPassword: '1234567' },
        'Password must be at least 8 characters'
      );
    });

    it('rejects an old password longer than 50 characters', () => {
      expectInvalid(
        { ...validPayload, oldPassword: 'a'.repeat(51) },
        'Password must be at most 50 characters'
      );
    });

    it('rejects an empty old password', () => {
      expectInvalid({ ...validPayload, oldPassword: '' }, 'Password must be at least 8 characters');
    });

    it('rejects a single-space old password', () => {
      expectInvalid(
        { ...validPayload, oldPassword: ' ' },
        'Password must be at least 8 characters'
      );
    });
  });

  describe('character content (no strength rule is enforced)', () => {
    it.each(['lowercase', 'UPPERCASE', '12345678', '!@#$%^&*', 'aaaaaaaa', 'pässwörd123'])(
      'accepts old password %s once it meets the length',
      (password) => {
        expectValid({ ...validPayload, oldPassword: password });
      }
    );
  });

  describe('invalid types', () => {
    it('rejects a missing oldPassword', () => {
      expectInvalid(
        { newPassword: validNewPassword, confirmPassword: validNewPassword },
        'Password is required'
      );
    });

    it('rejects a null oldPassword', () => {
      expectInvalid({ ...validPayload, oldPassword: null }, 'Password is required');
    });

    it('rejects an undefined oldPassword', () => {
      expectInvalid({ ...validPayload, oldPassword: undefined }, 'Password is required');
    });

    it('rejects a numeric oldPassword', () => {
      expectInvalid({ ...validPayload, oldPassword: 12345678 }, 'Password is required');
    });

    it('rejects a boolean oldPassword', () => {
      expectInvalid({ ...validPayload, oldPassword: true }, 'Password is required');
    });

    it('rejects an object oldPassword', () => {
      expectInvalid({ ...validPayload, oldPassword: {} }, 'Password is required');
    });
  });
});

describe('ChangePasswrodSchema - newPassword', () => {
  describe('length boundaries', () => {
    it('accepts a new password of exactly 8 characters (minimum)', () => {
      expectValid({ ...validPayload, newPassword: '12345678', confirmPassword: '12345678' });
    });

    it('accepts a new password of exactly 50 characters (maximum)', () => {
      expectValid({
        ...validPayload,
        newPassword: 'a'.repeat(50),
        confirmPassword: 'a'.repeat(50),
      });
    });

    it('rejects a new password shorter than 8 characters', () => {
      expectInvalid(
        { ...validPayload, newPassword: '1234567', confirmPassword: '1234567' },
        'Password must be at least 8 characters'
      );
    });

    it('rejects a new password longer than 50 characters', () => {
      expectInvalid(
        { ...validPayload, newPassword: 'a'.repeat(51), confirmPassword: 'a'.repeat(51) },
        'Password must be at most 50 characters'
      );
    });

    it('rejects an empty new password', () => {
      expectInvalid(
        { ...validPayload, newPassword: '', confirmPassword: '' },
        'Password must be at least 8 characters'
      );
    });

    it('rejects a single-space new password', () => {
      expectInvalid(
        { ...validPayload, newPassword: ' ', confirmPassword: ' ' },
        'Password must be at least 8 characters'
      );
    });
  });

  describe('character content (no strength rule is enforced)', () => {
    it.each(['lowercase', 'UPPERCASE', '12345678', '!@#$%^&*', 'aaaaaaaa', 'pässwörd123'])(
      'accepts new password %s once it meets the length',
      (password) => {
        expectValid({ ...validPayload, newPassword: password, confirmPassword: password });
      }
    );
  });

  describe('invalid types', () => {
    it('rejects a missing newPassword', () => {
      expectInvalid(
        { oldPassword: validOldPassword, confirmPassword: validNewPassword },
        'Password is required'
      );
    });

    it('rejects a null newPassword', () => {
      expectInvalid({ ...validPayload, newPassword: null }, 'Password is required');
    });

    it('rejects an undefined newPassword', () => {
      expectInvalid({ ...validPayload, newPassword: undefined }, 'Password is required');
    });

    it('rejects a numeric newPassword', () => {
      expectInvalid({ ...validPayload, newPassword: 12345678 }, 'Password is required');
    });

    it('rejects a boolean newPassword', () => {
      expectInvalid({ ...validPayload, newPassword: true }, 'Password is required');
    });

    it('rejects an object newPassword', () => {
      expectInvalid({ ...validPayload, newPassword: {} }, 'Password is required');
    });
  });
});

describe('ChangePasswrodSchema - confirmPassword', () => {
  describe('length boundaries', () => {
    it('accepts a confirm password of exactly 8 characters (minimum)', () => {
      expectValid({ ...validPayload, newPassword: '12345678', confirmPassword: '12345678' });
    });

    it('accepts a confirm password of exactly 50 characters (maximum)', () => {
      expectValid({
        ...validPayload,
        newPassword: 'a'.repeat(50),
        confirmPassword: 'a'.repeat(50),
      });
    });

    it('rejects a confirm password shorter than 8 characters', () => {
      expectInvalid(
        { ...validPayload, confirmPassword: '1234567' },
        'Password must be at least 8 characters'
      );
    });

    it('rejects a confirm password longer than 50 characters', () => {
      expectInvalid(
        { ...validPayload, confirmPassword: 'a'.repeat(51) },
        'Password must be at most 50 characters'
      );
    });

    it('rejects an empty confirm password', () => {
      expectInvalid(
        { ...validPayload, confirmPassword: '' },
        'Password must be at least 8 characters'
      );
    });

    it('rejects a single-space confirm password', () => {
      expectInvalid(
        { ...validPayload, confirmPassword: ' ' },
        'Password must be at least 8 characters'
      );
    });
  });

  describe('invalid types', () => {
    it('rejects a missing confirmPassword', () => {
      expectInvalid(
        { oldPassword: validOldPassword, newPassword: validNewPassword },
        'Password is required'
      );
    });

    it('rejects a null confirmPassword', () => {
      expectInvalid({ ...validPayload, confirmPassword: null }, 'Password is required');
    });

    it('rejects an undefined confirmPassword', () => {
      expectInvalid({ ...validPayload, confirmPassword: undefined }, 'Password is required');
    });

    it('rejects a numeric confirmPassword', () => {
      expectInvalid({ ...validPayload, confirmPassword: 12345678 }, 'Password is required');
    });

    it('rejects a boolean confirmPassword', () => {
      expectInvalid({ ...validPayload, confirmPassword: true }, 'Password is required');
    });

    it('rejects an object confirmPassword', () => {
      expectInvalid({ ...validPayload, confirmPassword: {} }, 'Password is required');
    });
  });
});

describe('ChangePasswrodSchema - Cross-Field: Password Match', () => {
  it('accepts matching new and confirm passwords', () => {
    expectValid({ ...validPayload, newPassword: 'abc12345', confirmPassword: 'abc12345' });
  });

  it('rejects when the new and confirm passwords differ', () => {
    expectInvalid(
      { ...validPayload, confirmPassword: 'Different1' },
      'New password and confirm password do not match.'
    );
  });

  it('reports the mismatch on the confirmPassword field', () => {
    const result = ChangePasswrodSchema.safeParse({
      ...validPayload,
      confirmPassword: 'Different1',
    });
    expect(result.success).toBeFalsy();
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
        'New password and confirm password do not match.'
      );
    }
  });

  it('does not add a mismatch issue when both new and confirm passwords are missing', () => {
    const result = ChangePasswrodSchema.safeParse({ oldPassword: validOldPassword });
    expect(result.success).toBeFalsy();
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).not.toContain(
        'New password and confirm password do not match.'
      );
    }
  });

  it('does not add a mismatch issue when the new password fails field validation', () => {
    const result = ChangePasswrodSchema.safeParse({
      oldPassword: validOldPassword,
      newPassword: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBeFalsy();
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).not.toContain(
        'New password and confirm password do not match.'
      );
    }
  });
});

describe('ChangePasswrodSchema - Cross-Field: Old vs New Password', () => {
  it('rejects a new password identical to the old password', () => {
    expectInvalid(
      {
        oldPassword: validOldPassword,
        newPassword: validOldPassword,
        confirmPassword: validOldPassword,
      },
      'New password and old password cannot be the same.'
    );
  });

  it('reports the same-password issue on the newPassword field', () => {
    const result = ChangePasswrodSchema.safeParse({
      oldPassword: validOldPassword,
      newPassword: validOldPassword,
      confirmPassword: validOldPassword,
    });
    expect(result.success).toBeFalsy();
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['newPassword']);
      expect(result.error.flatten().fieldErrors.newPassword).toContain(
        'New password and old password cannot be the same.'
      );
    }
  });

  it('adds only the same-password issue when all three passwords are identical', () => {
    const result = ChangePasswrodSchema.safeParse({
      oldPassword: validOldPassword,
      newPassword: validOldPassword,
      confirmPassword: validOldPassword,
    });
    expect(result.success).toBeFalsy();
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toEqual(['New password and old password cannot be the same.']);
    }
  });

  it('does not add a same-password issue when the old password field is missing', () => {
    const result = ChangePasswrodSchema.safeParse({
      newPassword: validNewPassword,
      confirmPassword: validNewPassword,
    });
    expect(result.success).toBeFalsy();
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).not.toContain(
        'New password and old password cannot be the same.'
      );
    }
  });
});

describe('ChangePasswrodSchema - Cross-Field: Combined', () => {
  it('reports both cross-field issues when the passwords repeat and the confirmation differs', () => {
    const result = ChangePasswrodSchema.safeParse({
      oldPassword: validOldPassword,
      newPassword: validOldPassword,
      confirmPassword: 'Different1',
    });
    expect(result.success).toBeFalsy();
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toEqual([
        'New password and confirm password do not match.',
        'New password and old password cannot be the same.',
      ]);
      const paths = result.error.issues.map((issue) => issue.path);
      expect(paths).toEqual([['confirmPassword'], ['newPassword']]);
    }
  });
});

describe('ChangePasswrodSchema - Whole Object', () => {
  it('rejects an empty object', () => {
    expectInvalid({}, 'Password is required');
  });

  it('rejects when only the confirm password is provided', () => {
    expectInvalid({ confirmPassword: validNewPassword }, 'Password is required');
  });

  it('rejects when only the old password is provided', () => {
    expectInvalid({ oldPassword: validOldPassword }, 'Password is required');
  });
});
