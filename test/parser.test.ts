import { it } from 'vitest';

import {
	type TokenPosition,
	alt,
	buildLexer,
	buildParser,
	kmid,
	lrec,
	mergePosition,
	rule,
	rule_ignore,
	seq,
	tok,
} from '../src';

// biome-ignore lint/style/useEnumInitializers:
enum Kind {
	NUMBER,
	PLUS,
	MINUS,
	MULTIPLY,
	DIVIDE,
	L_PAREN,
	R_PAREN,
}

const text = '2 * (1 + 3) - 4 / 2';

type Expression = NumberLiteral | AdditiveExpression | MultiplicativeExpression;

interface ExpressionBase {
	position: TokenPosition;
}

interface NumberLiteral extends ExpressionBase {
	type: 'number';
	value: number;
}
interface AdditiveExpression extends ExpressionBase {
	type: 'additive';
	operator: '+' | '-';
	left: Expression;
	right: Expression;
}
interface MultiplicativeExpression extends ExpressionBase {
	type: 'multiplicative';
	operator: '*' | '/';
	left: Expression;
	right: Expression;
}

it('parser', () => {
	const lexer = buildLexer([
		rule(/^[0-9]+/, Kind.NUMBER),
		rule('+', Kind.PLUS),
		rule('-', Kind.MINUS),
		rule('*', Kind.MULTIPLY),
		rule('/', Kind.DIVIDE),
		rule('(', Kind.L_PAREN),
		rule(')', Kind.R_PAREN),
		rule_ignore(/^\s+/),
	]);
	const parser = buildParser<
		Kind,
		{
			expression: Expression;
			additiveExpression: Expression;
			multiplicativeExpression: Expression;
			primaryExpression: Expression;
			parenthesisExpression: Expression;
			numberLiteral: Expression;
		},
		'expression'
	>(
		rules => ({
			expression: rules.additiveExpression,
			additiveExpression: lrec(
				rules.multiplicativeExpression,
				seq(
					alt(tok(Kind.PLUS), tok(Kind.MINUS)),
					rules.multiplicativeExpression,
				),
				(left, [operator, right]) => ({
					type: 'additive',
					operator: operator.kind === Kind.PLUS ? '+' : '-',
					left,
					right,
					position: mergePosition(left.position, right.position),
				}),
			),
			multiplicativeExpression: lrec(
				rules.primaryExpression,
				seq(
					alt(tok(Kind.MULTIPLY), tok(Kind.DIVIDE)),
					rules.primaryExpression,
				),
				(left, [operator, right]) => ({
					type: 'multiplicative',
					operator: operator.kind === Kind.MULTIPLY ? '*' : '/',
					left,
					right,
					position: mergePosition(left.position, right.position),
				}),
			),
			primaryExpression: alt(
				rules.parenthesisExpression,
				rules.numberLiteral,
			),
			parenthesisExpression: kmid(
				tok<Kind>(Kind.L_PAREN),
				rules.expression,
				tok<Kind>(Kind.R_PAREN),
			),
			numberLiteral: tok(Kind.NUMBER).map(token => ({
				type: 'number',
				value: Number.parseInt(token.text),
				position: token.position,
			})),
		}),
		'expression',
	);

	const token = lexer(text);
	const expression = parser(token);
	console.log(JSON.stringify(expression, null, 4));
});
