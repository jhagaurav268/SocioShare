import { LightningElement } from 'lwc';
import facebookLogoIcon from '@salesforce/resourceUrl/FacebookLogoIcon';
import linkedInLogoIcon from '@salesforce/resourceUrl/LinkedInLogoIcon';
export default class SchedulingOptions extends LightningElement {
    fbIcon = facebookLogoIcon;
    InkIcon = linkedInLogoIcon;
    IsActive = false;

    changeToggle(event){
        if(event.target.checked){
            this.IsActive = true;
        }else{
            this.IsActive = false;
        }
    }
}