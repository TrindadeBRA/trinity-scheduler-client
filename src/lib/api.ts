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

export function decodeShopId(): string | null {
  const params = new URLSearchParams(window.location.search)
  const ref = params.get("ref")
  if (!ref) return localStorage.getItem(SHOP_STORAGE_KEY)
  try {
    const decoded = atob(ref)
    localStorage.setItem(SHOP_STORAGE_KEY, decoded)
    return decoded
  } catch {
    return null
  }
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
