/*
 * DOM-related helper functions.
 */

export function focusInputAtEnd(elem: HTMLInputElement) {
	elem.focus();
	const supportsSelection = (
		elem?.type === 'text' ||
		elem?.type === 'search' ||
		elem?.type === 'URL' ||
		elem?.type === 'tel' ||
		elem?.type === 'password'
	);
	if (supportsSelection) {
		const position = elem.value.length;
		elem.setSelectionRange(position, position);
	}
}
