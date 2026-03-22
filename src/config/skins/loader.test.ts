import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { loadSkin, applyColors, invalidateCache, SkinLoadError } from './loader';

describe('loader', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadSkin', () => {
    it('deve carregar skin barbearia com sucesso', async () => {
      const config = await loadSkin('barbearia');
      
      expect(config).toBeDefined();
      expect(config.metadata.nicheId).toBe('barbearia');
      expect(config.colors).toBeDefined();
      expect(config.texts).toBeDefined();
    });

    it('deve carregar skin salao-beleza com sucesso', async () => {
      const config = await loadSkin('salao-beleza');
      
      expect(config).toBeDefined();
      expect(config.metadata.nicheId).toBe('salao-beleza');
      expect(config.colors.primary).toBe('#e91e63');
    });

    it('deve cachear skin após primeiro carregamento', async () => {
      const config1 = await loadSkin('barbearia');
      
      // Verifica que foi salvo no cache
      const cached = localStorage.getItem('trinity_theme_config');
      expect(cached).toBeDefined();
      
      const config2 = await loadSkin('barbearia');
      
      // Deve retornar o mesmo conteúdo
      expect(config2.metadata.nicheId).toBe(config1.metadata.nicheId);
    });

    it('deve usar fallback para barbearia quando skin não existe', async () => {
      const config = await loadSkin('skin-inexistente');
      
      expect(config.metadata.nicheId).toBe('barbearia');
    });

    it('deve usar fallback mesmo para nomes similares ao padrão', async () => {
      // Tenta carregar skin com nome similar mas inexistente
      const config = await loadSkin('barbearia-inexistente');
      
      // Deve usar fallback para barbearia
      expect(config.metadata.nicheId).toBe('barbearia');
    });

    it('deve invalidar cache expirado (24h)', async () => {
      // Carrega e cacheia
      await loadSkin('barbearia');
      
      // Simula cache expirado (25 horas atrás)
      const expiredTimestamp = Date.now() - (25 * 60 * 60 * 1000);
      localStorage.setItem('trinity_theme_timestamp', expiredTimestamp.toString());
      
      // Deve recarregar do arquivo
      const config = await loadSkin('barbearia');
      expect(config).toBeDefined();
      
      // Timestamp deve ser atualizado
      const newTimestamp = localStorage.getItem('trinity_theme_timestamp');
      expect(parseInt(newTimestamp!)).toBeGreaterThan(expiredTimestamp);
    });
  });

  describe('applyColors', () => {
    it('deve aplicar cores às variáveis CSS', () => {
      const colors = {
        primary: '#1a1a1a',
        secondary: '#d4af37',
        accent: '#8b7355',
        background: '#ffffff',
        text: '#1a1a1a',
        muted: '#6b7280',
        border: '#e5e7eb',
      };
      
      applyColors(colors);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-primary')).toBe('#1a1a1a');
      expect(root.style.getPropertyValue('--color-secondary')).toBe('#d4af37');
      expect(root.style.getPropertyValue('--color-accent')).toBe('#8b7355');
    });

    it('deve sobrescrever cores existentes', () => {
      const colors1 = {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#ff0000',
        background: '#ffffff',
        text: '#000000',
        muted: '#cccccc',
        border: '#dddddd',
      };
      
      applyColors(colors1);
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#000000');
      
      const colors2 = {
        primary: '#111111',
        secondary: '#ffffff',
        accent: '#ff0000',
        background: '#ffffff',
        text: '#000000',
        muted: '#cccccc',
        border: '#dddddd',
      };
      
      applyColors(colors2);
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#111111');
    });
  });

  describe('invalidateCache', () => {
    it('deve remover cache do localStorage', async () => {
      // Carrega e cacheia
      await loadSkin('barbearia');
      
      expect(localStorage.getItem('trinity_theme_config')).toBeDefined();
      expect(localStorage.getItem('trinity_theme_timestamp')).toBeDefined();
      
      invalidateCache();
      
      expect(localStorage.getItem('trinity_theme_config')).toBeNull();
      expect(localStorage.getItem('trinity_theme_timestamp')).toBeNull();
    });
  });

  describe('SkinLoadError', () => {
    it('deve criar erro com nicheId', () => {
      const error = new SkinLoadError('Teste', 'test-niche');
      
      expect(error.message).toBe('Teste');
      expect(error.nicheId).toBe('test-niche');
      expect(error.name).toBe('SkinLoadError');
    });
  });
});
