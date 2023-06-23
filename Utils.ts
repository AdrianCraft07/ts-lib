type RangeValidator = (value: number) => boolean;
export function makeRange(min: number, max: number): RangeValidator {
	return (value: number) => min <= value && value <= max;
}

export type Base2 = 0 | 1;
export type Base10 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export function exec<A, B, C>(
	a: A | A[],
	b: B | B[],
	fn: (a: A, b: B) => C
): C | C[] {
	if (Array.isArray(a) && Array.isArray(b)) {
		const results = [];
		for (let i = 0; i < a.length; i++)
			for (let j = 0; j < b.length; j++) results.push(fn(a[i], b[j]));

		return results;
	}
	if (Array.isArray(a)) {
		const results = [];
		for (let i = 0; i < a.length; i++) results.push(fn(a[i], b as B));
		return results;
	}
	if (Array.isArray(b)) {
		const results = [];
		for (let i = 0; i < b.length; i++) results.push(fn(a as A, b[i]));
		return results;
	}
	return fn(a as A, b as B);
}
