import { LightningElement, api } from 'lwc';
import facebookLogoStatic from '@salesforce/resourceUrl/FacebookLogo';
import InstgramLogoStatic from '@salesforce/resourceUrl/InstgramLogo';
import linkedInLogoStatic from '@salesforce/resourceUrl/LinkedInLogo';

export default class PlatformPage extends LightningElement {
    logo;
    buttonLabel;
    showSetting = false;
    @api parentId;

    openCreatePost = false;
    successPostScreen = false;


    connectedCallback() {
        switch (this.parentId) {
            case 'fb': this.logo = facebookLogoStatic;
                this.buttonLabel = 'Create a Facebook Post'
                break;
            case 'insta': this.logo = InstgramLogoStatic;
                this.buttonLabel = 'Create a Instagram Post'
                break;
            case 'lnkdIn': this.logo = linkedInLogoStatic;
                this.buttonLabel = 'Create a LinkedIn Post'
                break;
            default:
        }
    }

    handlePost(event) {
        this.successPostScreen = false;
        this.openCreatePost = true;
    }

    handleCancel(event) {
        console.log('event.detail', event.detail)
        var childId = event.detail;
        switch (childId) {
            case 'fb': this.openCreatePost = false;
                break;
            case 'insta': this.openCreatePost = false;
                break;
            case 'lnkdIn': this.openCreatePost = false;
                break;
            default:
        }
    }
    createPost(event) {
        console.log('event create post 1', event.detail);
        var bid = event.detail;
        console.log('bid', bid);
        switch (bid) {
            case 'fb': this.successPostScreen = true;
                this.openCreatePost = false;
                break;
            case 'insta': this.succssPostScreen = true;
                this.openCreatePost = false;
                break;
            case 'lnkdIn': this.successPostScreen = true;
                this.openCreatePost = false;
                break;
            default:
        }

    }

    handleScreens(bid) {
        switch (bid) {
            case 'fb': this.successPostScreen = false;
                this.openCreatePostForFB = true;
                break;
            case 'insta': this.succssPostScreen = false;
                this.openCreatePost = true;
                break;
            case 'lnkdIn': this.successPostScreen = false;
                this.openCreatePost = true;
                break;
            default:
        }
    }
  
    handleSetting(event){
        var setId = event.currentTarget.dataset.id;
        console.log('setId', setId);
        console.log('showSetting', this.showSetting);
        if(setId == 'set'){
            this.showSetting = true;
        }

        console.log('after showSetting', this.showSetting);

    }
}