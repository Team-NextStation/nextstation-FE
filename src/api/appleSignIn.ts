import { registerPlugin } from '@capacitor/core';

interface AppleSignInPlugin {
  signIn(options: { nonce: string }): Promise<{
    identityToken: string;
    user: string;
  }>;
}

export const AppleSignIn = registerPlugin<AppleSignInPlugin>('AppleSignIn');
