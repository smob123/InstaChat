/**
 * @author Sultan
 * 
 * register page modle
 */

import * as app from 'firebase/app';
import AppModel from '../../AppModel';
import { gql } from '@apollo/client';
import { BehaviorSubject } from 'rxjs';
import ProfileModle from '../tabs/modles/ProfileModel';

class RegisterModel {
    // observes if sign up requests are successful
    private success = new BehaviorSubject<Boolean>(false);
    // observes errors
    private errorMessage = new BehaviorSubject<string>('');

    // sign  up mutation
    private signupMutation = gql`
        mutation Signup($email: String!, $username: String!, $firebaseToken: String!) {
            Signup(email: $email, username: $username, firebaseToken: $firebaseToken)
        }
    `;

    /**
     * sends a signup request to firebase
     */
    signup(email: string, username: string, password: string) {
        app.auth().createUserWithEmailAndPassword(email, password)
            .then(user => {
                user.user?.getIdToken().then(firebaseToken => {
                    // send a sign up request to the apollo server
                    this.apolloSignup(email, username, firebaseToken);
                })
            })
            .catch(err => {
                this.errorMessage.next(err.message);
            });
    }

    /**
     * sends a sign up request to the server
     */
    private async apolloSignup(email: string, username: string, firebaseToken: string) {
        const client = AppModel.getApolloClient();
        await client.mutate({
            mutation: this.signupMutation,
            variables: { email, username, firebaseToken }
        })
            .then(({ data, errors }) => {

                if (errors) {
                    this.errorMessage.next(errors[0].toString());
                    return;
                }

                if (data['Signup']) {
                    const userId = app.auth().currentUser!.uid;
                    const status = ProfileModle.getStatusList()[0];

                    const userData = {
                        userId,
                        username,
                        email,
                        status
                    }

                    // cache the user's info, and update the success observer
                    localStorage.setItem('user', JSON.stringify(userData));
                    this.success.next(true);
                }
            })
            .catch(err => {
                this.errorMessage.next(err);
            });;
    }

    isSignupSuccessful(): BehaviorSubject<Boolean> {
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

export default new RegisterModel();