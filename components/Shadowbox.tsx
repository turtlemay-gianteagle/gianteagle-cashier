import * as React from 'react';
import lodash from 'lodash';
import c from 'classnames';
import { Untabbable, useTabIndex } from '../lib/tabindex';
import { GeneratedItemCard, StoreItemCard } from './item-cards';
import { AppStateContext } from './AppStateProvider';

export function Shadowbox(props: React.PropsWithChildren<{
	className?: string;
	active: boolean;
	item?: React.ReactNode;
	onClose: VoidFunction;
	data: IItemData | null;
}>) {
	const context = React.useContext(AppStateContext);
	const tabIndex = useTabIndex(0);

	const renderedItem = renderItem();

	React.useEffect(updateExitFn, [props.active]);

	return (
		<div className={c('shadowbox__root', props.className, { 'active': props.active })}>
			<div className="shadowbox__topbar">
				<div className="shadowbox__topbarlayoutleft" />
				<button className="shadowbox__closebutton" onClick={props.onClose} tabIndex={tabIndex} children="×" />
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

	function updateExitFn() {
		if (props.active) {
			context.provider.exitStack.add(props.onClose);
		}
		return () => {
			context.provider.exitStack.delete(props.onClose);
		};
	}

	function renderItem() {
		if (props.item)
			return props.item;

		if (props.data?.name)
			return <StoreItemCard data={props.data} compact={false} />;

		if (props.data?.value)
			return <GeneratedItemCard value={String(props.data.value)} />;

		return null;
	}
}
