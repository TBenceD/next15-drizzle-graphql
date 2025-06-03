// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper functions
export function tryCatch<T, E = Error>(fn: () => T): Result<T, E>;
export function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>>;
export function tryCatch<T, E = Error>(input: (() => T) | Promise<T>): Result<T, E> | Promise<Result<T, E>> {
  // Handle synchronous functions
  if (!(input instanceof Promise)) {
    try {
      return { data: input(), error: null };
    } catch (error) {
      return { data: null, error: error as E };
    }
  }

  // Handle asynchronous functions
  return input.then((data) => ({ data, error: null })).catch((error) => ({ data: null, error: error as E }));
}
