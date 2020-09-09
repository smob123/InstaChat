/**
 * @author Sultan
 * 
 * user's profile mutations
 */

const {
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean
} = require('graphql');

const admin = require('firebase-admin');

const authRepo = require('../repositories/authRepo');
const profileRepo = require('../repositories/profileRepo');

const profileMutations = {
    uploadAvatar: {
        type: GraphQLNonNull(GraphQLBoolean),
        args: {
            userId: {
                type: GraphQLNonNull(GraphQLString)
            },
            firebaseToken: {
                type: GraphQLNonNull(GraphQLString)
            },
            newAvatarUrl: {
                type: GraphQLNonNull(GraphQLString)
            }
        },
        resolve: async (parent, args) => {
            const {
                userId,
                firebaseToken,
                newAvatarUrl
            } = args;

            const data = [userId, firebaseToken, newAvatarUrl];

            for (const item of data) {
                if (!item || item.toString().trim() == '') {
                    throw new Error('Please fill in the empty fields');
                }
            }

            console.log('verifying token')
            // verify firebase token
            await authRepo.verifyUserFirebaseTokenByUserId(userId, firebaseToken);

            console.log('sending url')
            // upload the url
            await profileRepo.uploadAvatar(userId, newAvatarUrl);

            return true;
        }
    },
    updateStatus: {
        type: GraphQLNonNull(GraphQLBoolean),
        args: {
            userId: {
                type: GraphQLNonNull(GraphQLString)
            },
            firebaseToken: {
                type: GraphQLNonNull(GraphQLString)
            },
            newStatus: {
                type: GraphQLNonNull(GraphQLString)
            }
        },
        resolve: async (parent, args) => {
            const {
                userId,
                firebaseToken,
                newStatus
            } = args;
            const data = [userId, firebaseToken, newStatus];

            for (const item of data) {
                if (!item || item.toString().trim() == '') {
                    throw new Error('Please fill in the empty fields');
                }
            }

            // verify firebase token
            await authRepo.verifyUserFirebaseTokenByUserId(userId, firebaseToken);

            return await profileRepo.updateStatus(userId, newStatus);
        }
    }
}

module.exports = {
    profileMutations
};