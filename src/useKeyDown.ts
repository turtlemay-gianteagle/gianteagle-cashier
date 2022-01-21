import * as React from 'react';

export function useKeyDown(onKeyDown: (e: KeyboardEvent) => void) {
	React.useEffect(() => {
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	});
}
