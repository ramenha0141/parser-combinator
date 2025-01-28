import type { Token } from './token';

export interface Parser<K, R> {
	parse: (token: Token<K> | null) => ParseResult<K, R>;
	map: <T>(fn: (value: R) => T) => Parser<K, T>;
}

export class ParserImpl<K, R> implements Parser<K, R> {
	constructor(public parse: (token: Token<K> | null) => ParseResult<K, R>) {}

	public map<T>(fn: (value: R) => T): ParserImpl<K, T> {
		return new ParserImpl(token => {
			const result = this.parse(token);

			if (result.success) {
				return {
					...result,
					value: fn(result.value),
				};
			} else {
				return result;
			}
		});
	}
}

export type ParseResult<K, R> =
	| {
			success: true;
			token: Token<K> | null;
			value: R;
	  }
	| {
			success: false;
			error: ParseError<K>;
	  };

export interface ParseError<K> {
	token: Token<K> | null;
	value: string;
}

class ParserPlaceholder<K, R> extends ParserImpl<K, R> {
	private parser: Parser<K, R> | null = null;

	constructor(name: string) {
		super(token => {
			if (!this.parser)
				throw new Error(`Parser "${name}" not implemented`);

			return this.parser.parse(token);
		});
	}

	public setParser(parser: Parser<K, R>) {
		this.parser = parser;
	}
}

export function buildParser<K, R, E extends keyof R>(
	parsersFn: (parsers: { [I in keyof R]: Parser<K, R[I]> }) => {
		[I in keyof R]: Parser<K, R[I]>;
	},
	entry: E,
): (token: Token<K> | null) => R[E] {
	const parserMap: { [key: string]: ParserPlaceholder<K, any> } = {};

	const proxy = new Proxy(parserMap, {
		get: (_, name) => {
			if (typeof name !== 'string') throw new Error();

			return (parserMap[name] ??= new ParserPlaceholder(name));
		},
	});

	const parsers = parsersFn(
		proxy as { [I in keyof R]: ParserPlaceholder<K, R[I]> },
	);

	for (const [name, parser] of Object.entries<Parser<K, any>>(parsers)) {
		proxy[name].setParser(parser);
	}

	return token => {
		const result = (parsers as { [I in keyof R]: Parser<K, R[I]> })[
			entry
		].parse(token);

		if (!result.success) {
			console.log(result.error);
			throw result.error;
		}

		return result.value;
	};
}
