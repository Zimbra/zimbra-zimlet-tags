/* https://wiki.zimbra.com/wiki/DevelopersGuide#Zimlet_Development_Guide */
import { createElement, Component } from 'preact';
import { Text, withText } from 'preact-i18n';
import { withIntl } from '../../enhancers';
import { ActionMenuGroup, ActionMenuItem, NestedActionMenuItem } from '@zimbra-client/components';
import { withTagCreate, withActionMutation, withTags, withTagAction } from '@zimbra-client/graphql';
import style from './style';
import gql from 'graphql-tag';
import { useApolloClient } from '@apollo/react-hooks';

// See also: https://files.zimbra.com/docs/soap_api/8.8.8/api-reference/zimbraMail/MsgAction.html

@withIntl()
@withText({
    create: 'tags-zimlet.create',
    title: 'tags-zimlet.title',
    tagEmail: 'tags-zimlet.tagEmail',
    removeEmailTag: 'tags-zimlet.removeEmailTag',
    getAllTags: 'tags-zimlet.getAllTags',
    removeTag: 'tags-zimlet.removeTag',
})
@withTagCreate() //Makes available the `createTag` method, to create tags
@withActionMutation() //Makes available the `action` method, to add a tag to an email
@withTagAction() //Makes available the `tagAction` method, to change existing tags
@withTags({},
    ({ data: { getTag: tags } }) => ({
        tagList: tags
    })
) //Makes available this.props.tagList with a list of current tags when component initializes
export default class MoreMenu extends Component {
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


    tagEmail = e => {
        const { action } = this.props;
        const zimlet = this;
        return action({
            ids: [this.props.emailData.id], //supports multiple items using: ["1000", "1001"]
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
    removeEmailTag = e => {
        const { action } = this.props;
        const zimlet = this;
        return action({
            ids: [this.props.emailData.id],
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

    /* Zimbra has an interactive GraphQL client, append /graphiql to the Zimbra server domain to run queries
    use the part between `` from below query 
    
    The getAllTags method shows you how to run any query whenever you want (aka not from render or when the component initializes)
    */
    getAllTags = e => {
        const getTags = gql`
        query getTag {
            getTag {
                id
                name
                color
                unread
            }
        }`;
        //https://www.apollographql.com/docs/react/api/react-hooks/#useapolloclient
        const client = useApolloClient();

        //https://www.freecodecamp.org/news/react-apollo-client-2020-cheatsheet/#usingtheclientdirectly
        client.query({
            query: getTags
        })
            .then((response) => {
                console.log(response.data)
            })
            .catch((err) => console.error(err));

        /* In case your query has variables use them like so: 
        client.query({
            query: GET_POSTS,
            variables: { limit: 5 },
        })
        */
    }

    deleteTag = e => {
        const { tagAction, tagList } = this.props;
        /* tagList in an array of objects. Each object contains the data of a tag
        We can use `find` which is an es6 feature to select the tag object with the property name='Test'
        then we can directly get the id of the tag, needed for the tagAction method.*/
        console.log(tagList.find(x => x.name === 'Test').id);
        const tagId = tagList.find(x => x.name === 'Test').id;
        tagAction({ id: tagId }, 'delete')

        //You can also rename or change color of a tag using:
        //tagAction({ id:tagId, name: tagName, color: tagColor }, 'rename')
        //tagAction({ id:tagId, name: tagName, color: tagColor }, 'color')
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
                        <ActionMenuItem onClick={() => this.tagEmail()}>
                            <Text id="tags-zimlet.tagEmail" />
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => this.removeEmailTag()}>
                            <Text id="tags-zimlet.removeEmailTag" />
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => this.getAllTags()}>
                            <Text id="tags-zimlet.getAllTags" />
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => this.deleteTag()}>
                            <Text id="tags-zimlet.deleteTag" />
                        </ActionMenuItem>
                    </ActionMenuGroup>
                </NestedActionMenuItem>
            </div>
        );
    }
}
