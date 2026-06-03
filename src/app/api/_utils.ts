export function platformJson(data: Record<string, unknown>, init?: ResponseInit) {
  return Response.json({ platform: true, appMode: process.env.APP_MODE ?? "platform", ...data }, init);
}

export function errorJson(message: string, status = 400, details?: Record<string, unknown>) {
  return platformJson({ error: message, ...(details ?? {}) }, { status });
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function decimalToString(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) return value.toString();
  return String(value ?? "0");
}
