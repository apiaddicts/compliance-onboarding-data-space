import { ErrorBasicInterface, ErrorSerializedInterface } from './Error'

export type ErrorTypeInterface = undefined | ErrorBasicInterface | ErrorSerializedInterface

export type ValidationResult = { ok: true; url: URL } | { ok: false; reason: string } | { ok: true; data: any };
export interface Options {
  allowRelative?: boolean;
  base?: string;
}