export const NIDHI_REFRESH_EVENT = "nidhi:refresh";
export const NIDHI_ASK_EVENT = "nidhi:ask";

export type NidhiRefreshEntity = "claims" | "tickets" | "profile";

export function emitNidhiRefresh(entity: NidhiRefreshEntity) {
  window.dispatchEvent(new CustomEvent(NIDHI_REFRESH_EVENT, { detail: { entity } }));
}

export function emitNidhiAsk(prompt: string) {
  window.dispatchEvent(new CustomEvent(NIDHI_ASK_EVENT, { detail: { prompt } }));
}
