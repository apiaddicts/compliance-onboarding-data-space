import { AuthInterface } from '@/interfaces'

export const setToken = (tokenInfo: AuthInterface) => {
  localStorage.setItem('tokenInfo', JSON.stringify(tokenInfo))
}

export const getToken = () => {
  return JSON.parse(localStorage.getItem('tokenInfo') ?? 'null')
}

export const removeToken = () => {
  localStorage.removeItem('tokenInfo')
}
