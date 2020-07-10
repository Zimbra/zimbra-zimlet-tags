/* https://wiki.zimbra.com/wiki/DevelopersGuide#Zimlet_Development_Guide */
import { createElement } from 'preact';
import MoreMenu from '../more-menu';

export default function createMore(context) {
	return props => (
		<MoreMenu {...props}>{{context}}</MoreMenu>
	);
}
