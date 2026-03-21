interface SlugResolutionResult {
  unitId: string;
  shopId: string;
  unitName: string;
  shopName: string;
}

/**
 * Extrai o slug do subdomínio da URL atual
 * Retorna null se não houver subdomínio ou se estiver em localhost sem subdomínio
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function extractSlugFromSubdomain(): string | null {
  const hostname = window.location.hostname;
  
  // Extrai o leftmost label como slug
  const parts = hostname.split('.');
  
  // Se tem apenas 1 parte (localhost sem subdomínio), não há subdomain
  if (parts.length === 1) {
    return null;
  }
  
  // Se tem 2 ou mais partes, verifica se o último é localhost
  // Exemplos:
  // - trinitybarber.localhost -> ['trinitybarber', 'localhost'] -> retorna 'trinitybarber'
  // - localhost -> ['localhost'] -> retorna null (já tratado acima)
  // - trinitybarber.domain.com -> ['trinitybarber', 'domain', 'com'] -> retorna 'trinitybarber'
  // - domain.com -> ['domain', 'com'] -> retorna null (sem subdomain)
  
  const lastPart = parts[parts.length - 1];
  
  // Se o último é localhost e tem subdomínio, retorna o primeiro
  if (lastPart === 'localhost' && parts.length >= 2) {
    return parts[0];
  }
  
  // Se não é localhost, verifica se tem pelo menos 3 partes (subdomain.domain.tld)
  if (parts.length <= 2) {
    return null;
  }
  
  // Retorna o primeiro label (leftmost)
  return parts[0];
}

/**
 * Resolve um slug chamando o endpoint do backend
 * 
 * Requirements: 7.1, 7.5, 7.6
 */
export async function resolveSlug(slug: string): Promise<SlugResolutionResult> {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const response = await fetch(`${API_URL}/client/units/resolve/${slug}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Unidade não encontrada');
    }
    throw new Error('Erro ao resolver slug');
  }
  
  return response.json();
}
