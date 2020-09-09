import * as app from 'firebase/app';
import AppModel from '../../AppModel';
import { gql } from '@apollo/client';
import { BehaviorSubject } from 'rxjs';

class GalleryModel {
    private sucess = new BehaviorSubject<boolean>(false);
    private errorMessage = new BehaviorSubject<string>('');

    private sendFriendRequestMutation = gql`
    mutation sendFriendRequest($userId: String!, $firebaseToken: String!, $otherUserId: String!) {
        sendFriendRequest(userId: $userId, firebaseToken: $firebaseToken, otherUserId: $otherUserId)
    }
    `;

    async sendFriendRequest(otherUserId: string) {
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId = user['userId'];
        const firebaseToken = await app.auth().currentUser?.getIdToken();

        const client = AppModel.getApolloClient();
        await client.mutate({
            mutation: this.sendFriendRequestMutation,
            variables: { userId, firebaseToken, otherUserId }
        })
            .then(({ data, errors }) => {
                if (errors) {
                    this.errorMessage.next(errors[0].message);
                    return;
                }

                if (data) {
                    const sent = data['sendFriendRequest'];
                    if (sent) {
                        this.sucess.next(true);
                    } else {
                        this.errorMessage.next('failed connecting to the server');
                    }
                }
            })
            .catch(err => {
                this.errorMessage.next(err);
            })
    }

    isOperationSuccessful(): BehaviorSubject<boolean> {
        return this.sucess;
    }

    getErrorMessage(): BehaviorSubject<string> {
        return this.errorMessage;
    }
}

export default new GalleryModel();