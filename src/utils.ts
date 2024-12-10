export async function destructPromise<Data, Err extends Error = Error>(
  promise: PromiseLike<Data>
): Promise<[false, Err] | [true, Data]> {
  try {
    const data = await promise;
    return [true, data];
  } catch (e) {
    return [false, e as Err];
  }
}
