import { isMatch, pick } from 'lodash'

function getKeyCombo(str: string): IKeyCombo {
	const match = str.match(/^((?:\^?|!?|\+?|#?)*)(.+)$/)
	const modifiers = match?.[1]
	const key = match?.[2]
	return {
		ctrlKey: modifiers?.includes('^'),
		altKey: modifiers?.includes('!'),
		shiftKey: modifiers?.includes('+'),
		metaKey: modifiers?.includes('#'),
		key: key,
		code: key,
	}
}

export function matchKeyCombo(event: KeyboardEvent, key: string): boolean {
	const kc = getKeyCombo(key)
	const matchedKey = isMatch(event, pick(kc, ['key', 'ctrlKey', 'altKey', 'shiftKey', 'metaKey']))
	const matchedCode = isMatch(event, pick(kc, ['code', 'ctrlKey', 'altKey', 'shiftKey', 'metaKey']))
	return matchedKey || matchedCode
}

export interface IKeyCombo {
	ctrlKey?: boolean
	altKey?: boolean
	shiftKey?: boolean
	metaKey?: boolean
	key?: string
	code?: string
}
