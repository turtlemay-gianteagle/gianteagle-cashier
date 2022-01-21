import * as React from 'react';
import lodash from 'lodash';

export function useRoundUp(query: string) {
	const [roundUpResult, setRoundUpResult] = React.useState(0);
	const [showRoundUpResult, setShowRoundUpResult] = React.useState(false);

	React.useEffect(update, [query]);

	function update() {
		const gotRoundUpResult = tryRoundUp(query);
		if (gotRoundUpResult) setRoundUpResult(gotRoundUpResult);
		setShowRoundUpResult(Boolean(gotRoundUpResult));
	}

	return [roundUpResult, showRoundUpResult] as const;
}

function tryRoundUp(query: string): number | null {
	if (query.match(/^\d{1,2}$/)) {
		const n = Number(query);
		return lodash.inRange(n, 1, 100) ? 100 - n : 0;
	}
	return null;
}
