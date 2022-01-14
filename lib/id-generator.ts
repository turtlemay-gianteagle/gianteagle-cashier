export function* IDGenerator(): Generator<number> {
	for (let i = 0; ;)
		yield i++;
}
