import { type Parser, ParserImpl } from '../parser';
import type { ResultOf, TokenKindOf } from '../utils';

export function opt<P extends Parser<any, any>>(
	parser: P,
): Parser<TokenKindOf<P>, ResultOf<P> | null> {
	return new ParserImpl(token => {
		const result = parser.parse(token);

		if (result.success) {
			return result;
		} else {
			return {
				success: true,
				token,
				value: null,
			};
		}
	});
}
