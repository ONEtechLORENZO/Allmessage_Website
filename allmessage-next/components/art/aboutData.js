import { GmailIcon, WhatsAppIcon, InstagramIcon, FacebookIcon, MessengerIcon } from '../icons';

// Positions (%), fly-in offsets (--fx/--fy) and glow of the floating channel tiles.
export const TILES = [
  { key: 'gmail', Icon: GmailIcon, style: { '--fx': '16.57cqw', '--fy': '13.76cqw', left: '45.455%', top: '23.592%', '--glow': 'rgba(255, 110, 40, .45)', '--delay': '0s' } },
  { key: 'whatsapp', Icon: WhatsAppIcon, style: { '--fx': '-10.11cqw', '--fy': '11.90cqw', left: '72.129%', top: '26.886%', '--glow': 'rgba(37, 211, 102, .5)', '--delay': '-1.2s' } },
  { key: 'instagram', Icon: InstagramIcon, style: { '--fx': '-29.13cqw', '--fy': '8.91cqw', left: '91.148%', top: '32.200%', '--glow': 'rgba(200, 60, 220, .45)', '--delay': '-2.4s' } },
  { key: 'facebook', Icon: FacebookIcon, style: { '--fx': '12.92cqw', '--fy': '-13.94cqw', left: '49.103%', top: '72.795%', '--glow': 'rgba(24, 119, 242, .5)', '--delay': '-3.1s' } },
  { key: 'messenger', Icon: MessengerIcon, style: { '--fx': '-13.76cqw', '--fy': '-16.03cqw', left: '75.778%', top: '76.514%', '--glow': 'rgba(190, 70, 230, .45)', '--delay': '-4.2s' } },
];

// Small coloured cubes on the deeper parallax layer.
export const CUBES = [
  { '--fx': '6.34cqw', '--fy': '18.48cqw', left: '55.682%', top: '15.197%', width: '2.512%', height: '4.463%', '--c': '#ff6a2b', '--delay': '-.6s' },
  { '--fx': '-3.47cqw', '--fy': '10.35cqw', left: '65.490%', top: '29.649%', width: '2.392%', height: '4.251%', '--c': '#15a39a', '--delay': '-2s' },
  { '--fx': '-22.79cqw', '--fy': '19.20cqw', left: '84.809%', top: '13.921%', width: '3.469%', height: '6.164%', '--c': '#6a3fd4', '--delay': '-1.4s' },
  { '--fx': '-26.14cqw', '--fy': '16.75cqw', left: '88.158%', top: '18.278%', width: '2.273%', height: '4.038%', '--c': '#b88af2', '--delay': '-3.3s' },
  { '--fx': '-33.19cqw', '--fy': '0.42cqw', left: '95.215%', top: '47.290%', width: '2.153%', height: '7.651%', '--c': '#ffc21a', '--delay': '-2.6s' },
  { '--fx': '23.50cqw', '--fy': '-6.64cqw', left: '38.517%', top: '59.830%', width: '2.871%', height: '5.101%', '--c': '#5fe3f3', '--delay': '-4s' },
  { '--fx': '19.62cqw', '--fy': '-16.27cqw', left: '42.404%', top: '76.939%', width: '2.392%', height: '4.251%', '--c': '#1f7ef2', '--delay': '-.9s' },
  { '--fx': '-20.69cqw', '--fy': '-14.00cqw', left: '82.715%', top: '72.901%', width: '2.632%', height: '4.676%', '--c': '#9b40df', '--delay': '-3.8s' },
  { '--fx': '-30.68cqw', '--fy': '-16.81cqw', left: '92.703%', top: '77.896%', width: '2.392%', height: '4.251%', '--c': '#ffc21a', '--delay': '-5s' },
];
