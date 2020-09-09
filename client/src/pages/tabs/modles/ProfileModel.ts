/**
 * @author Sultan
 * 
 * Profile page's modle
 */

import * as app from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import AppModel from '../../../AppModel';
import { gql } from '@apollo/client';
import { BehaviorSubject } from 'rxjs';

class ProfileModel {
    // error message observer
    private errorMessage = new BehaviorSubject<string>('');
    // user's info observer
    private userInfo = new BehaviorSubject<any>({});
    //  observes the list of all available statuses
    private statusList = [{
        name: 'Available',
        iconColor: 'green'
    },
    {
        name: 'Busy',
        iconColor: 'red'
    },
    {
        name: 'Away',
        iconColor: 'purple'
    }
    ];

    /// mutation to update the user's current status
    private updateStatusMutation = gql`
    mutation updateStatus($userId: String!, $firebaseToken: String!, $newStatus: String!) {
        updateStatus(userId: $userId, firebaseToken: $firebaseToken, newStatus: $newStatus)
    }
`;

    // mutation to upload a new user avatar
    private uploadAvatarMutation = gql`
        mutation uploadAvatar($userId: String!, $firebaseToken: String!, $newAvatarUrl: String!) {
            uploadAvatar(userId: $userId, firebaseToken: $firebaseToken, newAvatarUrl: $newAvatarUrl)
        }
    `;

    /**
     * fetches user's info from the database
     */
    async fetchUserInfo() {
        // get cached user id
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId = user['userId'];

        app.database().ref().child('users').child(userId).on('value', async snapshots => {
            // update the user info observer
            const info = await snapshots.val();
            this.userInfo.next({
                username: info.username,
                avatar: info.avatar,
                status: info.status
            })
        })
    }

    /**
     * updates the user's current status
     */
    async updateUserStatus(newStatus: string) {
        // get the cached user id, and the firebase token
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId = user['userId'];
        const firebaseToken = await app.auth().currentUser?.getIdToken();

        // send a mutation request to the server
        const client = AppModel.getApolloClient();
        await client.mutate({
            mutation: this.updateStatusMutation,
            variables: {
                userId, firebaseToken, newStatus
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
     * uploads new user avatar to the server
     */
    async uploadAvatar(base64Image: string, filename: string) {
        // get the cached user id, and the firebase token
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId = user['userId'];
        const firebaseToken = await app.auth().currentUser?.getIdToken();

        // upload the image to the firebase storage
        const ref = app.storage().ref().child('avatars').child(`${userId}.${filename.split('.').pop()}`);
        await ref.putString(base64Image, 'base64');
        // get the image's url
        const url = await ref.getDownloadURL();

        // upload the url to the server
        const client = AppModel.getApolloClient();
        await client.mutate({
            mutation: this.uploadAvatarMutation,
            variables: {
                userId, firebaseToken, newAvatarUrl: url
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

    getUserInfo(): BehaviorSubject<any> {
        return this.userInfo;
    }

    getStatusList(): Array<any> {
        return this.statusList;
    }

    resetVariables() {
        this.userInfo.next({});
        this.errorMessage.next('');
    }
}

export default new ProfileModel();