/**
 * @author Sultan
 * 
 * Login page modle
 */

import * as app from 'firebase/app';
import AppModel from '../../AppModel';
import { gql } from '@apollo/client';
import { BehaviorSubject } from 'rxjs';

class LoginModel {
    // observes if login requests are successful
    private success = new BehaviorSubject<Boolean>(false);
    // observes errors
    private errorMessage = new BehaviorSubject<string>('');

    // login mutation
    private loginMutation = gql`
    mutation Login($email: String!, $firebaseToken: String!) {
        Login(email: $email, firebaseToken: $firebaseToken) {
            userId
            username
            avatar
            status {
                name
                iconColor
            }
        }
      }
    `;

    /**
     * try to login user firebase, and then send a login request to the server
     */
    login(email: string, password: string) {
        app.auth().signInWithEmailAndPassword(email, password)
            .then(user => {
                user.user?.getIdToken().then(firebaseToken => {
                    this.apolloLogin(email, firebaseToken);
                })
            })
            .catch(err => {
                this.errorMessage.next(err.message);
            });
    }

    /**
     * sends a login request to the apollo server 
     */
    private async apolloLogin(email: string, firebaseToken: string) {
        const client = AppModel.getApolloClient();
        await client.mutate({
            mutation: this.loginMutation,
            variables: { email, firebaseToken }
        })
            .then(({ data, errors }) => {

                if (errors) {
                    this.errorMessage.next(errors[0].toString());
                    return;
                }

                if (data) {
                    const { userId, username, avatar, status } = data['Login'];

                    if (!userId || !username) {
                        this.errorMessage.next('Could not complete your login request, make sure that your are connected to the server');
                        return;
                    }

                    const userData = {
                        userId,
                        username,
                        avatar,
                        email,
                        status
                    }

                    // cache the server's response
                    localStorage.setItem('user', JSON.stringify(userData));
                    this.success.next(true);
                }
            })
            .catch(err => {
                this.errorMessage.next(err);
            });
    }

    isLoginSuccessful(): BehaviorSubject<Boolean> {
        return this.success;
    }

    getErrorMessage(): BehaviorSubject<string> {
        return this.errorMessage;
    }

    resetVariables() {
        this.success.next(false);
        this.errorMessage.next('');
    }
}

export default new LoginModel();