import * as React from 'react';
import lodash from 'lodash';
import c from 'classnames';
import data from '../data/data.json';
import { focusInputAtEnd } from '../lib/dom';
import { AppStateContext } from './AppStateProvider';
import { DelayedTextInput } from './DelayedTextInput';
import { Shadowbox } from './Shadowbox';
import { useNavigate } from 'react-router-dom';
import { MainViewQueryResults } from './MainViewQueryResults';
import { Untabbable } from '../lib/tabindex';
import { isTabbable } from 'tabbable';
import { useIsFirstRender, usePrevious } from '../lib/react';
import { matchKeyCombos } from '../src/keys';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useMath } from '../hooks/useMath';
import { useRoundUp } from '../hooks/useRoundUp';
import { useVisibility } from '../hooks/useVisibility';
import { useKeyDown } from '../hooks/useKeyDown';
import { useParams } from '../hooks/useParams';

export const MainView = (props: {
	className?: string;
	active: boolean;
}) => {
	const isFirstRender = useIsFirstRender();
	const context = React.useContext(AppStateContext);
	const navigate = useNavigate();
	const [params, getParam, setParam, deleteParam] = useParams();
	const [query, setQuery] = React.useState(context.defaultQuery);
	const prevQuery = usePrevious(query);
	const [splitQueries, setSplitQueries] = React.useState([query]);
	const [activeQueryIndex, setActiveQueryIndex] = React.useState(0);
	const [showThrobber, setThrobber] = React.useState(false);
	const [mathResult, showMathResult] = useMath(query);
	const [roundUpResult, showRoundUpResult] = useRoundUp(query);
	const [showShadowbox, setShowShadowbox] = React.useState(false);
	const [shadowboxData, setShadowboxData] = React.useState<IItemData | null>(null);
	const [useNumInput, setUseNumInput] = React.useState(false);
	const [onResetQueryDelegate] = React.useState(new Set<VoidFunction>());
	const rootElemRef = React.useRef<HTMLDivElement>(null);
	const inputElemRef = React.useRef<HTMLInputElement>(null);
	const [listening, startSpeech, stopSpeech] = useSpeechRecognition(setQuery);
	const [lastInputTime, setLastInputTime] = React.useState(Date.now());

	useVisibility(onVisible, onHidden);

	React.useEffect(updateActiveKeyListener);
	React.useEffect(updateShadowbox, [params]);
	React.useEffect(updateSelectInputTimeout, [context.selectQueryTime, query, lastInputTime]);
	React.useEffect(stopSpeech, [props.active, query, activeQueryIndex, useNumInput, showShadowbox]);
	React.useEffect(onChangedQuery, [query]);
	React.useEffect(selectInputOnActiveView, [props.active]);
	React.useEffect(updateChangedSplitQueries, [splitQueries, query, context.defaultQuery]);
	React.useEffect(updateHighlightedQuery, [context.querySeparator, activeQueryIndex]);
	React.useEffect(updateSpeechThrobber, [listening]);

	let inputCodeText = "Enter UPC or PLU";
	if (context.getOrganization() === 'TARGET')
		inputCodeText = "Enter UPC, SKU, or PLU";

	const showViewLeftButton = activeQueryIndex > 0;
	const showViewRightButton = activeQueryIndex < splitQueries.length - 1;

	return (
		<div className={c('mainView__root mainView__mainLayout', props.className)} ref={rootElemRef}>
			<div className="mainView__mainLayoutTop mainView__mainInputContainer">
				<div className="mainView__queryNumInputToggleButton" role="button">
					<div className="mainView__queryNumInputToggleButtonText" onClick={onClickToggleKbButton}>
						{useNumInput ? '⌨️' : '🔢'}
					</div>
				</div>
				{context.speechEnabled() && (
					<div className={c('mainView__queryVoiceInputButton', { 'active': listening })} role="button" onClick={onClickVoiceInputButton}>
						<span className="mainview__queryVoiceInputButtonText">🎙️</span>
					</div>
				)}
				<DelayedTextInput className={c('mainView__mainInput', { 'mainView__mainInput--numType': useNumInput })}
					type={useNumInput ? 'number' : 'text'}
					elemRef={inputElemRef}
					placeholder={useNumInput ? inputCodeText : "Enter query"}
					committedValue={query}
					onStartInput={onStartInput}
					onStopInput={onStopInput}
					onCommit={v => v.length > 0 && setQuery(v)}
					onResetDelegate={onResetQueryDelegate}
					commitDelay={300}
					disabled={!props.active}
					passProps={{ spellCheck: false }} />
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
								onPickShadowBoxElem={handlePickShadowBoxElem}
								onResetQueryDelegate={onResetQueryDelegate} />
						</Untabbable>
					))}
				</div>

				<div className={c('mainView__roundUpResult', { 'active': showRoundUpResult })}>
					<div className="mainView__roundUpHeaderText">Round up:</div>
					<div className="mainView__roundUpResultContent">
						<span className="mainView__roundUpNumberText">{roundUpResult}</span>
						<span className="mainView__roundUpCentSign">¢</span>
					</div>
				</div>

				<div className={c('mainView__mathResult', { 'active': showMathResult })}>
					<span className="mainView__mathResultEqualSign">=</span>
					<span className="mainView__mathResultText">{mathResult}</span>
				</div>

				<div className={c('mainView__listeningIndicator', { 'active': listening })}>
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
					<Shadowbox className="mainView__shadowbox" active={showShadowbox} data={shadowboxData} onClose={onCloseShadowbox} />
				</Untabbable>

			</div>

		</div>
	);

	function updateSpeechThrobber() {
		setThrobber(listening);
	}

	function updateActiveKeyListener() {
		if (props.active)
			document.addEventListener('keydown', onKeyDown);
		return () =>
			document.removeEventListener('keydown', onKeyDown);
	}

	function onKeyDown(e: KeyboardEvent) {
		// Use Ctrl + Alt + Function keys to select result by index
		if (e.ctrlKey && e.altKey && e.key.match(/^F\d{1,2}$/)?.[0]) {
			e.preventDefault();
			const n = Number(e.key.match(/^F(\d{1,2})$/)?.[1]);
			if (!isNaN(n)) {
				const index = n - 1;
				const elems = rootElemRef.current?.querySelectorAll('.mainView__queryResultListView.active .mainView__queryResultNode');
				const clickEl: HTMLElement | null | undefined = elems?.[index]?.querySelector('[role="button"]');
				clickEl?.click();
			}
			return;
		}

		// Use Ctrl + Number to switch active view
		const matchedNumKey = e.key.match(/^\d$/)?.[0];
		if (e.ctrlKey && matchedNumKey) {
			e.preventDefault();
			setActiveQueryTo(matchedNumKey === '0' ? 9 : Number(matchedNumKey) - 1);
			return;
		}

		if (context.speechEnabled() && matchKeyCombos(e, context.speechStartKey)) {
			e.preventDefault();
			if (!listening) startSpeech();
			return;
		}

		if (matchKeyCombos(e, context.resetQueryKey)) {
			e.preventDefault();
			resetQuery();
			return;
		}

		if (!showShadowbox) {
			if (splitQueries.length > 1) {
				if (matchKeyCombos(e, context.appNavViewLeftKey)) {
					e.preventDefault();
					setThrobber(false);
					setActiveQueryLeft();
					return;
				}
				if (matchKeyCombos(e, context.appNavViewRightKey)) {
					e.preventDefault();
					setThrobber(false);
					setActiveQueryRight();
					return;
				}
			}
		}

		if (e.ctrlKey || e.altKey || e.metaKey)
			return;

		if (e.key === 'Enter') {
			const el = document.activeElement;
			const isInputFocused = el === inputElemRef.current;
			const isTabbableFocused = el && isTabbable(el);
			if (isInputFocused || !isTabbableFocused) {
				e.preventDefault();
				const v = inputElemRef.current?.value;
				const didCommand = v && handleCommand(v);
				if (didCommand) {
					inputElemRef.current?.select();
				} else {
					clearInputField();
					inputElemRef.current?.select();
				}
			}
			return;
		}

		if (inputElemRef && inputElemRef.current !== document.activeElement) {
			if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.match(/^(\S)$/)) {
				focusInputField();
				return;
			}
		}
	}

	function updateSelectInputTimeout() {
		let timeout: number | undefined;

		if (context.selectQueryTime > 0 && query !== prevQuery) {
			const fn = () => inputElemRef.current?.select();
			timeout = window.setTimeout(fn, context.selectQueryTime);
		}

		return function cleanup() {
			window.clearTimeout(timeout);
		};
	}

	function selectInputOnActiveView() {
		if (props.active)
			inputElemRef.current?.select();
	}

	function onChangedQuery() {
		if (query.length === 0)
			return;

		setSplitQueries(splitQuery(query));

		if (!isFirstRender)
			deleteParam('sb');
	}

	function updateChangedSplitQueries() {
		setActiveQueryIndex(0);

		if (query === context.defaultQuery)
			inputElemRef.current?.select();
	}

	function updateHighlightedQuery() {
		const [s, n] = [context.querySeparator, activeQueryIndex];
		const regex = new RegExp(`^((?:[^${s}]+${s}){${n}})([^${s}]+)`, '');
		const match = query.match(regex);
		if (!match) { return; }
		const start = match[1].length;
		const end = start + match[2].length;

		// Hack to scroll to selection.
		inputElemRef.current?.setSelectionRange(start, start);
		inputElemRef.current?.blur();
		inputElemRef.current?.focus();

		// Select text.
		inputElemRef.current?.setSelectionRange(start, end);
	}

	function resetQuery() {
		stopSpeech();
		onResetQueryDelegate.forEach(fn => fn?.());
		setActiveQueryIndex(0);
		setQuery(context.defaultQuery);
		setThrobber(false);
		setUseNumInput(false);
		deleteParam('sb');
		inputElemRef.current?.select();
	}

	function splitQuery(str: string): string[] {
		const s = context.querySeparator;
		const arr = s ? str.split(s) : [str];
		return arr.filter(v => v.length > 0);
	}

	function focusInputField() {
		const elem = inputElemRef.current;
		if (elem && elem !== document.activeElement)
			focusInputAtEnd(elem);
	}

	function clearInputField() {
		const elem = inputElemRef.current;
		if (elem) elem.value = '';
	}

	function onClickToggleKbButton() {
		inputElemRef.current?.select();
		setUseNumInput(!useNumInput);
		setQuery('');
	}

	function onClickResetButton() {
		resetQuery();
	}

	function onClickVoiceInputButton() {
		if (listening) {
			stopSpeech();
		} else {
			startSpeech();
		}
	}

	function updateShadowbox() {
		const str = getParam('sb');
		setShowShadowbox(str !== null);
		try {
			const data = str && JSON.parse(str);
			if (data?.name) setShadowboxData(data);
		} catch (err) {
			console.error(err);
			setShadowboxData(null);
		}
	}

	function onCloseShadowbox() {
		deleteParam('sb');
	}

	function handlePickShadowBoxElem(jsx: JSX.Element) {
		setParam('sb', jsx.props['data-json']);
	}

	function setActiveQueryTo(index: number) {
		const clampedIndex = lodash.clamp(index, 0, splitQueries.length - 1);
		setActiveQueryIndex(clampedIndex);
	}

	function setActiveQueryLeft() {
		setActiveQueryTo(activeQueryIndex - 1);
	}

	function setActiveQueryRight() {
		setActiveQueryTo(activeQueryIndex + 1);
	}

	function handleCommand(str: string): boolean {
		if (str === 'wc') {
			navigate('/wcalc');
			return true;
		}

		const searchMatch = str.match(/^@(\S+) (.+)$/);
		if (searchMatch) {
			const [, k, s] = searchMatch;
			const url = data.search_urls[k]?.replace('%s', s);
			if (url) {
				window.open(url);
				return true;
			}
		}

		return false;
	}

	function onStartInput() {
		setThrobber(true);
		setLastInputTime(Date.now());
	}

	function onStopInput() {
		setThrobber(false);
	}

	function onVisible() {
		inputElemRef.current?.select();
	}

	function onHidden() {
		stopSpeech();
	}
};
