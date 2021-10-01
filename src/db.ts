import * as schemaJson from 'turtlemay-cashier-db-schema/schema.json'
import { Validator } from 'jsonschema'

const LOCAL_STORE_DB_CACHE_KEY = 'item-database-cache'

let cachedRemoteDb: { url: string, db: IItemDb } | undefined

export async function getRemoteDb(url?: string, opts?: { forceFetch: boolean }): Promise<IItemDb | null> {
	if (!url)
		return null

	console.info(`Looking for database at "${url}".`)

	if (!opts?.forceFetch && url === cachedRemoteDb?.url) {
		console.info("Already have remote data in memory, skipping fetch.")
		return cachedRemoteDb.db
	}

	let fetchRes: Response | undefined

	try {
		console.info(`Fetching remote database from "${url}".`)
		fetchRes = await fetch(url)
	} catch (error) {
		console.error(error)
	}

	if (fetchRes && fetchRes.ok) {
		console.info(`Got remote database "${url}".`)
		const db = await fetchRes.json() as unknown

		if (validateDb(db)) {
			const validDb = db as IItemDb
			cachedRemoteDb = { url, db: validDb }
			console.info(`Successfully loaded remote database "${validDb.name}". Cached in memory.`)
			return validDb
		}

		console.error(`Database found at "${url}" is not valid.`)
	}
	else {
		console.info("Could not fetch database.")
	}

	return null
}

export function loadCacheDb(): IItemDb | unknown | null {
	const str = localStorage.getItem(LOCAL_STORE_DB_CACHE_KEY)
	if (str) {
		console.info(`Got database from cache "${LOCAL_STORE_DB_CACHE_KEY}".`)
		return JSON.parse(str)
	}
	return null
}

export function saveCacheDb(db: IItemDb | unknown) {
	const str = JSON.stringify(db)
	localStorage.setItem(LOCAL_STORE_DB_CACHE_KEY, str)
	console.info(`Saved database to cache "${LOCAL_STORE_DB_CACHE_KEY}".`)
}

export function clearCacheDb() {
	localStorage.removeItem(LOCAL_STORE_DB_CACHE_KEY)
	console.info(`Cleared cached data from "${LOCAL_STORE_DB_CACHE_KEY}".`)
}

export function validateDb(db: IItemDb | unknown): boolean {
	const validator = new Validator()
	const result = validator.validate(db, schemaJson)
	if (result.errors.length > 0) {
		const [err] = result.errors
		console.error(
			"Database does not match schema.",
			`${err.property} ${err.message}`,
			"Must provide valid database.",
		)
		return false
	}
	const validDb = db as IItemDb
	console.info(`Database "${validDb.name}" matches current schema.`)
	return true
}
