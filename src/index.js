/* https://wiki.zimbra.com/wiki/DevelopersGuide#Zimlet_Development_Guide */
//Load components from Zimbra
import { createElement } from "preact";

//Load the createMore function from our Zimlet component
import createMore from "./components/more";
import createContactsMore from "./components/contacts-more";

//Create function by Zimbra convention
export default function Zimlet(context) {
	//Get the 'plugins' object from context and define it in the current scope
	const { plugins } = context;
	const exports = {};
      
	const moreMenu = createMore(context);
	const moreMenuContacts = createContactsMore(context);
	
	exports.init = function init() {
		//Here we load the moreMenu Zimlet item into the UI slot:
		plugins.register('slot::action-menu-mail-more', moreMenu);
		plugins.register('slot::action-menu-contacts-more', moreMenuContacts);
	};

	return exports;
}
