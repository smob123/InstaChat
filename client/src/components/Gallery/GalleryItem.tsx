/**
 * @author Sultan
 * 
 * Gallery item, which represents a single column in the gallery
 * 
 */

import React, { Component } from 'react';
import {
    IonCard,
    IonButton,
    IonCol,
    IonAvatar,
    IonText,
    IonImg
} from '@ionic/react';
import './Gallery.css';
import GalleryModel from './GalleryModel';
// default user avatar
import defaultAvatar from '../../assets/default_avatar.png';

interface Props {
    // the user's info
    user: any,
    // the size of the column
    size: number
}

interface State {
    // the button's title
    buttonContent: any,
    isButtonDisabled: boolean
}

class GalleryItem extends Component<Props, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            buttonContent: 'Connect',
            isButtonDisabled: false
        }
    }

    /**
     * sends a friend request to the given user, and disables the button
     */
    handleClick() {
        GalleryModel.sendFriendRequest(this.props.user.id);
        this.setState({ buttonContent: 'Sent', isButtonDisabled: true });
    }

    render() {
        return (
            <IonCol className='ion-text-center' size={(this.props.size).toString()}>
                <IonCard className='gallery-item-card'>
                    {/* the user's avatar */}
                    <IonAvatar className='ion-margin-bottom ion-margin-top'>
                        <IonImg src={this.props.user.avatar || defaultAvatar}></IonImg>
                    </IonAvatar>

                    {/* the user's username */}
                    <IonText color='dark'>
                        <span className='username ion-margin-bottom'>{this.props.user['username']}</span>
                    </IonText>

                    {/* the friend request button */}
                    <div>
                        <IonButton size='small' className='ion-margin-bottom' color='dark' onClick={() => this.handleClick()} disabled={this.state.isButtonDisabled}>
                            <span>
                                {this.state.buttonContent}
                            </span>
                        </IonButton>
                    </div>
                </IonCard>
            </IonCol>
        );
    }
}

export default GalleryItem;