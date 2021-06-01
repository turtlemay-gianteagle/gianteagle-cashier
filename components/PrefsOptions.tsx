import * as React from 'react'
import c from 'classnames'
import { ConditionalRenderer } from './ConditionalRenderer'

export const PrefsOption: React.StatelessComponent<{
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
			<ConditionalRenderer condition={Boolean(props.children.description)}>
				<div className="prefsView__optionDescription">
					{props.children.description}
				</div>
			</ConditionalRenderer>
		</div>
		<div className="prefsView__optionsLayoutRight">
			{props.children.controlNode}
			{props.children.stateInfo ? (
				<div className="prefsView__optionStateInfo">
					{props.children.stateInfo}
				</div>
			) : null}
		</div>
	</div>
)
