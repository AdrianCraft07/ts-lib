import { assertEquals } from 'https://deno.land/std@0.190.0/testing/asserts.ts';
import ComplexNumber, { absolute, divide, equals, power, square, add, subtract, multiply, Parser } from '../ComplexMath.ts';

const five = ComplexNumber.from(5);

Deno.test('absolute', () => {
	assertEquals(absolute(ComplexNumber.from(3, 4)), five);
	assertEquals(absolute(ComplexNumber.from(3, -4)), five);
	assertEquals(absolute(ComplexNumber.from(-3, 4)), five);
	assertEquals(absolute(ComplexNumber.from(-3, -4)), five);
	assertEquals(absolute(ComplexNumber.from(0, 0)), ComplexNumber.from(0));
});
Deno.test('divide', () => {
	assertEquals(divide(ComplexNumber.from(3, 2), ComplexNumber.from(1, -1)), ComplexNumber.from(1 / 2, 5 / 2));
	assertEquals(divide(ComplexNumber.from(-4, -3), ComplexNumber.from(-2, 2)), ComplexNumber.from(1 / 4, 7 / 4));
	assertEquals(divide(ComplexNumber.from(0, 2), ComplexNumber.from(1, 3)), ComplexNumber.from(3 / 5, 1 / 5));
});
Deno.test('equals', () => {
	assertEquals(equals(ComplexNumber.from(0, 1), square(ComplexNumber.from(-1))), true);
	assertEquals(equals(ComplexNumber.from(3, 2), ComplexNumber.from(3, 3)), false);
});
Deno.test('power', () => {
	assertEquals(power(ComplexNumber.from(3, 2)), ComplexNumber.from(5, 12));
	assertEquals(power(ComplexNumber.from(3, 2), ComplexNumber.from(2)), ComplexNumber.from(5, 12));
	assertEquals(power(ComplexNumber.from(3, 2), ComplexNumber.from(3)), ComplexNumber.from(-9, 46));
});
Deno.test('square', () => {
	assertEquals(square(ComplexNumber.from(-1)), ComplexNumber.from(0, 1));
});

Deno.test('add', () => {
	assertEquals(add(ComplexNumber.from(2, 3), ComplexNumber.from(4, 1)), ComplexNumber.from(6, 4));
	assertEquals(add(ComplexNumber.from(-1, 5), ComplexNumber.from(3, -2)), ComplexNumber.from(2, 3));
	assertEquals(add(ComplexNumber.from(0, 0), ComplexNumber.from(1, 2)), ComplexNumber.from(1, 2));
});

Deno.test('substract', () => {
	assertEquals(subtract(ComplexNumber.from(5, 3), ComplexNumber.from(2, 1)), ComplexNumber.from(3, 2));
	assertEquals(subtract(ComplexNumber.from(-1, 5), ComplexNumber.from(3, -2)), ComplexNumber.from(-4, 7));
	assertEquals(subtract(ComplexNumber.from(0, 0), ComplexNumber.from(1, 2)), ComplexNumber.from(-1, -2));
});

Deno.test('multiply', () => {
	assertEquals(multiply(ComplexNumber.from(2, 3), ComplexNumber.from(4, 1)), ComplexNumber.from(5, 14));
	assertEquals(multiply(ComplexNumber.from(-1, 5), ComplexNumber.from(3, -2)), ComplexNumber.from(7, 17));
	assertEquals(multiply(ComplexNumber.from(0, 0), ComplexNumber.from(1, 2)), ComplexNumber.from(0, 0));
});

Deno.test('toString', () => {
	assertEquals(ComplexNumber.from(0, 0).toString(), '0');
	assertEquals(ComplexNumber.from(0, 1).toString(), 'i');
	assertEquals(ComplexNumber.from(10, -4).toString(), '10-4i');
});

Deno.test('Parser', () => {
	assertEquals(Parser.compile(new Parser('1+i').parse()), ComplexNumber.from(1, 1));
	assertEquals(Parser.compile(new Parser('e^(πi)').parse()), ComplexNumber.from(-1));
	assertEquals(Parser.compile(new Parser('(-1)^(1/2)').parse()), ComplexNumber.from(0, 1));
});
