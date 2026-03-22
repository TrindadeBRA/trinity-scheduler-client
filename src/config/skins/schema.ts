import { z } from 'zod';

/**
 * Schema de validação para cores em formato hexadecimal
 * Valida strings no formato #RRGGBB (6 dígitos hexadecimais)
 */
export const ColorSchemaZ = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor primária deve estar no formato #RRGGBB'),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor secundária deve estar no formato #RRGGBB'),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor de destaque deve estar no formato #RRGGBB'),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor de fundo deve estar no formato #RRGGBB'),
  text: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor de texto deve estar no formato #RRGGBB'),
  muted: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor muted deve estar no formato #RRGGBB'),
  border: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor de borda deve estar no formato #RRGGBB'),
  input: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor de input deve estar no formato #RRGGBB'),
});

/**
 * Schema de validação para textos personalizados
 * Aceita estrutura aninhada de strings para suportar organização hierárquica
 */
export const TextsSchemaZ = z.record(z.string(), z.any());

/**
 * Schema de validação para metadados da skin
 * Contém informações identificadoras e descritivas do tema
 */
export const MetadataSchemaZ = z.object({
  nicheId: z.string().min(1, 'nicheId é obrigatório'),
  displayName: z.string().min(1, 'displayName é obrigatório'),
  description: z.string().optional(),
});

/**
 * Schema principal de validação para configuração de tema
 * Combina metadados, cores e textos em uma estrutura completa
 */
export const ThemeConfigSchemaZ = z.object({
  metadata: MetadataSchemaZ,
  colors: ColorSchemaZ,
  texts: TextsSchemaZ,
});

/**
 * Tipo TypeScript inferido do schema de cores
 */
export type ColorSchema = z.infer<typeof ColorSchemaZ>;

/**
 * Tipo TypeScript inferido do schema de textos
 */
export type TextsSchema = z.infer<typeof TextsSchemaZ>;

/**
 * Tipo TypeScript inferido do schema de metadados
 */
export type MetadataSchema = z.infer<typeof MetadataSchemaZ>;

/**
 * Tipo TypeScript inferido do schema de configuração de tema
 * Representa a estrutura completa de uma skin
 */
export type ThemeConfig = z.infer<typeof ThemeConfigSchemaZ>;
