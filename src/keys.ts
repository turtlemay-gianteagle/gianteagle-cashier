import { extendWith, isMatch, pick } from 'lodash';

function getKeyCombo(str: string): IKeyCombo {
	const match = str.match(/^((?:\^?|!?|\+?|#?)*)(.+)$/);
	const modifiers = match?.[1];
	const key = match?.[2];
	return {
		ctrlKey: modifiers?.includes('^'),
		altKey: modifiers?.includes('!'),
		shiftKey: modifiers?.includes('+'),
		metaKey: modifiers?.includes('#'),
		key: key,
		code: key,
	};
}

function matchKeyCombo(event: KeyboardEvent, str: string): boolean {
	const kc = getKeyCombo(str);
	const ev = extendWith({}, event, (_v, v, k) => k === 'key' ? v.toLowerCase?.() : v);
	const matchedKey = isMatch(ev, pick(kc, ['key', 'ctrlKey', 'altKey', 'shiftKey', 'metaKey']));
	const matchedCode = isMatch(ev, pick(kc, ['code', 'ctrlKey', 'altKey', 'shiftKey', 'metaKey']));
	return matchedKey || matchedCode;
}

export function matchKeyCombos(event: KeyboardEvent, str: string): boolean {
	const keys: string[] = str.split(/[\s,]+/);
	for (const v of keys) {
		if (matchKeyCombo(event, v))
			return true;
	}
	return false;
}

export interface IKeyCombo {
	ctrlKey?: boolean;
	altKey?: boolean;
	shiftKey?: boolean;
	metaKey?: boolean;
	key?: string;
	code?: string;
}
