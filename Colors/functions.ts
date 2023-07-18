import { FONTS, Color } from "./constants.ts";
import { Base10, makeRange } from '../util.ts';

type Base255STR = Base10 | `${Exclude<Base10, 0>}${Base10}` | `1${Base10}${Base10}` | `2${0 | 1 | 2 | 3 | 4}${Base10}` | `25${0 | 1 | 2 | 3 | 4 | 5}`;
type RGB_ARG = number | Base255STR;
type RGB_RED = RGB_ARG | [RGB_ARG, RGB_ARG, RGB_ARG];

export function ValidateColor(color: string): color is Color {
	return color.startsWith('\x1b[') && color.endsWith('m');
}

export function joinColors(...colors: Color[]) {
	let foreground = false;
	let background = false;
	let result = FONTS.RESET;
	for (const color of colors) {
		if (!ValidateColor(color)) throw new Error('Invalid color');
		if (color === FONTS.RESET) result = FONTS.RESET;
		else if (color.startsWith('\x1b[38;2;')) foreground = true;
		else if (color.startsWith('\x1b[48;2;')) background = true;

		if (result.includes(color)) continue;
		if (color.startsWith('\x1b[38;2;') && foreground) continue;
		if (color.startsWith('\x1b[48;2;') && background) continue;
		result += color;
	}
	return result;
}
export function colorize(text: string, color: Color, end: Color = FONTS.RESET): string {
	if (typeof text !== 'string') throw new Error('Invalid text');
	if (!ValidateColor(color)) throw new Error('Invalid color');
	if (!ValidateColor(end)) throw new Error('Invalid end color');
	if (text.includes(FONTS.RESET)) {
		const parts = text.split(FONTS.RESET);
		return parts.map(part => colorize(part, color, end)).join(FONTS.RESET);
	}
	return `${color}${text}${end}`;
}

const ValidRGB = makeRange(0, 255);
function validateRGB(red: RGB_RED, green: RGB_ARG, blue: RGB_ARG): [number, number, number] {
	if (Array.isArray(red)) return validateRGB(...red);

	red = parseInt(red as string);
	if (!ValidRGB(red)) throw new Error('Invalid red value');

	green = parseInt(green as string);
	if (!ValidRGB(green)) throw new Error('Invalid green value');

	blue = parseInt(blue as string);
	if (!ValidRGB(blue)) throw new Error('Invalid blue value');

	return [red, green, blue];
}
export function rgb(red: number, green: number, blue: number): Color {
	const [r, g, b] = validateRGB(red, green, blue);
	return `\x1b[38;2;${r};${g};${b}m`;
}
rgb.background = function (red: number, green: number, blue: number): Color {
	const [r, g, b] = validateRGB(red, green, blue);
	return `\x1b[48;2;${r};${g};${b}m`;
};

export function hexToRGB(hex: string): [number, number, number] {
	if (!hex.startsWith('#')) throw new Error('Invalid hex color');
	hex = hex.replace('#', '');
	const LENGTH = hex.length / 3;
	if (LENGTH === 1)
		hex = hex
			.split('')
			.map(x => x + x)
			.join('');
	else if (LENGTH !== 2) throw new Error('Invalid hex color');
	const red = parseInt(hex[0] + hex[1], 16);
	const green = parseInt(hex[2] + hex[3], 16);
	const blue = parseInt(hex[4] + hex[5], 16);
	return [red, green, blue];
}
