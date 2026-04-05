import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loadSkin, applyColors, type ThemeConfig } from '@/config/skins/loader';

interface SkinContextValue {
  config: ThemeConfig | null;
  error: Error | null;
}

const SkinContext = createContext<SkinContextValue | null>(null);

/**
 * Hook para acessar contexto de skin
 * @throws Error se usado fora do SkinProvider
 */
export function useSkin() {
  const context = useContext(SkinContext);
  if (!context) {
    throw new Error('useSkin must be used within SkinProvider');
  }
  return context;
}

interface SkinProviderProps {
  children: ReactNode;
}

/**
 * Provider que gerencia carregamento e aplicação de skins
 * Busca nicho da API e carrega skin correspondente
 */
export function SkinProvider({ children }: SkinProviderProps) {
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function initializeSkin() {
      try {
        // Busca nicho configurado da API
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const shopId = localStorage.getItem('trinity_shop_id');
        const unitId = localStorage.getItem('trinity_unit_id');
        
        // Aguarda até que shopId esteja disponível
        if (!shopId) {
          const fallbackConfig = await loadSkin('barbearia');
          applyColors(fallbackConfig.colors);
          setConfig(fallbackConfig);
          return;
        }
        
        // Monta URL com unitId se disponível
        const url = unitId 
          ? `${apiUrl}/client/shop/info?unitId=${unitId}`
          : `${apiUrl}/client/shop/info`;
        
        const response = await fetch(url, {
          headers: {
            'X-Shop-Id': shopId,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Falha ao buscar informações do estabelecimento: ${response.status}`);
        }
        
        const data = await response.json();
        const nicheId = data.niche || 'barbearia';

        // Cache logo URL for other components
        if (data.logoUrl) {
          localStorage.setItem('trinity_logo_url', data.logoUrl);
        }
        
        // Verifica se o cache é do niche correto
        const cachedConfig = localStorage.getItem('trinity_theme_config');
        if (cachedConfig) {
          try {
            const parsed = JSON.parse(cachedConfig);
            if (parsed.metadata?.nicheId !== nicheId) {
              localStorage.removeItem('trinity_theme_config');
              localStorage.removeItem('trinity_theme_timestamp');
            }
          } catch {
            // Ignora erro de parse
          }
        }
        
        // Carrega skin correspondente
        const skinConfig = await loadSkin(nicheId);
        
        // Aplica cores às variáveis CSS
        applyColors(skinConfig.colors);
        
        setConfig(skinConfig);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'));
        
        // Tenta carregar skin padrão como fallback
        try {
          const fallbackConfig = await loadSkin('barbearia');
          applyColors(fallbackConfig.colors);
          setConfig(fallbackConfig);
        } catch {
          // fallback também falhou, sem skin
        }
      }
    }
    
    initializeSkin();
  }, []);
  
  return (
    <SkinContext.Provider value={{ config, error }}>
      {children}
    </SkinContext.Provider>
  );
}
