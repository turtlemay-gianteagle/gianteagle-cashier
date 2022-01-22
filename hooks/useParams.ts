import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

	function setParam(k: string, v: string) {
		params.set(k, v);
		navigate('?' + params);
	}

	function deleteParam(k: string) {
		params.delete(k);
		navigate('?' + params);
	}

	return [params, getParam, setParam, deleteParam] as const;
}
