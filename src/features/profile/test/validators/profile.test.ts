import { ProfileUpdateSchema } from '@features/profile/validators/profile';

/**
 * A payload that satisfies every rule in {@link ProfileUpdateSchema}, so each
 * test can override exactly one field and assert on that field in isolation.
 */
const validPayload = {
  pan_dob: '25/08/1990',
  pan_no: 'ABCDE1234F',
  mobile_no: '9876543210',
  height: '170',
  comty_cd: 'GEN',
  marital_cd: 'MARRIED',
};

/** Asserts a payload parses, returning the parsed data. */
const expectValid = (data: unknown) => {
  const result = ProfileUpdateSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Expected a valid profile payload, got: ${JSON.stringify(result.error.issues)}`
    );
  }
  return result.data;
};

/** Asserts a payload is rejected, optionally matching the message on `field`. */
const expectInvalid = (data: unknown, field: string, message?: string) => {
  const result = ProfileUpdateSchema.safeParse(data);
  expect(result.success).toBeFalsy();
  if (!result.success) {
    const issue = result.error.issues.find((i) => i.path[0] === field);
    expect(issue).toBeDefined();
    if (message) {
      expect(issue?.message).toBe(message);
    }
  }
};

describe('ProfileUpdateSchema - whole payload', () => {
  it('accepts a fully populated payload', () => {
    expect(expectValid(validPayload)).toEqual(validPayload);
  });

  it('strips unknown keys, leaving only the six contract fields', () => {
    const parsed = expectValid({ ...validPayload, name: 'Ram', organization: 'NPS' });
    expect(Object.keys(parsed).sort()).toEqual([
      'comty_cd',
      'height',
      'marital_cd',
      'mobile_no',
      'pan_dob',
      'pan_no',
    ]);
  });
});

describe('ProfileUpdateSchema - pan_dob', () => {
  // `Date.parse` reads DD/MM/YYYY as MM/DD/YYYY, which rejects every day > 12
  // and silently mis-reads the rest. These cases pin the corrected behaviour.
  it.each(['25/08/1990', '05/08/1990', '31/12/1955', '01/01/1940'])(
    'accepts the valid DD/MM/YYYY date %s',
    (pan_dob) => {
      expectValid({ ...validPayload, pan_dob });
    }
  );

  it.each(['31/02/1990', '31/04/1990', '00/01/1990', '01/00/1990', '32/01/1990'])(
    'rejects %s, which is not a real calendar date',
    (pan_dob) => {
      expectInvalid({ ...validPayload, pan_dob }, 'pan_dob');
    }
  );

  it.each(['1/1/1990', '1990-08-25', '25081990', 'abc', '25/08/19900', '25-08-1990'])(
    'rejects %s, which is not in DD/MM/YYYY format',
    (pan_dob) => {
      expectInvalid({ ...validPayload, pan_dob }, 'pan_dob');
    }
  );

  it('reports a required-field error for an empty value', () => {
    expectInvalid({ ...validPayload, pan_dob: '' }, 'pan_dob', 'Date of birth is required');
  });

  it('accepts 29 February in a leap year', () => {
    expectValid({ ...validPayload, pan_dob: '29/02/2000' });
  });

  it('rejects 29 February in a non-leap year', () => {
    expectInvalid({ ...validPayload, pan_dob: '29/02/1990' }, 'pan_dob');
  });
});

describe('ProfileUpdateSchema - pan_no', () => {
  it('accepts a well-formed PAN', () => {
    expectValid({ ...validPayload, pan_no: 'AAAAA0000A' });
  });

  it('rejects lowercase letters', () => {
    expectInvalid({ ...validPayload, pan_no: 'abcde1234f' }, 'pan_no');
  });

  it.each(['ABCDE1234', 'ABCDE12345F', 'ABCD1234F', '12345ABCDE'])(
    'rejects %s, which has the wrong shape',
    (pan_no) => {
      expectInvalid({ ...validPayload, pan_no }, 'pan_no');
    }
  );

  it('reports a required-field error for an empty value', () => {
    expectInvalid({ ...validPayload, pan_no: '' }, 'pan_no', 'PAN number is required');
  });
});

describe('ProfileUpdateSchema - mobile_no', () => {
  it('accepts a 10-digit number', () => {
    expectValid({ ...validPayload, mobile_no: '6123456789' });
  });

  it.each(['987654321', '98765432101', '98765A3210', '+919876543210'])(
    'rejects %s',
    (mobile_no) => {
      expectInvalid({ ...validPayload, mobile_no }, 'mobile_no');
    }
  );

  it('reports a required-field error for an empty value', () => {
    expectInvalid({ ...validPayload, mobile_no: '' }, 'mobile_no', 'Mobile number is required');
  });
});

describe('ProfileUpdateSchema - height', () => {
  it.each(['170', '170.5', '58'])('accepts %s', (height) => {
    expectValid({ ...validPayload, height });
  });

  it.each(['0', '-5', 'tall'])('rejects %s', (height) => {
    expectInvalid({ ...validPayload, height }, 'height');
  });

  it('reports a required-field error for an empty value', () => {
    expectInvalid({ ...validPayload, height: '' }, 'height', 'Height is required');
  });
});

describe('ProfileUpdateSchema - comty_cd and marital_cd', () => {
  it('reports a required-field error for an empty community', () => {
    expectInvalid({ ...validPayload, comty_cd: '' }, 'comty_cd', 'Community is required');
  });

  it('reports a required-field error for an empty marital status', () => {
    expectInvalid({ ...validPayload, marital_cd: '' }, 'marital_cd', 'Marital status is required');
  });

  it('accepts a whitespace-only community once trimmed, then rejects the empty result', () => {
    expectInvalid({ ...validPayload, comty_cd: '   ' }, 'comty_cd', 'Community is required');
  });
});
