import * as React from 'react';

export const UntabbableContext = React.createContext(false);

export function Untabbable({
	active = true,
	reset = false,
	children,
}) {
	const isUntabbable = React.useContext(UntabbableContext);
	const value = reset ? active : active || isUntabbable;
	return React.createElement(UntabbableContext.Provider, { value, children });
}

export function useTabIndex(tabIndex?: number) {
	const isUntabbable = React.useContext(UntabbableContext);
	return isUntabbable ? -1 : tabIndex;
}
