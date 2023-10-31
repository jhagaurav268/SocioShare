import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export const showToastMessage = (that, title, message, variant) => {
    const event = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant
    });
    that.dispatchEvent(event);
}