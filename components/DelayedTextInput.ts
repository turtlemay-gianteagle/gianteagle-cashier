import * as React from 'react';
import c from 'classnames';

export function DelayedTextInput(props: {
	className?: string;
	activeClassName?: string;
	textarea?: boolean;
	type?: string;
	disabled?: boolean;
	placeholder?: string;
	elemRef?: React.RefObject<HTMLElement>;
	children?: React.ReactNode;
	committedValue: string;
	commitDelay: number;
	onStartInput?: VoidFunction;
	onStopInput?: VoidFunction;
	onCommit: (v: string) => void;
	onResetDelegate?: Set<VoidFunction>;
	passProps?: Object;
}) {
	const [value, setValue] = React.useState(props.committedValue);
	const [active, setActive] = React.useState(false);
	const timeout = React.useRef<number | undefined>();

	React.useEffect(updateOnResetDelegate, [props.onResetDelegate, props.committedValue]);
	React.useEffect(onChangeValue, [value, props.commitDelay]);
	React.useEffect(onChangeCommitedValue, [props.committedValue]);

	function onChangeValue() {
		timeout.current = window.setTimeout(changedValueCallback, props.commitDelay);
		return () => window.clearTimeout(timeout.current);
	}

	function updateOnResetDelegate() {
		const onReset = () => setValue(props.committedValue);
		props.onResetDelegate?.add(onReset);
		return () => void props.onResetDelegate?.delete(onReset);
	}

	function onChangeCommitedValue() {
		window.clearTimeout(timeout.current);
		props.onStopInput?.();
		setValue(props.committedValue);
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		props.onStartInput?.();
		setActive(true);
		setValue(e.target.value);
	}

	function changedValueCallback() {
		props.onStopInput?.();
		setActive(false);
		props.onCommit(value);
	}

	return React.createElement(props.textarea ? 'textarea' : 'input', {
		className: c(props.className, { [props.activeClassName ?? '']: active }),
		type: props.type ?? 'text',
		disabled: props.disabled,
		value: value,
		placeholder: props.placeholder,
		onChange: handleChange,
		children: props.children,
		ref: props.elemRef,
		...props.passProps ?? {},
	});
}
