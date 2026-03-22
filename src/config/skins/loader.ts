import { ThemeConfigSchemaZ, type ThemeConfig } from './schema';
import barbeariaConfig from './barbearia.json';
import salaoConfig from './salao-beleza.json';

export type { ThemeConfig };

// Mapeamento estático de skins
const SKIN_MAP: Record<string, ThemeConfig> = {
  'barbearia': barbeariaConfig as ThemeConfig,
  'salao-beleza': salaoConfig as ThemeConfig,
};

const CACHE_KEY = 'trinity_theme_config';
const CACHE_TIMESTAMP_KEY = 'trinity_theme_timestamp';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_NICHE = 'barbearia';

/**
 * Erro customizado para falhas no carregamento de skins
 */
export class SkinLoadError extends Error {
  constructor(message: string, public nicheId: string) {
    super(message);
    this.name = 'SkinLoadError';
  }
}

/**
 * Carrega skin do cache se válida
 * @returns ThemeConfig do cache ou null se inválido/expirado
 */
function loadFromCache(): ThemeConfig | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;
    
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > CACHE_DURATION_MS) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    const parsed = JSON.parse(cached);
    return ThemeConfigSchemaZ.parse(parsed);
  } catch (error) {
    console.error('[Skin] Cache inválido:', error);
    return null;
  }
}

/**
 * Salva skin no cache com timestamp
 * @param config - Configuração de tema a ser cacheada
 */
function saveToCache(config: ThemeConfig): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(config));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('[Skin] Erro ao salvar cache:', error);
  }
}

/**
 * Carrega arquivo de skin do mapeamento estático
 * @param nicheId - Identificador do nicho (ex: 'barbearia', 'salao-beleza')
 * @returns Promise com ThemeConfig validado
 * @throws SkinLoadError se o arquivo não existir ou for inválido
 */
async function loadSkinFile(nicheId: string): Promise<ThemeConfig> {
  try {
    const config = SKIN_MAP[nicheId];
    if (!config) {
      throw new Error(`Skin "${nicheId}" não encontrada`);
    }
    return ThemeConfigSchemaZ.parse(config);
  } catch (error) {
    throw new SkinLoadError(
      `Falha ao carregar skin "${nicheId}"`,
      nicheId
    );
  }
}

/**
 * Carrega skin com fallback automático para skin padrão
 * Implementa cache de 24 horas para otimizar performance
 * 
 * @param nicheId - Identificador do nicho desejado
 * @returns Promise com ThemeConfig carregado
 * @throws Error se nem a skin solicitada nem o fallback puderem ser carregados
 * 
 * @example
 * ```typescript
 * const config = await loadSkin('salao-beleza');
 * applyColors(config.colors);
 * ```
 */
export async function loadSkin(nicheId: string): Promise<ThemeConfig> {
  // Tenta cache primeiro
  const cached = loadFromCache();
  if (cached && cached.metadata.nicheId === nicheId) {
    console.log(`[Skin] Usando cache: ${nicheId}`);
    return cached;
  }
  
  // Tenta carregar skin solicitada
  try {
    const config = await loadSkinFile(nicheId);
    saveToCache(config);
    console.log(`[Skin] Carregada: ${nicheId}`);
    return config;
  } catch (error) {
    console.error(`[Skin] Erro ao carregar "${nicheId}":`, error);
    
    // Fallback para skin padrão
    if (nicheId !== DEFAULT_NICHE) {
      console.warn(`[Skin] Usando fallback: ${DEFAULT_NICHE}`);
      const fallback = await loadSkinFile(DEFAULT_NICHE);
      saveToCache(fallback);
      return fallback;
    }
    
    throw error;
  }
}

/**
 * Converte cor hexadecimal para HSL no formato do Tailwind (sem "hsl()")
 * @param hex - Cor em formato hexadecimal (ex: "#e91e63")
 * @returns String no formato "h s% l%" (ex: "340 82% 52%")
 */
function hexToHSL(hex: string): string {
  // Remove o # se presente
  hex = hex.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  // Converte para graus e porcentagens
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  return `${h} ${s}% ${lPercent}%`;
}

/**
 * Aplica cores da skin às variáveis CSS do documento
 * Define variáveis CSS no formato HSL para uso com Tailwind
 * 
 * @param colors - Objeto com cores em formato hexadecimal
 * 
 * @example
 * ```typescript
 * applyColors({
 *   primary: '#1a1a1a',
 *   secondary: '#d4af37',
 *   accent: '#8b7355'
 * });
 * // Define: --primary, --secondary, --accent em formato HSL
 * ```
 */
export function applyColors(colors: ThemeConfig['colors']): void {
  const root = document.documentElement;
  
  // Mapeamento de cores da skin para variáveis CSS do Tailwind
  const colorMap: Record<string, string> = {
    primary: '--primary',
    secondary: '--secondary',
    accent: '--accent',
    background: '--background',
    text: '--foreground',
    muted: '--muted',
    border: '--border',
    input: '--input',
  };
  
  Object.entries(colors).forEach(([key, hexValue]) => {
    const cssVar = colorMap[key];
    if (cssVar) {
      const hslValue = hexToHSL(hexValue);
      root.style.setProperty(cssVar, hslValue);
      console.log(`[Skin] Aplicando ${cssVar}: ${hslValue} (de ${hexValue})`);
    }
  });
  
  // Aplica cores derivadas para outros elementos
  const primaryHSL = hexToHSL(colors.primary);
  const backgroundHSL = hexToHSL(colors.background);
  const textHSL = hexToHSL(colors.text);
  const accentHSL = hexToHSL(colors.accent);
  
  // Ring usa a cor primária
  root.style.setProperty('--ring', primaryHSL);
  
  // Card usa o background
  root.style.setProperty('--card', backgroundHSL);
  root.style.setProperty('--card-foreground', textHSL);
  
  // Popover usa o background
  root.style.setProperty('--popover', backgroundHSL);
  root.style.setProperty('--popover-foreground', textHSL);
  
  // Muted foreground usa o texto principal (para contraste com bg-muted)
  root.style.setProperty('--muted-foreground', textHSL);
  
  // Primary foreground usa o background (contraste com primary)
  root.style.setProperty('--primary-foreground', backgroundHSL);
  
  // Secondary foreground usa o texto
  root.style.setProperty('--secondary-foreground', textHSL);
  
  // Accent foreground usa o background (contraste com accent)
  root.style.setProperty('--accent-foreground', backgroundHSL);
  
  console.log('[Skin] Cores derivadas aplicadas');
}

/**
 * Invalida cache de skin
 * Útil para forçar recarregamento em desenvolvimento ou após mudança de nicho
 * 
 * @example
 * ```typescript
 * invalidateCache();
 * const freshConfig = await loadSkin('barbearia');
 * ```
 */
export function invalidateCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
}
