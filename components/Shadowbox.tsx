import * as React from 'react';
import c from 'classnames';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppStateContext } from './AppStateProvider';
import { Untabbable, useTabIndex } from '../lib/tabindex';
import { GeneratedItemCard, StoreItemCard } from './item-cards';
import { matchKeyCombos } from '../src/keys';
import { useKeyDown } from '../src/useKeyDown';

export function Shadowbox(props: React.PropsWithChildren<{
	className?: string;
	active: boolean;
	item?: React.ReactNode;
}>) {
	const context = React.useContext(AppStateContext);
	const tabIndex = useTabIndex(0);
	const navigate = useNavigate();
	const location = useLocation();

	useKeyDown(e => {
		if (!props.active)
			return;
		if (matchKeyCombos(e, context.appNavBackKey))
			handleClose();
	});

	const renderedItem = renderItem();

	return (
		<div className={c('shadowbox__root', props.className, { 'shadowbox__root--active': props.active })}>
			<div className="shadowbox__topbar">
				<div className="shadowbox__topbarlayoutleft" />
				<button className="shadowbox__closebutton" onClick={handleClose} tabIndex={tabIndex} children="×" />
			</div>
			<div className="shadowbox__layoutbottom">
				<div className="shadowbox__itemcontainer">
					{renderedItem ? (
						<Untabbable>{renderedItem}</Untabbable>
					) : (
						<div className="shadowbox__noitem">
							There's nothing here.
						</div>
					)}
				</div>
			</div>
		</div>
	);

	function handleClose() {
		const queryParams = new URLSearchParams(location.search);
		queryParams.delete('sb');
		navigate(`?${queryParams.toString()}`);
	}

	function renderItem() {
		if (props.item) {
			return props.item;
		}
		const queryParams = new URLSearchParams(location.search);

		let data: IItemData | undefined;
		try {
			data = JSON.parse(queryParams.get('sb') || '{}');
			if (data?.name) {
				return <StoreItemCard data={data} compact={false} />;
			} else if (data?.value) {
				return <GeneratedItemCard value={String(data.value)} />;
			}
		} catch (err) {
			console.error(err);
		}

		return null;
	}
}
