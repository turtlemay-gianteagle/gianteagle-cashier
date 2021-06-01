import * as React from 'react'
import lodash from 'lodash'
import c from 'classnames'

export function WeightCalcView() {
	const [bundleLbs, setBundleLbs] = React.useState<string | number>('0')
	const [containerOz, setContainerOz] = React.useState<string | number>('0')
	const [containerLbs, setContainerLbs] = React.useState<string | number>('0')

	return (
		<div className="weightCalcView__root">
			<div className="weightCalcView__mainContainer">
				<h1 className="weightCalcView__headingText">Weight Calculator</h1>
				<p>This tool helps you subtract container weights.</p>
				<p>Enter the total bundle weight (including container) according to your scale, then the container's weight in either pounds or ounces to calculate the item weight.</p>
				<div className="weightCalcView__columnContainer">
					<div className={c([
						'weightCalcView__inputLabel',
						'weightCalcView__columnLeft',
					])}>
						<span>Bundle weight (lbs):</span>
					</div>
					<input type="number" min="0" step="0.1"
						className={c([
							'weightCalcView__numInput',
							'weightCalcView__columnRight',
						])}
						value={bundleLbs}
						onChange={handleChangeBundleLbs}
						onFocus={handleFocusInput}
					/>
				</div>
				<div className="weightCalcView__columnContainer">
					<div className={c([
						'weightCalcView__inputLabel',
						'weightCalcView__columnLeft',
					])}>
						<span>Container weight (oz):</span>
					</div>
					<input type="number" min="0" step="0.01"
						className={c([
							'weightCalcView__numInput',
							'weightCalcView__columnRight',
						])}
						value={containerOz}
						onChange={handleChangeContainerOz}
						onFocus={handleFocusInput}
					/>
				</div>
				<div className="weightCalcView__columnContainer">
					<div className={c([
						'weightCalcView__inputLabel',
						'weightCalcView__columnLeft',
					])}>
						<span>Container weight (lbs):</span>
					</div>
					<input type="number" min="0" step="0.01"
						className={c([
							'weightCalcView__numInput',
							'weightCalcView__columnRight',
						])}
						value={containerLbs}
						onChange={handleChangeContainerLbs}
						onFocus={handleFocusInput}
					/>
				</div>
				<div className="weightCalcView__resultContainer">
					<span>Item weight:&nbsp;</span>
					<span className="weightCalcView__resultText">
						{calcItemWeight(Number(bundleLbs), Number(containerLbs))}
					</span>
					<span>&nbsp;lbs</span>
				</div>
			</div>
		</div>
	)

	function handleChangeBundleLbs(event: React.ChangeEvent<HTMLInputElement>) {
		setBundleLbs(event.target.value)
	}

	function handleChangeContainerOz(event: React.ChangeEvent<HTMLInputElement>) {
		const v = event.target.value
		setContainerOz(v)
		if (v) setContainerLbs(ozToLbs(Number(v)))
	}

	function handleChangeContainerLbs(event: React.ChangeEvent<HTMLInputElement>) {
		const v = event.target.value
		setContainerLbs(v)
		if (v) setContainerOz(lbsToOz(Number(v)))
	}

	function handleFocusInput(event: React.FocusEvent<HTMLInputElement>) {
		const elem = event.target as HTMLInputElement
		elem.select()
	}
}

function calcItemWeight(bundleLbs: number, containerLbs: number) {
	const n = lodash.clamp(bundleLbs - containerLbs, 0, Infinity)
	return Math.round(n * 100) / 100
}

function lbsToOz(n: number) {
	return n * 16
}

function ozToLbs(n: number) {
	return n / 16
}
