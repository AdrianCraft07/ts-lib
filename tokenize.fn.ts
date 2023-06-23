import { InvalidTokenError } from './Errors.consts.ts';

export interface Token<TokenType> {
	type: TokenType;
	value: string;
	col: number;
	row: number;
}
type TokenOptionsCallback<TokenType> = (
	value: string,
	index: { col: number; row: number },
	line: string
) => [Token<TokenType> | null, number];
export type TokenOptions<TokenType> = [
	string | RegExp,
	TokenType | TokenOptionsCallback<TokenType>
][];

export default function tokenize<TokenType>(
	source: string,
	options: TokenOptions<TokenType>
): Token<TokenType>[] {
	const tokens: Token<TokenType>[] = [];
	const lines = source.split(/\r?\n/);
	for (let row = 0; row < lines.length; row++) {
		const line = lines[row];
		for (let col = 0; col < line.length; col++) {
			const char = line[col];
			const token = options.find(option => {
				if (typeof option[0] === 'string') return option[0] === char;
				if (option[0] instanceof RegExp) return option[0].test(char);
			});
			if (token) {
				const v = token[1];
				if (typeof v === 'function') {
					const [t, i] = (v as TokenOptionsCallback<TokenType>)(
						char,
						{ col, row },
						line
					);
					if (t) tokens.push(t);
					col += i;
					continue;
				}
				tokens.push({ type: v, value: char, col, row });
			} else throw new InvalidTokenError(`Invalid token ${char}`);
		}
	}

	return tokens;
}

export function skip(): [null, 0] {
	return [null, 0];
}
