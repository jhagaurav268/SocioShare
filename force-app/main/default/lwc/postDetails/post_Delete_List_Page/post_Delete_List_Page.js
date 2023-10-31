import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import socioshareData from '@salesforce/apex/SocioShareRecords.socioshareData';
import LightningConfirm from "lightning/confirm";
import { deleteRecord } from 'lightning/uiRecordApi';
import { gql, graphql } from 'lightning/uiGraphQLApi';
import { NavigationMixin } from 'lightning/navigation';

const API_TOKEN = 'AQV1cupGKxoR1ALqcYv4tYpFp8s2tCAUMVn_F2YcMnFTS_BE_R0EDXbkx94PHJ3_EQ0HZCIOtmFWWVocNIvUMWizpKVZSAkF-W0gSJF1gezoriuqWL0jUgomhXh_6OQfbMPapwYt6_KNoB-n58FEdAHkW_2SwgQsY1bprGYCXck47Ho8XkKE8Pk_7y92c1uAvDFWsyfvQTdi_hVLx5rUi8wqx_VgnhmtRQw9lfTM2JHu3iTzhLDl_p51gox2sOYgZedtsGNEvu2M0RbJ1rp2dOLId-HMgfm_ulyxZjaV9r25_eK1kHzDIuXX1_m4YTnYLQm7RlWJ-Nmb7WABA8H9zhpHrivtmuZxFKFVcv_CQiSO8NHLGLZPwSoNvldt20B-Ssj6K9JJ9cJ5JkNhZv4';
const LINKEDIN_API = 'https://api.linkedin.com';

const columns = [
    { label: 'Sr.No', fieldName: 'rowNumber', type: 'number', cellAttributes: { alignment: 'left' }, initialWidth: 110 },
    { label: 'Image', fieldName: 'ImageURL__c', type: 'customImage', initialWidth: 180, cellAttributes: { alignment: 'center' } },
    { label: 'Caption', fieldName: 'Caption', type: 'url', sortable: "true", typeAttributes: { label: { fieldName: 'Caption__c' }, target: '_blank' } },
    { label: 'Posted On', fieldName: 'Posted_On__c', type: 'text', sortable: "true", initialWidth: 200 },
    { label: 'Scheduled For', fieldName: 'Scheduled_On__c', type: 'text', sortable: "true", initialWidth: 200 },
    { label: 'Platform', fieldName: 'Platform_Img__c', type: 'customImage', initialWidth: 200, cellAttributes: { alignment: 'center' } },
    { label: 'Action', type: 'button-icon', title: 'Delete', typeAttributes: { iconName: 'utility:delete', name: 'delete', iconClass: 'slds-icon-text-error' }, cellAttributes: { alignment: 'left' }, initialWidth: 80, }
];

export default class Post_Delete_List_Page extends NavigationMixin(LightningElement) {


    pageSizeOptions = [10, 25, 50, 75, 100];
    columns = columns;
    totalRecords = 0;
    bDisableFirst = true;
    bDisableLast = false;
    pageSize;
    totalPages;
    pageNumber = 1;
    @track recordsToDisplay = [];
    sortBy;
    sortDirection = 'asc';
    filteredData;
    @track selectedRows = [];
    sortedField = 'Caption__c';
    @track RecordIds = [];
    records = [];
    checked = false;
    fixedWidth = "width:8.75rem;";
    recId;

    // @wire(graphql, {
    //     query: gql`
    //       query GetPosts {
    //         uiapi {
    //           query {
    //             Post__c(first: 50) {  // Replace "Account" with "Post__c"
    //               edges {
    //                 node {
    //                   Id
    //                   Name{
    //                       value
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     `,
    //   })
    //   graphqlQueryResult({ data, errors }){
    //     if (data) {
    //       let results = data.uiapi.query.Post__c.edges.map((edge) => edge.node);
    //     }
    //     this.errors = errors;
    //   }

    connectedCallback() {
        let tempConList = [];
        socioshareData()
            .then(result => {
                let rec = result;
                console.log('rec', rec);
                for (var i = 0; i < rec.length; i++) {
                    rec[i].rowNumber = i + 1;
                    let tempRec = Object.assign({}, rec[i]);
                    tempRec.Caption = tempRec.Caption__c;
                    tempConList.push(tempRec);

                };
                this.records = tempConList;
                console.log('Records ==>', this.records);
                this.totalRecords = result.length; // update total records count                 
                this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
                this.paginationHelper();
            }).catch(error => {
                console.error('Error executing batch:', error);
            });


    }


    changeToggle(event) {
        this.checked = event.target.checked;
        this.filterData();
    }

    filterData() {
        let filteredDatas = this.recordsToDisplay;
        if (this.checked) {
            this.filteredData = filteredDatas.filter(item => item.Scheduled_On__c);
        } else {
            this.filteredData = filteredDatas;
        }
    }

    navigateToRecord() {
        const recordId = event.currentTarget.dataset.id;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }

    handleRecordsPerPage(event) {
        this.pageSize = event.target.value;
        this.paginationHelper();
    }
    previousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
        this.bDisableLast = false;
        if (this.pageNumber === 1) {
            this.bDisableFirst = true;

        }
    }
    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
        this.bDisableFirst = false;
        if (this.pageNumber === this.totalPages) {
            this.bDisableLast = true;

        }
    }
    firstPage() {
        this.pageNumber = 1;
        this.bDisableFirst = true;
        this.paginationHelper();
        this.bDisableLast = false;
    }
    lastPage() {
        this.pageNumber = this.totalPages;
        this.paginationHelper();
        this.bDisableFirst = false;
        this.bDisableLast = true;

    }

    paginationHelper() {
        this.recordsToDisplay = [];
        // calculate total pages
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        // set page number 
        if (this.pageNumber <= 1) {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
            if (i === this.totalRecords) {
                break;
            }
            this.recordsToDisplay.push(this.records[i]);
        }
    }
    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.recordsToDisplay));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1 : -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.recordsToDisplay = parseData;
    }
    handleRowAction() {
        console.log('currentRow', JSON.stringify(event.detail.action));
        console.log('Id', JSON.stringify(event.detail.row));
        const action = event.detail.action;
        const row = event.detail.row;
        if (action.name === 'delete') {
            this.handleConfirmClick()
            this.recId = row.Id;
        }
    }
    async handleConfirmClick() {
        const result = await LightningConfirm.open({
            message: "Are you sure to delete the record?",
            variant: "default",
            label: "Delete a post",
            theme: "warning"
        });
        if (result === true) {
            this.DeleteHandler();
        }
    }
    async DeleteHandler(event) {
        const apiUrl = `${LINKEDIN_API}/v2/shares/urn:li:share:7124459036862799872`;//'https://api.linkedin.com/v2/shares/urn:li:share:7120305897922281472';//+deleteId;``

        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
            });
            console.log('response ', response);
            if (response.ok) {
                console.log('API Response:', response.ok);
            } else {
                console.error('API Request failed:', response.statusText);
            }
        } catch (error) {
            console.error('API Request Error:', error);
        }
        // console.log('this.recId', this.recId);
        // deleteRecord(this.recId).then(() => {
        //     console.log('under event');
        //     this.dispatchEvent(
        //         new ShowToastEvent({
        //             title: 'Success',
        //             message: 'Record deleted successfully',
        //             variant: 'success'
        //         })
        //     );
        //     window.location.reload();
        // }).catch((error) => {
        //     this.dispatchEvent(
        //         new ShowToastEvent({
        //             title: 'Error',
        //             message: 'Error Deleting record',
        //             variant: 'error'
        //         })
        //     );
        // });
    }


}