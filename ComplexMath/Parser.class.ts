import {
	add,
	divide,
	equals,
	isInt,
	multiply,
	power,
	round,
	subtract,
} from './functions.ts';
import ComplexNumber from './ComplexNumber.class.ts';
import { InvalidTokenError, ParseComplexError } from '../Errors.consts.ts';
import tokenize, {
	Token as Token_Type,
	TokenOptions,
	skip,
} from '../tokenize.fn.ts';
import { scope, valid_var, LikeNumber } from './types.ts';
import { exec } from '../Utils.ts';

const enum TokenType {
	Number,
	Operator,
	OpenParen,
	CloseParen,
	OpenBracket,
	CloseBracket,
	OpenBrace,
	CloseBrace,
	Constant,
	Variable,
}

const TokenizeOptions: TokenOptions<TokenType> = [
	['(', TokenType.OpenParen],
	[')', TokenType.CloseParen],
	['[', TokenType.OpenBracket],
	[']', TokenType.CloseBracket],
	['{', TokenType.OpenBrace],
	['}', TokenType.CloseBrace],
	[/\+|\-|\*|\/|\^/, TokenType.Operator],
	[/i|e|π/, TokenType.Constant],
	[
		/[0-9]/,
		function (_, { col, row }, line) {
			let number = '';
			let nchar = _;
			let i = col;
			while (nchar.match(/[0-9]/) || nchar === '.') {
				if (nchar === '.' && number.includes('.'))
					throw new InvalidTokenError('Invalid number double decimal');
				number += nchar;
				nchar = line[++i] || '';
			}
			return [{ type: TokenType.Number, value: number, col, row }, i - col - 1];
		},
	],
	[/\s/, skip],
	[/[a-z]/i, TokenType.Variable],
];

export interface ParseComplexResultVariable {
	type: 'variable';
	value: LikeNumber;
	name: valid_var;
}
export interface ParseComplexResultNumber {
	type: 'number';
	value: LikeNumber;
}
export interface ParseComplexResultOperator {
	type: 'operator';
	value: string;
	left: ParseComplexResult;
	right: ParseComplexResult;
}
export interface ParseComplexResultList {
	type: 'list';
	value: LikeNumber[];
}

export type ParseComplexResultValue =
	| ParseComplexResultNumber
	| ParseComplexResultVariable;
export type ParseComplexResult =
	| ParseComplexResultValue
	| ParseComplexResultOperator
	| ParseComplexResultList;

type Token = Token_Type<TokenType>;
function isMultiplication(token: Token) {
	if (token.type === TokenType.OpenBracket) return true; // 2[x] = 2*(x)
	if (token.type === TokenType.OpenParen) return true; // 2(x) = 2*(x)
	if (token.type === TokenType.OpenBrace) return true; // 2{x} = 2*(x)
	if (token.type === TokenType.Constant) return true; // xi = (x)*i
	if (token.type === TokenType.Variable) return true; // xy = (x)*y
	if (token.type === TokenType.Number) return true; // 2x = 2*(x)
	return false;
}

export default class Parser {
	tokens: Token[];
	constructor(source: string) {
		this.tokens = tokenize(source, TokenizeOptions);
	}
	protected at() {
		return this.tokens[0];
	}
	protected eat() {
		return this.tokens.shift();
	}
	protected next() {
		return this.tokens[1];
	}
	protected parseVariable(): ParseComplexResultVariable {
		const variable = this.eat();
		if (variable?.type === TokenType.Variable)
			return { type: 'variable', value: 1, name: variable.value as valid_var };
		throw new ParseComplexError('Invalid variable');
	}
	protected parseConstant(): ParseComplexResultValue {
		const constant = this.eat();
		if (constant?.value === 'i')
			return { type: 'number', value: new ComplexNumber(0, 1) };
		if (constant?.value === 'e')
			return { type: 'number', value: new ComplexNumber(Math.E) };
		if (constant?.value === 'π')
			return { type: 'number', value: new ComplexNumber(Math.PI) };
		throw new ParseComplexError('Invalid constant');
	}
	protected parseValue(): ParseComplexResult {
		if (this.at().type === TokenType.OpenParen) {
			this.eat();
			const left = this.parseExpression();
			if (this.at() && this.at().type === TokenType.CloseParen) {
				this.eat();
				return left;
			}
		}
		if (this.at().type === TokenType.OpenBracket) {
			this.eat();
			const left = this.parseExpression();
			if (this.at() && this.at().type === TokenType.CloseBracket) {
				this.eat();
				return left;
			}
		}
		if (this.at().type === TokenType.OpenBrace) {
			this.eat();
			const left = this.parseExpression();
			if (this.at() && this.at().type === TokenType.CloseBrace) {
				this.eat();
				return left;
			}
		}
		if (this.at().type === TokenType.Constant) {
			return this.parseConstant();
		}
		if (this.at().type === TokenType.Variable) {
			return this.parseVariable();
		}
		if (this.at().type === TokenType.Number) {
			const number = this.eat();
			return {
				type: 'number',
				value: new ComplexNumber(parseFloat(number?.value || '0')),
			};
		}
		if (this.at().type === TokenType.Operator && this.at().value === '-') {
			this.eat();
			const right = this.parseValue();
			return {
				type: 'operator',
				value: '-',
				left: { type: 'number', value: ComplexNumber.from(0) },
				right,
			};
		}
		throw new ParseComplexError('Invalid value');
	}
	protected powerValue(): ParseComplexResult {
		const left = this.power();
		if (this.at() && isMultiplication(this.at())) {
			const right = this.multiplication();
			return { type: 'operator', value: '*', left, right };
		}
		return left;
	}
	protected power(): ParseComplexResult {
		const left = this.parseValue();
		if (
			this.at() &&
			this.at().type === TokenType.Operator &&
			this.at().value === '^'
		) {
			this.eat();
			const right = this.powerValue();
			return { type: 'operator', value: '^', left, right };
		}
		return left;
	}
	protected multiplication(): ParseComplexResult {
		const left = this.power();
		if (
			this.at() &&
			this.at().type === TokenType.Operator &&
			(this.at().value === '*' || this.at().value === '/')
		) {
			const operator = this.eat() as Token;
			const right = this.power();
			return { type: 'operator', value: operator.value, left, right };
		}
		if (this.at() && isMultiplication(this.at())) {
			const right = this.multiplication();
			return { type: 'operator', value: '*', left, right };
		}
		return left;
	}
	protected addition(): ParseComplexResult {
		const left = this.multiplication();
		if (
			this.at() &&
			this.at().type === TokenType.Operator &&
			(this.at().value === '+' || this.at().value === '-')
		) {
			const operator = this.eat() as Token;
			const right = this.multiplication();
			return { type: 'operator', value: operator.value, left, right };
		}
		return left;
	}
	protected parseExpression(): ParseComplexResult {
		const left = this.addition();
		if (
			this.at() &&
			(this.at().type === TokenType.Variable ||
				this.at().type === TokenType.Constant ||
				this.at().type === TokenType.Number ||
				this.at().type === TokenType.OpenParen ||
				this.at().type === TokenType.OpenBracket ||
				this.at().type === TokenType.OpenBrace)
		) {
			return {
				type: 'operator',
				value: '*',
				left,
				right: this.parseExpression(),
			};
		}
		return left;
	}
	public parse() {
		return this.parseExpression();
	}
	static evaluate(parse: ParseComplexResult, scope: scope): LikeNumber | LikeNumber[] {
		if (parse.type === 'number') return ComplexNumber.from(parse.value);
		if (parse.type === 'operator') {
			const left = Parser.evaluate(parse.left, scope);
			const right = Parser.evaluate(parse.right, scope);
			switch (parse.value) {
				case '+':
					return exec(left, right, add);
				case '-':
					return exec(left, right, subtract);
				case '*':
					return exec(left, right, multiply);
				case '/':
					return exec(left, right, divide);
				case '^':
					return exec(left, right, power);
			}
		}
		if (parse.type === 'variable') {
			if (scope[parse.name])
				return ComplexNumber.from(scope[parse.name] as LikeNumber);
			throw new ParseComplexError(`Variable ${parse.name} not found`);
		}
		if (parse.type === 'list') {
			const results = [];
			for (const value of parse.value) results.push(value);
			return results;
		}
		throw new ParseComplexError('Invalid parse');
	}
	static simplify(parse: ParseComplexResult, scope: scope): ParseComplexResult {
		if (parse.type === 'variable' && scope[parse.name])
			return {
				type: 'number',
				value: multiply(parse.value, scope[parse.name] as LikeNumber),
			};

		if (parse.type !== 'operator') return parse;
		const operator = parse.value;
		const left = Parser.simplify(parse.left, scope);
		const right = Parser.simplify(parse.right, scope);

		if (operator === '/') return divide_var(left, right, scope);
		if (operator === '*') return multiply_var(left, right, scope);
		if (operator === '+') return add_var(left, right, scope);
		if (operator === '-') return subtract_var(left, right, scope);
		if (operator === '^') return power_var(left, right, scope);

		return { type: 'operator', value: operator, left, right };
	}
}
export function eval_complex(value: string, scope: scope) {
	const parse = new Parser(value).parse();
	return Parser.evaluate(parse, scope);
}

export function divide_var(
	_left: ParseComplexResult,
	_right: ParseComplexResult,
	scope: scope
): ParseComplexResult {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope);
	if (left.type === 'number' && right.type === 'number')
		return { type: 'number', value: divide(left.value, right.value) };
	if (left.type === 'variable' && right.type === 'variable') {
		if (left.name === right.name)
			return {
				type: 'number',
				value: ComplexNumber.from(divide(left.value, right.value)),
			};
		const value = divide(left.value, right.value);
		return {
			type: 'operator',
			value: '*',
			left: { type: 'number', value },
			right: {
				type: 'operator',
				value: '/',
				left: { type: 'variable', value: 1, name: left.name },
				right: { type: 'variable', value: 1, name: right.name },
			},
		};
	}
	if (left.type === 'variable') {
		if (right.type === 'number') {
			return {
				type: 'variable',
				value: divide(left.value, right.value),
				name: left.name,
			};
		}
	}
	if (left.type === 'operator' && right.type !== 'operator') {
		if (left.value === '+') {
			return add_var(
				divide_var(left.left, right, scope),
				divide_var(left.right, right, scope),
				scope
			);
		}
		if (left.value === '-') {
			return subtract_var(
				divide_var(left.left, right, scope),
				divide_var(left.right, right, scope),
				scope
			);
		}
	}
	return {
		type: 'operator',
		value: '/',
		left,
		right,
	};
}
export function multiply_var(
	_left: ParseComplexResult,
	_right: ParseComplexResult,
	scope: scope
): ParseComplexResult {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope);
	if (left.type === 'number' && right.type === 'number')
		return { type: 'number', value: multiply(left.value, right.value) };
	if (left.type === 'number' && equals(left.value, 1)) return right;
	if (right.type === 'number' && equals(right.value, 1)) return left;
	if (left.type === 'number' && equals(left.value, 0))
		return { type: 'number', value: 0 };
	if (right.type === 'number' && equals(right.value, 0))
		return { type: 'number', value: 0 };
	if (left.type === 'variable' && right.type === 'variable') {
		if (left.name === right.name) {
			return multiply_var(
				{ type: 'number', value: multiply(left.value, right.value) },
				{
					type: 'operator',
					value: '^',
					left: { type: 'variable', value: 1, name: left.name },
					right: { type: 'number', value: 2 },
				},
				scope
			);
		}
		return multiply_var(
			{ type: 'number', value: multiply(left.value, right.value) },
			{
				type: 'operator',
				value: '*',
				left: { type: 'variable', value: 1, name: left.name },
				right: { type: 'variable', value: 1, name: right.name },
			},
			scope
		);
	}
	if (left.type === 'variable') {
		if (right.type === 'number')
			return {
				type: 'variable',
				value: multiply(left.value, right.value),
				name: left.name,
			};
	}
	if (right.type === 'variable') {
		if (left.type === 'number') {
			return {
				type: 'variable',
				value: multiply(left.value, right.value),
				name: right.name,
			};
		}
	}
	if (left.type === 'operator' && right.type !== 'operator') {
		if (left.value === '+')
			return add_var(
				multiply_var(left.left, right, scope),
				multiply_var(left.right, right, scope),
				scope
			);
		if (left.value === '-')
			return subtract_var(
				multiply_var(left.left, right, scope),
				multiply_var(left.right, right, scope),
				scope
			);
		if (left.value === '/')
			return divide_var(
				multiply_var(left.left, right, scope),
				multiply_var(left.right, right, scope),
				scope
			);
		if (left.value === '*')
			return multiply_var(
				multiply_var(left.left, right, scope),
				multiply_var(left.right, right, scope),
				scope
			);
	}
	if (left.type !== 'operator' && right.type === 'operator') {
		if (right.value === '+')
			return add_var(
				multiply_var(left, right.left, scope),
				multiply_var(left, right.right, scope),
				scope
			);
		if (right.value === '-')
			return subtract_var(
				multiply_var(left, right.left, scope),
				multiply_var(left, right.right, scope),
				scope
			);
		if (right.value === '/')
			return divide_var(
				multiply_var(left, right.left, scope),
				multiply_var(left, right.right, scope),
				scope
			);
		if (right.value === '*')
			return multiply_var(
				multiply_var(left, right.left, scope),
				multiply_var(left, right.right, scope),
				scope
			);
	}
	return {
		type: 'operator',
		value: '*',
		left,
		right,
	};
}
export function add_var(
	_left: ParseComplexResult,
	_right: ParseComplexResult,
	scope: scope
): ParseComplexResult {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope);
	if (left.type === 'number' && right.type === 'number')
		return { type: 'number', value: add(left.value, right.value) };
	if (left.type === 'variable' || right.type === 'variable')
		return { type: 'operator', value: '+', left, right };
	if (left.type === 'operator' && right.type !== 'operator') {
		if (left.value === '+') {
			return add_var(left.left, add_var(left.right, right, scope), scope);
		}
		if (left.value === '-') {
			return subtract_var(left.left, add_var(left.right, right, scope), scope);
		}
	}
	if (left.type !== 'operator' && right.type === 'operator') {
		if (right.value === '+') {
			return add_var(add_var(left, right.left, scope), right.right, scope);
		}
		if (right.value === '-') {
			return subtract_var(add_var(left, right.left, scope), right.right, scope);
		}
	}
	return { type: 'operator', value: '+', left, right };
}
export function subtract_var(
	_left: ParseComplexResult,
	_right: ParseComplexResult,
	scope: scope
): ParseComplexResult {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope);
	if (left.type === 'number' && right.type === 'number')
		return { type: 'number', value: subtract(left.value, right.value) };
	if (left.type === 'variable' || right.type === 'variable')
		return { type: 'operator', value: '*', left, right };
	if (left.type === 'operator' && right.type !== 'operator') {
		if (left.value === '+') {
			return add_var(left.left, subtract_var(left.right, right, scope), scope);
		}
		if (left.value === '-') {
			return subtract_var(
				left.left,
				subtract_var(left.right, right, scope),
				scope
			);
		}
	}
	if (left.type !== 'operator' && right.type === 'operator') {
		if (right.value === '+') {
			return add_var(subtract_var(left, right.left, scope), right.right, scope);
		}
		if (right.value === '-') {
			return subtract_var(
				subtract_var(left, right.left, scope),
				right.right,
				scope
			);
		}
	}
	return { type: 'operator', value: '-', left, right };
}
export function power_var(
	_left: ParseComplexResult,
	_right: ParseComplexResult,
	scope: scope
): ParseComplexResult {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope) as
		| ParseComplexResultNumber
		| ParseComplexResultList;

	if (right.type === 'number' && equals(right.value, 0))
		return { type: 'number', value: 1 };
	if (right.type === 'number' && equals(right.value, 1)) return left;

	if (left.type === 'number' && right.type === 'number')
		return { type: 'number', value: power(left.value, right.value) };

	if (left.type === 'operator') {
		if (left.value === '*') {
			return multiply_var(
				power_var(left.left, right, scope),
				power_var(left.right, right, scope),
				scope
			);
		}
		if (left.value === '/') {
			return divide_var(
				power_var(left.left, right, scope),
				power_var(left.right, right, scope),
				scope
			);
		}
		if (left.value === '^') {
			return power_var(
				left.left,
				multiply_var(left.right, right, scope),
				scope
			);
		}
	}
	return { type: 'operator', value: '^', left, right };
}
export function multiple_power_var(
	right: ParseComplexResultNumber | ParseComplexResultList,
	root: number
): ParseComplexResultList {
	const roots: ComplexNumber[] = [];
	if (right.type === 'list') {
		const actualRoots = [];
		for (const value of right.value) {
			actualRoots.push(
				...multiple_power_var({ type: 'number', value }, root).value
			);
		}
		return { type: 'list', value: actualRoots };
	}
	let value = right.value;

	if (typeof value === 'number') value = ComplexNumber.from(value);
	const magnitude = Math.pow(
		value.real ** 2 + value.imaginary ** 2,
		1 / (2 * root)
	);
	const angle = Math.atan2(value.imaginary, value.real);
	for (let i = 0; i < root; i++) {
		const theta = (angle + 2 * Math.PI * i) / root;
		const realPart = magnitude * Math.cos(theta);
		const imaginaryPart = magnitude * Math.sin(theta);
		roots.push(ComplexNumber.from(realPart, imaginaryPart));
	}

	return { type: 'list', value: roots };
}
