import LightningDatatable from 'lightning/datatable';
import customImage from './customImage.html';

export default class ImageControl extends LightningDatatable {
    static customTypes = {
        customImage: {
            template: customImage
        }
    };
}