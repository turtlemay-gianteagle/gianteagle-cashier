import * as React from 'react'
import lodash from 'lodash'
import * as mathjs from 'mathjs'
import c from 'classnames'
import { focusInputAtEnd } from '../lib/dom'
import { AppStateContext } from './AppStateProvider'
import { DelayedTextInput } from './DelayedTextInput'
import { Shadowbox } from './Shadowbox'
import { useNavigate, useLocation } from 'react-router-dom'
import { MainViewQueryResults } from './MainViewQueryResults'
import { Untabbable } from '../lib/tabindex'
import { isTabbable } from 'tabbable'
import { useIsFirstRender } from '../lib/react'
import { matchKeyCombo } from '../src/keys'

export const MainView = (props: {
	className?: string
	active: boolean
}) => {
	const isFirstRender = useIsFirstRender()
	const context = React.useContext(AppStateContext)
	const navigate = useNavigate()
	const location = useLocation()
	const [query, setQuery] = React.useState(context.defaultQuery)
	const [splitQueries, setSplitQueries] = React.useState([query])
	const [activeQueryIndex, setActiveQueryIndex] = React.useState(0)
	const [highlightQuery, setHighlightQuery] = React.useState<string | null>(null)
	const [showThrobber, setThrobber] = React.useState(false)
	const [mathResult, setMathResult] = React.useState(0)
	const [showMathResult, setShowMathResult] = React.useState(false)
	const [roundUpResult, setRoundUpResult] = React.useState(0)
	const [showRoundUpResult, setShowRoundUpResult] = React.useState(false)
	const [showShadowbox, setShowShadowbox] = React.useState(false)
	const [useNumInput, setUseNumInput] = React.useState(false)
	const [onResetQueryDelegate] = React.useState(new Set<VoidFunction>())
	const rootElemRef = React.useRef<HTMLDivElement>(null)
	const inputElemRef = React.useRef<HTMLInputElement>(null)
	const speechRec = React.useRef<any>(null)
	const [startedSpeechRec, setStartedSpeechRec] = React.useState(false)

	React.useEffect(initSelectInput, [])
	React.useEffect(initSpeechRecognition, [])
	React.useEffect(updateKeyListener)
	React.useEffect(updateQueryParams)
	React.useEffect(updateSpeechRecognition)
	React.useEffect(cancelSpeech, [props.active, query, activeQueryIndex, useNumInput, showShadowbox])
	React.useEffect(onChangedQuery, [query])
	React.useEffect(onChangedActiveView, [props.active])
	React.useEffect(updateChangedSplitQueries, [splitQueries, query, context.defaultQuery])
	React.useEffect(updateHighlightedQuery, [highlightQuery, context.querySeparator, activeQueryIndex])

	function initSelectInput() {
		inputElemRef.current?.select()
	}

	function initSpeechRecognition() {
		if (context.speechEnabled()) {
			const SpeechRecognition = window['SpeechRecognition'] ?? window['webkitSpeechRecognition']
			speechRec.current = new SpeechRecognition()
		}
	}

	function updateSpeechRecognition() {
		if (!context.speechEnabled()) {
			return
		}
		speechRec.current.onstart = () => {
			console.info("Listening for speech…")
			setThrobber(true)
			setStartedSpeechRec(true)
		}
		speechRec.current.onend = () => {
			console.info("Stopped listening.")
			setThrobber(false)
			setStartedSpeechRec(false)
		}
		speechRec.current.onerror = () => {
			setThrobber(false)
			setStartedSpeechRec(false)
		}
		speechRec.current.onspeechend = () => {
			speechRec.current.stop()
		}
		speechRec.current.onresult = (event) => {
			const transcript = event.results[0][0].transcript
			console.info(`"${transcript}"`)
			setQuery(transcript)
			focusInputField()
		}
	}

	function updateKeyListener() {
		addEventListener('keydown', handleKeyDown)

		return function cleanup() {
			removeEventListener('keydown', handleKeyDown)
		}

		function handleKeyDown(e: KeyboardEvent) {
			if (!props.active)
				return

			// Use Ctrl + Alt + Function keys to select result by index
			if (e.ctrlKey && e.altKey && e.key.match(/^F\d{1,2}$/)?.[0]) {
				e.preventDefault()
				const n = Number(e.key.match(/^F(\d{1,2})$/)?.[1])
				if (!isNaN(n)) {
					const index = n - 1
					const elems = rootElemRef.current?.querySelectorAll('.mainView__queryResultListView.active .mainView__queryResultNode')
					const clickEl: HTMLElement | null | undefined = elems?.[index]?.querySelector('[role="button"]')
					clickEl?.click()
				}
				return
			}

			// Use Ctrl + Number to switch active view
			const matchedNumKey = e.key.match(/^\d$/)?.[0]
			if (e.ctrlKey && matchedNumKey) {
				e.preventDefault()
				setActiveQueryTo(matchedNumKey === '0' ? 9 : Number(matchedNumKey) - 1)
				return
			}

			if (context.speechEnabled() && matchKeyCombo(e, context.speechStartKey)) {
				e.preventDefault()
				if (!startedSpeechRec) speechRec.current?.start()
				return
			}

			if (matchKeyCombo(e, context.resetQueryKey)) {
				e.preventDefault()
				resetQuery()
				return
			}

			if (!showShadowbox) {
				if (splitQueries.length > 1) {
					if (matchKeyCombo(e, context.appNavViewLeftKey)) {
						e.preventDefault()
						setThrobber(false)
						setActiveQueryLeft()
						return
					}
					if (matchKeyCombo(e, context.appNavViewRightKey)) {
						e.preventDefault()
						setThrobber(false)
						setActiveQueryRight()
						return
					}
				}
			}

			if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey)
				return

			if (e.key === 'Enter') {
				handleCommand(inputElemRef.current?.value ?? '')
				const el = document.activeElement
				const isInputFocused = el === inputElemRef.current
				const isTabbableFocused = el ? isTabbable(el) : false
				if (isInputFocused || !isTabbableFocused) {
					e.preventDefault()
					focusInputField()
					clearInputField()
					return
				}
			}

			if (e.key === 'Escape') {
				if (context.speechEnabled()) {
					e.preventDefault()
					speechRec.current?.abort()
				}
			}

			if (inputElemRef && inputElemRef.current !== document.activeElement) {
				if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.match(/^(\S)$/)) {
					focusInputField()
					return
				}
			}
		}
	}

	function updateQueryParams() {
		const queryParams = new URLSearchParams(location.search)
		setShowShadowbox(queryParams.has('sb'))
	}

	function onChangedActiveView() {
		if (props.active)
			inputElemRef.current?.select()
	}

	function onChangedQuery() {
		if (query.length === 0)
			return

		setSplitQueries(splitQuery(query))

		if (!isFirstRender) {
			const queryParams = new URLSearchParams(location.search)
			if (queryParams.has('sb')) {
				queryParams.delete('sb')
				navigate(`?${queryParams.toString()}`)
			}
		}

		const gotMathResult = tryMath(query)
		if (gotMathResult) {
			setMathResult(gotMathResult)
			setShowMathResult(true)
		} else {
			setShowMathResult(false)
		}

		const gotRoundUpResult = tryRoundUp(query)
		if (gotRoundUpResult) {
			setRoundUpResult(gotRoundUpResult)
			setShowRoundUpResult(true)
		} else {
			setShowRoundUpResult(false)
		}
	}

	function cancelSpeech() {
		speechRec.current?.abort()
	}

	function updateChangedSplitQueries() {
		setActiveQueryIndex(0)
		setHighlightQuery(null)
		
		if (query === context.defaultQuery)
			inputElemRef.current?.select()
	}

	function updateHighlightedQuery() {
		if (!highlightQuery) { return }
		const [fullStr, subStr] = [query, highlightQuery]
		const [s, n] = [context.querySeparator, activeQueryIndex]
		const ss = lodash.escapeRegExp(subStr)
		const regex = new RegExp(`^((?:[^${s}]+${s}){${n}})${ss}`, '')
		const match = fullStr.match(regex)
		if (!match) { return }
		const start = match[1].length
		const end = start + subStr.length

		// Hack to scroll to selection.
		inputElemRef.current?.setSelectionRange(start, start)
		inputElemRef.current?.blur()
		inputElemRef.current?.focus()

		// Select text.
		inputElemRef.current?.setSelectionRange(start, end)
	}

	function resetQuery() {
		speechRec.current?.abort()
		onResetQueryDelegate.forEach(fn => fn?.())
		setHighlightQuery(null)
		setActiveQueryIndex(0)
		setQuery(context.defaultQuery)
		setThrobber(false)
		setUseNumInput(false)
		const queryParams = new URLSearchParams(location.search)
		if (queryParams.has('sb')) {
			queryParams.delete('sb')
			navigate(`?${queryParams.toString()}`)
		}
		inputElemRef.current?.select()
	}

	function splitQuery(str: string): string[] {
		const s = context.querySeparator
		const arr = s ? str.split(s) : [str]
		return arr.filter(v => v.length > 0)
	}

	function focusInputField() {
		const elem = inputElemRef.current
		if (elem && elem !== document.activeElement)
			focusInputAtEnd(elem)
	}

	function clearInputField() {
		const elem = inputElemRef.current
		if (elem) elem.value = ''
	}

	function onClickToggleKbButton() {
		inputElemRef.current?.select()
		setUseNumInput(!useNumInput)
		setQuery('')
	}

	function onClickResetButton() {
		resetQuery()
	}

	function onClickVoiceInputButton() {
		if (startedSpeechRec) {
			speechRec.current?.abort()
		} else {
			speechRec.current?.start()
		}
	}

	function onPickShadowBoxElem(jsx: JSX.Element) {
		const queryParams = new URLSearchParams(location.search)
		queryParams.set('sb', jsx.props['data-json'])
		navigate(`?${queryParams.toString()}`)
	}

	function setActiveQueryTo(index: number) {
		const clampedIndex = lodash.clamp(index, 0, splitQueries.length - 1)
		setActiveQueryIndex(clampedIndex)
		setHighlightQuery(splitQueries[clampedIndex])
	}

	function setActiveQueryLeft() {
		setActiveQueryTo(activeQueryIndex - 1)
	}

	function setActiveQueryRight() {
		setActiveQueryTo(activeQueryIndex + 1)
	}

	function handleCommand(str: string) {
		if (str === 'wc') {
			navigate('/wcalc')
			resetQuery()
		}
	}

	const showViewLeftButton = activeQueryIndex > 0
	const showViewRightButton = activeQueryIndex < splitQueries.length - 1

	return (
		<div className={c('mainView__root mainView__mainLayout', props.className)} ref={rootElemRef}>
			<div className="mainView__mainLayoutTop mainView__mainInputContainer">
				<div className="mainView__queryNumInputToggleButton" role="button">
					<div className="mainView__queryNumInputToggleButtonText" onClick={onClickToggleKbButton}>
						{useNumInput ? '⌨️' : '🔢'}
					</div>
				</div>
				<DelayedTextInput className={c('mainView__mainInput', { 'mainView__mainInput--numType': useNumInput })}
					type={useNumInput ? 'number' : 'text'}
					elemRef={inputElemRef}
					placeholder={useNumInput ? "Enter UPC or PLU" : "Enter query"}
					committedValue={query}
					onStartInput={() => setThrobber(true)}
					onStopInput={() => setThrobber(false)}
					onCommit={v => { if (v.length > 0) setQuery(v) }}
					onResetDelegate={onResetQueryDelegate}
					commitDelay={300}
					disabled={!props.active}
					passProps={{ spellCheck: false }} />
				{context.speechEnabled() && (
					<div className={c('mainView__queryVoiceInputButton', { 'mainView__queryVoiceInputButton--active': startedSpeechRec })} role="button" onClick={onClickVoiceInputButton}>
						<span className="mainview__queryVoiceInputButtonText">🎙️</span>
					</div>
				)}
				<div className="mainView__queryResetButton" role="button" onClick={onClickResetButton}>
					<span className="mainView__queryResetButtonText">↶</span>
				</div>
			</div>

			<div className={c(
				'mainView__mainLayoutBottom',
				'mainView__throbberPositioner',
				'mainView__mathResultPositioner',
				'mainView__roundUpResultPositioner',
				'mainView__listeningIndicatorPositioner',
				'mainView__viewNavContainerPositionRoot',
				'mainView__shadowboxPositionroot',
			)}>

				<div className="mainView__queryResultListViewContainer">
					{splitQueries.map((q, i) => (
						<Untabbable active={showShadowbox || i !== activeQueryIndex} key={i}>
							<MainViewQueryResults query={q}
								className={c('mainView__queryResultListView', {
									'active': i === activeQueryIndex,
									'hideToLeft': i < activeQueryIndex,
									'hideToRight': i > activeQueryIndex,
								})}
								active={i === activeQueryIndex}
								onPickShadowBoxElem={onPickShadowBoxElem}
								onResetQueryDelegate={onResetQueryDelegate} />
						</Untabbable>
					))}
				</div>

				<div className={c('mainView__roundUpResult', { 'active': showRoundUpResult })}>
					<div className="mainView__roundUpText">Round up:</div>
					<span>{roundUpResult}</span>
					<span className="mainView__roundUpCentSign">¢</span>
				</div>

				<div className={c('mainView__mathResult', { 'active': showMathResult })}>
					<span className="mainView__mathResultEqualSign">=</span>{mathResult}
				</div>

				<div className={c('mainView__listeningIndicator', { 'active': startedSpeechRec })}>
					<span className="mainView__listeningIndicatorText">Listening…</span>
				</div>

				<div className={c('mainView__throbberBackdrop', { 'active': showThrobber })}>
					<div className="mainView__throbber" />
				</div>

				<div className="mainView__viewNavContainer">
					<div className="mainView__viewNavButtonLeftContainer">
						<button className={c('mainView__viewNavButtonLeft', { 'active': showViewLeftButton })} onClick={setActiveQueryLeft} tabIndex={-1}>
							<span>‹</span>
						</button>
					</div>
					<div className="mainView__viewNavButtonRightContainer">
						<button className={c('mainView__viewNavButtonRight', { 'active': showViewRightButton })} onClick={setActiveQueryRight} tabIndex={-1}>
							<span>›</span>
						</button>
					</div>
				</div>

				<Untabbable active={!showShadowbox}>
					<Shadowbox className="mainView__shadowbox" active={showShadowbox} />
				</Untabbable>

			</div>

		</div>
	)
}

function tryMath(query: string): number | null {
	let result: unknown
	if (query.match(/^\d+$/))
		return null
	try { result = mathjs.evaluate(query) } catch { }
	if (typeof result === 'number')
		return result
	return null
}

function tryRoundUp(query: string): number | null {
	if (query.match(/^\d{1,2}$/)) {
		const n = Number(query)
		return lodash.inRange(n, 1, 100) ? 100 - n : 0
	}
	return null
}
