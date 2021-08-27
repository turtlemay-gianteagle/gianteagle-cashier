import * as React from 'react'
import { Barcode } from './Barcode'
import { AppStateContext } from './AppStateProvider'
import c from 'classnames'

export function StoreItemCard(props: {
	query?: string
	data: IItemData
	onPick?: (jsx: JSX.Element) => void
}) {
	const context = React.useContext(AppStateContext)

	let name = props.data.name
	let value = String(props.data.value)

	// Add organic prefix.
	if (context.organicModifier && props.query?.endsWith(context.organicModifier) && value.length === 4 && !name?.includes('organic')) {
		name = `[Organic] ${name}`
		value = '9' + value
	}
	
	const disableBarcode = (
		(context.overrideOrganizationId || context.dbInfo?.organization) === 'GIANT_EAGLE' &&
		context.noCheat &&
		props.data.tags?.includes("produce"))

	const jsx = (
		<div className="itemCards__storeItemCard" data-name={name} data-color={props.data.uiColor}>
			<div className="itemCards__storeItemName">{name}</div>
			<Barcode className={c("itemCards__storeItemBarcode", { "itemCards__storeItemBarcode--disabled": disableBarcode })}
				value={value}
				onClickBarcode={() => props.onPick?.(jsx)} />
			<div className="itemCards__storeItemId">{value}</div>
		</div>
	)
	return jsx
}

export function GeneratedItemCard(props: {
	value: string
	onPick?: (jsx: JSX.Element) => void
}) {
	const jsx = (
		<div className="itemCards__generatedBarcodeCard">
			<Barcode className="itemCards__generatedBarcode"
				value={props.value}
				onClickBarcode={() => props.onPick?.(jsx)} />
			<div className="itemCards__generatedBarcodeText">⇪ User Entered Code ⇪</div>
		</div>
	)
	return jsx
}
