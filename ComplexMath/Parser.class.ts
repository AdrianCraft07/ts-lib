import { add, divide, multiply, power, subtract } from './functions.ts';
import ComplexNumber from './ComplexNumber.class.ts';

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
}
interface Token {
	type: TokenType;
	value: string;
	index: number;
}

export class InvalidTokenError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidTokenError';
	}
}

function tokenize(source: string): Token[] {
	const tokens: Token[] = [];
	let index = 0;
	while (index < source.length) {
		const char = source[index];
		if (char === '(') tokens.push({ type: TokenType.OpenParen, value: char, index });
		else if (char === ')') tokens.push({ type: TokenType.CloseParen, value: char, index });
		else if (char === '[') tokens.push({ type: TokenType.OpenBracket, value: char, index });
		else if (char === ']') tokens.push({ type: TokenType.CloseBracket, value: char, index });
		else if (char === '{') tokens.push({ type: TokenType.OpenBrace, value: char, index });
		else if (char === '}') tokens.push({ type: TokenType.CloseBrace, value: char, index });
		else if (char === '+' || char === '-' || char === '*' || char === '/' || char === '^') tokens.push({ type: TokenType.Operator, value: char, index });
		else if (char === 'i' || char === 'e' || char === 'π') tokens.push({ type: TokenType.Constant, value: char, index });
		else if (char.match(/[0-9]/)) {
			let number = '';
			let nchar = char;
			let i_index = index;
			while (nchar.match(/[0-9]/) || nchar === '.') {
				if (nchar === '.' && number.includes('.')) throw new InvalidTokenError('Invalid number double decimal');
				number += nchar;
				nchar = source[++i_index] || '';
			}
			tokens.push({ type: TokenType.Number, value: number, index });
			index = i_index - 1;
		}
		index++;
	}
	return tokens;
}

export class ParseComplexError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ParseComplexError';
	}
}

interface ParseComplexResultNumber {
	type: 'number';
	value: ComplexNumber;
}
interface ParseComplexResultOperator {
	type: 'operator';
	value: string;
	left: ParseComplexResult;
	right: ParseComplexResult;
}

type ParseComplexResult = ParseComplexResultNumber | ParseComplexResultOperator;

export default class Parser {
	tokens: Token[];
	constructor(source: string) {
		this.tokens = tokenize(source);
	}
	protected at() {
		return this.tokens[0];
	}
	protected eat() {
		return this.tokens.shift();
	}
	protected parseConstant(): ParseComplexResultNumber {
		const constant = this.eat();
		if (constant?.value === 'i') return { type: 'number', value: new ComplexNumber(0, 1) };
		if (constant?.value === 'e') return { type: 'number', value: new ComplexNumber(Math.E) };
		if (constant?.value === 'π') return { type: 'number', value: new ComplexNumber(Math.PI) };
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
		if (this.at().type === TokenType.Number) {
			const number = this.eat();
			return { type: 'number', value: new ComplexNumber(parseFloat(number?.value || '0')) };
		}
		if (this.at().type === TokenType.Operator && this.at().value === '-') {
			this.eat();
			const right = this.parseValue();
			return { type: 'operator', value: '-', left: { type: 'number', value: ComplexNumber.from() }, right };
		}
		throw new ParseComplexError('Invalid value');
	}
	protected power(): ParseComplexResult {
		const left = this.parseValue();
		if (this.at() && this.at().type === TokenType.Operator && this.at().value === '^') {
			this.eat();
			const right = this.parseValue();
			return { type: 'operator', value: '^', left, right };
		}
		return left;
	}
	protected multiplication(): ParseComplexResult {
		const left = this.power();
		if (this.at() && this.at().type === TokenType.Operator && (this.at().value === '*' || this.at().value === '/')) {
			const operator = this.eat() as Token;
			const right = this.power();
			return { type: 'operator', value: operator.value, left, right };
		}
		return left;
	}
	protected addition(): ParseComplexResult {
		const left = this.multiplication();
		if (this.at() && this.at().type === TokenType.Operator && (this.at().value === '+' || this.at().value === '-')) {
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
			(this.at().type === TokenType.Constant ||
				this.at().type === TokenType.Number ||
				this.at().type === TokenType.OpenParen ||
				this.at().type === TokenType.OpenBracket ||
				this.at().type === TokenType.OpenBrace)
		) {
			return { type: 'operator', value: '*', left, right: this.parseExpression() };
		}
		return left;
	}
	public parse() {
		return this.parseExpression();
	}
	static compile(parse: ParseComplexResult): ComplexNumber {
		if (parse.type === 'number') return parse.value;
		if (parse.type === 'operator') {
			const left = Parser.compile(parse.left);
			const right = Parser.compile(parse.right);
			switch (parse.value) {
				case '+':
					return add(left, right);
				case '-':
					return subtract(left, right);
				case '*':
					return multiply(left, right);
				case '/':
					return divide(left, right);
				case '^':
					return power(left, right);
			}
		}
		throw new ParseComplexError('Invalid parse');
	}
}
