/**
 * WebAuthn Biometric Passkey Utility
 * Supports TouchID, FaceID, Windows Hello, and Android Biometric unlock.
 * Adheres to ADR-008 for Sovereign Client-Side Security.
 */

export const isWebAuthnAvailable = async () => {
  if (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  ) {
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (e) {
      return false;
    }
  }
  return false;
};

export const registerBiometricPasskey = async (username = 'sovereign_user') => {
  if (!window.PublicKeyCredential) {
    throw new Error('WebAuthn biometric authentication is not supported in this browser.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const userId = new Uint8Array(16);
  window.crypto.getRandomValues(userId);

  const createOptions = {
    publicKey: {
      challenge,
      rp: {
        name: 'Richy Rich Sovereign Finance',
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },  // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
    },
  };

  const credential = await navigator.credentials.create(createOptions);
  if (credential) {
    const rawIdBase64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    localStorage.setItem('richy_biometric_cred_id', rawIdBase64);
    localStorage.setItem('richy_biometric_enabled', 'true');
    return { success: true, credentialId: rawIdBase64 };
  }
  throw new Error('Failed to create biometric passkey.');
};

export const authenticateBiometricPasskey = async () => {
  if (!window.PublicKeyCredential) {
    throw new Error('WebAuthn is not supported.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const getOptions = {
    publicKey: {
      challenge,
      timeout: 60000,
      userVerification: 'required',
      rpId: window.location.hostname,
    },
  };

  const assertion = await navigator.credentials.get(getOptions);
  if (assertion) {
    return { success: true };
  }
  throw new Error('Biometric verification failed.');
};

export const isBiometricLockEnabled = () => {
  try {
    return localStorage.getItem('richy_biometric_enabled') === 'true';
  } catch (e) {
    return false;
  }
};
