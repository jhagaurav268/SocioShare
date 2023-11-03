import { LightningElement, api } from 'lwc';
import FACEBOOK_LOGO_URL from '@salesforce/resourceUrl/FacebookLogoIcon';
import LINKEDIN_LOGO_URL from '@salesforce/resourceUrl/LinkedInLogoIcon';

export default class PostDetails extends LightningElement {

    fburl = FACEBOOK_LOGO_URL;
    lnkdInurl = LINKEDIN_LOGO_URL;
    showTabs= false;
    captionText = '';

    changeHandleAction(event){
        console.log('hey this is me!');
        var thisObj = event.target.name;
        var sldsTabItemOver = this.template.querySelectorAll('.activePage');
        var sldsTabItemContent = this.template.querySelectorAll('.tabContent');
  
        for(var i=0; i<sldsTabItemOver.length; i++){
            sldsTabItemOver[i].classList.remove('activePage');
        }
        for(var i=0;i<sldsTabItemContent.length;i++){
            sldsTabItemContent[i].classList.add('slds-hide');
            sldsTabItemContent[i].classList.remove('slds-show');
        }
 
        this.template.querySelector('[data-id="'+thisObj+'"').classList.add('activePage'); 
        this.template.querySelector('[data-id="active'+thisObj+'"').classList.remove('slds-hide');
        this.template.querySelector('[data-id="active'+thisObj+'"').classList.add('slds-show');
 
    }

    handleIsActive(event){
        console.log('isActive',event.target.checked);
        var checkToggle = event.target.checked;
        if(checkToggle === true){
            this.showTabs= true;
        }else{
            this.showTabs= false;
        }
        
    }
    handleText(event){
        this.captionText = event.target.value;
        console.log(event.target.value);
        this.dispatchEvent(new CustomEvent('textchange', {
        detail:  event.target.value }
        ));
    }

    @api clearData(){
        this.captionText = '';
        this.showTabs= false;
    }
}