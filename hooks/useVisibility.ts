import * as React from 'react';

export function useVisibility(onVisible?: VoidFunction, onHidden?: VoidFunction) {
	React.useEffect(update);

	function update() {
		document.addEventListener('visibilitychange', listener);
		return () => document.removeEventListener('visibilitychange', listener);
	}

	function listener() {
		if (document.visibilityState === 'visible') {
			onVisible?.();
		} else {
			onHidden?.();
		}
	}
}
