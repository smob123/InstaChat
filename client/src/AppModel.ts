/**
 * @author Sultan
 * 
 * initializes connections to firebase, and the graphql server
 */

import * as app from 'firebase/app';
import { ApolloClient, InMemoryCache } from '@apollo/client';

class AppModel {
    private apolloClient!: ApolloClient<any>

    constructor() {
        // initialize the firebase app
        if (!app.apps.length) {
            this.initializeFirebaseApp();
            this.initializeApolloClient();
        }
    }

    private initializeFirebaseApp() {
        const firebaseConfig = {
            apiKey: "AIzaSyAvxfskHxsF4YbRLK6fSy01vvSi6XgF6A8",
            authDomain: "instachat-4dec4.firebaseapp.com",
            databaseURL: "https://instachat-4dec4.firebaseio.com",
            projectId: "instachat-4dec4",
            storageBucket: "instachat-4dec4.appspot.com",
            messagingSenderId: "858860471514",
            appId: "1:858860471514:web:0e5de8a6dab55bc16051e3",
            measurementId: "G-CE9ZW2XM6Z"
        };
        app.initializeApp(firebaseConfig);
    }

    initializeApolloClient() {
        this.apolloClient = new ApolloClient({
            uri: 'http://localhost:8080/graphql',
            cache: new InMemoryCache({
                typePolicies: {
                    User: {
                        fields: {
                            id: {
                                // custom merge function for lists containing users' information to force apollo to return the incoming list
                                merge(_ignored, incoming) {
                                    return incoming;
                                },
                            },
                        },
                    },
                }
            })
        });
    }

    getApolloClient(): ApolloClient<any> {
        return this.apolloClient;
    }
}

export default new AppModel();