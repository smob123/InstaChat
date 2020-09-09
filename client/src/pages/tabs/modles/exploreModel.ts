/**
 * @author Sultan
 * 
 * Explore page's modle
 */

import * as app from 'firebase/app';
import AppModel from '../../../AppModel';
import { gql, ObservableQuery } from '@apollo/client';
import { BehaviorSubject } from 'rxjs';

class ExploreModel {
    // error message observer
    private errorMessage = new BehaviorSubject<string>('');
    // observes the list of recommended users
    private recommendedUsers = new BehaviorSubject<Array<any>>([]);

    // query to fetch random users from the graphql server
    private getRandomUsersQuery = gql`
        query getRandomUsers($userId: String!, $firebaseToken: String!) {
            getRandomUsers(userId: $userId, firebaseToken: $firebaseToken) {
                id
                username
                avatar
                status {
                    name
                    iconColor
                }
              }
        }
    `;

    // used as a global variable to allow refetching the same query every time the user  swipes torefresh
    private clientRandomUsersQuery!: ObservableQuery<any, any>;

    /**
     * initializes the apollo client, an makes the initial network request
     */
    private async initializeClient() {
        // get the cached user id
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const userId = user['userId'];
        const firebaseToken = await app.auth().currentUser?.getIdToken();

        this.clientRandomUsersQuery = AppModel.getApolloClient().watchQuery({
            query: this.getRandomUsersQuery,
            variables: { userId: userId, firebaseToken: firebaseToken }
        });

        this.clientRandomUsersQuery.subscribe(({ data, errors }) => {
            if (errors) {
                this.errorMessage.next(errors[0].message);
                return;
            }

            if (data) {
                this.recommendedUsers.next(data['getRandomUsers']);
            }
        })
    }

    /**
     * fetches random users from the graphql server
     */
    async fetchRandomUsers() {
        // check if the apollo client has been initialized
        if (!this.clientRandomUsersQuery) {
            await this.initializeClient();
        } else {
            // otherwise refetch using the same client
            const newResult = await this.clientRandomUsersQuery.refetch();

            // check if the new result is not different from the old one
            if (!this.clientRandomUsersQuery.isDifferentFromLastResult(newResult)) {
                // update the recommended users list to notify the UI that the network request was finished, 
                // since the subscribe funtion that's used above doesn't get called if the data  is the same as 
                // the last result
                this.recommendedUsers.next(newResult.data['getRandomUsers']);
            }
        }
    }

    getErrorMessage(): BehaviorSubject<string> {
        return this.errorMessage;
    }

    getRecommendedUsers(): BehaviorSubject<Array<any>> {
        return this.recommendedUsers;
    }

    resetVariables() {
        this.recommendedUsers.next([]);
        this.errorMessage.next('');
    }
}

export default new ExploreModel();