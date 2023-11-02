import { LightningElement } from 'lwc';

export default class PlatformPost extends LightningElement {
    handleChildEvent(event){
        console.log('heyyyyy',event.detail);
        const previewComp = this.template.querySelector('c-facebook-preview');
        previewComp.showPreview(event.detail);
    }
    handleTxtChng(event){
        const previewComp = this.template.querySelector('c-facebook-preview');
        previewComp.showText(event.detail);
    }
}