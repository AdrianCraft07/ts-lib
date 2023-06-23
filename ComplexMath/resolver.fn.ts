import { log } from '../ComplexMath.ts';
import Parser, {
	ParseComplexResult,
	ParseComplexResultNumber,
multiple_power_var,
} from './Parser.class.ts';
import { divide, isInt } from './functions.ts';
import { LikeNumber, scope } from './types.ts';

function hasVariable(parse: ParseComplexResult): boolean {
	if (parse.type === 'variable') return true;
	if (parse.type === 'operator')
		return hasVariable(parse.left) || hasVariable(parse.right);
	return false;
}

function resolveEquation(
	_left: ParseComplexResult,
	_right: ParseComplexResult,
	scope: scope
): scope {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope) as ParseComplexResultNumber;
	if (hasVariable(right))
		throw new Error('Cannot resolve equation with variable on the right side');
	if (left.type === 'variable') {
		scope[left.name] = Parser.evaluate(right, scope);
		return scope;
	}
	if (left.type === 'operator') {
		switch (left.value) {
			case '^':
				// x^2 = 4
				// x = 4^(1/2)
				if (left.left.type === 'variable') {
					if(left.right.type === 'number'){
						const power = left.right.value;
						if(isInt(power)) return resolveEquation(
							left.left,
							multiple_power_var(right, +power),
							scope
						)
					}
					return resolveEquation(
						left.left,
						{
							type: 'operator',
							value: '^',
							left: right,
							right: {
								type: 'operator',
								value: '/',
								left: { type: 'number', value: 1 },
								right: left.right,
							},
						},
						scope
					);
				}
				if (left.right.type === 'variable') {
					const base = left.left;
					const variable = left.right;
					if (base.type === 'number') {
						return resolveEquation(
							variable,
							{
								type: 'operator',
								value: '/',
								left: { type: 'number', value: log(right.value) },
								right: { type: 'number', value: log(base.value) },
							},
							scope
						);
					}
				}
				break;
			case '*':
				// x*2 = 4
				// x = 4/2
				if (left.left.type === 'variable') {
					return resolveEquation(
						left.left,
						{
							type: 'operator',
							value: '/',
							left: right,
							right: left.right,
						},
						scope
					);
				}
				if (left.right.type === 'variable') {
					return resolveEquation(
						left.right,
						{
							type: 'operator',
							value: '/',
							left: right,
							right: left.left,
						},
						scope
					);
				}
				break;
			case '/':
				// x/2 = 4
				// x = 4*2
				if (left.left.type === 'variable') {
					return resolveEquation(
						left.left,
						{
							type: 'operator',
							value: '*',
							left: right,
							right: left.right,
						},
						scope
					);
				}
				if (left.right.type === 'variable') {
					// 2/x = 4
					// x(2/x) = 4x
					// 4x = 2
					return resolveEquation(
						{
							type: 'operator',
							value: '*',
							left: right,
							right: left.right,
						},
						left.left,
						scope
					);
				}
				break;
			case '+':
				// x+2 = 4
				// x = 4-2
				if (left.left.type === 'variable') {
					return resolveEquation(
						left.left,
						{
							type: 'operator',
							value: '-',
							left: right,
							right: left.right,
						},
						scope
					);
				}
				if (left.right.type === 'variable') {
					return resolveEquation(
						left.right,
						{
							type: 'operator',
							value: '-',
							left: right,
							right: left.left,
						},
						scope
					);
				}
				break;
			case '-':
				// x-2 = 4
				// x = 4+2
				if (left.left.type === 'variable') {
					return resolveEquation(
						left.left,
						{
							type: 'operator',
							value: '+',
							left: right,
							right: left.right,
						},
						scope
					);
				}
				if (left.right.type === 'variable') {
					return resolveEquation(
						left.right,
						{
							type: 'operator',
							value: '+',
							left: right,
							right: left.left,
						},
						scope
					);
				}
		}
	}
	return scope;
}

type equation = `${string}=${string}`

/**
 * Resolves an equation
 * 
 * This function is not finished so it may have errors
 */
export default function resolve(source: equation, scope?: scope): scope;
export default function resolve(source: string, scope?: scope): LikeNumber | LikeNumber[];
export default function resolve(source: string, scope: scope = {}) {
	const equations = source.split('=');
	const simplified = equations.map(equation => {
		const parsed = new Parser(equation).parse();
		const simplify = Parser.simplify(parsed, scope);
		return simplify;
	});
	if (simplified.length === 1) return Parser.evaluate(simplified[0],scope);
	if (simplified.length === 2) {
		const [left, right] = simplified;
		if (hasVariable(left)) return resolveEquation(left, right, scope);
		if (hasVariable(right)) return resolveEquation(right, left, scope);
	}
	throw new Error('Invalid equation');
}
