type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

export type AuthRefreshQueue = {
  enqueue: () => Promise<string>;
  resolveAll: (token: string) => void;
  rejectAll: (error: unknown) => void;
  size: () => number;
};

export function createAuthRefreshQueue(): AuthRefreshQueue {
  let queue: QueueItem[] = [];

  return {
    enqueue: () =>
      new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }),
    resolveAll: (token: string) => {
      queue.forEach((item) => item.resolve(token));
      queue = [];
    },
    rejectAll: (error: unknown) => {
      queue.forEach((item) => item.reject(error));
      queue = [];
    },
    size: () => queue.length,
  };
}
