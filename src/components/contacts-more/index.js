/* https://wiki.zimbra.com/wiki/DevelopersGuide#Zimlet_Development_Guide */
import { createElement } from 'preact';
import MoreMenuContacts from '../more-menu-contacts';

export default function createContactsMore(context) {
    return props => (        
       <MoreMenuContacts {...props}>{{context}}</MoreMenuContacts>
	);
}
