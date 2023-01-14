/**
 * @author Sultan
 * 
 * Login page
 */

import React, { Component } from 'react';
import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonThumbnail,
    IonImg,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonButton,
    IonAlert,
    IonPage
} from '@ionic/react';
import { mailOutline, lockClosedOutline, enterOutline } from 'ionicons/icons';

import LoginModel from './LoginModel';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';

import app from 'firebase/app';
import 'firebase/auth';

import { Redirect } from 'react-router';

import './login.css';

interface Props {
    history: any
}

interface State {
    email: any,
    password: any,
    showAlert: boolean,
    errorMessage: string,
    isLoading: boolean
}

class Login extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            showAlert: false,
            errorMessage: '',
            isLoading: false
        };
    }

    componentDidMount() {
        this.initializeSucessObserver();
        this.initializeFailureObserver();
    }

    componentWillUnmount() {
        // reset the observables, so that when the user signs out, the observers will have the initial values
        LoginModel.resetVariables();
    }

    /**
     * observes whether the login request was successful or not
     */
    initializeSucessObserver() {
        LoginModel.isLoginSuccessful().subscribe(isLoggedIn => {
            if (isLoggedIn) {
                this.props.history.push('/chats');
            }
        });
    }

    /**
     * observes network errors
     */
    initializeFailureObserver() {
        LoginModel.getErrorMessage().subscribe(message => {
            if (message !== '') {
                this.setState({ errorMessage: message, showAlert: true, isLoading: false });
            }
        })
    }

    /**
     * sends login requests to the server
     */
    login = () => {
        const loginInfo = [this.state.email, this.state.password];

        // make sure that input fields are not empty
        for (const item of loginInfo) {
            if (!item || item.trim() === '') {
                this.setState({ errorMessage: 'Please fill in empty fields', showAlert: true });
                return;
            }
        }

        // change the loading state to display the loading spinner, and send a request to the server
        this.setState({ isLoading: true });
        LoginModel.login(this.state.email, this.state.password);
    }

    render() {
        // redirect the user to the main app's screen if they are already logged in
        if (app.auth().currentUser && localStorage.getItem('user')) {
            return <Redirect from='/login' to='/chats' />
        }

        return (
            <IonPage>
                <IonContent fullscreen={true}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle size="large">InstaChat</IonTitle>
                        </IonToolbar>
                    </IonHeader>

                    {/* the app's icon */}
                    <IonThumbnail>
                        <IonImg src={require('../../assets/logo.png')}></IonImg>
                    </IonThumbnail>

                    {/* login form */}
                    <form className="main-container">
                        <IonItem lines="none">
                            <IonLabel>
                                <h2>Sign in</h2>
                                <p>Enter your information to continue!</p>
                            </IonLabel>
                        </IonItem>

                        {/* text inputs */}
                        <IonItem>
                            <IonLabel position="stacked">
                                Email
                            </IonLabel>
                            <IonInput type="email"
                                onKeyUp={(e) => e.key === 'Enter' ? this.login() : ''}
                                onIonChange={(e) => this.setState({ email: e.detail.value })} required>
                                <IonIcon icon={mailOutline}></IonIcon>
                            </IonInput>
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">
                                Password
                            </IonLabel>
                            <IonInput
                                type="password"
                                onKeyUp={(e) => e.key === 'Enter' ? this.login() : ''}
                                onIonChange={(e) => this.setState({ password: e.detail.value })} required>
                                <IonIcon icon={lockClosedOutline}></IonIcon>
                            </IonInput>
                        </IonItem>

                        {/* submit button */}
                        <IonButton color="dark" expand="block" onClick={() => this.login()}>
                            Login
                            <IonIcon icon={enterOutline} slot="end"></IonIcon>
                        </IonButton>

                        {/* link to registration page */}
                        <IonItem lines="none">
                            <IonLabel>
                                Need an account?
                                <b color='dark'>
                                    <span onClick={() => this.props.history.push('/register')}> Sign up</span>
                                </b>
                            </IonLabel>
                        </IonItem>
                    </form>
                </IonContent>

                {/* loading indicator */}
                {this.state.isLoading &&
                    < LoadingIndicator />
                }

                {/* error alert dialog */}
                <IonAlert
                    isOpen={this.state.showAlert}
                    onDidDismiss={() => this.setState({ showAlert: false })}
                    header='Login Error'
                    message={this.state.errorMessage}
                    buttons={['Okay']}
                />
            </IonPage>
        );
    }
}

export default Login;