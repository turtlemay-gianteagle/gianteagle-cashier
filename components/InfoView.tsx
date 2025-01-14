import * as React from 'react';
import packageJson from '../package.json';
import { Link, useParams } from 'react-router-dom';
import { AppStateContext } from './AppStateProvider';
import data from "../data/data.json";
import { useRandomName } from '../hooks/useRandomName';

export const InfoView = () => {
	return (
		<div className="infoView__root">
			<div className="infoView__mainContainer">
				<section>
					<p>This app assists cashiers in scanning produce, looking up item codes, and performing calculations.</p>
					<h2>✨ Features</h2>
					<ul>
						<li>Enter search text into the query box to display a list of items found in the database.</li>
						<li>Perform web searches with <Link to="/info/web-search">shortcut prefixes</Link>.</li>
						<li><CodeEntryFeatureText /></li>
						<li>Multiple queries can be chained with semicolon (default <Link to="/prefs">user setting</Link>).</li>
						<li>Mathematical expressions entered in the query box will be automatically evaluated.</li>
						<li>Enter a two digit number to calculate round-up amount.</li>
					</ul>
				</section>
				<section>
					<h2>📅 Recent Changes</h2>
					<ul>
						<li>Added experimental voice input for supported browsers.</li>
						<li>Added compact barcode option.</li>
						<li>Now supporting multiple organizations. Set your database in settings.</li>
						<li>Support key combinations in settings.</li>
						<li>Use modifier in settings to generate organic produce results.</li>
					</ul>
				</section>
				<section>
					<h2>🧰 Other Tools</h2>
					<ul>
						<li><Link to="/wcalc">Weight Calculator</Link></li>
						<li><a target="_blank" href="https://github.com/turtlemay-gianteagle/gianteagle-web#readme">Giant Eagle browser extension</a></li>
						<li><a target="_blank" href="https://target.turtlemay.us/">Target tools</a></li>
					</ul>
				</section>
				<section>
					<p><VersionText version={packageJson.version} buildDate={__BUILD_DATE__} /><br />See source code <a target="_blank" href="https://github.com/turtlemay/turtlemay-cashier">here</a>.</p>
					<p>We use the latest browser APIs so ensure your OS, browser and/or WebView is up to date. An Android device with peripheral keyboard is recommended.</p>
					<p>Created and maintained by <a target="_blank" href="http://turtlemay.us">Turtlemay</a>.</p>
				</section>
			</div>
		</div>
	);
};

export const WebSearchInfoView = () => {
	const [getRandomName] = useRandomName();
	return (
		<div className="infoView__root">
			<div className="infoView__mainContainer">
				<h2>🔎 Web Search Shortcuts</h2>
				<p>The following web searches can be performed from the <Link to="/l">main query box</Link> by typing their shortcut prefix followed by your query:</p>
				<ul>
					{Object.entries(data.search_engines).map(([k, v]) => (
						<li key={k}>
							<Link to={`/l?q=${k} ${getRandomName()}`}>
								{v.name} :: <code>{k}</code> &#123;<i>query</i>&#125;
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

function VersionText(props: { version: string, buildDate?: string; }) {
	if (props.buildDate) {
		return <>Software version <strong>{props.version}</strong> built on {props.buildDate}.</>;
	} else {
		return <>Software version <strong>{props.version}</strong>.</>;
	}
}

function CodeEntryFeatureText() {
	const context = React.useContext(AppStateContext);

	if (context.getOrganization() === 'TARGET') {
		return <>Enter a UPC, DPCI, or PLU code to generate a data bar.</>;
	} else {
		return <>Enter a UPC or PLU code to generate a barcode.</>;
	}
}
