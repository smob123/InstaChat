/**
 * @author Sultan
 * 
 * chat mutations
 */

const {
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean
} = require('graphql');

const {
    chatMessageType
} = require('../gqlObjectTypes');

const authRepo = require('../repositories/authRepo');
const searchRepo = require('../repositories/searchRepo');
const chatRepo = require('../repositories/chatRepo');

const chatMutations = {
    // handles sending chat messages
    sendMessage: {
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
            },
            message: {
                type: GraphQLNonNull(chatMessageType)
            }
        },
        resolve: async (parent, args) => {
            const {
                userId,
                firebaseToken,
                otherUserId,
                message
            } = args;
            const data = [userId, firebaseToken, otherUserId, message.body, message.type];

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

            // verify the format of the message
            switch (message.type) {
                case 'url':
                    const urlRegex = RegExp(/(http[s]?:\/\/){1}([a-z|A-Z]{1,200})\.[a-z]{2,5}/);
                    if (!urlRegex.test(message.body)) {
                        throw new Error('Invalid URL');
                    }
                    break;
                case 'image':
                    const imageExtensions = RegExp(/(png|jpg|jpeg|gif|bmp)/i);
                    if (!imageExtensions.test(message.body)) {
                        throw new Error('Invalid image type');
                    }
                    break;
                case 'text':
                    break;
                default:
                    throw new Error('Invalid message type');
            }

            // initialize the message object that will be stored in the database
            const now = Date.now();
            const messageObj = {
                userId,
                body: message.body,
                type: message.type,
                datetime: now
            };

            // decide the chat's id by selceting tha smaller first character of the users' IDs
            let chatId = '';

            if (userId.charAt(0) < otherUserId.charAt(0)) {
                chatId = `${userId}_${otherUserId}`;
            } else {
                chatId = `${otherUserId}_${userId}`;
            }

            // add the new message to the chat's database object
            await chatRepo.addMessage(chatId, messageObj);

            // update the list of the sender's chats
            await chatRepo.updateUsersChats(userId, otherUserId, messageObj);

            // update the list of the reciever's chats
            await chatRepo.updateUsersChats(otherUserId, userId, messageObj);

            return true;
        }
    },
    // sets a conversation's messages as read
    setChatMessagesAsRead: {
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

            // set the chat's messages as read
            await chatRepo.setChatMessagesAsRead(userId, otherUserId);

            return true;
        }
    }
}

module.exports = {
    chatMutations
};