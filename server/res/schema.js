/**
 * @author Sultan
 * 
 * The grpahql schema of queries and mutations
 */

const {
    GraphQLSchema,
    GraphQLObjectType
} = require('graphql');

/* queries */

const {
    searchQueries
} = require('./queries/searchQueries');

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        ...searchQueries
    }
});

/* mutations */

const {
    authMutations
} = require('./mutations/authMutations');

const {
    profileMutations
} = require('./mutations/profileMutations');

const {
    friendsMutations
} = require('./mutations/friendsMutations');

const {
    chatMutations
} = require('./mutations/chatMutations');

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...authMutations,
        ...profileMutations,
        ...friendsMutations,
        ...chatMutations
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});