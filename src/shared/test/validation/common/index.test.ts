import { PAGE_SIZE } from '@utils/constants/common';
import {
  pageNumberValidation,
  pageSizeValidation,
  passwordValidation,
  uuidValidation,
} from '@validation/common';
import { z } from 'zod';

/** Parses a value with a schema and returns the parsed data when it is valid. */
const expectValid = <T>(schema: z.ZodType<T>, input: unknown): T => {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(`Expected valid input, got: ${JSON.stringify(result.error.issues)}`);
  }
  return result.data;
};

/** Parses a value with a schema and asserts it is invalid, optionally matching the first issue message. */
const expectInvalid = (schema: z.ZodType<unknown>, input: unknown, message?: string) => {
  const result = schema.safeParse(input);
  expect(result.success).toBeFalsy();
  if (message) {
    expect(result.error?.issues[0]?.message).toBe(message);
  }
};

describe('uuidValidation', () => {
  describe('valid UUIDs', () => {
    it('accepts a standard v4 UUID', () => {
      expect(expectValid(uuidValidation, '123e4567-e89b-12d3-a456-426614174000')).toBe(
        '123e4567-e89b-12d3-a456-426614174000'
      );
    });

    it('accepts a UUID with uppercase hex characters', () => {
      expect(expectValid(uuidValidation, '123E4567-E89B-12D3-A456-426614174000')).toBe(
        '123E4567-E89B-12D3-A456-426614174000'
      );
    });

    it('accepts a v1 UUID', () => {
      expect(expectValid(uuidValidation, '550e8400-e29b-11d4-a716-446655440000')).toBe(
        '550e8400-e29b-11d4-a716-446655440000'
      );
    });
  });

  describe('invalid UUIDs', () => {
    it('rejects a non-UUID string', () => {
      expectInvalid(uuidValidation, 'not-a-uuid', 'Invalid ID');
    });

    it('rejects a UUID with wrong segment lengths', () => {
      expectInvalid(uuidValidation, '123e4567-e89b-12d3-a456', 'Invalid ID');
    });

    it('rejects an empty string', () => {
      expectInvalid(uuidValidation, '', 'Invalid ID');
    });

    it('rejects null and undefined', () => {
      expectInvalid(uuidValidation, null, 'Invalid ID');
      expectInvalid(uuidValidation, undefined, 'Invalid ID');
    });

    it('rejects non-string types', () => {
      expectInvalid(uuidValidation, 123, 'Invalid ID');
      expectInvalid(uuidValidation, true, 'Invalid ID');
      expectInvalid(uuidValidation, {}, 'Invalid ID');
      expectInvalid(uuidValidation, [], 'Invalid ID');
    });
  });
});

describe('passwordValidation', () => {
  describe('length boundaries', () => {
    it('accepts a password of exactly 8 characters (minimum)', () => {
      expect(expectValid(passwordValidation, '12345678')).toBe('12345678');
    });

    it('accepts a password of exactly 50 characters (maximum)', () => {
      expect(expectValid(passwordValidation, 'a'.repeat(50))).toBe('a'.repeat(50));
    });

    it('rejects a password shorter than 8 characters', () => {
      expectInvalid(passwordValidation, '1234567', 'Password must be at least 8 characters');
    });

    it('rejects a password longer than 50 characters', () => {
      expectInvalid(passwordValidation, 'a'.repeat(51), 'Password must be at most 50 characters');
    });

    it('rejects an empty password', () => {
      expectInvalid(passwordValidation, '', 'Password must be at least 8 characters');
    });

    it('rejects a single-space password', () => {
      expectInvalid(passwordValidation, ' ', 'Password must be at least 8 characters');
    });
  });

  describe('character content (no strength rule is enforced)', () => {
    it.each(['lowercase', 'UPPERCASE', '12345678', '!@#$%^&*', 'aaaaaaaa', 'pässwörd123'])(
      'accepts password %s once it meets the length',
      (password) => {
        expect(expectValid(passwordValidation, password)).toBe(password);
      }
    );

    it('accepts a whitespace-only password of 8 or more characters', () => {
      expect(expectValid(passwordValidation, '        ')).toBe('        ');
    });
  });

  describe('invalid types', () => {
    it('rejects null and undefined', () => {
      expectInvalid(passwordValidation, null, 'Password is required');
      expectInvalid(passwordValidation, undefined, 'Password is required');
    });

    it('rejects non-string types', () => {
      expectInvalid(passwordValidation, 12345678, 'Password is required');
      expectInvalid(passwordValidation, true, 'Password is required');
      expectInvalid(passwordValidation, {}, 'Password is required');
    });
  });
});

describe('pageSizeValidation', () => {
  describe('valid sizes', () => {
    it('accepts the lower boundary', () => {
      expect(expectValid(pageSizeValidation, 1)).toBe(1);
    });

    it('accepts the configured default', () => {
      expect(expectValid(pageSizeValidation, PAGE_SIZE)).toBe(PAGE_SIZE);
    });

    it('accepts the upper boundary', () => {
      expect(expectValid(pageSizeValidation, 50)).toBe(50);
    });

    it('accepts numeric strings and coerces them', () => {
      expect(expectValid(pageSizeValidation, '1')).toBe(1);
      expect(expectValid(pageSizeValidation, '10')).toBe(10);
      expect(expectValid(pageSizeValidation, '50')).toBe(50);
    });

    it('accepts an integer-valued decimal string', () => {
      expect(expectValid(pageSizeValidation, '5.0')).toBe(5);
    });
  });

  describe('coercion edge cases', () => {
    it('coerces true to 1 (Number coercion)', () => {
      expect(expectValid(pageSizeValidation, true)).toBe(1);
    });

    it('falls back to PAGE_SIZE when coercion yields 0', () => {
      expect(expectValid(pageSizeValidation, false)).toBe(PAGE_SIZE);
    });
  });

  describe('falls back to PAGE_SIZE', () => {
    it.each([0, -1, 51])('for out-of-range size %s', (size) => {
      expect(expectValid(pageSizeValidation, size)).toBe(PAGE_SIZE);
    });

    it('for a non-integer size', () => {
      expect(expectValid(pageSizeValidation, 5.5)).toBe(PAGE_SIZE);
    });

    it.each(['abc', '', '   ', null, undefined, NaN, {}])('for non-numeric input %j', (input) => {
      expect(expectValid(pageSizeValidation, input)).toBe(PAGE_SIZE);
    });
  });
});

describe('pageNumberValidation', () => {
  describe('valid page numbers', () => {
    it('accepts the lower boundary', () => {
      expect(expectValid(pageNumberValidation, 1)).toBe(1);
    });

    it('accepts a mid-range page number', () => {
      expect(expectValid(pageNumberValidation, 500)).toBe(500);
    });

    it('accepts the upper boundary', () => {
      expect(expectValid(pageNumberValidation, 1000)).toBe(1000);
    });

    it('accepts numeric strings and coerces them', () => {
      expect(expectValid(pageNumberValidation, '1')).toBe(1);
      expect(expectValid(pageNumberValidation, '1000')).toBe(1000);
    });
  });

  describe('coercion edge cases', () => {
    it('coerces true to 1 (Number coercion)', () => {
      expect(expectValid(pageNumberValidation, true)).toBe(1);
    });
  });

  describe('falls back to 1', () => {
    it.each([0, -1, 1001])('for out-of-range page %s', (page) => {
      expect(expectValid(pageNumberValidation, page)).toBe(1);
    });

    it('for a non-integer page', () => {
      expect(expectValid(pageNumberValidation, 2.5)).toBe(1);
    });

    it.each(['abc', '', null, undefined, NaN])('for non-numeric input %j', (input) => {
      expect(expectValid(pageNumberValidation, input)).toBe(1);
    });

    it('for a false boolean (coerces to 0)', () => {
      expect(expectValid(pageNumberValidation, false)).toBe(1);
    });
  });
});
