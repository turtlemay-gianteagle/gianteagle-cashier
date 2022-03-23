import * as React from 'react';
import { AppStateContext } from '../components/AppStateProvider';
import lodash from 'lodash';

export function useRandomName() {
	const context = React.useContext(AppStateContext);

	function getRandomName(defaultValue = 'banana'): string {
		const arr = context.compiledItemData.filter(v =>
			v.tags?.includes('produce') &&
			v.name?.match(/^[\w\s]+$/)
		);
		const v = lodash.sample(arr);
		return (v?.name ?? defaultValue).toLowerCase();
	}

	return [getRandomName] as const;
}
