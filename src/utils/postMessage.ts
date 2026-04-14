interface VcFile {
  filename: string;
  content_in_base64: string;
}

const win = globalThis as unknown as Window & typeof globalThis;

export function isEmbeddedInIframe(): boolean {
  return win.parent !== win;
}

export function sendVcsToParent(files: VcFile[]): void {
  if (!isEmbeddedInIframe()) return;
  const origin = win.location.ancestorOrigins?.[0]
    ?? (win.document.referrer?.replace(/\/$/, '') || '*');
  win.parent.postMessage({ files }, origin);
}

export function vcToBase64(vc: Record<string, unknown>, filename: string): VcFile {
  const json = JSON.stringify(vc, null, 2);
  const bytes = new TextEncoder().encode(json);
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
  return { filename, content_in_base64: win.btoa(binString) };
}
