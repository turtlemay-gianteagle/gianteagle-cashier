import * as React from 'react';
import { Barcode } from './Barcode';
import { AppStateContext } from './AppStateProvider';
import c from 'classnames';
import { pluToUpc, skuToUpc } from '../lib/barcode';

export function StoreItemCard(props: {
	query?: string;
	data: IItemData;
	onPick?: (jsx: JSX.Element) => void;
	compact?: boolean;
}) {
	const context = React.useContext(AppStateContext);

	let name = props.data.name;
	let value = String(props.data.value);

	// Add organic prefix.
	if (context.organicModifier && props.query?.endsWith(context.organicModifier) && value.length === 4 && !name?.toLowerCase()?.includes('organic')) {
		name = `[Organic] ${name}`;
		value = '9' + value;
	}

	const disableBarcode = (
		context.getOrganization() === 'GIANT_EAGLE' &&
		context.noCheat &&
		props.data.tags?.includes('produce'));

	const jsx = (
		<div className="itemCards__storeItemCard"
			data-name={name}
			data-color={props.data.uiColor}
			data-json={JSON.stringify(props.data)}
			style={{ "--item-ui-color": props.data.uiColor } as React.CSSProperties}>
			<div className="itemCards__storeItemName">{name}</div>
			<Barcode className={c("itemCards__storeItemBarcode", { "disabled": disableBarcode })}
				value={value} compact={props.compact}
				onClickBarcode={() => props.onPick?.(jsx)} />
			<div className="itemCards__storeItemId">{value}</div>
		</div>
	);
	return jsx;
}

export function GeneratedItemCard(props: {
	value: string;
	onPick?: (jsx: JSX.Element) => void;
}) {
	const context = React.useContext(AppStateContext);

	let value = props.value;
	if (context.getOrganization() === 'GIANT_EAGLE') {
		const upc = pluToUpc(props.value) ?? skuToUpc(props.value);
		value = upc ?? props.value;
	}

	const jsx = (
		<div className="itemCards__generatedBarcodeCard"
			data-json={JSON.stringify({ value: value })}>
			<Barcode className="itemCards__generatedBarcode"
				value={value}
				onClickBarcode={() => props.onPick?.(jsx)} />
			<div className="itemCards__generatedBarcodeValue">{value}</div>
			<div className="itemCards__generatedBarcodeText">⇪ User Entered Code ⇪</div>
		</div>
	);
	return jsx;
}
