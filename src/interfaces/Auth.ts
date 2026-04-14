import { ErrorTypeInterface } from '@/interfaces'

export interface AuthInterface {
  access_token: string
  expires_in: number
  refresh_expires_in: number
  refresh_token: number
}

export interface InitialStateAuthInterface {
  authenticating: boolean
  errorAuthenticating: ErrorTypeInterface
  refreshingToken: boolean
  errorRefreshingToken: ErrorTypeInterface
  loggingOff: boolean
  errorLoggingOff: ErrorTypeInterface
  logged: boolean
  token_info: undefined | AuthInterface
}
