export type Color = `\x1b[${string}m`;
export const FONTS = {
	RESET: '\x1b[0m' as Color,
	BOLD: '\x1b[1m' as Color,
	DIM: '\x1b[2m' as Color,
	ITALIC: '\x1b[3m' as Color,
	UNDERLINED: '\x1b[4m' as Color,
	BLINK: '\x1b[5m' as Color,
	REVERSE: '\x1b[7m' as Color,
	HIDDEN: '\x1b[8m' as Color,
	STRIKETHROUGH: '\x1b[9m' as Color,
};

type COLORS =
	| 'BLACK'
	| 'RED'
	| 'GREEN'
	| 'YELLOW'
	| 'BLUE'
	| 'MAGENTA'
	| 'CYAN'
	| 'WHITE';
type BRIGHT_COLORS = `BRIGHT_${Exclude<COLORS, 'GRAY' | 'BLACK'>}` | 'GRAY';
type ALL_COLORS = COLORS | BRIGHT_COLORS;

export const FOREGROUND = {} as Record<ALL_COLORS, Color>;
export const BACKGROUND = {} as Record<ALL_COLORS, Color>;

const Colors: COLORS[] = [
	'BLACK',
	'RED',
	'GREEN',
	'YELLOW',
	'BLUE',
	'MAGENTA',
	'CYAN',
	'WHITE',
];

for (const color of Colors) {
	FOREGROUND[color] = `\x1b[${30 + Colors.indexOf(color)}m` as Color;
	BACKGROUND[color] = `\x1b[${40 + Colors.indexOf(color)}m` as Color;

	const brightColor: BRIGHT_COLORS =
		color === 'BLACK' ? 'GRAY' : `BRIGHT_${color}`;
	FOREGROUND[brightColor] = `\x1b[${90 + Colors.indexOf(color)}m` as Color;
	BACKGROUND[brightColor] = `\x1b[${100 + Colors.indexOf(color)}m` as Color;
}
