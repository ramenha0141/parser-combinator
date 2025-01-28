import type { Parser } from '../parser';
import { rep } from './rep';
import { seq } from './seq';

export function lrec<K, RFirst extends R, RTail, R>(
	parser1: Parser<K, RFirst>,
	parser2: Parser<K, RTail>,
	fn: (value1: R, value2: RTail) => R,
): Parser<K, R> {
	return seq(parser1, rep(parser2)).map(([first, tails]) => {
		let result: R = first;

		for (const tail of tails) {
			result = fn(result, tail);
		}

		return result;
	});
}
