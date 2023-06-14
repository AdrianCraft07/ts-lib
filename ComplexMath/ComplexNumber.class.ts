import Inspecteable from '../Inspectable.class.ts';
const PRECISION = 14;
const MIDDLE_PRECISION = Math.round(PRECISION/2);
const EPSILON = Number(`1e-${PRECISION+1}`);
function roundDecimals(value: number, decimals = 0) {
	const multiplier = Math.pow(10, decimals);
	const round = Math.round(value * multiplier);
	return round / multiplier;
}

export default class ComplexNumber extends Inspecteable {
	constructor(public real: number = 0, public imaginary: number = 0) {
		super();
	}
	toString() {
		const parts = ['0', '+', '0i'];
		if (this.real !== 0) parts[0] = this.real.toString();
		else parts[0] = parts[1] = '';

		if (this.imaginary === 0) {
			parts[1] = parts[2] = '';
		} else if (Math.abs(this.imaginary) === 1) parts[2] = 'i';
		else parts[2] = `${Math.abs(this.imaginary)}i`;

		if (this.imaginary < 0) parts[1] = '-';

		return parts.join('') || '0';
	}
	static NaN: ComplexNumber;
	static Infinity: ComplexNumber;
	static NegativeInfinity: ComplexNumber;
	static Zero: ComplexNumber;
	static One: ComplexNumber;
	static Two: ComplexNumber;
	static E: ComplexNumber;
	static Pi: ComplexNumber;
	static I: ComplexNumber;
	static One_Two: ComplexNumber;
	static from(value = 0, imaginary = 0) {
		if (Math.abs(value) < EPSILON) value = 0;
		if (Math.abs(imaginary) < EPSILON) imaginary = 0;

		const a = Number(value.toPrecision(PRECISION));
		const b = Number(value.toPrecision(MIDDLE_PRECISION));
		if (a === b) value = roundDecimals(value, PRECISION-2);

		const c = parseFloat(imaginary.toPrecision(PRECISION));
		const d = parseFloat(imaginary.toPrecision(MIDDLE_PRECISION));
		if (c === d) imaginary = roundDecimals(imaginary, PRECISION-2);

		if (!ComplexNumber.NaN) ComplexNumber.NaN = new ComplexNumber(NaN);

		if (!ComplexNumber.Infinity) ComplexNumber.Infinity = new ComplexNumber(Infinity);
		if (!ComplexNumber.NegativeInfinity) ComplexNumber.NegativeInfinity = new ComplexNumber(-Infinity);
		if (!ComplexNumber.Zero) ComplexNumber.Zero = new ComplexNumber(0);
		if (!ComplexNumber.One) ComplexNumber.One = new ComplexNumber(1);
		if (!ComplexNumber.Two) ComplexNumber.Two = new ComplexNumber(2);
		if (!ComplexNumber.E) ComplexNumber.E = new ComplexNumber(Math.E);
		if (!ComplexNumber.Pi) ComplexNumber.Pi = new ComplexNumber(Math.PI);
		if (!ComplexNumber.I) ComplexNumber.I = new ComplexNumber(0, 1);
		if (!ComplexNumber.One_Two) ComplexNumber.One_Two = new ComplexNumber(1 / 2);

		if (typeof value !== 'number') value = parseFloat(value);
		if (typeof imaginary !== 'number') imaginary = parseFloat(imaginary);

		if (ComplexNumber.isNeN(value) || ComplexNumber.isNeN(imaginary)) return ComplexNumber.NaN;

		if (value === Infinity) return ComplexNumber.Infinity;
		if (value === -Infinity) return ComplexNumber.NegativeInfinity;

		if (imaginary === Infinity) return ComplexNumber.Infinity;
		if (imaginary === -Infinity) return ComplexNumber.NegativeInfinity;

		if (value === 0 && imaginary === 0) return ComplexNumber.Zero;
		if (value === 1 && imaginary === 0) return ComplexNumber.One;
		if (value === 2 && imaginary === 0) return ComplexNumber.Two;
		if (value === Math.E && imaginary === 0) return ComplexNumber.E;
		if (value === Math.PI && imaginary === 0) return ComplexNumber.Pi;
		if (value === 0 && imaginary === 1) return ComplexNumber.I;
		if (value === 1 / 2 && imaginary === 0) return ComplexNumber.One_Two;

		return new ComplexNumber(value, imaginary);
	}
	static isNeN(value: number): boolean {
		return value !== 0 && !value;
	}
}