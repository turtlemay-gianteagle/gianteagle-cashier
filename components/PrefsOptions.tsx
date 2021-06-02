import * as React from 'react'
import c from 'classnames'

export const PrefsOption: React.FunctionComponent<{
	className?: string
	children: {
		label: string
		description?: React.ReactNode
		controlNode: React.ReactNode
		stateInfo?: React.ReactNode
	}
}> = props => (
	<div className={c('prefsView__optionsListItem prefsView__optionsLayout', props.className)}>
		<div className="prefsView__optionsLayoutLeft">
			<div className="prefsView__optionLabel">
				{props.children.label}
			</div>
			{props.children.description && (
				<div className="prefsView__optionDescription">
					{props.children.description}
				</div>
			)}
		</div>
		<div className="prefsView__optionsLayoutRight">
			{props.children.controlNode}
			{props.children.stateInfo && (
				<div className="prefsView__optionStateInfo">
					{props.children.stateInfo}
				</div>
			)}
		</div>
	</div>
)
