const BASE_URL = "/api"
const ACCESS_KEY = "nestboard.accessToken"
const REFRESH_KEY = "nestboard.refreshToken"

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  auth?: boolean
}

export class ApiError extends Error {
  code: string
  status: number

  constructor(status: number, code: string, message: string) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function parseError(res: Response): Promise<ApiError> {
  let code = "UNKNOWN"
  let message = res.statusText
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string }
    }
    code = body.error?.code ?? code
    message = body.error?.message ?? message
  } catch {

  }
  return new ApiError(res.status, code, message)
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (!refreshToken) return false
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as {
      accessToken: string
      refreshToken: string
    }
    localStorage.setItem(ACCESS_KEY, data.accessToken)
    localStorage.setItem(REFRESH_KEY, data.refreshToken)
    return true
  } catch {
    return false
  }
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const token = localStorage.getItem(ACCESS_KEY)
  if (auth && token) headers.Authorization = `Bearer ${token}`

  const send = (): Promise<Response> =>
    fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })

  let res = await send()

  if (res.status === 401 && auth && token) {
    if (await refreshTokens()) {
      headers.Authorization = `Bearer ${localStorage.getItem(ACCESS_KEY)}`
      res = await send()
    }
  }

  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}