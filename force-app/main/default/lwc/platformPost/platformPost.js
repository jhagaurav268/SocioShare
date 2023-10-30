import { LightningElement } from 'lwc';

export default class PlatformPost extends LightningElement {
    textData;
    imageData;
    isLoading = false;

    handleChildEvent(event){
        console.log('heyyyyy',event.detail);
        const previewComp = this.template.querySelector('c-facebook-preview');
        previewComp.showPreview(event.detail);
        this.imageData = event.detail;
    }
    handleTxtChng(event){
        const previewComp = this.template.querySelector('c-facebook-preview');
        previewComp.showText(event.detail);
        this.textData = event.detail;
    }
    handlePostClicked(event){
        this.isLoading = event.detail;
    }
}