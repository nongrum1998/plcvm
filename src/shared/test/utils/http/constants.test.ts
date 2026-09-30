import { AUTH_PATHS, isAuthPath } from '@utils/http/constants';

describe('isAuthPath', () => {
  it('returns true for configured auth paths', () => {
    expect(AUTH_PATHS).toContain('/login');
    expect(isAuthPath('/login')).toBe(true);
    expect(isAuthPath('/logout')).toBe(true);
    expect(isAuthPath('/user')).toBe(true);
  });

  it('returns false for non-auth API paths', () => {
    expect(isAuthPath('/api/verification/')).toBe(false);
    expect(isAuthPath('/api/validate_token/')).toBe(false);
    expect(isAuthPath('https://dat.example.com/paymentslip')).toBe(false);
  });
});
