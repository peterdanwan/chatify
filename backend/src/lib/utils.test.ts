import { normalizeInputs, validateUsername } from './utils.js';

describe('validateUsername', () => {
  test.each(['johndoe', 'john_doe', 'j0hn', 'abc'])('accepts %s', (username) => {
    expect(validateUsername(username)).toBe(true);
  });

  test.each([
    'jo', // too short
    'a'.repeat(21), // too long
    'John_Doe', // uppercase not allowed — must already be lowercased before this check
    'john doe', // spaces
    'john.doe', // period not allowed
    '',
  ])('rejects %s', (username) => {
    expect(validateUsername(username)).toBe(false);
  });
});

describe('normalizeInputs', () => {
  test('trims displayName and lowercases+trims username, independent of each other', () => {
    const result = normalizeInputs({
      displayName: '  Peter Wan  ',
      username: '  PeterWan  ',
      email: '  Peter@Example.com  ',
      password: 'hunter2',
    });

    expect(result).toEqual({
      displayName: 'Peter Wan',
      username: 'peterwan',
      email: 'peter@example.com',
      password: 'hunter2',
    });
  });

  test('defaults missing fields to empty strings instead of throwing (e.g. login only sends email/password)', () => {
    const result = normalizeInputs({ email: 'a@b.com', password: 'hunter2' });

    expect(result.displayName).toBe('');
    expect(result.username).toBe('');
  });
});
