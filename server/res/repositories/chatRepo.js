// initialize firebase app
const admin = require('firebase-admin');

/**
 * @author Sultan
 * 
 * Responsible for manipulating chat references in the database.
 */
class ChatRepo {
    async addMessage(chatId, message) {
        const chatReference = admin.database().ref().child('chats').child(chatId);
        await chatReference.once('value', async snapshots => {
            const chat = await snapshots.val();

            // check if a chat with the given id doesn't exist
            if (!chat) {
                // add an array with the new message
                await chatReference.set([message]);
                return;
            }

            // otherwise add the new message to the existing array
            chat.push(message);
            await chatReference.set(chat);
        });
    }

    async updateUsersChats(userId, otherUserId, messageObj) {
        const userDbRef = admin.database().ref().child('users').child(userId).child('chats');
        await userDbRef.once('value').then(async snapshot => {
            const userChats = await snapshot.val();

            const chatRef = {
                userId: otherUserId,
                lastMessageReceivedAt: messageObj.datetime,
                isRead: messageObj.userId === userId
            };

            // check if the user has no chats
            if (!userChats) {
                await userDbRef.set([chatRef]);
                return;
                // check if the user has chats but none of them are with the other user
            }

            // check if there is a chat between the two users already
            for (let i = 0; i < userChats.length; i++) {
                if (userChats[i].userId === otherUserId) {
                    // otherwise move the current chat's reference to the top of the user's chats list
                    userChats.splice(i, 1);
                    userChats.unshift(chatRef);
                    await userDbRef.set(userChats);
                    return;
                }
            }

            // add the other user's id to the top of the user's chats
            userChats.unshift(chatRef);
            await userDbRef.set(userChats);
        });
    }

    async setChatMessagesAsRead(userId, otherUserId) {
        const userDbRef = admin.database().ref().child('users').child(userId).child('chats');
        await userDbRef.once('value').then(async snapshot => {
            const userChats = await snapshot.val();

            if (!userChats) {
                return;
            }

            for (const chat of userChats) {
                if (chat.userId === otherUserId) {
                    chat.isRead = true;
                    userDbRef.set(userChats);
                    return;
                }
            }
        })
    }
}

module.exports = new ChatRepo();