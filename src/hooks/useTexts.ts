import { useSkin } from '@/contexts/SkinContext';
import defaultTexts from '@/config/texts.json';

/**
 * Hook para acessar textos da skin atual com fallback
 * Implementa navegação por path aninhado (ex: "booking.servico.titulo")
 * 
 * @returns Objeto com função getText e textos completos
 * 
 * @example
 * ```typescript
 * const { getText } = useTexts();
 * const titulo = getText('login.titulo'); // "Bem-vindo" ou "Bem-vinda"
 * ```
 */
export function useTexts() {
  const { config } = useSkin();
  
  /**
   * Busca texto por path aninhado
   * @param path - Caminho do texto (ex: "booking.servico.titulo")
   * @returns Texto encontrado ou fallback
   */
  function getText(path: string): string {
    if (!config) return getFromDefault(path);
    
    const keys = path.split('.');
    let value: any = config.texts;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return getFromDefault(path);
      }
    }
    
    return typeof value === 'string' ? value : getFromDefault(path);
  }
  
  /**
   * Busca texto no arquivo padrão texts.json
   * @param path - Caminho do texto
   * @returns Texto encontrado ou o próprio path como fallback final
   */
  function getFromDefault(path: string): string {
    const keys = path.split('.');
    let value: any = defaultTexts;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return path; // Retorna o path como fallback final
      }
    }
    
    return typeof value === 'string' ? value : path;
  }
  
  return { 
    getText, 
    texts: config?.texts || defaultTexts 
  };
}
