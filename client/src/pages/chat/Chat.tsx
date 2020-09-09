/**
 * @author Sultan
 * 
 * Chat page
 */

import React, { Component } from 'react';

import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonImg,
    IonInput,
    IonIcon,
    IonToast,
    IonAvatar,
    IonBackButton,
    IonButtons,
    IonFooter
} from '@ionic/react';
import { ellipse, send, image } from 'ionicons/icons';

import ChatModel from './ChatModel';

import ChatBubble from '../../components/ChatBubble/ChatBubble';
import ImageModal from '../../components/ImageModal/ImageModal';

import imageCompression from 'browser-image-compression';

import './Chat.css';

interface State {
    messages: Array<any>,
    toastMessage: string,
    displayToast: boolean,
    onToastDismiss: any,
    otherUserUsername: string,
    otherUserAvatar: string,
    currentUserUsername: string,
    status: any,
    inputText: any,
    displayImageModal: boolean,
    imageModalSrc: string
}

class Chat extends Component<any, State> {
    // checks whether the component is mounted or not 
    // (needed because the observers will try to immediately access the component's state when the user navigates back to this component after its parent has been unmounted)
    isComponentMounted: boolean = false;

    constructor(props: any) {
        super(props);

        // get the cahched user's info
        let currentUser: any = localStorage.getItem('user');
        currentUser = JSON.parse(currentUser);

        this.state = {
            messages: [],
            toastMessage: '',
            // handles displaying, and hiding the toast message
            displayToast: false,
            // gets executed after the toast is dismissed
            onToastDismiss: () => { },
            otherUserUsername: '',
            otherUserAvatar: require('../../assets/default_avatar.png'),
            currentUserUsername: currentUser.username,
            status: {},
            inputText: '',
            // handles displaying, and hiding images in the chat as modal images
            displayImageModal: false,
            // the source of the modal image
            imageModalSrc: ''
        }
    }

    componentDidMount() {
        this.isComponentMounted = true;
        // get the other user's id from the url, and check if they are friends with the current user
        const otherUserId = this.props.match.params.userId;
        ChatModel.fetchIsFriendsWithUser(otherUserId);

        // initialze change observers
        this.initializeIsFriendsWithUserObserver();
        this.initializeOtherUserInfoObserver();
        this.initializeChatMessagesObserver();
        this.initializeErrorMessageObserver();
    }

    componentWillUnmount() {
        // reset modle variables so that the old data will not appear when the user enters another chat
        this.isComponentMounted = false;
        ChatModel.resetVariables();
    }

    /**
     * observes whether the current user if friends with the account they are trying to chat with
     */
    initializeIsFriendsWithUserObserver() {
        ChatModel.getIsFriendsWithUser().subscribe(isFriend => {
            if (!isFriend && this.isComponentMounted) {
                this.setState({
                    toastMessage: 'You need to add this person as a friend to have a conversation with them',
                    displayToast: true,
                    onToastDismiss: () => { this.props.history.push('/') }
                })
            }
        })
    }

    /**
     * observes changes to the other user's profile info
     */
    initializeOtherUserInfoObserver() {
        ChatModel.getOtherUserInfo().subscribe(info => {
            if (info && this.isComponentMounted) {
                this.setState({
                    otherUserUsername: info.username,
                    otherUserAvatar: info.avatar || this.state.otherUserAvatar,
                    status: info.status
                })
            }
        });
    }

    /**
     * observes changes to the chat's messages
     */
    initializeChatMessagesObserver() {
        ChatModel.getChatMessages().subscribe(messages => {
            if (this.isComponentMounted) {
                this.setState({ messages });

                setTimeout(() => {
                    let list = document.querySelector("ion-content");
                    list?.scrollToBottom();
                }, 100)
            }
        })
    }

    /**
     * observes error messages
     */
    initializeErrorMessageObserver() {
        ChatModel.getErrorMessage().subscribe(message => {
            if (message && this.isComponentMounted) {
                this.state.messages.pop();
                this.setState({ toastMessage: message, displayToast: true, onToastDismiss: () => { this.setState({ displayToast: false }) } })
            }
        })
    }

    /**
     * handles sending messages
     */
    handleSubmit() {
        if (this.state.inputText.trim() === '') {
            return;
        }

        // get the type of the message
        const messageType = this.getMessageType(this.state.inputText);

        // send it to the server
        ChatModel.sendMessage({ body: this.state.inputText, type: messageType }, this.props.match.params.userId);
        // add the message to the message list
        this.state.messages.push({ body: this.state.inputText, userId: '', datetime: Date.now() })
        // reset the tex input's content
        this.setState({ inputText: '' });

        // wait for 100ms before scolling to the bottom
        setTimeout(() => {
            let list = document.querySelector("ion-content");
            list?.scrollToBottom();
        }, 100)
    }

    /**
     * handles sending image messages.
     */
    async sendImage(files: FileList | null) {
        // make sure that the user has only selected a single file
        if (!files || files.length !== 1) {
            this.setState({
                toastMessage: 'cannot upload more than one file at a time',
                displayToast: true,
                onToastDismiss: () => { this.setState({ displayToast: false }) }
            })
            return;
        }

        const selectedFile = files[0];

        // make sure that the file type is an image by checking its extension
        const fileExtension = selectedFile.name.split('.').pop();

        // check if there is an extension in the file's name
        if (!fileExtension) {
            this.setState({
                toastMessage: 'Invalid file type',
                displayToast: true,
                onToastDismiss: () => { this.setState({ displayToast: false }) }
            })
            return;
        }

        // check if it's is a valid image extension
        const isImage = this.getMessageType(fileExtension) === 'image';

        // display an error message if the file is not an image
        if (!isImage) {
            this.setState({
                toastMessage: 'Invalid file type',
                displayToast: true,
                onToastDismiss: () => { this.setState({ displayToast: false }) }
            })
            return;
        }

        // compress the file
        const compressedFile = await imageCompression(selectedFile, {
            maxSizeMB: 2
        })

        // convert it into a base64 string
        const bytes = await compressedFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        // upload it to the backend
        ChatModel.sendImage(base64Image, selectedFile.name, this.props.match.params.userId);
    }

    /**
     * returns the type of the message that the user is trying to send.
     */
    getMessageType(message: string) {
        // url format
        const urlRegex = RegExp(/(http[s]?:\/\/){1}([a-z|A-Z]{1,200})\.[a-z]{2,5}/);
        // image file format
        const imageExtensions = RegExp(/(png|jpg|jpeg|gif|bmp)/i);

        // check and return the type of the message
        if (imageExtensions.test(message)) {
            return 'image';
        } else if (urlRegex.test(message)) {
            return 'url';
        } else {
            return 'text';
        }
    }

    /**
     * displays modal images
     */
    displayImageModal(src: string) {
        this.setState({
            displayImageModal: true,
            imageModalSrc: src
        })
    }

    /**
     * hides modal images
     */
    hideImageModal() {
        this.setState({ displayImageModal: false });
    }

    render() {
        return (
            <IonPage>
                <IonHeader translucent={true}>
                    <IonToolbar className='chat-tool-bar'>
                        {/* header's back button */}
                        <IonButtons slot='start'>
                            <IonBackButton defaultHref='/' />
                        </IonButtons>

                        {/* the other user's avatar, username, and status */}
                        <IonAvatar slot='start'>
                            <IonImg src={this.state.otherUserAvatar}></IonImg>
                        </IonAvatar>

                        <IonTitle>
                            {this.state.otherUserUsername}
                            <IonIcon icon={ellipse} style={{ color: this.state.status.iconColor }}></IonIcon>
                        </IonTitle>

                    </IonToolbar>
                </IonHeader>

                {/* the list of messages in the chat */}
                <IonContent className='messages-container' onChange={() => console.log('changed')}>

                    {this.state.messages.length > 0 &&
                        this.state.messages.map((item, index) => {
                            // gets initialized if the date of the current message is different from the previous message, then it gets added to the UI inside a paragraph element to indicate 
                            // the date of the group of messages that come after it
                            let date;

                            // if the message's index is 0, then get its date
                            if (index === 0) {
                                const dateObj = new Date(item.datetime);
                                date = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`
                            } else {
                                // otherwise check if the current message's date is the same as the previous message's date
                                const currentMessageDate = new Date(this.state.messages[index].datetime);
                                const previousMessageDate = new Date(this.state.messages[index - 1].datetime);

                                if (currentMessageDate.getDate() !== previousMessageDate.getDate() ||
                                    currentMessageDate.getMonth() !== previousMessageDate.getMonth() ||
                                    currentMessageDate.getFullYear() !== previousMessageDate.getFullYear()) {
                                    // update the date object
                                    date = `${currentMessageDate.getDate()}/${currentMessageDate.getMonth() + 1}/${currentMessageDate.getFullYear()}`
                                }
                            }

                            return (
                                <div className='ion-text-center' key={`${item.datetime}_${item.userId}`}>
                                    {
                                        /* display this if the date object has been initialize */
                                        (item.datetime && date) &&
                                        <p>
                                            {date}
                                        </p>
                                    }
                                    {/* displays the current message in a chat bubble */}
                                    <ChatBubble message={item}
                                        belongsToCurrentUser={item.userId !== this.props.match.params.userId} key={`${item.body}_${index}`}
                                        senderUsername={item.userId !== this.props.match.params.userId ? this.state.currentUserUsername : this.state.otherUserUsername}
                                        setDisplayImage={(src: string) => this.displayImageModal(src)} />
                                </div>
                            )
                        })
                    }

                    {
                        /* modal image */
                        this.state.displayImageModal &&
                        <ImageModal imageSrc={this.state.imageModalSrc} hideImage={() => this.hideImageModal()} />
                    }

                </IonContent>

                {/* message input */}
                <IonFooter className='chat-box-container'>
                    <IonInput className='chat-box'
                        autofocus={true}
                        inputmode='text'
                        onKeyUp={(e) => e.key === 'Enter' ? this.handleSubmit() : ''}
                        onIonChange={(e) => this.setState({ inputText: e.detail.value })}
                        placeholder='Send messaage...'
                        autocorrect='on'
                        value={this.state.inputText}>
                    </IonInput>

                    {/* submit message, and upload image buttons */}
                    <div>
                        <label htmlFor='upload'>
                            <IonIcon icon={image}></IonIcon>
                            <input type='file' id='upload' className='upload-input' onChange={(e) => this.sendImage(e.target.files)} />
                        </label>

                        <IonIcon icon={send} onClick={() => this.handleSubmit()}></IonIcon>
                    </div>

                </IonFooter>

                {/* displays error messages */}
                <IonToast
                    isOpen={this.state.displayToast}
                    onDidDismiss={() => { this.state.onToastDismiss() }}
                    message={this.state.toastMessage}
                    duration={1000} />
            </IonPage>
        )
    }
}

export default Chat;