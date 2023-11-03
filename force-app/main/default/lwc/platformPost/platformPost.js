import { LightningElement } from 'lwc';

export default class PlatformPost extends LightningElement {
    textData;
    imageData;
    isLoading = false;

    handleChildEvent(event) {
        const previewComp = this.template.querySelector('c-facebook-preview');
        previewComp.showPreview(event.detail.src);
        this.imageData = event.detail.file;
    }
    handleTxtChng(event) {
        const previewComp = this.template.querySelector('c-facebook-preview');
        previewComp.showText(event.detail);
        this.textData = event.detail;
        console.log('text data ', this.textData);
    }
    handlePostClicked(event) {
        this.isLoading = event.detail;
    }
    clearData() {
        console.log('Event Called');
        this.textData = '';
        this.imageData = '';
        const postComp = this.template.querySelector('c-post-details');
        postComp.clearData();
        const previewComp = this.template.querySelector('c-facebook-preview');
        previewComp.clearData();
    }
}