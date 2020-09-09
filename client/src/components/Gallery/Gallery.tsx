/**
 * @author Sultan
 * 
 * Gallery of recommended users
 */

import React, { Component } from 'react';
import {
    IonGrid,
    IonRow
} from '@ionic/react';
import './Gallery.css';
import GalleryItem from './GalleryItem';

interface Props {
    // the number of columns in the gallery
    ncols: number,
    // the list of users in the gallery
    users: Array<any>
}

class Gallery extends Component<Props> {

    /**
     * returns recommended users in rows with the specified number of columns in the component's props
     */
    getRows() {
        const { ncols, users } = this.props;

        const rows = [];
        // the start index of each row
        let index = 0;

        while (index < users.length) {
            // users in the current row
            const usersInRow = [];

            // loop from the current value of index until (index + number of columns)
            for (let i = index; i < index + ncols; i++) {
                // check if the value of i has exceeded the lengh of the users array
                if (i >= users.length) {
                    break;
                }

                // add a new item to the current row
                usersInRow.push(
                    <GalleryItem size={12 / ncols} user={users[i]} key={`${users[i].id}_gallery_item`} />
                );
            }

            // add the current row to the gallery
            rows.push(
                <IonRow key={index}>
                    {usersInRow}
                </IonRow>
            );

            // check if we can add another row with the given number of columns
            if ((index + ncols) < users.length) {
                index += ncols;
            } else {
                // otherwise check if we can add a row with at least one item in it
                index += users.length - ncols;

                if (index <= 0) {
                    break;
                }
            }
        }

        return rows;
    }

    render() {
        return (
            <IonGrid>
                {
                    this.getRows()
                }
            </IonGrid>
        );
    }
}

export default Gallery;