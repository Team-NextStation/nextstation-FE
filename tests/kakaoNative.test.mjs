import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildNativeKakaoCallback,
  parseNativeKakaoCallback,
  runNativeKakaoLogin,
} from '../src/utils/kakaoNative.ts';

const state = `nextstation-ios-${'a'.repeat(64)}`;
const search = `?code=authorization-code&state=${state}`;

test('only app-initiated callbacks are relayed, without arbitrary parameters', () => {
  assert.equal(buildNativeKakaoCallback('?code=x&state=web-state'), null);
  assert.equal(buildNativeKakaoCallback(`?code=x&state=${state}&state=${state}`), null);
  assert.equal(buildNativeKakaoCallback(`?code=x&error=denied&state=${state}`), null);
  assert.equal(buildNativeKakaoCallback(`?state=${state}`), null);
  assert.equal(buildNativeKakaoCallback(`${search}&redirect=https://evil.example`),
    `nextstation://auth/kakao/callback${search}`);
});

test('accepts only the exact app callback and preserves OAuth denial', () => {
  assert.equal(parseNativeKakaoCallback(`nextstation://auth/kakao/callback${search}`),
    `/auth/kakao/callback${search}`);
  for (const url of [
    `https://auth/kakao/callback${search}`,
    `nextstation://evil/kakao/callback${search}`,
    `nextstation://auth/other${search}`,
    `nextstation://user@auth/kakao/callback${search}`,
    'not a url',
  ]) assert.equal(parseNativeKakaoCallback(url), null);
  const denied = `?error=access_denied&state=${state}`;
  assert.equal(parseNativeKakaoCallback(`nextstation://auth/kakao/callback${denied}`),
    `/auth/kakao/callback${denied}`);
});

function harness(open) {
  const calls = [];
  let onUrl;
  let onFinished;
  const ports = {
    listenUrl: async (listener) => {
      onUrl = listener;
      calls.push('listen-url');
      return { remove: async () => { calls.push('remove-url'); } };
    },
    listenFinished: async (listener) => {
      onFinished = listener;
      calls.push('listen-finished');
      return { remove: async () => { calls.push('remove-finished'); } };
    },
    open: async () => { calls.push('open'); await open(onUrl, onFinished); },
    close: async () => { calls.push('close'); onFinished(); },
  };
  return { calls, ports };
}

test('subscribes before opening, ignores mismatched state, and closes on app return', async () => {
  const { calls, ports } = harness(async (onUrl) => {
    onUrl(`nextstation://auth/kakao/callback?code=bad&state=nextstation-ios-${'b'.repeat(64)}`);
    onUrl(`nextstation://auth/kakao/callback${search}`);
  });
  assert.equal(await runNativeKakaoLogin('https://kauth.kakao.com/oauth/authorize', state, ports),
    `/auth/kakao/callback${search}`);
  assert.deepEqual(calls, ['listen-url', 'listen-finished', 'open', 'close', 'remove-url', 'remove-finished']);
});

test('closing the browser cancels login and removes both listeners', async () => {
  const { calls, ports } = harness(async (_, finished) => finished());
  assert.equal(await runNativeKakaoLogin('https://kauth.kakao.com/oauth/authorize', state, ports), null);
  assert.deepEqual(calls.slice(-2), ['remove-url', 'remove-finished']);
});

test('opening failure cleans up listeners and propagates the error', async () => {
  const { calls, ports } = harness(async () => { throw new Error('Cannot open browser'); });
  await assert.rejects(runNativeKakaoLogin('https://kauth.kakao.com/oauth/authorize', state, ports),
    /Cannot open browser/);
  assert.deepEqual(calls.slice(-2), ['remove-url', 'remove-finished']);
});
