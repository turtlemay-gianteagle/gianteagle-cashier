import * as React from 'react';
import * as QRCode from 'qrcode';
import jsbarcode from 'jsbarcode';
import { useTabIndex } from '../lib/tabindex';
import { AppStateContext } from './AppStateProvider';
import { UPC_REGEX, PLU_REGEX, SKU_REGEX, pluToUpc, skuToUpc } from '../lib/barcode';

export function Barcode(props: {
	className?: string;
	value: string;
	onClickBarcode?: VoidFunction;
	compact?: boolean;
}) {
	const context = React.useContext(AppStateContext);
	const tabIndex = useTabIndex(0);
	const canvasElemRef = React.createRef<HTMLCanvasElement>();
	const [renderSuccess, setRenderSuccess] = React.useState(false);

	const jsBarcodeOpts = {
		lineColor: 'black',
		background: 'transparent',
		width: 2,
		height: props.compact ? 20 : 80,
		displayValue: false,
		margin: 0,
		flat: true,
	};

	React.useEffect(updateValue, [
		props.value,
		props.compact,
		context.dbInfo,
		context.getOrganization(),
	]);

	return (
		<div role="button" className={props.className}
			key={`${props.value};${context.getOrganization()}`}
			tabIndex={tabIndex}
			onClick={props.onClickBarcode}
			onKeyDown={handleKeyDown}
			data-error={!renderSuccess}>
			<canvas ref={canvasElemRef} />
		</div>
	);

	function updateValue() {
		if (canvasElemRef.current) {
			const v = renderBarcode(context.getOrganization(), canvasElemRef.current, props.value, jsBarcodeOpts);
			setRenderSuccess(v);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const el = e.target as HTMLElement;
			el?.click();
		}
	}
}

function renderBarcode(org: string, elem: HTMLElement, value: string, jsBarcodeOpts = {}): boolean {
	if (value.match(PLU_REGEX)) {
		// Target supports QR codes.
		if (org === 'TARGET') {
			try {
				QRCode.toCanvas(elem, value, err => { if (err) throw err; });
				return true;
			} catch (err) {
				elem.style.width = 'unset';
				elem.style.height = 'unset';
				console.error(err);
			}
		}

		// Use UPC format for PLU codes.
		try {
			const barcodeOpts = Object.assign({}, jsBarcodeOpts, { format: 'upc' });
			jsbarcode(elem, pluToUpc(value, false), barcodeOpts);
			return true;
		} catch (err) {
			console.error(err);
		}
	}

	if (value.match(UPC_REGEX)) {
		try {
			const barcodeOpts = Object.assign({}, jsBarcodeOpts, { format: 'upc' });
			jsbarcode(elem, value.padStart(11, '0'), barcodeOpts);
			return true;
		} catch (err) {
			console.error(err);
		}
	}

	// Take UPC from SKU format.
	if (value.match(SKU_REGEX)) {
		try {
			const barcodeOpts = Object.assign({}, jsBarcodeOpts, { format: 'upc' });
			jsbarcode(elem, skuToUpc(value, false), barcodeOpts);
			return true;
		} catch (err) {
			console.error(err);
		}
	}

	// Fallback to CODE 128.
	try {
		const barcodeOpts = Object.assign({}, jsBarcodeOpts, { format: 'CODE128' });
		jsbarcode(elem, value, barcodeOpts);
		return true;
	} catch (err) {
		console.error(err);
	}

	// Try QR code before failing.
	try {
		QRCode.toCanvas(elem, value, err => { if (err) throw err; });
		return true;
	} catch (err) {
		elem.style.width = 'unset';
		elem.style.height = 'unset';
		console.error(err);
	}

	return false;
}
