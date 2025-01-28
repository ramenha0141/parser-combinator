import { type Parser, ParserImpl } from '../parser';
import type { ResultOf, TokenKindOf } from '../utils';

export function alt<P extends Parser<any, any>[]>(
	...parsers: P
): Parser<TokenKindOf<P[number]>, ResultOf<P[number]>> {
	return new ParserImpl(token => {
		for (const parser of parsers) {
			const result = parser.parse(token);

			if (result.success) {
				return result;
			}
		}

		return {
			success: false,
			error: {
				token,
				value: 'NO_MATCH',
			},
		};
	});
}
