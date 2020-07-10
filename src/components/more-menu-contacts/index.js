/* https://wiki.zimbra.com/wiki/DevelopersGuide#Zimlet_Development_Guide */
import { createElement, Component } from 'preact';
import { Text, withText } from 'preact-i18n';
import { withIntl } from '../../enhancers';
import { ActionMenuGroup, ActionMenuItem, NestedActionMenuItem } from '@zimbra-client/components';
import { withTagCreate, withContactAction } from '@zimbra-client/graphql';
import style from './style';

@withIntl()
@withText({
    create: 'tags-zimlet.create',
    title: 'tags-zimlet.title',
    tagEmail: 'tags-zimlet.tagEmail',
    removeEmailTag: 'tags-zimlet.removeEmailTag',
    getAllTags: 'tags-zimlet.getAllTags',
    removeTag: 'tags-zimlet.removeTag',
    tagContact: 'tags-zimlet.tagContact',
    removeContactTag: 'tags-zimlet.removeContactTag',
})
@withTagCreate() //Makes available the `createTag` method, to create tags
@withContactAction() //Makes available the `contactAction` to add tags to contacts
export default class MoreMenuContacts extends Component {
    constructor(props) {
        super(props);
        this.zimletContext = props.children.context;
        console.log(this);

    };

    createTag = e => {
        //this.props.emailData contains a JSON-like object with the clicked email's data, you could use the id to fetch the email from the REST API from the back-end
        const { createTag } = this.props;
        /*
        0: blue, // default color
        1: blue,
        2: cyan,
        3: green,
        4: purple,
        5: red,
        6: yellow,
        7: pink,
        8: gray,
        9: orange
        */

        const zimlet = this;
        createTag({ name: 'Test', color: 1 }).then(function (result) {
            console.log(result);
            zimlet.alert('Tag created with id:' + result.data.createTag.id);
        }).catch(function (error) {
            console.log(error);
            zimlet.alert('Whoops an error see console.log');
        });
    }


    tagContact = e => {
        const { contactAction } = this.props;
        const zimlet = this;
        return contactAction({
            ids: [this.props.selectedContacts[0].id], //supports multiple items using: ["1000", "1001"]
            op: "tag",
            tagNames: "Test",
            tagToAdd: {
                name: "Test"
            },
            tagToRemove: false,
            removeFromList: false,
            idsToRemove: [],
            type: "MsgAction",
            view: "MsgAction"
        }).then(() => {
            //You can do more stuff here
        });
    }

    /*`removeFromList`: Boolean - If user is exploring "Tag 1" list and he/she removes "Tag 1" from list, 
    removeFromList will make sure to remove item from current list by optimistic update.*/
    removeContactTag = e => {
        const { contactAction } = this.props;
        const zimlet = this;
        return contactAction({
            ids: [this.props.selectedContacts[0].id],
            op: "!tag", // Notice `!` before `tag`
            tagNames: "Test",
            tagToAdd: false,
            tagToRemove: {
                name: "Test"
            },
            removeFromList: false, // See description above
            idsToRemove: [],
            type: "MsgAction",
            view: "MsgAction",
        }).then(() => {
            //You can do more stuff here
        });
    }

    /* Method to display a toaster to the user */
    alert = (message) => {
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.notifications.notify({
            message: message
        }));
    }

    render() {

        const childIcon = (
            <span class={style.appIcon}>
            </span>);

        return (
            <div>
                <NestedActionMenuItem
                    anchor="bottom"
                    icon={childIcon}
                    position="right"
                    title={this.props.title}
                >
                    <ActionMenuGroup>
                        <ActionMenuItem onClick={() => this.createTag()}>
                            <Text id="tags-zimlet.create" />
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => this.tagContact()}>
                            <Text id="tags-zimlet.tagContact" />
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => this.removeContactTag()}>
                            <Text id="tags-zimlet.removeContactTag" />
                        </ActionMenuItem>
                    </ActionMenuGroup>
                </NestedActionMenuItem>
            </div>
        );
    }
}
