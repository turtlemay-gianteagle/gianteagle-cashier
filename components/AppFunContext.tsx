import * as React from 'react';
import { useCounter } from '../hooks/useCounter';

export const AppFunContext = React.createContext<IState | null>(null);

export function AppFunContextProvider(props: React.PropsWithChildren<{}>) {
	return React.createElement(AppFunContext.Provider, {
		children: props.children,
		value: {
			counter: useCounter(),
		},
	});
}

interface IState {
	counter: ReturnType<typeof useCounter>;
}
