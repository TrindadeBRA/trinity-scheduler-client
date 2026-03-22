import { describe, it, expect } from 'vitest';
import {
  ColorSchemaZ,
  TextsSchemaZ,
  MetadataSchemaZ,
  ThemeConfigSchemaZ,
  type ThemeConfig,
} from './schema';

describe('Skin Schema Validation', () => {
  describe('ColorSchemaZ', () => {
    it('should validate valid hex colors', () => {
      const validColors = {
        primary: '#1a1a1a',
        secondary: '#d4af37',
        accent: '#8b7355',
        background: '#ffffff',
        text: '#1a1a1a',
        muted: '#6b7280',
        border: '#e5e7eb',
      };

      const result = ColorSchemaZ.safeParse(validColors);
      expect(result.success).toBe(true);
    });

    it('should reject invalid hex color format', () => {
      const invalidColors = {
        primary: '#1a1a1a',
        secondary: 'red', // Invalid: not hex
        accent: '#8b7355',
        background: '#ffffff',
        text: '#1a1a1a',
        muted: '#6b7280',
        border: '#e5e7eb',
      };

      const result = ColorSchemaZ.safeParse(invalidColors);
      expect(result.success).toBe(false);
    });

    it('should reject short hex colors', () => {
      const invalidColors = {
        primary: '#1a1',
        secondary: '#d4af37',
        accent: '#8b7355',
        background: '#ffffff',
        text: '#1a1a1a',
        muted: '#6b7280',
        border: '#e5e7eb',
      };

      const result = ColorSchemaZ.safeParse(invalidColors);
      expect(result.success).toBe(false);
    });

    it('should reject missing required color fields', () => {
      const incompleteColors = {
        primary: '#1a1a1a',
        secondary: '#d4af37',
        // Missing other required fields
      };

      const result = ColorSchemaZ.safeParse(incompleteColors);
      expect(result.success).toBe(false);
    });
  });

  describe('MetadataSchemaZ', () => {
    it('should validate valid metadata', () => {
      const validMetadata = {
        nicheId: 'barbearia',
        displayName: 'Barbearia',
        description: 'Tema para barbearias',
      };

      const result = MetadataSchemaZ.safeParse(validMetadata);
      expect(result.success).toBe(true);
    });

    it('should validate metadata without optional description', () => {
      const validMetadata = {
        nicheId: 'salao-beleza',
        displayName: 'Salão de Beleza',
      };

      const result = MetadataSchemaZ.safeParse(validMetadata);
      expect(result.success).toBe(true);
    });

    it('should reject empty nicheId', () => {
      const invalidMetadata = {
        nicheId: '',
        displayName: 'Test',
      };

      const result = MetadataSchemaZ.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidMetadata = {
        nicheId: 'test',
        // Missing displayName
      };

      const result = MetadataSchemaZ.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
    });
  });

  describe('TextsSchemaZ', () => {
    it('should validate nested text structure', () => {
      const validTexts = {
        login: {
          titulo: 'Bem-vindo',
          subtitulo: 'Informe seu telefone',
        },
        booking: {
          servico: {
            titulo: 'Escolha o serviço',
          },
        },
      };

      const result = TextsSchemaZ.safeParse(validTexts);
      expect(result.success).toBe(true);
    });

    it('should validate empty texts object', () => {
      const emptyTexts = {};

      const result = TextsSchemaZ.safeParse(emptyTexts);
      expect(result.success).toBe(true);
    });
  });

  describe('ThemeConfigSchemaZ', () => {
    it('should validate complete theme config', () => {
      const validConfig: ThemeConfig = {
        metadata: {
          nicheId: 'barbearia',
          displayName: 'Barbearia',
          description: 'Tema para barbearias',
        },
        colors: {
          primary: '#1a1a1a',
          secondary: '#d4af37',
          accent: '#8b7355',
          background: '#ffffff',
          text: '#1a1a1a',
          muted: '#6b7280',
          border: '#e5e7eb',
        },
        texts: {
          login: {
            titulo: 'Bem-vindo',
          },
        },
      };

      const result = ThemeConfigSchemaZ.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should reject config with invalid colors', () => {
      const invalidConfig = {
        metadata: {
          nicheId: 'barbearia',
          displayName: 'Barbearia',
        },
        colors: {
          primary: 'invalid',
          secondary: '#d4af37',
          accent: '#8b7355',
          background: '#ffffff',
          text: '#1a1a1a',
          muted: '#6b7280',
          border: '#e5e7eb',
        },
        texts: {},
      };

      const result = ThemeConfigSchemaZ.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject config missing required sections', () => {
      const invalidConfig = {
        metadata: {
          nicheId: 'barbearia',
          displayName: 'Barbearia',
        },
        // Missing colors and texts
      };

      const result = ThemeConfigSchemaZ.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });
});
