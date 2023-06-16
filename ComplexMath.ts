import {absolute,add,cos,cot,csc,divide,equals,exp,log,modulo,multiply,negative,power,round,sec,sin,square,subtract,tan,floor} from './ComplexMath/functions.ts';
import ComplexNumber from './ComplexMath/ComplexNumber.class.ts';
import Parser from './ComplexMath/Parser.class.ts';

export {
  absolute,
  add,
  cos,
  cot,
  csc,
  divide,
  equals,
  exp,
  log,
  modulo,
  multiply,
  negative,
  power,
  round,
  floor,
  sec,
  sin,
  square,
  subtract,
  tan,
};
export { Parser };
export function parseComplex(value: string) {
  const parse = new Parser(value).parse();
  return Parser.compile(parse);
}
export default ComplexNumber;