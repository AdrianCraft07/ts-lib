import ComplexNumber from "./ComplexNumber.class.ts";

function roundDecimals(value: number, decimals = 0) {
	const multiplier = Math.pow(10, decimals);
	const round = Math.round(value * multiplier);
	return round / multiplier;
}

//#region Arithmetic functions
export function round(x: ComplexNumber, y: ComplexNumber = ComplexNumber.from(0)): ComplexNumber {
	// Round the real and imaginary parts separately
	const real = roundDecimals(x.real, y.real);
	const imaginary = roundDecimals(x.imaginary, y.real);
	return ComplexNumber.from(real, imaginary);
}
export function absolute(x: ComplexNumber): ComplexNumber {
	// Absolute value is the distance from the origin (0,0)
	// c^2 = a^2 + b^2
	// c = sqrt(a^2 + b^2)
	const c2 = x.real * x.real + x.imaginary * x.imaginary;
	const c = Math.sqrt(c2);
	return ComplexNumber.from(c);
}
export function add(x: ComplexNumber, y: ComplexNumber): ComplexNumber {
	// Real part: a + c
	const real = x.real + y.real;

	// Imaginary part: b + d
	const imaginary = x.imaginary + y.imaginary;

	return ComplexNumber.from(real, imaginary);
}
export function subtract(x: ComplexNumber, y: ComplexNumber): ComplexNumber {
	// Real part: a - c
	const real = x.real - y.real;

	// Imaginary part: b - d
	const imaginary = x.imaginary - y.imaginary;

	return ComplexNumber.from(real, imaginary);
}
export function multiply(x: ComplexNumber, y: ComplexNumber): ComplexNumber {
	// Real part: a * c - b * d
	const real = x.real * y.real - x.imaginary * y.imaginary;

	// Imaginary part: a * d + b * c
	const imaginary = x.real * y.imaginary + x.imaginary * y.real;

	return ComplexNumber.from(real, imaginary);
}
export function divide(x: ComplexNumber, y: ComplexNumber): ComplexNumber {
	// Denominator: c^2 + d^2
	const denominator = y.real * y.real + y.imaginary * y.imaginary;

	// Real part: (a * c + b * d) / (c^2 + d^2)
	const real = (x.real * y.real + x.imaginary * y.imaginary) / denominator;

	// Imaginary part: (b * c - a * d) / (c^2 + d^2)
	const imaginary = (x.imaginary * y.real - x.real * y.imaginary) / denominator;

	return ComplexNumber.from(real, imaginary);
}
export function modulo(x: ComplexNumber, y: ComplexNumber): ComplexNumber {
	// Denominator: c^2 + d^2
	const denominator = y.real * y.real + y.imaginary * y.imaginary;

	// Real part: (a * c + b * d) % (c^2 + d^2)
	const real = (x.real * y.real + x.imaginary * y.imaginary) % denominator;

	// Imaginary part: (b * c - a * d) / (c^2 + d^2)
	const imaginary = (x.imaginary * y.real - x.real * y.imaginary) % denominator;

	return ComplexNumber.from(real, imaginary);
}
export function exp(x: ComplexNumber) {
	const real = Math.exp(x.real) * Math.cos(x.imaginary);
	const imaginary = Math.exp(x.real) * Math.sin(x.imaginary);
	return ComplexNumber.from(real, imaginary);
}
export function log(x: ComplexNumber) {
	// Real: ln(|x|)
	const real = Math.log(Math.sqrt(x.real * x.real + x.imaginary * x.imaginary));
	// Imaginary: arg(x)
	const imaginary = Math.atan2(x.imaginary, x.real);
	return ComplexNumber.from(real, imaginary);
}
export function power(x: ComplexNumber, y: ComplexNumber = ComplexNumber.from(2)): ComplexNumber {
	const logX = log(x);
	const product = multiply(logX, y);
	return exp(product);
}
export function square(x: ComplexNumber, y: ComplexNumber = ComplexNumber.from(2)): ComplexNumber {
	return power(x, divide(ComplexNumber.from(1), y));
}
//#endregion

//#region Trigonometric functions
export function sin(x: ComplexNumber): ComplexNumber {
	// Real part: sin(a) * cosh(b)
	const real = Math.sin(x.real) * Math.cosh(x.imaginary);

	// Imaginary part: cos(a) * sinh(b)
	const imaginary = Math.cos(x.real) * Math.sinh(x.imaginary);

	return ComplexNumber.from(real, imaginary);
}
export function cos(x: ComplexNumber): ComplexNumber {
	// Real part: cos(a) * cosh(b)
	const real = Math.cos(x.real) * Math.cosh(x.imaginary);

	// Imaginary part: -sin(a) * sinh(b)
	const imaginary = -Math.sin(x.real) * Math.sinh(x.imaginary);

	return ComplexNumber.from(real, imaginary);
}
export function tan(x: ComplexNumber): ComplexNumber {
	// Calculate sin(x) and cos(x)
	const sinX = sin(x);
	const cosX = cos(x);

	// Divide sin(x) by cos(x)
	return divide(sinX, cosX);
}
export function cot(x: ComplexNumber): ComplexNumber {
	// Calculate cos(x) and sin(x)
	const cosX = cos(x);
	const sinX = sin(x);

	// Divide cos(x) by sin(x)
	return divide(cosX, sinX);
}
export function sec(x: ComplexNumber): ComplexNumber {
	// Calculate cos(x)
	const cosX = cos(x);

	// Take the reciprocal of cos(x)
	return divide(ComplexNumber.from(1), cosX);
}
export function csc(x: ComplexNumber): ComplexNumber {
	// Calculate sin(x)
	const sinX = sin(x);

	// Take the reciprocal of sin(x)
	return divide(ComplexNumber.from(1), sinX);
}
//#endregion

//#region Program functions
export function equals(x: ComplexNumber, y: ComplexNumber): boolean {
	return x.real === y.real && x.imaginary === y.imaginary;
}
export function negative(x: ComplexNumber): ComplexNumber {
	return ComplexNumber.from(-x.real, -x.imaginary);
}
//#endregion
