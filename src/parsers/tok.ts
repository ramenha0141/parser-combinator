import { type Parser, ParserImpl } from '../parser';
import type { Token } from '../token';

export function tok<K>(kind: K): Parser<K, Token<K>> {
	return new ParserImpl(token => {
		if (!token) {
			return {
				success: false,
				error: {
					token,
					value: 'NULL',
				},
			};
		}
		if (token.kind === kind) {
			return {
				success: true,
				token: token.next,
				value: token,
			};
		} else {
			return {
				success: false,
				error: {
					token,
					value: 'KIND',
					expected: kind,
				},
			};
		}
	});
}
