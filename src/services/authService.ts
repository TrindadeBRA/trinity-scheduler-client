const simulateDelay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function login(phone: string, delay = 800): Promise<string> {
  await simulateDelay(delay);
  const clientId = `client-${phone}-${Date.now()}`;
  console.log("[authService] login", { phone, clientId });
  return clientId;
}
