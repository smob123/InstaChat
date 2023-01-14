/**
 * @author Sultan
 * 
 * user's auth mutations
 */

const {
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean
} = require('graphql');

const {
    loginObjectType
} = require('../gqlObjectTypes');

const authRepo = require('../repositories/authRepo');
const searchRepo = require('../repositories/searchRepo');

const authMutations = {
    Signup: {
        type: GraphQLBoolean,
        args: {
            username: {
                type: GraphQLNonNull(GraphQLString)
            },
            email: {
                type: GraphQLNonNull(GraphQLString)
            },
            firebaseToken: {
                type: GraphQLNonNull(GraphQLString)
            }
        },
        resolve: async (parent, args) => {
            const {
                username,
                email,
                firebaseToken
            } = args;

            // check that none of the fields are empty
            const data = [username, email, firebaseToken];

            for (const item of data) {
                if (!item || item.toString().trim() == '') {
                    throw new Error('Please fill in the empty fields');
                }
            }

            // verify the firebase token
            const userId = await authRepo.verifyUserFirebaseTokenByEmail(email, firebaseToken);

            // add a new record to the database
            await authRepo.storeUserInfoInDataBase(userId, username);

            return true;
        }
    },
    Login: {
        type: loginObjectType,
        args: {
            email: {
                type: GraphQLNonNull(GraphQLString)
            },
            firebaseToken: {
                type: GraphQLNonNull(GraphQLString)
            }
        },
        resolve: async (parent, args) => {
            const {
                email,
                firebaseToken
            } = args;

            // check that none of the fields are empty
            const data = [email, firebaseToken];

            for (const item of data) {
                if (!item || item.toString().trim() == '') {
                    throw new Error('Please fill in the empty fields');
                }
            }

            // verify the firebase token
            const userId = await authRepo.verifyUserFirebaseTokenByEmail(email, firebaseToken);

            // get the user's username
            const username = searchRepo.getUsernameByUserId(userId);

            // get the user's avatar
            const avatar = await searchRepo.getAvatarByUserId(userId);

            // get the user's id
            const status = await searchRepo.getUsersStatus(userId);

            return {
                userId,
                username,
                avatar,
                status
            };
        }
    }
}

module.exports = {
    authMutations
};