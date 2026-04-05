import { ThemeConfigSchemaZ, type ThemeConfig } from './schema';
import barbeariaConfig from './barbearia.json';
import salaoConfig from './salao-beleza.json';

export type { ThemeConfig };

// Mapeamento de nicho → skin (vários nichos → 2 skins)
const NICHE_TO_SKIN: Record<string, 'barbearia' | 'salao-beleza'> = {
  'barbearia': 'barbearia',
  'salao-beleza': 'salao-beleza',
  'esmalteria': 'salao-beleza',
  'clinica-estetica': 'salao-beleza',
  'manicure': 'salao-beleza',
  'pedicure': 'salao-beleza',
  'cabeleireiro': 'salao-beleza',
};

// Skin configs (apenas 2 skins físicas)
const SKIN_MAP: Record<string, ThemeConfig> = {
  'barbearia': barbeariaConfig as ThemeConfig,
  'salao-beleza': salaoConfig as ThemeConfig,
};

function resolveSkin(nicheId: string): 'barbearia' | 'salao-beleza' {
  return NICHE_TO_SKIN[nicheId] ?? 'barbearia';
}

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
  } catch {
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
  } catch {
    // ignore cache write errors
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
  const skinId = resolveSkin(nicheId);

  // Tenta cache primeiro
  const cached = loadFromCache();
  if (cached && cached.metadata.nicheId === skinId) {
    return cached;
  }

  // Tenta carregar skin
  try {
    const config = await loadSkinFile(skinId);
    saveToCache(config);
    return config;
  } catch (error) {
    // Fallback para skin padrão
    if (skinId !== DEFAULT_NICHE) {
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
 * Gera uma cor intermediária entre o texto e o background para uso como muted-foreground (placeholder)
 * Mistura 45% do texto com 55% do background para criar um tom visivelmente mais suave
 */
function hexToMutedForeground(textHex: string, backgroundHex: string): string {
  const parseHex = (hex: string) => {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  };

  const text = parseHex(textHex);
  const bg = parseHex(backgroundHex);

  // Mistura 45% texto + 55% background
  const mixed = {
    r: Math.round(text.r * 0.45 + bg.r * 0.55),
    g: Math.round(text.g * 0.45 + bg.g * 0.55),
    b: Math.round(text.b * 0.45 + bg.b * 0.55),
  };

  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return hexToHSL(`#${toHex(mixed.r)}${toHex(mixed.g)}${toHex(mixed.b)}`);
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
    }
  });
  
  // Aplica cores derivadas para outros elementos
  const primaryHSL = hexToHSL(colors.primary);
  const backgroundHSL = hexToHSL(colors.background);
  const textHSL = hexToHSL(colors.text);
  const accentHSL = hexToHSL(colors.accent);
  
  // Ring usa a cor primária
  root.style.setProperty('--ring', primaryHSL);
  root.style.setProperty('--card', backgroundHSL);
  root.style.setProperty('--card-foreground', textHSL);
  
  // Popover usa o background
  root.style.setProperty('--popover', backgroundHSL);
  root.style.setProperty('--popover-foreground', textHSL);
  
  // Muted foreground usa uma versão mais suave do texto (para placeholder e textos secundários)
  const mutedForegroundHSL = hexToMutedForeground(colors.text, colors.background);
  root.style.setProperty('--muted-foreground', mutedForegroundHSL);
  
  // Primary foreground usa o background (contraste com primary)
  root.style.setProperty('--primary-foreground', backgroundHSL);
  
  // Secondary foreground usa o texto
  root.style.setProperty('--secondary-foreground', textHSL);
  
  // Accent foreground usa o background (contraste com accent)
  root.style.setProperty('--accent-foreground', backgroundHSL);
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
