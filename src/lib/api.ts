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

function decodeRef(): { shopId: string; unitId: string | null } | null {
  const params = new URLSearchParams(window.location.search)
  const ref = params.get("ref")
  if (!ref) return null
  try {
    const decoded = atob(ref)
    const [shopId, unitId] = decoded.split(":")
    return { shopId, unitId: unitId || null }
  } catch {
    return null
  }
}

export function decodeShopId(): string | null {
  const result = decodeRef()
  if (result) {
    localStorage.setItem(SHOP_STORAGE_KEY, result.shopId)
    if (result.unitId) {
      localStorage.setItem(UNIT_STORAGE_KEY, result.unitId)
    }
    return result.shopId
  }
  return localStorage.getItem(SHOP_STORAGE_KEY)
}

export function getUnitId(): string | null {
  const result = decodeRef()
  if (result?.unitId) {
    localStorage.setItem(UNIT_STORAGE_KEY, result.unitId)
    return result.unitId
  }
  return localStorage.getItem(UNIT_STORAGE_KEY)
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
