/**
 * @author Sultan
 * 
 * Chat page modle
 */

import * as app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import AppModel from '../../AppModel';
import { gql } from '@apollo/client';
import { BehaviorSubject } from 'rxjs';

class ChatModel {
    // observes  if the current user is friends with the account that they are trying to chat with
    private isFriendsWithUser = new BehaviorSubject<boolean>(true);
    // observes the other user's account info
    private otherUserInfo = new BehaviorSubject<any>(null);
    // observes error messages
    private errorMessage = new BehaviorSubject<string>('');
    // observes messages in the chat
    private chatMessages = new BehaviorSubject<Array<any>>([]);

    // mutation to send a new chat message
    private sendMessageMutation = gql`
        mutation sendMessage($userId: String!, $firebaseToken: String!, $otherUserId: String!, $message: ChatMessage!) {
            sendMessage(userId: $userId, firebaseToken: $firebaseToken, otherUserId: $otherUserId, message: $message)
        }
    `;

    // mutation to set received chat messages as read
    private setMessagesAsRead = gql`
        mutation setChatMessagesAsRead($userId: String!, $firebaseToken: String!, $otherUserId: String!) {
            setChatMessagesAsRead(userId: $userId, firebaseToken: $firebaseToken, otherUserId: $otherUserId)
        }
    `;

    /**
     * fetches whether the current user is friends with the account they are trying to chat with
     */
    fetchIsFriendsWithUser(otherUserId: string) {
        // get the cached user id
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId: string = user['userId'];

        app.database().ref().child('users').child(userId).child('friends').once('value', async snapshots => {
            const friends = await snapshots.val();

            // check if the user has no friends
            if (!friends) {
                this.isFriendsWithUser.next(false);
                return;
            }

            // check if the user's list of friends contains the other account's id
            if (!friends.includes(otherUserId)) {
                this.isFriendsWithUser.next(false);
            } else {
                this.fetchOtherUserInfo(otherUserId);
                this.fetchChatMessages(otherUserId);
            }
        });
    }

    /**
     * fetches the other user's info from the database
     */
    private fetchOtherUserInfo(otherUserId: string) {
        app.database().ref().child('users').child(otherUserId).on('value', async snapshots => {
            const info = await snapshots.val();
            this.otherUserInfo.next({
                id: otherUserId,
                username: info.username,
                avatar: info.avatar,
                status: info.status
            })
        })
    }

    /**
     * fetches the chat's messages from the database
     */
    private async fetchChatMessages(otherUserId: string) {
        // get the cached user id, and the firebase token
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId: string = user['userId'];
        const firebaseToken = await app.auth().currentUser?.getIdToken();

        // get the chat id
        let chatId = '';

        if (userId.charAt(0) < otherUserId.charAt(0)) {
            chatId = `${userId}_${otherUserId}`;
        } else {
            chatId = `${otherUserId}_${userId}`;
        }

        const userDbRef = app.database().ref().child('chats').child(chatId);
        userDbRef.on('value', async snapshots => {
            const conversation = await snapshots.val();

            if (conversation) {
                this.chatMessages.next(conversation);

                // set chat's messages as read
                const client = AppModel.getApolloClient();
                client.mutate({ mutation: this.setMessagesAsRead, variables: { userId, firebaseToken, otherUserId } })
                    .then(({ data, errors }) => {
                        if (errors) {
                            this.errorMessage.next(errors[0].message);
                        }
                    })
            }
        });
    }

    /**
     * sends a new chat message 
     */
    async sendMessage(message: any, otherUserId: string) {
        // get the cached user id, and the firebase token
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId: string = user['userId'];
        const firebaseToken = await app.auth().currentUser!.getIdToken();

        // send a mutation to the server
        const client = AppModel.getApolloClient();
        client.mutate({
            mutation: this.sendMessageMutation,
            variables: { userId, firebaseToken, otherUserId, message }
        })
            .then(({ data, errors }) => {
                if (errors) {
                    this.errorMessage.next(errors[0].message);
                    return;
                }

                if (data) {
                    // check if the message was actually sent
                    if (!data['sendMessage']) {
                        this.errorMessage.next("Couldn't send the message");
                    }
                }
            })
            .catch(err => {
                this.errorMessage.next(err);
            });
    }

    /**
     * sends an image as a message
     */
    async sendImage(base64Image: string, filename: string, otherUserId: string) {
        // get the cached user id
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId = user['userId'];

        // get the chat's id
        let childName = '';

        if (userId.charAt(0) < otherUserId.charAt(0)) {
            childName = `${userId}_${otherUserId}`;
        } else {
            childName = `${otherUserId}_${userId}`
        }

        // generate a random id for the file name
        const uid = new Date().getTime().toString(30) + Math.random().toString(36);

        // upload the file
        const ref = app.storage().ref().child('chats').child(childName).child(`${uid}.${filename.split('.').pop()}`);
        await ref.putString(base64Image, 'base64');
        // get its url, and create a message object
        const url = await ref.getDownloadURL();
        const message = {
            type: 'image',
            body: url
        }

        // send the message to the server
        this.sendMessage(message, otherUserId);
    }

    getOtherUserInfo(): BehaviorSubject<any> {
        return this.otherUserInfo;
    }

    getIsFriendsWithUser(): BehaviorSubject<boolean> {
        return this.isFriendsWithUser;
    }

    getChatMessages(): BehaviorSubject<Array<any>> {
        return this.chatMessages;
    }

    getErrorMessage(): BehaviorSubject<string> {
        return this.errorMessage;
    }

    resetVariables() {
        this.isFriendsWithUser.next(true);
        this.otherUserInfo.next(null);
        this.chatMessages.next([]);
        this.errorMessage.next('');
    }
}

export default new ChatModel();