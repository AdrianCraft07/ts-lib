import { Cartesian } from "./Cartesian.class.ts";
import { figure } from "./types.d.ts";

export function makeCircle(r: number) {
	if(r === 0) return [[0,0]] as figure;
	const list = [] as figure;

	for (let x = 0; x <= r; x++) {
		const n = new Cartesian(x, r);
		const polar = n.toPolar();
		const coord = Cartesian.from(r, polar.angle);

		const cx = Math.round(coord.x);
		const cy = Math.round(coord.y);

		const exists = list.find(([x, y]) => x === cx && y === cy);
		if (!exists) {
			list.push([cx, cy]);
		}
	}
	for (let y = 0; y <= r; y++) {
		const n = new Cartesian(r, y);
		const polar = n.toPolar();
		const coord = Cartesian.from(r, polar.angle);

		const cx = Math.round(coord.x);
		const cy = Math.round(coord.y);

		const exists = list.find(([x, y]) => x === cx && y === cy);
		if (!exists) {
			list.push([cx, cy]);
		}
	}
	const listLength = list.length;

	for (let i = 0; i < listLength; i++) {
		const [x, y] = list[i];
		const existsX = list.find(([cx, cy]) => cx === -x && cy === y);
		if (!existsX) list.push([-x, y]);

		const existsY = list.find(([cx, cy]) => cx === x && cy === -y);
		if (!existsY) list.push([x, -y]);

		const existsXY = list.find(([cx, cy]) => cx === -x && cy === -y);
		if (!existsXY) list.push([-x, -y]);
	}
	return list;
}
makeCircle.noNegative = function (r: number): figure {
  return makeCircle(r).map(([x, y]) => [y + r, x + r]) as figure;
};