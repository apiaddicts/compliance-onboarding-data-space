export const getEnvironment = () => {
  return {
    VITE_API_SIGN: import.meta.env.VITE_API_SIGN,
    VITE_PRIVATE_KEY: import.meta.env.VITE_PRIVATE_KEY,
    VITE_CLEARING_URL: import.meta.env.VITE_CLEARING_URL,
    VITE_CLIENT_ID_KONG: import.meta.env.VITE_CLIENT_ID_KONG,
    VITE_CLIENT_SECRET_KONG: import.meta.env.VITE_CLIENT_SECRET_KONG,
    VITE_API_BACK: import.meta.env.VITE_API_BACK,
    VITE_COMPLIANCE_URL: import.meta.env.VITE_COMPLIANCE_URL
  }
}
