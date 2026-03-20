import { clientApi } from "../lib/api";

interface LoginResponse {
  clientId: string;
  name: string | null;
}

interface ValidateResponse {
  clientId: string;
  name: string | null;
}

export async function login(phone: string): Promise<LoginResponse> {
  const response = await clientApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
  const data = await response.json();
  return { clientId: data.clientId, name: data.name ?? null };
}

export async function validateSession(clientId: string): Promise<ValidateResponse | false> {
  try {
    const response = await clientApi(`/auth/validate?clientId=${encodeURIComponent(clientId)}`);
    const data = await response.json();
    return { clientId: data.clientId, name: data.name ?? null };
  } catch {
    return false;
  }
}

export async function updateClientName(clientId: string, name: string): Promise<void> {
  await clientApi("/auth/name", {
    method: "PATCH",
    body: JSON.stringify({ clientId, name }),
  });
}
