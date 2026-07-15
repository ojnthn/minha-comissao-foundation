export type Result<T, E = string> =
  { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });

export const fail = <T>(error: string): Result<T> => ({ ok: false, error });
