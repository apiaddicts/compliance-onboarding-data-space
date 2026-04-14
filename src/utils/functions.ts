import type { AxiosError } from 'axios'

import { ErrorBasicInterface } from '@/interfaces'

const iso3166_2_regex = /^[A-Z]{2}-[A-Z0-9]{1,3}$/;

export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(func: F, waitFor = 800) => {
  let timeout: NodeJS.Timeout
  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), waitFor)
  }
  return debounced
}

export const parseErrorAxios = (err: unknown) => {
  const error = err as AxiosError<ErrorBasicInterface>
  if (!error.response) throw err
  else {
    const status = error.response?.status
    const error_code = error.response?.data.error ?? error.response?.data.error_code
    const error_description = error.response?.data.error_description
    return { status, error_code, error_description }
  }
}

export const isISO31662 = (code: string): boolean => {
  return iso3166_2_regex.test(code);
}

export const isPEMStructure = (str: string): boolean => {
  const pemRegex = /^-----BEGIN PRIVATE KEY-----[\s\S]*-----END PRIVATE KEY-----$/g;
  return pemRegex.test(str.trim());
}
