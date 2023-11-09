import { LightningElement, api} from 'lwc';


export default class CreatePostPage extends LightningElement {
  
    showSetting = false;


    handleCancel(event){
            const selectedEvent = new CustomEvent('cancelevent');      
        this.dispatchEvent(selectedEvent);


    }

    handlePost(event){
            const selectedEvent = new CustomEvent('postevent');       
        this.dispatchEvent(selectedEvent);


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

    closeModal(){
        this.showSetting = false;
    }

}