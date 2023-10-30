import { LightningElement, api, track } from 'lwc';
import facebookLogoIcon from '@salesforce/resourceUrl/FacebookLogoIcon';
import imagePreview from '@salesforce/resourceUrl/ImagePreview';
export default class FacebookPreview extends LightningElement {
    fbIcon = facebookLogoIcon;
    imgPreview = imagePreview;
    imgURL;
    @track selectedOption;
    changeHandler(event) {
        const field = event.target.name;
        if (field === 'optionSelect') {
            this.selectedOption = event.target.value;
            alert("you have selected : " + this.selectedOption);
        }
    }
    @api
    showPreview(src) {
        var preview = this.template.querySelector("[data-id='file-ip-1-preview']");
        this.imgURL = src;
        preview.src = src;
        preview.style.display = "block";
    }
    @api
    showText(txt) {
        if (this.imgURL === undefined || this.imgURL === null || this.imgURL === '') {
            var preview = this.template.querySelector("[data-id='file-ip-1-preview']");
            preview.src = '';
            preview.style.display = "none";
        }
        var preview = this.template.querySelector("[data-id='demo']");
        preview.innerHTML = txt;
    }
}