import ComplexNumber from './ComplexNumber.class.ts';

type LikeNumber = number | ComplexNumber;

function roundDecimals(value: number, decimals = 0) {
	const multiplier = Math.pow(10, decimals);
	const round = Math.round(value * multiplier);
	return round / multiplier;
}

export function isLikeNumber(value: unknown): value is LikeNumber {
	return value instanceof ComplexNumber || typeof value === 'number';
}

//#region Arithmetic functions
export function absolute(x: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(typeof x === 'number') return ComplexNumber.from(Math.abs(x))
	// Absolute value is the distance from the origin (0,0)
	// c^2 = a^2 + b^2
	// c = sqrt(a^2 + b^2)
	const c2 = x.real * x.real + x.imaginary * x.imaginary;
	const c = Math.sqrt(c2);
	return ComplexNumber.from(c);
}
export function add(x: LikeNumber, y: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(!isLikeNumber(y)) throw new Error('Invalid y value')
	if(typeof x === 'number')
		if(typeof y === 'number') return ComplexNumber.from(x + y);
		else return ComplexNumber.from(x + y.real, y.imaginary);
	else // x instanceof ComplexNumber
	  if(typeof y === 'number') return ComplexNumber.from(x.real + y, x.imaginary);
	  else return ComplexNumber.from(x.real + y.real, x.imaginary + y.imaginary);
}
export function subtract(x: LikeNumber, y: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(!isLikeNumber(y)) throw new Error('Invalid y value')
	if(typeof x === 'number')
		if(typeof y === 'number') return ComplexNumber.from(x - y);
		else return ComplexNumber.from(x - y.real, -y.imaginary);
	else // x instanceof ComplexNumber
	  if(typeof y === 'number') return ComplexNumber.from(x.real - y, x.imaginary);
	  else return ComplexNumber.from(x.real - y.real, x.imaginary - y.imaginary);
}
export function multiply(x: LikeNumber, y: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(!isLikeNumber(y)) throw new Error('Invalid y value')

	if(typeof x === 'number')
		if(typeof y === 'number') return ComplexNumber.from(x * y);
		else return ComplexNumber.from(x * y.real, x * y.imaginary);
	else // x instanceof ComplexNumber
	  if(typeof y === 'number') return ComplexNumber.from(x.real * y, x.imaginary * y);
		else return ComplexNumber.from(x.real * y.real - x.imaginary * y.imaginary, x.real * y.imaginary + x.imaginary * y.real);
}
export function divide(x: LikeNumber, y: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(!isLikeNumber(y)) throw new Error('Invalid y value')

	if(typeof x === 'number')
		if(typeof y === 'number') return ComplexNumber.from(x / y);
		else return ComplexNumber.from(x / y.real, x / y.imaginary);
	else // x instanceof ComplexNumber
		if(typeof y === 'number') return ComplexNumber.from(x.real / y, x.imaginary / y);
		else {
			// Denominator: c^2 + d^2
			const denominator = y.real * y.real + y.imaginary * y.imaginary;

			// Real part: (a * c + b * d) / (c^2 + d^2)
			const real = (x.real * y.real + x.imaginary * y.imaginary) / denominator;

			// Imaginary part: (b * c - a * d) / (c^2 + d^2)
			const imaginary = (x.imaginary * y.real - x.real * y.imaginary) / denominator;

			return ComplexNumber.from(real, imaginary);
		}
}
export function modulo(x: LikeNumber, y: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(!isLikeNumber(y)) throw new Error('Invalid y value')

	const quotient = divide(x, y);
	const quotientFloor = floor(quotient);
	return subtract(x, multiply(quotientFloor, y));
}
export function exp(x: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(typeof x === 'number') return ComplexNumber.from(Math.exp(x))

	const real = Math.exp(x.real) * Math.cos(x.imaginary);
	const imaginary = Math.exp(x.real) * Math.sin(x.imaginary);
	return ComplexNumber.from(real, imaginary);
}
export function log(x: LikeNumber) {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(typeof x === 'number') return ComplexNumber.from(Math.log(x))

	// Real: ln(|x|)
	const real = Math.log(Math.sqrt(x.real * x.real + x.imaginary * x.imaginary));
	// Imaginary: arg(x)
	const imaginary = Math.atan2(x.imaginary, x.real);
	return ComplexNumber.from(real, imaginary);
}
export function power(x: LikeNumber, y: LikeNumber = 2): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(!isLikeNumber(y)) throw new Error('Invalid y value')

	const logX = log(x);
	const product = multiply(logX, y);
	return exp(product);
}
export function square(x: LikeNumber, y: LikeNumber = (2)): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')

	return power(x, divide(ComplexNumber.from(1), y));
}
//#endregion

//#region Trigonometric functions
export function sin(x: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')

	if(typeof x === 'number') return ComplexNumber.from(Math.sin(x))

	// Real part: sin(a) * cosh(b)
	const real = Math.sin(x.real) * Math.cosh(x.imaginary);

	// Imaginary part: cos(a) * sinh(b)
	const imaginary = Math.cos(x.real) * Math.sinh(x.imaginary);

	return ComplexNumber.from(real, imaginary);
}
export function cos(x: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')

	if(typeof x === 'number') return ComplexNumber.from(Math.cos(x))

	// Real part: cos(a) * cosh(b)
	const real = Math.cos(x.real) * Math.cosh(x.imaginary);

	// Imaginary part: -sin(a) * sinh(b)
	const imaginary = -Math.sin(x.real) * Math.sinh(x.imaginary);

	return ComplexNumber.from(real, imaginary);
}
export function tan(x: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')

	if(typeof x === 'number') return ComplexNumber.from(Math.tan(x))

	// Calculate sin(x) and cos(x)
	const sinX = sin(x);
	const cosX = cos(x);

	// Divide sin(x) by cos(x)
	return divide(sinX, cosX);
}
export function cot(x: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')

	// Calculate cos(x) and sin(x)
	const cosX = cos(x);
	const sinX = sin(x);

	// Divide cos(x) by sin(x)
	return divide(cosX, sinX);
}
export function sec(x: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(typeof x === 'number') return ComplexNumber.from(1 / Math.cos(x))

	// Calculate cos(x)
	const cosX = cos(x);

	// Take the reciprocal of cos(x)
	return divide(1, cosX);
}
export function csc(x: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(typeof x === 'number') return ComplexNumber.from(1 / Math.sin(x))

	// Calculate sin(x)
	const sinX = sin(x);

	// Take the reciprocal of sin(x)
	return divide(1, sinX);
}
//#endregion

//#region Program functions
export function equals(x: LikeNumber, y: LikeNumber): boolean {
	if (typeof x === 'number' && typeof y === 'number') return x === y;
	if (typeof x === 'number' && y instanceof ComplexNumber) return x === y.real && y.imaginary === 0;
	if (x instanceof ComplexNumber && typeof y === 'number') return x.real === y && x.imaginary === 0;
	if (x instanceof ComplexNumber && y instanceof ComplexNumber) return x.real === y.real && x.imaginary === y.imaginary;
	return false;
}
export function negative(x: LikeNumber): ComplexNumber {
	if (typeof x === 'number') return ComplexNumber.from(-x);
	return ComplexNumber.from(-x.real, -x.imaginary);
}
export function round(x: LikeNumber, y: LikeNumber = 0): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(!isLikeNumber(y)) throw new Error('Invalid y value')

	// If y is a complex number, use its real part
	if(y instanceof ComplexNumber) y = y.real;

	if(typeof x === 'number') return ComplexNumber.from(roundDecimals(x, y));
	// Round the real and imaginary parts separately
	const real = roundDecimals(x.real, y);
	const imaginary = roundDecimals(x.imaginary, y);
	return ComplexNumber.from(real, imaginary);
}
export function floor(x: LikeNumber): ComplexNumber {
	if(!isLikeNumber(x)) throw new Error('Invalid x value')
	if(typeof x === 'number') return ComplexNumber.from(Math.floor(x));
	// Floor the real and imaginary parts separately
	const real = Math.floor(x.real);
	const imaginary = Math.floor(x.imaginary);
	return ComplexNumber.from(real, imaginary);
}
//#endregion
