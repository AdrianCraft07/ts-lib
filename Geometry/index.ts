import { FOREGROUND, BACKGROUND, Color, FONTS } from '../Colors/constants.ts';
import { joinColors, colorize } from '../Colors/functions.ts';
import { figure } from './types.d.ts';

export function toString(
	figure: figure,
	char = '#',
	foreground = joinColors(FOREGROUND.WHITE, BACKGROUND.WHITE),
	background = FONTS.RESET,
  ...othersColors: Color[]
): string {
	const str: number[][] = [];
  let i = 0;
  while(i < figure.length) {
    const [x, y, color] = figure[i];
    if (str.length <= y) {
      str.push([]);
      continue
    }
    if(str[y].length <= x) {
      str[y].push(0);
      continue
    }
    str[y][x] = color ?? 1;
    i++;
  }
	const pixels = [colorize(char, background), colorize(char, foreground), ...othersColors.map(color => colorize(char, color))];
	return str.map(row => row.map(v => pixels[v]).join('')).join('\n');
}
