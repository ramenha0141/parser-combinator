import { type Parser, ParserImpl } from '../parser';
import type { ResultOf, TokenKindOf } from '../utils';

export function seq<P extends Parser<any, any>[]>(
	...parsers: P
): Parser<
	TokenKindOf<P[number]>,
	{
		[I in keyof P]: ResultOf<P[I]>;
	}
> {
	return new ParserImpl(_token => {
		let token = _token;
		const results = [];

		for (const parser of parsers) {
			const result = parser.parse(token);

			if (result.success) {
				token = result.token;
				results.push(result.value);
			} else {
				return result;
			}
		}

		return {
			success: true,
			token,
			value: results as {
				[I in keyof P]: ResultOf<P[I]>;
			},
		};
	});
}

export function kleft<K, R>(
	parser1: Parser<K, R>,
	parser2: Parser<K, any>,
): Parser<K, R> {
	return seq(parser1, parser2).map(([r]) => r);
}

export function kright<K, R>(
	parser1: Parser<K, any>,
	parser2: Parser<K, R>,
): Parser<K, R> {
	return seq(parser1, parser2).map(([_, r]) => r);
}

export function kmid<K, R>(
	parser1: Parser<K, any>,
	parser2: Parser<K, R>,
	parser3: Parser<K, any>,
): Parser<K, R> {
	return seq(parser1, parser2, parser3).map(([_, r]) => r);
}
