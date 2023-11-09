import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import socioshareData from '@salesforce/apex/SocioShareRecords.socioshareData';
import LightningConfirm from "lightning/confirm";
import { deleteRecord } from 'lightning/uiRecordApi';
import { gql, graphql } from 'lightning/uiGraphQLApi';
import { NavigationMixin } from 'lightning/navigation';
import blankImg from '@salesforce/resourceUrl/blankImg';

const LINKEDIN_API = 'https://api.linkedin.com';
const CORS_API = 'https://cors-anywhere.herokuapp.com/';


const columns = [
    { label: 'Sr.No', fieldName: 'rowNumber', type: 'number', cellAttributes: { alignment: 'left' },initialWidth:100},
    { label: 'Image', fieldName: 'ImageData__c', type: 'customImage', cellAttributes: { alignment: 'center' },initialWidth:150 },
    { label: 'Caption', fieldName: 'Caption', type: 'url', sortable: "true", typeAttributes: { label: { fieldName: 'Caption__c' }, target: '_blank' } },
    { label: 'Posted On', fieldName: 'Posted_On__c', type: 'text', sortable: "true" },
    { label: 'Scheduled For', fieldName: 'Scheduled_On__c', type: 'text', sortable: "true" },
    { label: 'Platform', fieldName: 'Platform_Img__c', type: 'customImage', cellAttributes: {class:"slds-align_absolute-center", }},
    { label: '', type: 'button-icon', title: 'Delete', typeAttributes: { iconName: 'utility:delete', name: 'delete', iconClass: 'slds-icon-text-error' }, cellAttributes: { alignment: 'center' },initialWidth:6 },
    { label: '', type: 'button-icon', title: 'Preview', typeAttributes: { iconName: 'action:preview', name: 'Preview', variant: 'brand' }, cellAttributes: { alignment: 'center' }, initialWidth:6}
   
];


export default class Post_Delete_List_Page extends NavigationMixin(LightningElement) {


    pageSizeOptions = [10, 25, 50, 75, 100];
    columns = columns;
    totalRecords = 0;
    bDisableFirst = true;
    bDisableLast = false;
    pageSize;
    totalPages;
    isLoading = false;
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
    apiUrl;
    headers;
    API_TOKEN;

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
                for (var i = 0; i < rec.length; i++) {
                    rec[i].rowNumber = i + 1;
                    
                     if(rec[i].ImageData__c === undefined){
                         let baseURL = window.location.origin;
                        rec[i].ImageData__c = baseURL + '//resource/blankImg'; 
                        console.log(' rec[i].ImageData__c==>', rec[i].ImageData__c);
                     }
                      let tempRec = Object.assign({}, rec[i]);
                      tempRec.Caption = tempRec.Caption__c;
                     tempConList.push(tempRec);
                };
                this.records = tempConList;
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
         console.log('action.name',action.name);
        const row = event.detail.row;
         this.recId = row.Id;
        if (action.name === 'delete') {
            this.handleConfirmClick()
           }
           if(action.name === 'Preview'){
               console.log('action.name',action.name);
            this.navigateToRecord();
        }
        if (row.Platform_Name__c === 'Facebook') {
            this.apiUrl = `https://graph.facebook.com/v18.0/${row.Post_Id__c}`;
        }else if (row.Platform_Name__c === 'LinkedIn') {
            this.apiUrl = `${CORS_API}${LINKEDIN_API}/v2/posts/${row.Post_Id__c}`;
        }
        this.API_TOKEN = row.Platform_Setting__r.Access_Token__c;
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
    navigateToRecord(event) {
     this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: this.recId,
            actionName: 'view'
        }
    });
}
    async DeleteHandler(event) {
       this.isLoading = true;
       try {
            const headers = {   
                'Authorization': 'Bearer ' + this.API_TOKEN,
                'Origin': 'https://page-innovation-2217-dev-ed.scratch.lightning.force.com',
            };
            const response = await fetch(this.apiUrl, {
                method: 'DELETE',
                headers: headers
            });
            console.log('response ', response);
            if (response.ok) {
                console.log('API Response:', response.ok);
                this.deletePostRecord();     
            } else {
                this.isLoading = false;
                console.error('API Request failed:', response.statusText);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error Deleting record',
                        variant: 'error'
                    })
                );
            }
        } catch (error) {
            this.isLoading = false;
            console.error('API Request Error:', error);
        }
        
        
    }

    deletePostRecord(){
        deleteRecord(this.recId).then(() => {
                console.log('under event');
                this.isLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted successfully',
                        variant: 'success'
                    })
                );
                window.location.reload();
            }).catch((error) => {
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Error',
                //         message: 'Error Deleting record',
                //         variant: 'error'
                //     })
                // );
            });
    }
}