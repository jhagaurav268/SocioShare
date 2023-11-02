import { LightningElement } from 'lwc';

export default class MediaUpload extends LightningElement {
    handleImage(event){
        if(event.target.files.length > 0){
            var src = URL.createObjectURL(event.target.files[0]);
            console.log('src'+src);
            this.dispatchEvent(new CustomEvent('fileuploaded', {
            detail:  src }
            ));
        }
    }
}