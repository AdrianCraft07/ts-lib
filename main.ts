import { rgb } from './Colors/functions.ts';
import { makeCircle } from './Geometry/circle.ts';
import { toString } from "./Geometry/index.ts";
import { makeQuadrate } from './Geometry/quadrate.ts';

const r = 10
const quadrate = makeQuadrate(r+r).map((a) => {a.push(2);return a});
const list: string[] = [];
for (let i = 0; i < r; i++) {
  const figure = makeCircle(i)
  const incenter = [...quadrate, ...figure.map(([x, y]) => [x + r - i, y + r -i])] as typeof figure;
  const figureStr = toString(incenter, '  ', rgb.background(0,255,0), undefined, rgb.background(255,0,0));
  list.push(figureStr);
}
list.push(...list.toReversed())

setInterval(() => {
  console.clear();
  const figure = list.shift()!;
  list.push(figure);
  console.log(figure);
}, 100);