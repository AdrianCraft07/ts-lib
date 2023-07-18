export type FunctionDestroyer<FN> = FN extends (...args: infer ARGS) => infer RESULT ? {args:ARGS, result:RESULT} : never;
export type ArrayTransform<T extends any[]> = {
  [K in keyof T]: T[K] | T[K][];
} extends infer U ? U extends any[] ? U : never : never;

export type Item<A> = A extends (infer B)[] ? B : A;