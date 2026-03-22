import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { loadSkin, applyColors, invalidateCache } from './loader';
import type { ThemeConfig } from './schema';

/**
 * **Validates: Requirements 2.5, 7.1, 7.2, 9.1, 9.2, 9.3, 9.4**
 * 
 * Testes baseados em propriedades para o skin loader
 */
describe('loader - Property-Based Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadSkin properties', () => {
    it('deve sempre retornar um ThemeConfig válido para qualquer nicheId', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (nicheId) => {
            const config = await loadSkin(nicheId);
            
            // Propriedade: sempre retorna um objeto válido
            expect(config).toBeDefined();
            expect(config.metadata).toBeDefined();
            expect(config.colors).toBeDefined();
            expect(config.texts).toBeDefined();
            
            // Propriedade: metadata sempre tem nicheId
            expect(config.metadata.nicheId).toBeDefined();
            expect(typeof config.metadata.nicheId).toBe('string');
          }
        ),
        { numRuns: 20 }
      );
    });

    it('deve cachear e retornar o mesmo conteúdo em carregamentos subsequentes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('barbearia', 'salao-beleza'),
          async (nicheId) => {
            // Limpa cache antes do teste
            invalidateCache();
            
            // Primeiro carregamento
            const config1 = await loadSkin(nicheId);
            
            // Segundo carregamento (deve vir do cache)
            const config2 = await loadSkin(nicheId);
            
            // Propriedade: conteúdo deve ser idêntico
            expect(config2.metadata.nicheId).toBe(config1.metadata.nicheId);
            expect(config2.colors).toEqual(config1.colors);
            expect(config2.texts).toEqual(config1.texts);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('deve usar fallback "barbearia" para nicheIds inválidos', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => s !== 'barbearia' && s !== 'salao-beleza'),
          async (invalidNicheId) => {
            const config = await loadSkin(invalidNicheId);
            
            // Propriedade: sempre retorna barbearia como fallback
            expect(config.metadata.nicheId).toBe('barbearia');
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('applyColors properties', () => {
    it('deve aplicar todas as cores fornecidas como variáveis CSS', () => {
      fc.assert(
        fc.property(
          fc.record({
            primary: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            secondary: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            accent: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            background: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            text: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            muted: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            border: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
          }),
          (colors) => {
            applyColors(colors);
            
            const root = document.documentElement;
            
            // Propriedade: todas as cores devem estar aplicadas
            Object.entries(colors).forEach(([key, value]) => {
              const cssValue = root.style.getPropertyValue(`--color-${key}`);
              expect(cssValue).toBe(value);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('deve sobrescrever cores anteriores (idempotência)', () => {
      fc.assert(
        fc.property(
          fc.record({
            primary: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            secondary: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            accent: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            background: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            text: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            muted: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            border: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
          }),
          fc.record({
            primary: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            secondary: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            accent: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            background: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            text: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            muted: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
            border: fc.hexaString().map(s => `#${s.padStart(6, '0').substring(0, 6)}`),
          }),
          (colors1, colors2) => {
            applyColors(colors1);
            applyColors(colors2);
            
            const root = document.documentElement;
            
            // Propriedade: apenas as últimas cores devem estar aplicadas
            Object.entries(colors2).forEach(([key, value]) => {
              const cssValue = root.style.getPropertyValue(`--color-${key}`);
              expect(cssValue).toBe(value);
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('cache properties', () => {
    it('deve invalidar cache completamente', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('barbearia', 'salao-beleza'),
          async (nicheId) => {
            // Carrega e cacheia
            await loadSkin(nicheId);
            
            // Verifica que está no cache
            expect(localStorage.getItem('trinity_theme_config')).not.toBeNull();
            expect(localStorage.getItem('trinity_theme_timestamp')).not.toBeNull();
            
            // Invalida
            invalidateCache();
            
            // Propriedade: cache deve estar completamente limpo
            expect(localStorage.getItem('trinity_theme_config')).toBeNull();
            expect(localStorage.getItem('trinity_theme_timestamp')).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('deve respeitar expiração de 24 horas', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('barbearia', 'salao-beleza'),
          fc.integer({ min: 25, max: 100 }), // horas após expiração
          async (nicheId, hoursExpired) => {
            // Carrega e cacheia
            await loadSkin(nicheId);
            
            // Simula cache expirado
            const expiredTimestamp = Date.now() - (hoursExpired * 60 * 60 * 1000);
            localStorage.setItem('trinity_theme_timestamp', expiredTimestamp.toString());
            
            // Carrega novamente
            await loadSkin(nicheId);
            
            // Propriedade: timestamp deve ser atualizado (cache renovado)
            const newTimestamp = parseInt(localStorage.getItem('trinity_theme_timestamp')!);
            expect(newTimestamp).toBeGreaterThan(expiredTimestamp);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('error handling properties', () => {
    it('deve sempre retornar um ThemeConfig válido mesmo com entradas maliciosas', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.string({ minLength: 0, maxLength: 100 }),
            fc.constant(''),
            fc.constant('../../../etc/passwd'),
            fc.constant('../../package.json'),
            fc.constant('<script>alert("xss")</script>'),
            fc.constant('null'),
            fc.constant('undefined'),
          ),
          async (maliciousInput) => {
            const config = await loadSkin(maliciousInput);
            
            // Propriedade: sempre retorna um ThemeConfig válido (fallback)
            expect(config).toBeDefined();
            expect(config.metadata).toBeDefined();
            expect(config.colors).toBeDefined();
            expect(config.texts).toBeDefined();
            
            // Propriedade: deve ser barbearia (fallback seguro)
            expect(config.metadata.nicheId).toBe('barbearia');
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
