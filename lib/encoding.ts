export function encode(str: string) {
	return window.btoa(unescape(encodeURIComponent(str)));
}

export function decode(str: string) {
	return decodeURIComponent(escape(window.atob(str)));
}
