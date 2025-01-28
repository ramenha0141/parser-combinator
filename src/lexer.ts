import type { Token, TokenPosition } from './token';

type Lexer<K> = (text: string) => Token<K> | null;

type LexerRule<K> =
	| {
			kind: K;
			pattern: RegExp;
			ignore: false;
	  }
	| {
			pattern: RegExp;
			ignore: true;
	  };

export function buildLexer<K>(rules: LexerRule<K>[]): Lexer<K> {
	return _text => {
		let text = _text;
		let row = 0;
		let column = 0;
		let token: Token<K> | null = null;
		let firstToken: Token<K> | null = null;

		while (true) {
			if (text.length === 0) break;

			for (const rule of rules) {
				const result = text.match(rule.pattern)?.[0];

				if (!result) continue;

				text = text.slice(result.length);

				const splitted = result.split('\n');
				const r = splitted.length - 1;
				const c =
					r === 0 ? column + splitted[r].length : splitted[r].length;
				const position: TokenPosition = {
					rowStart: row,
					columnStart: column,
					rowEnd: (row += r),
					columnEnd: (column = c),
				};

				if (!rule.ignore) {
					const t: Token<K> = {
						kind: rule.kind,
						text: result,
						position,
						next: null,
					};

					if (token) {
						token.next = t;
					} else {
						firstToken = t;
					}
					token = t;
				}

				break;
			}
		}

		return firstToken;
	};
}

export function rule<K>(pattern: RegExp | string, kind: K): LexerRule<K> {
	return {
		kind,
		pattern:
			typeof pattern === 'string'
				? new RegExp(
						`^${pattern
							.split('')
							.map(c => `\\${c}`)
							.join('')}`,
					)
				: pattern,
		ignore: false,
	};
}

export function rule_ignore(pattern: RegExp | string): LexerRule<never> {
	return {
		pattern:
			typeof pattern === 'string'
				? new RegExp(
						`^${pattern
							.split('')
							.map(c => `\\${c}`)
							.join('')}`,
					)
				: pattern,
		ignore: true,
	};
}
