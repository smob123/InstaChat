/**
 * @author Sultan
 * 
 * the chats page's modle
 */

import * as app from 'firebase/app';
import 'firebase/database';
import { BehaviorSubject } from 'rxjs';

class ChatsModel {
    // error message observer
    private errorMessage = new BehaviorSubject<string>('');
    // chats list observer
    private chats = new BehaviorSubject<Array<any>>([]);

    /**
     * fetches the user's chats from the database
     */
    fetchChats() {
        // get the cached user id
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId = user['userId'];

        app.database().ref().child('users').child(userId).child('chats').on('value', async snapshots => {
            const userChats = await snapshots.val();
            const chatsList: any = [];

            // check if the user has any chats
            if (!userChats) {
                return;
            }

            // otherwise parse each chat object
            for (const chatRef of userChats) {
                let chatId = '';

                // get the friend's id from the chats list
                const friendId = chatRef['userId'];

                // get the chat's id, which consists of the participants' IDs, seperated by an underscore
                if (userId.charAt(0) < friendId.charAt(0)) {
                    chatId = `${userId}_${friendId}`;
                } else {
                    chatId = `${friendId}_${userId}`;
                }

                // the last message in the conversation
                let lastMessage: any = {};

                // get the last message in the conversation
                app.database().ref().child('chats').child(chatId).on('value', async snapshots => {
                    const messages = await snapshots.val();

                    if (!messages) {
                        return;
                    }

                    lastMessage = messages[messages.length - 1];
                });

                // get the friend's info
                await app.database().ref().child('users').child(friendId).once('value', async userInfo => {
                    const friend = await userInfo.val();

                    // add a new object to the chats list
                    const chatDetails = {
                        userId: friendId,
                        username: friend.username,
                        avatar: friend.avatar,
                        lastMessage: lastMessage.body,
                        datetime: lastMessage.datetime,
                        status: friend.status,
                        type: lastMessage.type,
                        isRead: chatRef['isRead']
                    };

                    chatsList.push(chatDetails);
                })
            }

            // update the value of the observer
            this.chats.next(chatsList);
        })
    }

    getErrorMessage(): BehaviorSubject<string> {
        return this.errorMessage;
    }

    getChats(): BehaviorSubject<Array<any>> {
        return this.chats;
    }

    resetVariables() {
        this.chats.next([]);
        this.errorMessage.next('');
    }
}

export default new ChatsModel();