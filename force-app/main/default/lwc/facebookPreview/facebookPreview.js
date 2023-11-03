import { LightningElement, api, track } from 'lwc';
import facebookLogoIcon from '@salesforce/resourceUrl/FacebookLogoIcon';
import LinkedInLogoIcon from '@salesforce/resourceUrl/LinkedInLogoIcon';
import imagePreview from '@salesforce/resourceUrl/ImagePreview';
export default class FacebookPreview extends LightningElement {
    fbIcon = facebookLogoIcon;
    linkIcon=LinkedInLogoIcon;
    imgPreview = imagePreview;
    imgURL;
    pagePreview = true;
    linkPreview = false;
    @track selectedOption;
    changeHandler(event) {
        const field = event.target.name;
        if (field === 'optionSelect') {
            this.selectedOption = event.target.value;
            switch (this.selectedOption) {
                case 'Facebook':
                    this.pagePreview = true;
                    break;
                case 'LinkedIn':
                    this.pagePreview = false;
                    break;
                default:
            }
    
        }
    }


    @api
    showPreview(src) {
        console.log('heyyyyy2', src);
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

    @api clearData(){
        this.imgURL = null;
        this.pagePreview = true;
        this.linkPreview = false;
    }
}