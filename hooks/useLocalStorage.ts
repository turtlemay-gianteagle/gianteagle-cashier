import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = localStorage.getItem(key);
			const v = item ? JSON.parse(item) : initialValue;
			if (!isNaN(v)) {
				return Number(v);
			} else {
				return v;
			}
		} catch (err) {
			console.error(err);
			return initialValue;
		}
	});

	function setValue(value: T | ((val: T) => T)) {
		try {
			const v = value instanceof Function ? value(storedValue) : value;
			setStoredValue(v);
			localStorage.setItem(key, JSON.stringify(v));
		} catch (err) {
			console.error(err);
		}
	}

	return [storedValue, setValue] as const;
}
