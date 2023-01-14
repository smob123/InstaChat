/**
 * @author Sultan
 * 
 * A loading indicator that has an overlay, which fills the screen with an IonSpinner in the center of the overly
 */

import React from 'react';
import {
    IonSpinner
} from '@ionic/react';
import './LoadingIndicator.css';

const LoadingIndicator: React.FC = () => (
    <div className='loading-indicator-container'>
        <IonSpinner></IonSpinner>
    </div>
)

export default LoadingIndicator;