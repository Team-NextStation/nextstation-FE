export const NATIVE_KAKAO_STATE_PREFIX = 'nextstation-ios-';
const APP_CALLBACK = 'nextstation://auth/kakao/callback';

function getCallbackParams(search: string): URLSearchParams | null {
  const params = new URLSearchParams(search);
  for (const key of ['state', 'code', 'error', 'error_description']) {
    if (params.getAll(key).length > 1) return null;
  }
  const state = params.get('state');
  if (!state || !/^nextstation-ios-[a-f0-9]{64}$/.test(state)) return null;
  const code = params.get('code');
  const error = params.get('error');
  if (Boolean(code) === Boolean(error)) return null;

  const result = new URLSearchParams();
  if (code) result.set('code', code);
  if (error) result.set('error', error);
  result.set('state', state);
  if (error && params.get('error_description')) {
    result.set('error_description', params.get('error_description')!);
  }
  return result;
}

export function buildNativeKakaoCallback(search: string): string | null {
  const params = getCallbackParams(search);
  return params ? `${APP_CALLBACK}?${params}` : null;
}

export function parseNativeKakaoCallback(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'nextstation:' || url.host !== 'auth' ||
      url.pathname !== '/kakao/callback' || url.username || url.password || url.hash) {
      return null;
    }
    const params = getCallbackParams(url.search);
    return params ? `/auth/kakao/callback?${params}` : null;
  } catch {
    return null;
  }
}

interface ListenerHandle {
  remove(): Promise<void>;
}

interface NativeKakaoPorts {
  listenUrl(listener: (url: string) => void): Promise<ListenerHandle>;
  listenFinished(listener: () => void): Promise<ListenerHandle>;
  open(url: string): Promise<void>;
  close(): Promise<void>;
}

export async function runNativeKakaoLogin(
  url: string,
  state: string,
  ports: NativeKakaoPorts,
): Promise<string | null> {
  let finished = false;
  let resolveCallback!: (path: string | null) => void;
  const callback = new Promise<string | null>((resolve) => {
    resolveCallback = resolve;
  });
  const handles: ListenerHandle[] = [];
  try {
    handles.push(await ports.listenUrl((rawUrl) => {
      const path = parseNativeKakaoCallback(rawUrl);
      if (finished || !path) return;
      if (new URL(rawUrl).searchParams.get('state') !== state) return;
      finished = true;
      resolveCallback(path);
    }));
    handles.push(await ports.listenFinished(() => {
      if (finished) return;
      finished = true;
      resolveCallback(null);
    }));
    await ports.open(url);
    const path = await callback;
    if (path) await ports.close();
    return path;
  } finally {
    await Promise.allSettled(handles.map((handle) => handle.remove()));
  }
}
