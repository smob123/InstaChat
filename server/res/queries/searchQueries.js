/**
 * @author Sultan
 * 
 * search queries
 */

const {
    GraphQLNonNull,
    GraphQLString,
    GraphQLList
} = require('graphql');

const {
    userType
} = require('../gqlObjectTypes');

const authRepo = require('../repositories/authRepo');
const searchRepo = require('../repositories/searchRepo');

const searchQueries = {
    // returns a list of random users
    getRandomUsers: {
        type: GraphQLNonNull(GraphQLList(userType)),
        args: {
            userId: {
                type: GraphQLNonNull(GraphQLString)
            },
            firebaseToken: {
                type: GraphQLNonNull(GraphQLString)
            }
        },
        resolve: async (parent, args) => {
            const {
                userId,
                firebaseToken
            } = args;

            const data = [userId, firebaseToken];

            for (const item of data) {
                if (!item || item.toString().trim() == '') {
                    throw new Error('Please fill in the empty fields');
                }
            }

            // verify firebase token
            await authRepo.verifyUserFirebaseTokenByUserId(userId, firebaseToken);

            // list of users that should not be included in the recommendations, for example, friends, accounts that were sent friend requests previously, etc...
            let ignoreUsers = [];
            const usersFriends = await searchRepo.getUsersFriends(userId);

            ignoreUsers.push(...usersFriends);

            // add the list of accounts that were sent a friend request
            const sentFriendRequests = await searchRepo.getUsersSentFriendRequests(userId);
            ignoreUsers.push(...sentFriendRequests);

            // add the list of accounts that sent the user friend requests
            const receivedFriendRequests = await searchRepo.getUsersReceivedFriendRequests(userId);
            ignoreUsers.push(...receivedFriendRequests);

            return await searchRepo.getFriendSuggestions(ignoreUsers, userId);
        }
    }
};

module.exports = {
    searchQueries
};