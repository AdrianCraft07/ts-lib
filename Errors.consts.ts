export class InvalidTokenError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidTokenError';
	}
}
export class ParseComplexError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ParseComplexError';
	}
}