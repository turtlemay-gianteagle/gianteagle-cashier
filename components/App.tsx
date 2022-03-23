import * as React from 'react';
import c from 'classnames';
import { HashRouter, NavLink, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MainView } from './MainView';
import { PrefsView } from './PrefsView';
import { AppStateContext, AppStateProvider } from './AppStateProvider';
import { InfoView, WebSearchInfoView } from './InfoView';
import { WeightCalcView } from './WeightCalcView';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { matchKeyCombos } from '../src/keys';
import { useKeyDown } from '../hooks/useKeyDown';
import { AppFunContext, AppFunContextProvider } from './AppFunContext';

export function App() {
	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<Navigate replace to="/l" />} />
				<Route path="/l" element={<AppMain />} />
				<Route path="/prefs" element={<AppMain el={<PrefsView />} />} />
				<Route path="/info" element={<AppMain el={<InfoView />} />} />
				<Route path="/info/web-search" element={<AppMain el={<WebSearchInfoView />} />} />
				<Route path="/wcalc" element={<AppMain el={<WeightCalcView />} />} />
			</Routes>
		</HashRouter>
	);
}

function AppMain(props: React.PropsWithChildren<{
	el?: React.ReactElement,
}>) {
	const location = useLocation();
	const activateMainView = !props.el;
	return (
		<div className="app__layout">
			<AppStateProvider>
				<AppFunContextProvider>
					<AppKeyHandler />
					<div className="app__layoutMain app__viewContainer">
						<TransitionGroup component={null}>
							<MainView className={c('app__viewTransition', { 'active': activateMainView })} active={activateMainView} />
							<CSSTransition classNames="appViewTransitionAnimation" timeout={250} key={location.pathname}>
								<React.Fragment children={props.el} />
							</CSSTransition>
						</TransitionGroup>
					</div>
					<div className="app__layoutBottom app__navbarContainer">
						<NavBar className="app__navbar" />
					</div>
				</AppFunContextProvider>
			</AppStateProvider>
		</div>
	);
}

function NavBar(props: React.HTMLAttributes<{}>) {
	const context = React.useContext(AppStateContext);
	const fcontext = React.useContext(AppFunContext);
	return (
		<nav className={props.className}>
			<NavLink className={({ isActive }) => c('app__navItem', { 'app__navItem--active': isActive })} to="/l">
				<span className="app__navItemIcon">️🛍️</span>
				<span className="app__navItemLabel">Query</span>
				{context.showCounter && (
					<span className="app__navCounter animatePulse" key={fcontext?.counter.value}>
						«<span className="app__navCounterNumText">{fcontext?.counter.value}</span>»
					</span>
				)}
			</NavLink>
			<NavLink className={({ isActive }) => c('app__navItem', { 'app__navItem--active': isActive })} to="/info">
				<span className="app__navItemIcon">📄</span>
				<span className="app__navItemLabel">Info</span>
			</NavLink>
			<NavLink className={({ isActive }) => c('app__navItem', { 'app__navItem--active': isActive })} to="/prefs">
				<span className="app__navItemIcon">️⚙️</span>
				<span className="app__navItemLabel">Settings</span>
			</NavLink>
		</nav>
	);
}

function AppKeyHandler() {
	const navigate = useNavigate();
	const context = React.useContext(AppStateContext);

	useKeyDown(e => {
		if (matchKeyCombos(e, context.appRestartKey)) {
			e.preventDefault();
			navigate('/');
			return;
		}
		if (matchKeyCombos(e, context.appNavBackKey)) {
			e.preventDefault();
			const lastFn = Array.from(context.provider.exitStack).pop();
			if (lastFn) {
				lastFn();
				context.provider.exitStack.delete(lastFn);
			}
			return;
		}
	});

	return null;
}
