import AsyncStorage from '@react-native-async-storage/async-storage';
import { isValidEmail, isValidPassword } from '../utils/validation';

describe('isValidEmail', () => {
  it('accepts a normal, well-formed email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('accepts emails with dots and subdomains', () => {
    expect(isValidEmail('first.last@mail.example.co.uk')).toBe(true);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });

  it('rejects a string with no @ symbol', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects a string with no domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rejects a string with no local part', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('rejects a string missing a top-level domain', () => {
    expect(isValidEmail('user@example')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('rejects undefined input without throwing', () => {
    expect(isValidEmail(undefined)).toBe(false);
  });

  it('rejects null input without throwing', () => {
    expect(isValidEmail(null)).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts a password of exactly 6 characters', () => {
    expect(isValidPassword('abcdef')).toBe(true);
  });

  it('accepts a longer password', () => {
    expect(isValidPassword('a much longer passphrase123')).toBe(true);
  });

  it('rejects a password shorter than 6 characters', () => {
    expect(isValidPassword('abc')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidPassword('')).toBe(false);
  });

  it('rejects undefined input without throwing', () => {
    expect(isValidPassword(undefined)).toBe(false);
  });

  it('rejects a non-string value without throwing', () => {
    expect(isValidPassword(123456)).toBe(false);
  });
});

describe('account & session storage', () => {
  let storage;

  beforeEach(async () => {
    jest.resetModules();
    // Re-import so the module's internal state (none here, but AsyncStorage mock)
    // starts clean for every test.
    storage = require('../services/storage');
    await AsyncStorage.clear();
  });

  it('returns null from getAccount when no account has been created', async () => {
    const account = await storage.getAccount();
    expect(account).toBeNull();
  });

  it('creates an account and persists it', async () => {
    const account = await storage.createAccount({
      name: 'Jane Doe',
      email: 'Jane@Example.com',
      passwordHash: 'hashed-value-123',
    });

    expect(account.name).toBe('Jane Doe');
    expect(account.email).toBe('jane@example.com'); // normalized to lowercase
    expect(account.passwordHash).toBe('hashed-value-123');
    expect(account.createdAt).toEqual(expect.any(String));

    const stored = await storage.getAccount();
    expect(stored).toEqual(account);
  });

  it('verifyCredentials returns the account on matching email + hash', async () => {
    await storage.createAccount({
      name: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: 'correct-hash',
    });

    const result = await storage.verifyCredentials('jane@example.com', 'correct-hash');
    expect(result).not.toBeNull();
    expect(result.email).toBe('jane@example.com');
  });

  it('verifyCredentials is case-insensitive on email', async () => {
    await storage.createAccount({
      name: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: 'correct-hash',
    });

    const result = await storage.verifyCredentials('JANE@EXAMPLE.COM', 'correct-hash');
    expect(result).not.toBeNull();
  });

  it('verifyCredentials returns null on wrong password hash', async () => {
    await storage.createAccount({
      name: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: 'correct-hash',
    });

    const result = await storage.verifyCredentials('jane@example.com', 'wrong-hash');
    expect(result).toBeNull();
  });

  it('verifyCredentials returns null on wrong email', async () => {
    await storage.createAccount({
      name: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: 'correct-hash',
    });

    const result = await storage.verifyCredentials('someoneelse@example.com', 'correct-hash');
    expect(result).toBeNull();
  });

  it('verifyCredentials returns null when no account exists yet', async () => {
    const result = await storage.verifyCredentials('jane@example.com', 'any-hash');
    expect(result).toBeNull();
  });

  it('has no session by default', async () => {
    const session = await storage.getSession();
    expect(session).toBeNull();
  });

  it('sets and retrieves a session', async () => {
    await storage.setSession({ email: 'jane@example.com' });
    const session = await storage.getSession();
    expect(session).toEqual({ email: 'jane@example.com' });
  });

  it('clears a session', async () => {
    await storage.setSession({ email: 'jane@example.com' });
    await storage.clearSession();
    const session = await storage.getSession();
    expect(session).toBeNull();
  });

  it('clearAllData removes the account and session along with other data', async () => {
    await storage.createAccount({
      name: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: 'correct-hash',
    });
    await storage.setSession({ email: 'jane@example.com' });

    await storage.clearAllData();

    expect(await storage.getAccount()).toBeNull();
    expect(await storage.getSession()).toBeNull();
  });
});