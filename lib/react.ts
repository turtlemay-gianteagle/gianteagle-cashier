import { useRef, useEffect } from 'react'

export function usePrevious<T>(value: T): T | undefined {
	const ref = useRef<T>()
	useEffect(() => { ref.current = value }, [value])
	return ref.current
}

export const useIsFirstRender = () => {
	const ref = useRef(true)
	useEffect(() => { ref.current = false }, [])
	return ref.current
}
