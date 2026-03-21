import { describe, it, expect } from 'vitest';
import { encodeBase62, decodeBase62 } from '../encoding';

describe('encodeBase62', () => {
  it('should encode a valid UUID to base62', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const encoded = encodeBase62(uuid);
    
    // Verifica que o resultado é uma string não vazia
    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe('string');
    
    // Verifica que contém apenas caracteres base62
    expect(/^[0-9A-Za-z]+$/.test(encoded)).toBe(true);
  });

  it('should encode UUID with all zeros', () => {
    const uuid = '00000000-0000-0000-0000-000000000000';
    const encoded = encodeBase62(uuid);
    
    expect(encoded).toBe('0');
  });

  it('should produce URL-safe output', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const encoded = encodeBase62(uuid);
    
    // Verifica que não contém caracteres especiais que precisam de encoding em URLs
    expect(encoded).not.toMatch(/[+/=]/);
    expect(/^[0-9A-Za-z]+$/.test(encoded)).toBe(true);
  });

  it('should produce shorter output than UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const encoded = encodeBase62(uuid);
    
    // UUID tem 36 caracteres, base62 deve ter ~22
    expect(encoded.length).toBeLessThan(uuid.length);
    expect(encoded.length).toBeLessThanOrEqual(22);
  });

  it('should throw error for invalid UUID format', () => {
    expect(() => encodeBase62('invalid-uuid')).toThrow('Invalid UUID format');
    expect(() => encodeBase62('not-a-uuid-at-all')).toThrow('Invalid UUID format');
    expect(() => encodeBase62('')).toThrow('Invalid UUID format');
  });

  it('should handle UUIDs with uppercase hex digits', () => {
    const uuid = '550E8400-E29B-41D4-A716-446655440000';
    const encoded = encodeBase62(uuid);
    
    expect(encoded).toBeTruthy();
    expect(/^[0-9A-Za-z]+$/.test(encoded)).toBe(true);
  });
});

describe('decodeBase62', () => {
  it('should decode a valid base62 string to UUID', () => {
    const encoded = '2qLyKKKKKKKKKKKKKKKK';
    const decoded = decodeBase62(encoded);
    
    // Verifica formato UUID
    expect(decoded).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('should decode "0" to all-zeros UUID', () => {
    const decoded = decodeBase62('0');
    
    expect(decoded).toBe('00000000-0000-0000-0000-000000000000');
  });

  it('should throw error for invalid base62 characters', () => {
    expect(() => decodeBase62('invalid+chars')).toThrow('Invalid base62 character');
    expect(() => decodeBase62('has/slash')).toThrow('Invalid base62 character');
    expect(() => decodeBase62('has=equals')).toThrow('Invalid base62 character');
  });

  it('should produce lowercase UUID', () => {
    const encoded = '2qLyKKKKKKKKKKKKKKKK';
    const decoded = decodeBase62(encoded);
    
    expect(decoded).toBe(decoded.toLowerCase());
  });
});

describe('encodeBase62 and decodeBase62 round-trip', () => {
  it('should correctly round-trip encode and decode', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const encoded = encodeBase62(uuid);
    const decoded = decodeBase62(encoded);
    
    expect(decoded).toBe(uuid);
  });

  it('should round-trip with all-zeros UUID', () => {
    const uuid = '00000000-0000-0000-0000-000000000000';
    const encoded = encodeBase62(uuid);
    const decoded = decodeBase62(encoded);
    
    expect(decoded).toBe(uuid);
  });

  it('should round-trip with various UUIDs', () => {
    const uuids = [
      '123e4567-e89b-12d3-a456-426614174000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '00000000-0000-0000-0000-000000000001',
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    ];

    uuids.forEach(uuid => {
      const encoded = encodeBase62(uuid);
      const decoded = decodeBase62(encoded);
      expect(decoded).toBe(uuid);
    });
  });

  it('should handle uppercase UUIDs in round-trip', () => {
    const uuid = '550E8400-E29B-41D4-A716-446655440000';
    const encoded = encodeBase62(uuid);
    const decoded = decodeBase62(encoded);
    
    // Decoded should be lowercase
    expect(decoded).toBe(uuid.toLowerCase());
  });
});

describe('base62 encoding properties', () => {
  it('should be more compact than base64', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const base62Encoded = encodeBase62(uuid);
    
    // Base64 encoding of UUID without hyphens would be ~24 chars
    // Base62 should be ~22 chars or less
    const uuidWithoutHyphens = uuid.replace(/-/g, '');
    const base64Encoded = btoa(
      uuidWithoutHyphens.match(/.{2}/g)!.map(byte => String.fromCharCode(parseInt(byte, 16))).join('')
    );
    
    expect(base62Encoded.length).toBeLessThanOrEqual(base64Encoded.length);
  });

  it('should be deterministic', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const encoded1 = encodeBase62(uuid);
    const encoded2 = encodeBase62(uuid);
    const encoded3 = encodeBase62(uuid);
    
    expect(encoded1).toBe(encoded2);
    expect(encoded2).toBe(encoded3);
  });
});
