import * as React from 'react'
import c from 'classnames'
import { useLocation, useHistory } from 'react-router-dom'
import { AppStateContext } from './AppStateProvider'
import { Untabbable, useTabIndex } from '../lib/tabindex'
import { GeneratedItemCard, StoreItemCard } from './item-cards'

export function Shadowbox(props: React.PropsWithChildren<{
	className?: string
	active: boolean
	item?: React.ReactNode
}>) {
	const context = React.useContext(AppStateContext)
	const tabIndex = useTabIndex(0)
	const history = useHistory()
	const location = useLocation()

	React.useEffect(updateKeyListener)

	function updateKeyListener() {
		addEventListener('keydown', handleKeyDown)
		return function cleanup() {
			removeEventListener('keydown', handleKeyDown)
		}
		function handleKeyDown(e: KeyboardEvent) {
			if (!props.active)
				return
			if (context.appNavBackKey && [e.key, e.code].includes(context.appNavBackKey))
				handleClose()
		}
	}

	function handleClose() {
		const queryParams = new URLSearchParams(location.search)
		queryParams.delete('sb')
		history.push(`?${queryParams.toString()}`)
	}

	function renderItem() {
		if (props.item) {
			return props.item
		}
		const queryParams = new URLSearchParams(location.search)
		const data: IItemData = JSON.parse(queryParams.get('sb') ?? '{}')
		if (data?.name) {
			return <StoreItemCard data={data} />
		} else if (data?.value) {
			return <GeneratedItemCard value={String(data.value)} />
		}
		return null
	}

	const renderedItem = renderItem()

	return (
		<div className={c('shadowbox__root', props.className, { 'shadowbox__root--active': props.active })}>
			<div className="shadowbox__topbar">
				<div className="shadowbox__topbarlayoutleft" />
				<button className="shadowbox__closebutton" onClick={handleClose} tabIndex={tabIndex} children="×" />
			</div>
			<div className="shadowbox__layoutbottom">
				<div className="shadowbox__itemcontainer">
					{renderedItem ? (
						<Untabbable>{renderedItem}</Untabbable>
					) : (
						<div className="shadowbox__noitem">
							There's nothing here.
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
