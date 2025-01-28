import type { Parser } from './parser';

export type TokenKindOf<P extends Parser<any, any>> = P extends Parser<
	infer K,
	any
>
	? K
	: never;

export type ResultOf<P extends Parser<any, any>> = P extends Parser<
	any,
	infer R
>
	? R
	: never;
