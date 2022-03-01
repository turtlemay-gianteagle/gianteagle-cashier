export const UPC_REGEX = /^\d{11,12}$/;
export const UPC_FULL_REGEX = /^\d{12}$/;
export const PLU_REGEX = /^\d{4,5}$/;
export const SKU_REGEX = /^\d{14}$/;

export function skuToUpc(str: string, safe = true): string | undefined {
	if (str.match(SKU_REGEX) || !safe)
		return str.substring(2);
}

export function pluToUpc(str: string, safe = true): string | undefined {
	if (str.match(PLU_REGEX) || !safe) {
		let upc = str.padStart(11, '0');
		const cd = calcUpcCheckDigit(upc);
		if (cd) upc += cd;
		return upc;
	}
}

export function prettyUpc(str?: string): string | undefined {
	if (str?.match(UPC_FULL_REGEX)) {
		const f = str.substring.bind(str);
		const arr = [f(0, 1), f(1, 6), f(6, 11), f(11, 12)];
		return arr.join(' ');
	}
}

function calcUpcCheckDigit(value: string): number | undefined {
	if (value.match(UPC_REGEX)) {
		let result = 0;
		while (value.length < 11)
			value = '0' + value;
		for (let i = 0; i < value.length; i += 2)
			result += parseInt(value.charAt(i));
		result *= 3;
		for (let i = 1; i < value.length; i += 2)
			result += parseInt(value.charAt(i));
		result %= 10;
		result = (result == 0) ? result : 10 - result;
		return result;
	}
}
