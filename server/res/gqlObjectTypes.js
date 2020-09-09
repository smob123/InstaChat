/**
 * @author Sultan
 * 
 * object types that can be returned as responses, or received as inputs in queries and mutations
 */

const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLList,
    GraphQLID,
    GraphQLInputObjectType
} = require('graphql');

// response to status queries
const statusType = new GraphQLObjectType({
    name: 'Status',
    fields: () => ({
        name: {
            type: GraphQLNonNull(GraphQLString)
        },
        iconColor: {
            type: GraphQLNonNull(GraphQLString)
        }
    })
});

// response to login mutations
const loginObjectType = new GraphQLObjectType({
    name: 'LoginObject',
    fields: () => ({
        userId: {
            type: GraphQLID
        },
        username: {
            type: GraphQLNonNull(GraphQLString)
        },
        avatar: {
            type: GraphQLString
        },
        status: {
            type: GraphQLNonNull(statusType)
        }
    })
});

// response to user queries and mutations
const userType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {
            type: GraphQLID
        },
        username: {
            type: GraphQLNonNull(GraphQLString)
        },
        avatar: {
            type: GraphQLString
        },
        status: {
            type: GraphQLNonNull(statusType)
        }
    })
});

// send message mutation expected input type
const chatMessageType = new GraphQLInputObjectType({
    name: 'ChatMessage',
    fields: () => ({
        body: {
            type: GraphQLNonNull(GraphQLString)
        },
        type: {
            type: GraphQLNonNull(GraphQLString)
        }
    })
})

// response to chat queries and mutations
const chatType = new GraphQLObjectType({
    name: 'Chat',
    fields: () => ({
        id: {
            type: GraphQLID
        },
        userIds: {
            type: GraphQLNonNull(GraphQLString)
        },
        messages: {
            type: GraphQLNonNull(GraphQLList(chatMessageType))
        }
    })
})

module.exports = {
    loginObjectType,
    userType,
    statusType,
    chatMessageType,
    chatType
};