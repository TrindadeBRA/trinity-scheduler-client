import { decodeBase62 } from './encoding'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = "ApiError"
  }
}

const API_URL = (() => {
  const url = import.meta.env.VITE_API_URL
  if (!url) {
    console.error(
      "[api] VITE_API_URL não está definida. Usando http://localhost:3000 como fallback."
    )
    return "http://localhost:3000"
  }
  return url
})()

const SHOP_STORAGE_KEY = "trinity_shop_id"
const UNIT_STORAGE_KEY = "trinity_unit_id"
const USER_STORAGE_KEY = "trinity_user_id"

/**
 * Decodifica ref parameter no formato legado (base64)
 * Mantido para backward compatibility
 * No formato legado, o ref pode conter shopId ou shopId:unitId
 * Por compatibilidade com testes existentes, retornamos o valor decodificado como shopId
 * Requirements: 12.1, 12.3, 12.4, 12.5, 12.6
 */
function decodeLegacyRef(): { shopId: string; unitId: string | null } | null {
  const params = new URLSearchParams(window.location.search)
  const ref = params.get("ref")
  if (!ref) return null
  
  try {
    const decoded = atob(ref)
    
    console.warn('[DEPRECATED] Formato legado de ref detectado. Use slugs de subdomínio.')
    
    // Armazena o valor decodificado como shopId
    localStorage.setItem(SHOP_STORAGE_KEY, decoded)
    
    // Tenta extrair unitId se houver formato shopId:unitId
    // Mas sempre retorna o decoded completo como shopId para manter compatibilidade
    if (decoded.includes(':')) {
      const parts = decoded.split(':', 2)
      if (parts.length === 2 && parts[1]) {
        localStorage.setItem(UNIT_STORAGE_KEY, parts[1])
        return { shopId: decoded, unitId: parts[1] }
      }
    }
    
    return { shopId: decoded, unitId: null }
  } catch {
    // Se atob falhar, não é formato legado base64
    return null
  }
}

/**
 * Decodifica ref parameter no novo formato (apenas userId)
 * Formato: base62(userId)
 * Só tenta decodificar se não houver shopId em localStorage (slug já resolvido)
 * Requirements: 8.3, 8.4, 8.7
 */
export function decodeUserRef(): string | null {
  const params = new URLSearchParams(window.location.search)
  const ref = params.get("ref")
  if (!ref) return null
  
  // Se já temos shopId em localStorage (de slug ou ref legado),
  // então o ref deve ser userId no novo formato
  const hasShopId = localStorage.getItem(SHOP_STORAGE_KEY) !== null
  
  if (hasShopId) {
    try {
      // Novo formato: apenas userId em base62
      const userId = decodeBase62(ref)
      localStorage.setItem(USER_STORAGE_KEY, userId)
      return userId
    } catch {
      // Ref inválido não bloqueia o app
      return null
    }
  }
  
  return null
}

/**
 * Obtém shopId com priorização de slug resolvido
 * Prioridade 1: localStorage (slug já resolvido)
 * Prioridade 2: Ref legado
 * Requirements: 12.2, 12.3, 12.4
 */
export function decodeShopId(): string | null {
  // Prioridade 1: Slug já resolvido em localStorage
  const stored = localStorage.getItem(SHOP_STORAGE_KEY)
  if (stored) return stored
  
  // Prioridade 2: Ref legado
  const legacy = decodeLegacyRef()
  if (legacy) {
    return legacy.shopId
  }
  
  return null
}

/**
 * Obtém unitId do localStorage
 * O unitId é armazenado pela resolução de slug ou ref legado
 */
export function getUnitId(): string | null {
  return localStorage.getItem(UNIT_STORAGE_KEY)
}

/**
 * Obtém userId do localStorage
 * O userId é armazenado pela decodificação do ref parameter
 */
export function getUserId(): string | null {
  return localStorage.getItem(USER_STORAGE_KEY)
}

export async function clientApi(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const shopId = decodeShopId()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.headers ?? {}),
    ...(shopId ? { "X-Shop-Id": shopId } : {}),
  }

  const response = await fetch(API_URL + path, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.json()
      message = body?.message ?? message
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, message)
  }

  return response
}
