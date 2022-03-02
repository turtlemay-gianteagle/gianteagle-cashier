import * as React from 'react';
import { useNavigate, useLocation, NavigateOptions } from 'react-router-dom';

export function useParams() {
	const navigate = useNavigate();
	const location = useLocation();
	const [params, setParams] = React.useState(new URLSearchParams(location.search));

	React.useEffect(update, [location.search]);

	function update() {
		setParams(new URLSearchParams(location.search));
	}

	function getParam(k: string) {
		return params.get(k);
	}

	function setParam(k: string, v: string, opts?: NavigateOptions) {
		if (v !== params.get(k)) {
			params.set(k, v);
			navigate('?' + params, opts);
		}
	}

	function deleteParam(k: string, opts?: NavigateOptions) {
		if (params.has(k)) {
			params.delete(k);
			navigate('?' + params, opts);
		}
	}

	return [params, getParam, setParam, deleteParam] as const;
}
