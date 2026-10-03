import { LoginSchema } from '@features/login/validators/login';
import { formatPassword } from '@lib/encryption/format-password';

jest.mock('@lib/encryption/format-password', () => ({
  formatPassword: jest.fn((value: string) => `formatted:${value}`),
}));

const validUsername = 'PPO/123';
const validPassword = 'Password1';

/** Parses a login payload and returns the parsed data when it is valid. */
const expectValid = (data: unknown) => {
  const result = LoginSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Expected valid login, got: ${JSON.stringify(result.error.issues)}`);
  }
  return result.data;
};

/** Parses a login payload and asserts it is invalid, optionally matching the first issue message. */
const expectInvalid = (data: unknown, message?: string) => {
  const result = LoginSchema.safeParse(data);
  expect(result.success).toBeFalsy();
  if (message) {
    expect(result.error?.issues[0]?.message).toBe(message);
  }
};

describe('LoginSchema - Valid Login', () => {
  it('accepts a valid username and password', () => {
    expect(expectValid({ username: validUsername, password: validPassword })).toEqual({
      username: validUsername,
      password: `formatted:${validPassword}`,
    });
  });

  it('strips unknown keys from a valid login', () => {
    expectValid({ username: validUsername, password: validPassword, rememberMe: true });
  });
});

describe('LoginSchema - Username', () => {
  describe('length boundaries', () => {
    it('accepts a username of exactly 3 characters (minimum)', () => {
      expectValid({ username: 'abc', password: validPassword });
    });

    it('accepts a username of exactly 20 characters (maximum)', () => {
      expectValid({ username: 'a'.repeat(20), password: validPassword });
    });

    it('rejects a username shorter than 3 characters', () => {
      expectInvalid({ username: 'ab', password: validPassword }, 'Invalid Username');
    });

    it('rejects a username longer than 20 characters', () => {
      expectInvalid({ username: 'a'.repeat(21), password: validPassword }, 'Invalid Username');
    });

    it('rejects an empty username', () => {
      expectInvalid({ username: '', password: validPassword }, 'Invalid Username');
    });

    it('rejects a whitespace-only username', () => {
      expectInvalid({ username: '   ', password: validPassword }, 'Invalid Username');
    });
  });

  describe('allowed characters', () => {
    it.each(['PPO123', 'user_name', 'PPO/123', '_user1', 'user1/'])(
      'accepts username %s',
      (username) => {
        expectValid({ username, password: validPassword });
      }
    );

    it('accepts a username made of only underscores', () => {
      expectValid({ username: '___', password: validPassword });
    });

    it('accepts a username made of only forward slashes', () => {
      expectValid({ username: '///', password: validPassword });
    });

    it.each(['user-name', 'user.name', 'user@name', "user'name", 'user+name', 'usér1', 'user😀'])(
      'rejects username %s',
      (username) => {
        expectInvalid({ username, password: validPassword }, 'Invalid Username');
      }
    );
  });

  describe('whitespace', () => {
    it('rejects leading whitespace (regex runs before trim)', () => {
      expectInvalid({ username: ' abc', password: validPassword }, 'Invalid Username');
    });

    it('rejects trailing whitespace (regex runs before trim)', () => {
      expectInvalid({ username: 'abc ', password: validPassword }, 'Invalid Username');
    });

    it('rejects an embedded space', () => {
      expectInvalid({ username: 'ab c', password: validPassword }, 'Invalid Username');
    });

    it('rejects tab characters', () => {
      expectInvalid({ username: 'ab\tc', password: validPassword }, 'Invalid Username');
    });

    it('rejects newline characters', () => {
      expectInvalid({ username: 'ab\nc', password: validPassword }, 'Invalid Username');
    });
  });

  describe('invalid types', () => {
    it('rejects a missing username', () => {
      expectInvalid({ password: validPassword }, 'Username is Required');
    });

    it('rejects a null username', () => {
      expectInvalid({ username: null, password: validPassword }, 'Username is Required');
    });

    it('rejects an undefined username', () => {
      expectInvalid({ username: undefined, password: validPassword }, 'Username is Required');
    });

    it('rejects a numeric username', () => {
      expectInvalid({ username: 12345, password: validPassword }, 'Username is Required');
    });

    it('rejects a boolean username', () => {
      expectInvalid({ username: true, password: validPassword }, 'Username is Required');
    });

    it('rejects an object username', () => {
      expectInvalid({ username: {}, password: validPassword }, 'Username is Required');
    });
  });
});

describe('LoginSchema - Password', () => {
  describe('length boundaries', () => {
    it('accepts a password of exactly 8 characters (minimum)', () => {
      expectValid({ username: validUsername, password: '12345678' });
    });

    it('accepts a password of exactly 50 characters (maximum)', () => {
      expectValid({ username: validUsername, password: 'a'.repeat(50) });
    });

    it('rejects a password shorter than 8 characters', () => {
      expectInvalid(
        { username: validUsername, password: '1234567' },
        'Password must be at least 8 characters'
      );
    });

    it('rejects a password longer than 50 characters', () => {
      expectInvalid(
        { username: validUsername, password: 'a'.repeat(51) },
        'Password must be at most 50 characters'
      );
    });

    it('rejects an empty password', () => {
      expectInvalid(
        { username: validUsername, password: '' },
        'Password must be at least 8 characters'
      );
    });

    it('rejects a single-space password', () => {
      expectInvalid(
        { username: validUsername, password: ' ' },
        'Password must be at least 8 characters'
      );
    });
  });

  describe('character content (no strength rule is enforced)', () => {
    it.each(['lowercase', 'UPPERCASE', '12345678', '!@#$%^&*', 'aaaaaaaa', 'pässwörd123'])(
      'accepts password %s once it meets the length',
      (password) => {
        expectValid({ username: validUsername, password });
      }
    );

    it('accepts a whitespace-only password of 8 or more characters', () => {
      expectValid({ username: validUsername, password: '        ' });
    });

    it('does not trim surrounding whitespace before validating length', () => {
      expectValid({ username: validUsername, password: 'password ' });
    });
  });

  describe('invalid types', () => {
    it('rejects a missing password', () => {
      expectInvalid({ username: validUsername }, 'Password is required');
    });

    it('rejects a null password', () => {
      expectInvalid({ username: validUsername, password: null }, 'Password is required');
    });

    it('rejects an undefined password', () => {
      expectInvalid({ username: validUsername, password: undefined }, 'Password is required');
    });

    it('rejects a numeric password', () => {
      expectInvalid({ username: validUsername, password: 12345678 }, 'Password is required');
    });

    it('rejects a boolean password', () => {
      expectInvalid({ username: validUsername, password: true }, 'Password is required');
    });

    it('rejects an object password', () => {
      expectInvalid({ username: validUsername, password: {} }, 'Password is required');
    });
  });
});

describe('LoginSchema - Password Transform', () => {
  beforeEach(() => {
    jest.mocked(formatPassword).mockClear();
  });

  it('formats a valid password with formatPassword', () => {
    const data = expectValid({ username: validUsername, password: 'abc12345' });
    expect(data.password).toBe('formatted:abc12345');
    expect(jest.mocked(formatPassword)).toHaveBeenCalledWith('abc12345');
  });

  it('does not call formatPassword when the password itself is invalid', () => {
    expectInvalid({ username: validUsername, password: 'short' });
    expect(jest.mocked(formatPassword)).not.toHaveBeenCalled();
  });

  it('still calls formatPassword when the username is invalid (fields parse independently)', () => {
    expectInvalid({ username: 'x', password: validPassword });
    expect(jest.mocked(formatPassword)).toHaveBeenCalledWith(validPassword);
  });
});

describe('LoginSchema - Whole Object', () => {
  it('rejects an empty object', () => {
    expectInvalid({}, 'Username is Required');
  });

  it('rejects when only the password is provided', () => {
    expectInvalid({ password: validPassword }, 'Username is Required');
  });

  it('rejects when only the username is provided', () => {
    expectInvalid({ username: validUsername }, 'Password is required');
  });

  it('rejects a login with an invalid username and a valid password', () => {
    expectInvalid({ username: 'bad user', password: validPassword }, 'Invalid Username');
  });

  it('rejects a login with a valid username and an invalid password', () => {
    expectInvalid(
      { username: validUsername, password: 'short' },
      'Password must be at least 8 characters'
    );
  });
});
