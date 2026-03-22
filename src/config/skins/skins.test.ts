import { describe, it, expect } from 'vitest';
import { ThemeConfigSchemaZ } from './schema';
import barbeariaJson from './barbearia.json';
import salaoJson from './salao-beleza.json';

describe('Skin JSON Files Validation', () => {
  describe('barbearia.json', () => {
    it('should be valid according to ThemeConfigSchemaZ', () => {
      const result = ThemeConfigSchemaZ.safeParse(barbeariaJson);
      
      if (!result.success) {
        console.error('Validation errors:', result.error.errors);
      }
      
      expect(result.success).toBe(true);
    });

    it('should have correct metadata', () => {
      expect(barbeariaJson.metadata.nicheId).toBe('barbearia');
      expect(barbeariaJson.metadata.displayName).toBe('Barbearia');
    });

    it('should have all required color fields', () => {
      expect(barbeariaJson.colors).toHaveProperty('primary');
      expect(barbeariaJson.colors).toHaveProperty('secondary');
      expect(barbeariaJson.colors).toHaveProperty('accent');
      expect(barbeariaJson.colors).toHaveProperty('background');
      expect(barbeariaJson.colors).toHaveProperty('text');
      expect(barbeariaJson.colors).toHaveProperty('muted');
      expect(barbeariaJson.colors).toHaveProperty('border');
    });

    it('should have all required text sections', () => {
      expect(barbeariaJson.texts).toHaveProperty('login');
      expect(barbeariaJson.texts).toHaveProperty('booking');
      expect(barbeariaJson.texts).toHaveProperty('agendamentos');
      expect(barbeariaJson.texts).toHaveProperty('validacao');
      expect(barbeariaJson.texts).toHaveProperty('geral');
    });
  });

  describe('salao-beleza.json', () => {
    it('should be valid according to ThemeConfigSchemaZ', () => {
      const result = ThemeConfigSchemaZ.safeParse(salaoJson);
      
      if (!result.success) {
        console.error('Validation errors:', result.error.errors);
      }
      
      expect(result.success).toBe(true);
    });

    it('should have correct metadata', () => {
      expect(salaoJson.metadata.nicheId).toBe('salao-beleza');
      expect(salaoJson.metadata.displayName).toBe('Salão de Beleza');
    });

    it('should have all required color fields', () => {
      expect(salaoJson.colors).toHaveProperty('primary');
      expect(salaoJson.colors).toHaveProperty('secondary');
      expect(salaoJson.colors).toHaveProperty('accent');
      expect(salaoJson.colors).toHaveProperty('background');
      expect(salaoJson.colors).toHaveProperty('text');
      expect(salaoJson.colors).toHaveProperty('muted');
      expect(salaoJson.colors).toHaveProperty('border');
    });

    it('should have all required text sections', () => {
      expect(salaoJson.texts).toHaveProperty('login');
      expect(salaoJson.texts).toHaveProperty('booking');
      expect(salaoJson.texts).toHaveProperty('agendamentos');
      expect(salaoJson.texts).toHaveProperty('validacao');
      expect(salaoJson.texts).toHaveProperty('geral');
    });

    it('should use pink-themed colors', () => {
      // Primary color should be pink (#e91e63)
      expect(salaoJson.colors.primary).toBe('#e91e63');
      // Secondary should be light pink
      expect(salaoJson.colors.secondary).toBe('#f8bbd0');
    });

    it('should use feminine language', () => {
      // Check for feminine variations in text
      expect(salaoJson.texts.login.titulo).toBe('Bem-vinda');
      expect(salaoJson.texts.booking.servico.titulo).toBe('Escolha o tratamento');
      expect(salaoJson.texts.booking.profissional.titulo).toBe('Escolha a profissional');
    });
  });

  describe('Color consistency', () => {
    it('barbearia should use dark theme colors', () => {
      const colors = barbeariaJson.colors;
      // Background should be dark
      expect(colors.background).toBe('#121212');
      // Text should be light
      expect(colors.text).toBe('#ebebeb');
    });

    it('salao-beleza should use light theme colors', () => {
      const colors = salaoJson.colors;
      // Background should be light
      expect(colors.background).toBe('#ffffff');
      // Text should be dark
      expect(colors.text).toBe('#1a1a1a');
    });
  });
});
