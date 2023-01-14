/**
 * @author Sultan
 * 
 * Friends page modle
 */

import * as app from 'firebase/app';
import 'firebase/database';
import AppModel from '../../../AppModel';
import { gql } from '@apollo/client';
import { BehaviorSubject } from 'rxjs';

class FriendsModel {
    // error message observer
    private errorMessage = new BehaviorSubject<string>('');
    // friends list observer
    private friends = new BehaviorSubject<Array<any>>([]);
    // sent friend requests observer
    private sentFriendRequests = new BehaviorSubject<Array<any>>([]);
    // received friend requests observer
    private receivedFriendRequests = new BehaviorSubject<Array<any>>([]);

    // mutation to accept a friend request
    private acceptFriendRequestMutation = gql`
        mutation acceptFriendRequest($userId: String!, $firebaseToken: String!, $otherUserId: String!) {
            acceptFriendRequest(userId: $userId, firebaseToken: $firebaseToken, otherUserId: $otherUserId)
        }
    `;

    // mutation to reject a friend request
    private rejectFriendRequestMutation = gql`
        mutation rejectFriendRequest($userId: String!, $firebaseToken: String!, $otherUserId: String!) {
            rejectFriendRequest(userId: $userId, firebaseToken: $firebaseToken, otherUserId: $otherUserId)
        }
    `;

    // mutation to cancel a sent friend request
    private cancelFriendRequestMutation = gql`
    mutation cancelFriendRequest($userId: String!, $firebaseToken: String!, $otherUserId: String!) {
        cancelFriendRequest(userId: $userId, firebaseToken: $firebaseToken, otherUserId: $otherUserId)
    }
    `;

    /**
     * fetches the list of friends from the database
     */
    async fetchFriends() {
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId: string = user['userId'];

        app.database().ref().child('users').child(userId).child('friends').on('value', async snapshots => {
            const friendIds = await snapshots.val();

            // check if the user has not friends
            if (!friendIds) {
                this.friends.next([]);
                return;
            }

            const friendsList: Array<any> = [];
            for (const id of friendIds) {
                await app.database().ref().child('users').child(id).once('value', async users => {
                    // parse the required information from the friend's record, and add it to the friends list
                    const user = await users.val();
                    friendsList.push({
                        id,
                        username: user.username,
                        avatar: user.avatar,
                        status: user.status
                    })
                })
            }

            this.friends.next(friendsList);
        })
    }

    /**
     * fetches sent friend requests from the server
     */
    async fetchSentFriendRequests() {
        // get the cached user id
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId: string = user['userId'];

        app.database().ref().child('users').child(userId).child('sent friend requests').on('value', async snapshots => {
            const friendIds = await snapshots.val();

            // check if the user has no sent friend requests
            if (!friendIds) {
                this.sentFriendRequests.next([]);
                return;
            }

            // otherwise get the required account's data for each user id in the sent friend requests
            const friendsList: Array<any> = [];
            for (const id of friendIds) {
                await app.database().ref().child('users').child(id).once('value', async users => {
                    const user = await users.val();
                    friendsList.push({
                        id,
                        username: user.username,
                        avatar: user.avatar,
                        status: user.status
                    })
                })
            }

            this.sentFriendRequests.next(friendsList);
        })
    }

    /**
     * fetches the received friend requests
     */
    async fetchReceivedFriendRequests() {
        // get the cached user id
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId: string = user['userId'];

        app.database().ref().child('users').child(userId).child('received friend requests').on('value', async snapshots => {
            const friendIds = await snapshots.val();

            // check if the user has no received friend requests
            if (!friendIds) {
                this.receivedFriendRequests.next([]);
                return;
            }

            // otherwise get the required account's data for each user id in the received friend requests
            const friendsList: Array<any> = [];
            for (const id of friendIds) {
                await app.database().ref().child('users').child(id).once('value', async users => {
                    const user = await users.val();
                    friendsList.push({
                        id,
                        username: user.username,
                        avatar: user.avatar,
                        status: user.status
                    })
                })
            }

            this.receivedFriendRequests.next(friendsList);
        })
    }

    /**
     * accepts a receied friend request
     */
    async acceptFriendRequest(otherUserId: string) {
        // get cached the user id and the firebase token
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId = user['userId'];
        const firebaseToken = await app.auth().currentUser?.getIdToken();

        // send a mutation to the graphql server
        const client = AppModel.getApolloClient();
        await client.mutate({
            mutation: this.acceptFriendRequestMutation,
            variables: {
                userId, firebaseToken, otherUserId
            }
        }).then(({ errors }) => {
            if (errors) {
                this.errorMessage.next(errors[0].message);
                return;
            }
        }).catch(err => {
            this.errorMessage.next(err);
        })
    }

    /**
     * rejects a received friend request
     */
    async rejectFriendRequest(otherUserId: string) {
        // get cached the user id and the firebase token
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId = user['userId'];
        const firebaseToken = await app.auth().currentUser?.getIdToken();

        // send a mutation to the graphql server
        const client = AppModel.getApolloClient();
        await client.mutate({
            mutation: this.rejectFriendRequestMutation,
            variables: {
                userId, firebaseToken, otherUserId
            }
        }).then(({ errors }) => {
            if (errors) {
                this.errorMessage.next(errors[0].message);
                return;
            }
        }).catch(err => {
            this.errorMessage.next(err);
        })
    }

    async cancelFriendRequest(otherUserId: string) {
        // get cached the user id and the firebase token
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId = user['userId'];
        const firebaseToken = await app.auth().currentUser?.getIdToken();

        // send a mutation to the graphql server
        const client = AppModel.getApolloClient();
        await client.mutate({
            mutation: this.cancelFriendRequestMutation,
            variables: {
                userId, firebaseToken, otherUserId
            }
        }).then(({ errors }) => {
            if (errors) {
                this.errorMessage.next(errors[0].message);
                return;
            }
        }).catch(err => {
            this.errorMessage.next(err);
        })
    }

    getFriends(): BehaviorSubject<Array<any>> {
        return this.friends;
    }

    getSentRequests(): BehaviorSubject<Array<any>> {
        return this.sentFriendRequests;
    }

    getReceivedRequests(): BehaviorSubject<Array<any>> {
        return this.receivedFriendRequests;
    }

    getErrorMessage(): BehaviorSubject<string> {
        return this.errorMessage;
    }

    resetVariables() {
        this.friends.next([]);
        this.sentFriendRequests.next([]);
        this.receivedFriendRequests.next([]);
        this.errorMessage.next('');
    }
}

export default new FriendsModel();