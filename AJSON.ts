// deno-lint-ignore-file no-explicit-any

// deno-lint-ignore ban-types
function convertFunctionToString(fn: Function){
  const data = fn.toString();

  // function name (arg1, arg2) { body }
  const matchBlock = data.match(/function\s*\((.*)\)\s*\{([\s\S]*)\}/);
  if (matchBlock) return `fn:${data}`;

  // (arg1, arg2) => { body }
  const matchArrow = data.match(/\((.*)\)\s*=>\s*{([\s\S]*)}/);
  if (matchArrow) return `fn:${data}`;
  
  // name(arg1, arg2) { body }
  const matchProp = data.match(/(.*)\((.*)\)\s*\{([\s\S]*)\}/);
  if (matchProp) {
    const [, name, args, body] = matchProp;
    return `fn:function ${name}(${args}){${body}}`;
  }
}

export function stringify(data: any): string{
  if (typeof data === 'function') {
    return stringify(convertFunctionToString(data));
  }
  if (typeof data === 'object') {
    return JSON.stringify(data, (_key, value) => {
      if (typeof value === 'function') return convertFunctionToString(value);
      return value;
    })
  }
  return JSON.stringify(data);
}
function _parse(self:any, obj: any): any {
  if (typeof obj === 'string' && obj.startsWith('fn:')) {
    const fnBody = obj.slice(3);
    return new Function('self',`return (${fnBody})`)(self);
  }
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) return obj.map(v=>_parse(self,v));
    if (obj === null) return obj;
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = _parse(self, obj[key]);
      return acc;
    }, obj as Record<string, any>);
  }
  return obj;
}
export function parse(data: string): any{
  const self = JSON.parse(data);
  return _parse(self, self);
}

export default {
  stringify,
  parse
}
