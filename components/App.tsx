import * as React from 'react'
import c from 'classnames'
import { HashRouter, NavLink, Route, Switch, RouteComponentProps, matchPath, Redirect, useHistory } from 'react-router-dom'
import { MainView } from './MainView'
import { PrefsView } from './PrefsView'
import { AppStateContext, AppStateProvider } from './AppStateProvider'
import { InfoView } from './InfoView'
import { WeightCalcView } from './WeightCalcView'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { matchKeyCombo } from '../src/keys'

export const App = () => (
	<HashRouter>
		<Switch>
			<Redirect exact from="/" to="/l" />
			<Route component={AppMainRouteComponent} />
		</Switch>
	</HashRouter>
)

const AppMainRouteComponent = (props: RouteComponentProps) => {
	const matchedMainView = Boolean(matchPath(props.location.pathname, { path: '/l' }))
	return (
		<div className="app__layout">
			<AppStateProvider>
				<AppStateConsumer>
					<div className="app__layoutMain app__viewContainer">
						<TransitionGroup component={null}>
							<MainView className={c('app__viewTransition', { 'active': matchedMainView })} active={matchedMainView} />
							<CSSTransition classNames="appViewTransitionAnimation" timeout={250} key={props.location.pathname}>
								<Switch location={props.location}>
									<Route exact path="/prefs" component={PrefsView} />
									<Route exact path="/info" component={InfoView} />
									<Route exact path="/wcalc" component={WeightCalcView} />
								</Switch>
							</CSSTransition>
						</TransitionGroup>
					</div>
				</AppStateConsumer>
			</AppStateProvider>
			<div className="app__layoutBottom app__navbarContainer">
				<nav className="app__navbar">
					<NavLink className="app__navItem" activeClassName="app__navItem--active" to="/l">
						<span className="app__navItemIcon">️🛍️</span>
						<span className="app__navItemLabel">Query</span>
					</NavLink>
					<NavLink className="app__navItem" activeClassName="app__navItem--active" to="/info">
						<span className="app__navItemIcon">📄</span>
						<span className="app__navItemLabel">Info</span>
					</NavLink>
					<NavLink className="app__navItem" activeClassName="app__navItem--active" to="/prefs">
						<span className="app__navItemIcon">️⚙️</span>
						<span className="app__navItemLabel">Settings</span>
					</NavLink>
				</nav>
			</div>
		</div>
	)
}

function AppStateConsumer(props: React.PropsWithChildren<{}>) {
	const history = useHistory()
	const context = React.useContext(AppStateContext)

	React.useEffect(updateKeyListener)

	function updateKeyListener() {
		addEventListener('keydown', fn)
		return () => removeEventListener('keydown', fn)
		function fn(e: KeyboardEvent) {
			if (matchKeyCombo(e, context.appRestartKey)) {
				e.preventDefault()
				history.push('/')
			}
		}
	}

	return <React.Fragment children={props.children} />
}
