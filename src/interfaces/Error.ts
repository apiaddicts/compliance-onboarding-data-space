export interface ErrorBasicInterface {
  status?: number
  error?: string
  error_code?: string
  error_description?: string
}

export interface ErrorSerializedInterface {
  name?: string
  message?: string
  stack?: string
  code?: string
  error_description: string
}
