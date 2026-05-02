import AppID from 'ibmcloud-appid-js';

const appID = new AppID();
const clientId = import.meta.env.VITE_APPID_CLIENT_ID;
const discoveryEndpoint = import.meta.env.VITE_APPID_DISCOVERY_URL;

const initPromise = appID.init({
  clientId,
  discoveryEndpoint,
});

export const handleLogin = async () => {
  try {
    await initPromise;
    const tokens = await appID.signin();
    sessionStorage.setItem('appid_tokens', JSON.stringify(tokens));
    return tokens;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const handleLogout = async () => {
  sessionStorage.removeItem('appid_tokens');
  window.location.href = '/';
};

export const getUser = async () => {
  const tokensStr = sessionStorage.getItem('appid_tokens');
  if (!tokensStr) return null;
  try {
    const tokens = JSON.parse(tokensStr);
    return tokens.idTokenPayload;
  } catch (e) {
    return null;
  }
};

export default appID;
