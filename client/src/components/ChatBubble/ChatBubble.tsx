/**
 * @author Sultan
 * 
 * Displays chat images in a bubble
 */

import React from 'react';
import {
    IonText,
    IonItem,
    IonImg
} from '@ionic/react';
import './ChatBubble.css';

interface Props {
    message: any,
    belongsToCurrentUser: boolean,
    setDisplayImage: any,
    senderUsername: string
}

const ChatBubble: React.FC<Props> = ({ message, setDisplayImage, belongsToCurrentUser, senderUsername }) => {
    /**
     * parses the image's time in the format hh/mm AM/PM
     */
    const parseDateTime = () => {
        if (message.datetime) {
            const messageDate = new Date(message.datetime);
            const hour = messageDate.getHours() > 12 ? Math.abs(12 - messageDate.getHours()) : messageDate.getHours();
            const timeOfDay = messageDate.getHours() > 12 ? 'PM' : 'AM';
            const minute = messageDate.getMinutes() < 10 ? `0${messageDate.getMinutes()}` : messageDate.getMinutes();
            return `${hour}:${minute} ${timeOfDay}`;
        }
    }

    /**
     * parses the message into JSX based on its type
     */
    const parseMessage = () => {
        if (message.type === 'url') {
            return (
                <a href={message.body} target='_blank' rel='noopener noreferrer'>
                    <p className='message'>
                        {message.body}
                    </p>
                </a>
            )
        } else if (message.type === 'image') {
            return (
                <IonImg src={message.body} onClick={() => setDisplayImage(message.body)}></IonImg>
            )
        } else {
            return (
                <p className='message'>
                    {message.body}
                </p>
            )
        }
    }

    return (
        <IonItem lines='none' className='chat-bubble-container'>
            {/* decide the style of the bubble based on who the sender is */}
            <IonText className={`chat-bubble ${belongsToCurrentUser ? 'current-user-chat-bubble' : 'other-user-chat-bubble'}`}
                slot={belongsToCurrentUser ? 'end' : 'start'}>
                {/* the sender's username */}
                <p className='username'>
                    <strong>
                        {senderUsername}
                    </strong>
                </p>

                {/* the parsed message */}
                {parseMessage()}

                {/* the time of the message */}
                <p className='date'>
                    {
                        parseDateTime()
                    }
                </p>
            </IonText>
        </IonItem>
    )
}

export default ChatBubble;