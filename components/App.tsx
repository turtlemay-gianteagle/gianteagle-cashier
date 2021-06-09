import * as React from 'react'
import c from 'classnames'
import { HashRouter, NavLink, Route, Switch, RouteComponentProps, matchPath, Redirect } from 'react-router-dom'
import { MainView } from './MainView'
import { PrefsView } from './PrefsView'
import { AppStateProvider } from './AppStateProvider'
import { InfoView } from './InfoView'
import { WeightCalcView } from './WeightCalcView'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

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
