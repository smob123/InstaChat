/**
 * @author Sultan
 * 
 * Registration page
 */
import React, { Component } from 'react';
import {
    IonPage,
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
    IonCheckbox,
    IonAlert
} from '@ionic/react';
import { mailOutline, lockClosedOutline, enterOutline, personOutline } from 'ionicons/icons';

import RegisterModel from './RegisterModel';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';

import app from 'firebase/app';
import 'firebase/auth';

import { Redirect } from 'react-router';

import './Register.css';

interface Props {
    history: any
}

interface State {
    email: any,
    username: any,
    password: any,
    acceptedTermsAndConditions: boolean,
    showAlert: boolean,
    errorMessage: string,
    isLoading: boolean
}

export default class Register extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            email: '',
            username: '',
            password: '',
            acceptedTermsAndConditions: false,
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
        RegisterModel.resetVariables();
    }

    /**
     * observes whether the sign up request was successful or not
     */
    initializeSucessObserver() {
        RegisterModel.isSignupSuccessful().subscribe(isLoggedIn => {
            if (isLoggedIn) {
                this.props.history.push('/chats');
            }
        });
    }

    /**
     * observes network errors
     */
    initializeFailureObserver() {
        RegisterModel.getErrorMessage().subscribe(message => {
            if (message !== '') {
                this.setState({ errorMessage: message, showAlert: true, isLoading: false });
            }
        })
    }

    /**
     * sends sign up requests to the server
     */
    signup = () => {
        const loginInfo = [this.state.email, this.state.username, this.state.password];

        // make sure that input fields are not empty
        for (const item of loginInfo) {
            if (!item || item.trim() === '') {
                this.setState({ errorMessage: 'Please fill in empty fields', showAlert: true });
                return;
            }
        }

        //  make sure that the user has accepted the terms and conditions
        if (!this.state.acceptedTermsAndConditions) {
            this.setState({ errorMessage: 'Please accept the Terms & Conditions to continue', showAlert: true });
        }

        // change the loading state to display the loading spinner, and send a request to the server
        this.setState({ isLoading: true });
        RegisterModel.signup(this.state.email, this.state.username, this.state.password);
    }

    render() {
        // redirect the user to the main app's screen if they are already logged in
        if (app.auth().currentUser && localStorage.getItem('user')) {
            return <Redirect to='/chats' />
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

                    {/* registration form */}
                    <form className="main-container">
                        <IonItem lines="none">
                            {/* the form's title */}
                            <IonLabel>
                                <h2>Register</h2>
                                <p>Create an account to continue!</p>
                            </IonLabel>
                        </IonItem>

                        {/* text inputs */}
                        <IonItem>
                            <IonLabel position="stacked">
                                Email
                            </IonLabel>
                            <IonInput type="email"
                                onKeyUp={(e) => e.key === 'Enter' ? this.signup() : ''}
                                onIonChange={(e) => this.setState({ email: e.detail.value })} required>
                                <IonIcon icon={mailOutline}></IonIcon>
                            </IonInput>
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">
                                Username
                            </IonLabel>
                            <IonInput name="username"
                                onKeyUp={(e) => e.key === 'Enter' ? this.signup() : ''}
                                onIonChange={(e) => this.setState({ username: e.detail.value })} required>
                                <IonIcon icon={personOutline}></IonIcon>
                            </IonInput>
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">
                                Password
                            </IonLabel>
                            <IonInput type="password"
                                onKeyUp={(e) => e.key === 'Enter' ? this.signup() : ''}
                                onIonChange={(e) => this.setState({ password: e.detail.value })} required>
                                <IonIcon icon={lockClosedOutline}></IonIcon>
                            </IonInput>
                        </IonItem>

                        {/* terms and conditions checkbox */}
                        <IonItem lines="none">
                            <IonCheckbox slot="start" name="checkbox" onIonChange={(e) => this.setState({ acceptedTermsAndConditions: e.detail.checked })}></IonCheckbox>
                            <IonLabel className="ion-text-wrap">
                                <span>
                                    By creating an account, you agree to our <b>Terms & Conditions</b>
                                </span>
                            </IonLabel>
                        </IonItem>

                        {/* submit button */}
                        <IonButton color="dark" expand="block" onClick={() => this.signup()}>
                            Register
                        <IonIcon icon={enterOutline} slot="end"></IonIcon>
                        </IonButton>

                        {/* link to login screen */}
                        <IonItem lines="none">
                            <IonLabel>
                                Already have an account?
                                <b color='dark'>
                                    <span onClick={() => this.props.history.push('/login')}> Sign in </span>
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
                    header='Signup Error'
                    message={this.state.errorMessage}
                    buttons={['Okay']}
                />
            </IonPage>
        );
    }
}