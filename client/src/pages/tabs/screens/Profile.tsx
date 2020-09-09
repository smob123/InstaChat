/**
 * @author Sultan
 * 
 * profile fragment, which displays the user's profile information.
 */

import React, { Component } from 'react';
import { withRouter } from "react-router";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAvatar, IonImg, IonText, IonButton, IonAlert, IonSelect, IonSelectOption, IonIcon } from '@ionic/react';
import './Profile.css';
import * as app from 'firebase/app';
import { ellipse } from 'ionicons/icons';
import imageCompression from 'browser-image-compression';
import ProfileModel from '../modles/ProfileModel';

interface State {
    username: string,
    avatarSrc: any,
    status: any,
    showAlert: boolean
}

class Profile extends Component<any, State> {

    // checks whether the component is mounted or not 
    // (needed because the observers will try to immediately access the component's state when the user navigates back to this component after its parent has been unmounted)
    isComponentMounted: boolean = false

    constructor(props: any) {
        super(props);

        // get the cached user's info, and set the state accordingly
        let user: any = localStorage.getItem('user');
        user = JSON.parse(user);
        const username = user['username'];
        const avatarSrc = user['avatar'] || require('../../../assets/default_avatar.png');
        const status = user['status'];

        this.state = {
            username,
            avatarSrc,
            status,
            showAlert: false
        }
    }

    componentDidMount() {
        this.isComponentMounted = true;
        // make the requried network requests to populate the screen with data
        this.props.ProfileModel.fetchUserInfo();
        // initialze change observers
        this.initializeUserInfoObserver();
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    /**
   * observes changes to the userInfo objects in the modle
   */
    initializeUserInfoObserver() {
        this.props.ProfileModel.getUserInfo().subscribe((info: any) => {
            if (!info.username || !this.isComponentMounted) {
                return;
            }

            this.setState({
                username: info.username,
                avatarSrc: (info.avatar || require('../../../assets/default_avatar.png')),
                status: info.status
            });
        })
    }

    /**
     * responsible for uploading new avatar images to the server.
     */
    async uploadImage(files: FileList | null) {
        if (!files || files.length !== 1) {
            return;
        }

        const selectedFile = files[0];
        const compressedFile = await imageCompression(selectedFile, {
            maxSizeMB: 2
        })

        const bytes = await compressedFile.arrayBuffer()
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        this.props.ProfileModel.uploadAvatar(base64Image, selectedFile.name);
    }

    /**
     * logges out the user, and goes back to the login screen
     */
    async logOut() {
        await app.auth().signOut();
        localStorage.clear();
    }

    render() {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Profile</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonHeader collapse="condense">
                        <IonToolbar>
                            <IonTitle size="large">Profile</IonTitle>
                        </IonToolbar>
                    </IonHeader>

                    <div className='profile-main-container'>

                        {/* the user's avatar wrapped with an input element to allow the user to select a local image as a new avatar */}
                        <IonAvatar className='ion-margin-bottom profile-user-avatar'>
                            <label htmlFor='upload'>
                                <IonImg src={this.state.avatarSrc}></IonImg>

                                <div className='avatar-overlay'>Edit</div>
                                <input type='file' id='upload' onChange={(e) => this.uploadImage(e.target.files)} />
                            </label>
                        </IonAvatar>

                        {/* the user's username */}
                        <IonText>
                            <IonTitle>
                                {this.state.username}
                            </IonTitle>
                        </IonText>

                        {/* the user's status, which is displayed in a dropdown menu to allow the client to change their status at any time they wish */}
                        <IonSelect value={this.state.status.name} onIonChange={(e) => this.props.ProfileModel.updateUserStatus(e.detail.value)}>
                            {ProfileModel.getStatusList().map((item, index) => (
                                <IonSelectOption value={item.name} key={`${index}_${item.name}_${item.iconColor}`}>
                                    <IonIcon slot='start' icon={ellipse} style={{ color: item.iconColor }}></IonIcon>
                                    {item.name}
                                </IonSelectOption>
                            ))
                            }
                        </IonSelect>

                        {/* clicking this button shows the alert dialog */}
                        <IonButton color='danger' onClick={() => this.setState({ showAlert: true })}>Logout</IonButton>
                    </div>
                </IonContent>

                {/* this alert dialog will ask the user to confirm whether they want to logout or not */}
                <IonAlert
                    isOpen={this.state.showAlert}
                    header='Login Error'
                    message={'Are you sure you want to logout?'}
                    buttons={[
                        {
                            text: 'No',
                            handler: () => { this.setState({ showAlert: false }) }
                        }
                        , {
                            text: 'Yes',
                            handler: () => this.logOut()
                        }]}
                />
            </IonPage>
        );
    }
}

export default withRouter(Profile);
