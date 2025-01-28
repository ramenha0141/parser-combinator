import { type Parser, ParserImpl } from '../parser';
import type { ResultOf, TokenKindOf } from '../utils';
import { kright, seq } from './seq';

export function rep<P extends Parser<any, any>>(
	parser: P,
): Parser<TokenKindOf<P>, ResultOf<P>[]> {
	return new ParserImpl(_token => {
		let token = _token;
		const results: ResultOf<P>[] = [];

		while (true) {
			const result = parser.parse(token);

			if (result.success) {
				token = result.token;
				results.push(result.value);
			} else {
				break;
			}
		}

		return {
			success: true,
			token,
			value: results,
		};
	});
}

export function list<K, R>(
	parser1: Parser<K, R>,
	parser2: Parser<K, any>,
): Parser<K, R[]> {
	return seq(parser1, rep(kright(parser2, parser1))).map(([r1, r2]) => [
		r1,
		...r2,
	]);
}
