import apis from './index';
import { getEnvironment } from '@/utils';

const { VITE_API_BACK, VITE_CLIENT_ID_KONG, VITE_CLIENT_SECRET_KONG, VITE_COMPLIANCE_URL } = getEnvironment();

export const getJsonFile = async (url: string) => {
  return await apis.get(url);
}

export const submitCompliance = async (vp: Record<string, any>) => {
  const res = await apis.post(
    `${VITE_COMPLIANCE_URL}/api/credential-offers`,
    vp,
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );
  return res;
}

export const validLRN = async (didId: string, idLrn: string, type: string) => {
  const kongRes = await apis.post(
    `${VITE_API_BACK}/oauth2/token`,
    {
      "grant_type": "client_credentials",
      "client_id": VITE_CLIENT_ID_KONG,
      "client_secret": VITE_CLIENT_SECRET_KONG,
      "scope": "read"
    }
  )
  const token = kongRes.data.access_token;
  const res = await apis.post(
    `${VITE_API_BACK}/valid-lrn`,
    {
      didId: didId,
      idLrn: idLrn,
      type: type
    }
    , {
      headers: {
        token: `${token}`
      }
    }
  )
  return res.data;
}
