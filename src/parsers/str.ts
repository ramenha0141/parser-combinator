import { ParserImpl, type Parser } from '../parser';
import type { Token } from '../token';

export function str<K>(text: string): Parser<K, Token<K>> {
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
		if (token.text === text) {
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
					value: 'STR',
					expected: text,
				},
			};
		}
	});
}
