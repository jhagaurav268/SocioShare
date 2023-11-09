import { LightningElement, api, track } from 'lwc';

export default class SchedulePostPage extends LightningElement {
    @track isModalOpen = false;

    openModal() {
        this.isModalOpen = true;
    }
    closeModal() {
        console.log('click');
        const customEvent = new CustomEvent('closemodal', { detail: false});
        this.dispatchEvent(customEvent);
    }
    submitDetails() {
        this.isModalOpen = false;
    }
}