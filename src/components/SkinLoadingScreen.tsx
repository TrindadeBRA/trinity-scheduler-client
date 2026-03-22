import { useEffect, useState } from 'react';

interface SkinLoadingScreenProps {
  isLoading: boolean;
}

/**
 * Tela de carregamento exibida durante aplicação da skin
 * Previne FOUC (Flash of Unstyled Content) usando cores neutras
 * 
 * @param isLoading - Controla visibilidade do loading
 */
export function SkinLoadingScreen({ isLoading }: SkinLoadingScreenProps) {
  const [shouldRender, setShouldRender] = useState(isLoading);
  
  useEffect(() => {
    if (!isLoading) {
      // Aguarda transição de fade antes de desmontar
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
    }
  }, [isLoading]);
  
  if (!shouldRender) return null;
  
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-neutral-50 transition-opacity duration-200 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo Kronuz */}
        <div className="w-24 h-24 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full animate-pulse"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="40" stroke="#6b7280" strokeWidth="2" fill="none" />
            <path
              d="M50 20 L50 50 L70 70"
              stroke="#6b7280"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        {/* Spinner */}
        <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
      </div>
    </div>
  );
}
