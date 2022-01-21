import * as React from 'react';
import * as mathjs from 'mathjs';

export function useMath(query: string) {
	const [result, setResult] = React.useState('');
	const [renderResult, setRenderResult] = React.useState(false);

	React.useEffect(update, [query]);

	function update() {
		const result = tryMath(query);

		if (typeof result === 'string') {
			setResult(result);
			setRenderResult(true);
		} else {
			setRenderResult(false);
		}
	}

	return [result, renderResult] as const;
}

function tryMath(query: string): string | null {
	if (query.match(/^\d+$/))
		return null;

	let result: unknown;

	try { result = mathjs.evaluate(query); } catch { }

	if (typeof result === 'string')
		return result;

	if (typeof result === 'number')
		return String(result);

	return null;
}
