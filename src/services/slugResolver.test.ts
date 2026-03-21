import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { extractSlugFromSubdomain } from './slugResolver';

describe('extractSlugFromSubdomain', () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
  });

  afterEach(() => {
    // @ts-ignore
    window.location = originalLocation;
  });

  function mockHostname(hostname: string) {
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { hostname };
  }

  it('should return null for plain localhost', () => {
    mockHostname('localhost');
    expect(extractSlugFromSubdomain()).toBeNull();
  });

  it('should extract slug from subdomain.localhost', () => {
    mockHostname('trinitybarber.localhost');
    expect(extractSlugFromSubdomain()).toBe('trinitybarber');
  });

  it('should extract slug from subdomain.domain.com', () => {
    mockHostname('trinitybarber.agendamentos.app');
    expect(extractSlugFromSubdomain()).toBe('trinitybarber');
  });

  it('should return null for domain.com without subdomain', () => {
    mockHostname('agendamentos.app');
    expect(extractSlugFromSubdomain()).toBeNull();
  });

  it('should extract leftmost label from multi-level subdomain', () => {
    mockHostname('trinity.barber.agendamentos.app');
    expect(extractSlugFromSubdomain()).toBe('trinity');
  });

  it('should handle multiple subdomains with localhost', () => {
    mockHostname('a.b.localhost');
    expect(extractSlugFromSubdomain()).toBe('a');
  });
});
