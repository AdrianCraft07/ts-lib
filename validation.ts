export function ValidType<T>(value: T, callback: (value: unknown) => value is T){
  if(callback(value)) return value;
  throw new TypeError(`${value} is not a valid type`);
}