import { LightningElement } from 'lwc';

export default class PostDetails extends LightningElement {
    handleText(event){
        console.log(event.target.value);
        this.dispatchEvent(new CustomEvent('textchange', {
        detail:  event.target.value }
        ));
    }
}