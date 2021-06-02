import * as React from 'react'
import c from 'classnames'

export function DelayedTextInput(props: {
	className?: string
	activeClassName?: string
	textarea?: boolean
	type?: string
	disabled?: boolean
	placeholder?: string
	elemRef?: React.RefObject<HTMLElement>
	children?: React.ReactNode
	committedValue: string
	commitDelay: number
	onStartInput?: VoidFunction
	onStopInput?: VoidFunction
	onCommit: (v: string) => void
	onResetDelegate?: Set<VoidFunction>
	passProps?: Object
}) {
	const [value, setValue] = React.useState(props.committedValue)
	const [commitTimeout, setCommitTimeout] = React.useState<number | null>(null)
	const [active, setActive] = React.useState(false)

	React.useEffect(updateOnResetDelegate)
	React.useEffect(updateClearTimeout)
	React.useEffect(onChangeCommitedValue, [props.committedValue])

	function updateOnResetDelegate() {
		const onReset = () => setValue(props.committedValue)
		props.onResetDelegate?.add(onReset)
		return () => void props.onResetDelegate?.delete(onReset)
	}

	function updateClearTimeout() {
		return () => {
			if (commitTimeout !== null)
				window.clearTimeout(commitTimeout)
		}
	}

	function onChangeCommitedValue() {
		setValue(props.committedValue)
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		props.onStartInput?.()
		setActive(true)
		const newValue = e.target.value
		setValue(newValue)
		if (commitTimeout !== null)
			window.clearTimeout(commitTimeout)
		setCommitTimeout(window.setTimeout(() => {
			setActive(false)
			props.onCommit(newValue)
			props.onStopInput?.()
		}, props.commitDelay))
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
	})
}
