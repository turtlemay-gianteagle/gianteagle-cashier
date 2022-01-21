import * as React from 'react';
import lodash from 'lodash';

export function useRoundUp(query: string) {
	const [result, setResult] = React.useState(0);
	const [renderResult, setRenderResult] = React.useState(false);

	React.useEffect(update, [query]);

	function update() {
		const result = tryRoundUp(query);

		if (typeof result === 'number') {
			setResult(result);
			setRenderResult(true);
		} else {
			setRenderResult(false);
		}
	}

	return [result, renderResult] as const;
}

function tryRoundUp(query: string): number | null {
	if (query.match(/^\d{1,2}$/)) {
		const n = Number(query);
		return lodash.inRange(n, 1, 100) ? 100 - n : 0;
	}
	return null;
}
