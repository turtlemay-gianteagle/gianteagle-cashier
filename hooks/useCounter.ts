import * as React from 'react';
import lodash from 'lodash';
import { useIsFirstRender } from '../lib/react';
import { useKeyDown } from './useKeyDown';
import { matchKeyCombos } from '../src/keys';
import { AppStateContext } from '../components/AppStateProvider';
import { useLocalStorage } from './useLocalStorage';

export function useCounter() {
	const context = React.useContext(AppStateContext);
	const isFirstRender = useIsFirstRender();
	const [value, setValue] = useLocalStorage('counter', 0);

	React.useEffect(update, [value]);

	useKeyDown(e => {
		if (matchKeyCombos(e, context.appToggleCounterKey)) {
			e.preventDefault();
			context.provider.setState({ showCounter: !context.showCounter });
			return;
		}
		if (matchKeyCombos(e, context.appCounterUpKey)) {
			e.preventDefault();
			countUp();
			return;
		}
		if (matchKeyCombos(e, context.appCounterDownKey)) {
			e.preventDefault();
			countDown();
			return;
		}
	});

	function update() {
		if (!isFirstRender) {
			navigator.vibrate(100);
		}
	}

	function countUp() {
		setValue(value + 1);
	}

	function countDown() {
		let n = value - 1;
		n = lodash.clamp(n, 0, Infinity);
		setValue(n);
	}

	return { value, setValue, countUp, countDown } as const;
}
