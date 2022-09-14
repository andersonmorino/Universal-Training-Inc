import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getTrainingClasses from '@salesforce/apex/TrainingClassRegisterController.getTrainingClasses';
import bookTrainingClasses from '@salesforce/apex/TrainingClassRegisterController.bookTrainingClasses';

let i = 0;
export default class registerForTrainingClasses extends LightningElement {

    @track items = [];
    @track value = '';
    @track allValues = [];
    @track allValuesToInsert = [];
    @track register;

    @wire(getTrainingClasses)
    wiredTrainingClasses({ error, data }) {
        if (data) {
            for (i = 0; i < data.length; i++)  {
                this.items = [
                    ...this.items,
                    {
                        value: data[i].Id,
                        label: data[i].Subject + ' - ' + data[i].StartDateTime + ' to ' + data[i].EndDateTime + ' Duration: ' + data[i].DurationInMinutes + ' minutes'
                    }
                ];                                   
            }
            this.error = undefined;

            if (this.items.length === 0) {
                this.showInfoToast();
            }
        } else if (error) {
            this.error = error;
        }
    }

    get trainingOptions() {
        return this.items;
    }

    handleChange(event) {
        let labels = event.target.options.find(opt => opt.value === event.detail.value).label;
        let trainingClassId = event.target.value;

        if(!this.allValues.includes(labels)) {
            this.allValues.push(labels);
            this.allValuesToInsert.push(trainingClassId);
            console.log("this.allValuesToInsert change: ", this.allValuesToInsert);
        }
    }

    handleRemove(event) {
        const valueRemoved = event.target.name;
        this.allValues.splice(this.allValues.indexOf(valueRemoved), 1);
        this.allValuesToInsert.splice(this.allValuesToInsert.indexOf(valueRemoved), 1);
        console.log("this.allValuesToInsert remove: ", this.allValuesToInsert);
    }

    saveRecord() {
        bookTrainingClasses({ trainingClasses: this.allValuesToInsert })
            .then(() => {
                if (this.allValuesToInsert.length === 0) {
                    this.showWarningToast();
                } else {
                    this.showSuccessToast();
                }
            })
            .catch((error) => {
                console.log("error: ", error);
                this.showNotification("Error", error.body.message, "error");
            });
    }
    
    showSuccessToast() {
        const evt = new ShowToastEvent({
            title: 'Registration Success',
            message: 'You have successfully registered for one or more Training Classes!',
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

    showInfoToast() {
        const evt = new ShowToastEvent({
            title: 'No Upcoming Training Classes',
            message: 'There is no upcoming Training Classes to register.',
            variant: 'info',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

    showWarningToast() {
        const evt = new ShowToastEvent({
            title: 'No Selected Training Classes',
            message: 'Please select one or more Training Classes.',
            variant: 'warning',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
          title: title,
          message: message,
          variant: variant
        });
        this.dispatchEvent(evt);
    }
    
      connectedCallback() {}    
}