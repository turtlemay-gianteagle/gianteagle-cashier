import * as React from 'react';
import * as mathjs from 'mathjs';

export function useMath(query: string) {
	const [mathResult, setMathResult] = React.useState('');
	const [showMathResult, setShowMathResult] = React.useState(false);

	React.useEffect(update, [query]);

	function update() {
		const gotMathResult = tryMath(query);
		if (gotMathResult) setMathResult(gotMathResult);
		setShowMathResult(Boolean(gotMathResult));
	}

	return [mathResult, showMathResult] as const;
}

function tryMath(query: string): string | null {
	if (query.match(/^\d+$/))
		return null;
	let result: unknown = null;
	try { result = mathjs.evaluate(query); } catch { }
	if (typeof result === 'function')
		return null;
	return result ? String(result) : null;
}
