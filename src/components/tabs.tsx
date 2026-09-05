import type { TabKey } from '../types';
import { Icon } from './icons';

export interface TabDef {
  key: TabKey;
  label: string;
  Icon: (p: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
}

export const tabs: TabDef[] = [
  { key: 'chat',         label: 'Chat',         Icon: (p) => <Icon.Chat {...p} /> },
  { key: 'overview',     label: 'Overview',     Icon: (p) => <Icon.Compass {...p} /> },
  { key: 'competitors',  label: 'Competitors',  Icon: (p) => <Icon.Users {...p} /> },
  { key: 'products',     label: 'Products',     Icon: (p) => <Icon.Box {...p} /> },
  { key: 'pricing',      label: 'Pricing',      Icon: (p) => <Icon.Dollar {...p} /> },
  { key: 'market-gaps',  label: 'Market Gaps',  Icon: (p) => <Icon.Target {...p} /> },
  { key: 'insights',     label: 'Insights',     Icon: (p) => <Icon.Bulb {...p} /> },
  { key: 'reports',      label: 'Reports',      Icon: (p) => <Icon.Doc {...p} /> },
  { key: 'sources',      label: 'Sources',      Icon: (p) => <Icon.Link {...p} /> },
];