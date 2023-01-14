/**
 * @author Sultan
 * 
 * Modal image
 */

import React from 'react';
import {
    IonImg
} from '@ionic/react';
import './ImageModal.css';

interface Props {
    // the source of the image
    imageSrc: string,
    // a function that the parent passes to handles hiding the image
    hideImage: any
}

const ImageModal: React.FC<Props> = ({ imageSrc, hideImage }: Props) => (
    <div className='image-modal-container' onClick={() => hideImage()}>
        <IonImg src={imageSrc} className='image-modal'></IonImg>
    </div>
)

export default ImageModal;