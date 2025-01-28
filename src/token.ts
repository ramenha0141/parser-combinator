export interface Token<K> {
	kind: K;
	text: string;
	position: TokenPosition;
	next: Token<K> | null;
}

export interface TokenPosition {
	rowStart: number;
	columnStart: number;
	rowEnd: number;
	columnEnd: number;
}

export function mergePosition(
	from: TokenPosition,
	to: TokenPosition,
): TokenPosition {
	return {
		rowStart: from.rowStart,
		columnStart: from.columnStart,
		rowEnd: to.rowEnd,
		columnEnd: to.columnEnd,
	};
}
