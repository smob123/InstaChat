/**
 * @author Sultan
 * 
 * friends list mutations
 */

const {
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean
} = require('graphql');

const authRepo = require('../repositories/authRepo');
const searchRepo = require('../repositories/searchRepo');
const friendsRepo = require('../repositories/friendsRepo');

const friendsMutations = {
    sendFriendRequest: {
        type: GraphQLBoolean,
        args: {
            userId: {
                type: GraphQLNonNull(GraphQLString)
            },
            firebaseToken: {
                type: GraphQLNonNull(GraphQLString)
            },
            otherUserId: {
                type: GraphQLNonNull(GraphQLString)
            }
        },
        resolve: async (parent, args) => {
            const {
                userId,
                firebaseToken,
                otherUserId
            } = args;
            const data = [userId, firebaseToken, otherUserId];

            for (const item of data) {
                if (!item || item.toString().trim() == '') {
                    throw new Error('Please fill in the empty fields');
                }
            }

            // make sure that the IDs are different
            if (userId === otherUserId) {
                throw new Error('userId and otherUserId cannot be the same');
            }

            // verify firebase token
            await authRepo.verifyUserFirebaseTokenByUserId(userId, firebaseToken);

            // verify that the other user's id is valid
            await searchRepo.getUserById(otherUserId);

            // update the other user's recieved friend rerquests list
            await friendsRepo.addRecievedFriendRequest(otherUserId, userId);

            // update the user's sent friend requests list
            await friendsRepo.addSentFriendRequest(userId, otherUserId);

            return true;
        }
    },
    cancelFriendRequest: {
        type: GraphQLBoolean,
        args: {
            userId: {
                type: GraphQLNonNull(GraphQLString)
            },
            firebaseToken: {
                type: GraphQLNonNull(GraphQLString)
            },
            otherUserId: {
                type: GraphQLNonNull(GraphQLString)
            }
        },
        resolve: async (parent, args) => {
            const {
                userId,
                firebaseToken,
                otherUserId
            } = args;
            const data = [userId, firebaseToken];

            for (const item of data) {
                if (!item || item.toString().trim() == '') {
                    throw new Error('Please fill in the empty fields');
                }
            }

            // make sure that the IDs are different
            if (userId === otherUserId) {
                throw new Error('userId and otherUserId cannot be the same');
            }

            // verify firebase token
            authRepo.verifyUserFirebaseTokenByUserId(userId, firebaseToken);

            /** 
             * update the user's database record
             */

            // remove the sent friend request  from the user's database record
            friendsRepo.removeSentFriendRequest(userId, otherUserId);

            /**
             * update the other account's database record
             */

            // remove the received friend request from the other account's record
            await friendsRepo.removeReceivedFriendRequest(otherUserId, userId);

            return true;
        }
    },
    acceptFriendRequest: {
        type: GraphQLBoolean,
        args: {
            userId: {
                type: GraphQLNonNull(GraphQLString)
            },
            firebaseToken: {
                type: GraphQLNonNull(GraphQLString)
            },
            otherUserId: {
                type: GraphQLNonNull(GraphQLString)
            }
        },
        resolve: async (parent, args) => {
            const {
                userId,
                firebaseToken,
                otherUserId
            } = args;
            const data = [userId, firebaseToken];

            for (const item of data) {
                if (!item || item.toString().trim() == '') {
                    throw new Error('Please fill in the empty fields');
                }
            }

            // make sure that the IDs are different
            if (userId === otherUserId) {
                throw new Error('userId and otherUserId cannot be the same');
            }

            // verify firebase token
            await authRepo.verifyUserFirebaseTokenByUserId(userId, firebaseToken);

            /** 
             * update the user's database record
             */

            // remove the received friend request  from the user's database record
            await friendsRepo.removeReceivedFriendRequest(userId, otherUserId);

            // add the other account's id to this user's friends list
            await friendsRepo.addFriend(userId, otherUserId);

            /**
             * update the other account's database record
             */

            // remove the sent friend request from the other account's record
            await friendsRepo.removeSentFriendRequest(otherUserId, userId);

            // add the current user's id to the other account's friends list
            await friendsRepo.addFriend(otherUserId, userId);

            return true;
        }
    },
    rejectFriendRequest: {
        type: GraphQLBoolean,
        args: {
            userId: {
                type: GraphQLNonNull(GraphQLString)
            },
            firebaseToken: {
                type: GraphQLNonNull(GraphQLString)
            },
            otherUserId: {
                type: GraphQLNonNull(GraphQLString)
            }
        },
        resolve: async (parent, args) => {
            const {
                userId,
                firebaseToken,
                otherUserId
            } = args;
            const data = [userId, firebaseToken];

            for (const item of data) {
                if (!item || item.toString().trim() == '') {
                    throw new Error('Please fill in the empty fields');
                }
            }

            // make sure that the IDs are different
            if (userId === otherUserId) {
                throw new Error('userId and otherUserId cannot be the same');
            }

            // verify firebase token
            await authRepo.verifyUserFirebaseTokenByUserId(userId, firebaseToken);

            /** 
             * update the user's database record
             */

            // remove the received friend request  from the user's database record
            await friendsRepo.removeReceivedFriendRequest(userId, otherUserId);

            /**
             * update the other account's database record
             */

            // remove the sent friend request from the other account's record
            await friendsRepo.removeSentFriendRequest(otherUserId, userId);

            return true;
        }
    }
}

module.exports = {
    friendsMutations
};