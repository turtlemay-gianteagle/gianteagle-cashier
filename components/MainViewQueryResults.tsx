import * as React from 'react'
import lodash from 'lodash'
import c from 'classnames'
import { AppStateContext } from './AppStateProvider'
import { usePrevious } from '../lib/react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { StoreItemCard, GeneratedItemCard } from './item-cards'
import { useTabIndex } from '../lib/tabindex'

export function MainViewQueryResults(props: {
	className?: string
	query: string
	active: boolean
	onPickShadowBoxElem: (jsx: JSX.Element) => void
	onResetQueryDelegate: Set<VoidFunction>
}) {
	const context = React.useContext(AppStateContext)
	const tabIndex = useTabIndex(0)
	const [searchResults, setSearchResults] = React.useState<IItemData[]>(context.search(props.query))
	const [numRenderResultItems, setNumRenderResultItems] = React.useState(context.itemsPerPage)
	const [typedCode, setTypedCode] = React.useState('')
	const [showTypedCode, setShowTypedCode] = React.useState(false)
	const [enablePaging, setEnablePaging] = React.useState(true)
	const prevQuery = usePrevious(props.query)
	const scrollUpElemRef = React.useRef<HTMLDivElement>()

	React.useEffect(updateResetQueryCallback)
	React.useEffect(updateQuery, [
		props.query,
		context.defaultQuery,
		context.itemTagPrefix,
		context.organicModifier,
		context.itemsPerPage,
		context.dbInfo?.version,
		context.dbUrl,
		context.compiledItemData,
	])

	function updateResetQueryCallback() {
		props.onResetQueryDelegate.add(onResetQuery)
		return function cleanup() {
			props.onResetQueryDelegate.delete(onResetQuery)
		}
		function onResetQuery() {
			resetScroll({ smooth: props.query === context.defaultQuery })
			setNumRenderResultItems(context.itemsPerPage)
		}
	}

	function updateQuery() {
		if (props.query.length === 0)
			return

		if (props.query !== prevQuery)
			resetScroll({ smooth: false })

		setNumRenderResultItems(context.itemsPerPage)

		if (context.itemTagPrefix) {
			const tagMatchRegex = new RegExp(`${context.itemTagPrefix}(\\S*)`)
			const matchedTagName = props.query.match(tagMatchRegex)?.[1]
			if (matchedTagName) {
				setEnablePaging(false)
				setSearchResults(context.compiledItemData.filter(v => v.tags?.includes(matchedTagName)))
			} else {
				setEnablePaging(true)
				setSearchResults(context.search(ignoreModifier(props.query)))

				function ignoreModifier(str: string) {
					if (context.organicModifier)
						return str.replace(new RegExp(context.organicModifier, 'g'), '')
					return str
				}
			}
		}

		const matchedBarcodeValue = props.query.match(/\d{4,24}/)?.[0] || null
		if (matchedBarcodeValue) {
			setTypedCode(matchedBarcodeValue)
			setShowTypedCode(true)
		} else {
			setShowTypedCode(false)
		}
	}

	function showMore() {
		const n = lodash.clamp(numRenderResultItems + context.itemsPerPage, 1, searchResults.length)
		setNumRenderResultItems(n)
	}

	function resetScroll(opts: { smooth: boolean }) {
		const scrollToOptions: ScrollToOptions = { top: 0 }
		if (opts.smooth)
			Object.assign(scrollToOptions, { behavior: 'smooth' })
		scrollUpElemRef.current?.scrollTo(scrollToOptions)
	}

	const renderSearchResults = enablePaging ? searchResults.slice(0, numRenderResultItems) : searchResults
	const renderShowMoreButton = enablePaging && numRenderResultItems < searchResults.length

	return (
		<div className={c('mainView__queryResultList', props.className)}
			ref={scrollUpElemRef as React.RefObject<HTMLDivElement>}>
			<TransitionGroup component={null}>
				{showTypedCode && (
					<CSSTransition classNames="mainView__resultItemTransition" timeout={250}>
						<div className="mainView__queryResultNode">
							<GeneratedItemCard value={typedCode} onPick={props.onPickShadowBoxElem} />
						</div>
					</CSSTransition>
				)}
				{renderSearchResults.length === 0 && (
					<CSSTransition classNames="mainView__resultItemTransition" timeout={250}>
						<div className="mainView__queryResultNone">
							<span>No items found.</span>
						</div>
					</CSSTransition>
				)}
				{renderSearchResults.map((v, i) => (
					<CSSTransition classNames="mainView__resultItemTransition" key={`${v.value}.${v.name}.${i}`} timeout={250}>
						<div className="mainView__queryResultNode">
							<StoreItemCard data={v} onPick={props.onPickShadowBoxElem} query={props.query} />
						</div>
					</CSSTransition>
				))}
			</TransitionGroup>
			{renderShowMoreButton && (
				<button className="mainView__showMoreButton" onClick={showMore} tabIndex={tabIndex} key={numRenderResultItems}>+</button>
			)}
		</div>
	)
}
