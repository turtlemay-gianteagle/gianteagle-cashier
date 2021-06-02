import * as React from 'react'

export const ConditionalRenderer: React.FunctionComponent<{
	condition: boolean
}> = props => {
	if (props.condition) {
		return <>{props.children}</>
	} else {
		return null
	}
}
