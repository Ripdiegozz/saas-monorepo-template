/**
 * Result type for use case responses. No framework dependencies.
 */
export type Ok<T> = { isOk: true; value: T };
export type Err<E> = { isOk: false; error: E };
export type Result<T, E = Error> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { isOk: true, value };
}

export function err<E>(error: E): Err<E> {
  return { isOk: false, error };
}
