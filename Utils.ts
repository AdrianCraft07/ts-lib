type RangeValidator = (value: number) => boolean;
export function makeRange(min: number, max: number): RangeValidator {
	return (value: number) => min <= value && value <= max;
}

export type Base2 = 0|1;
export type Base10 = 0|1|2|3|4|5|6|7|8|9;
