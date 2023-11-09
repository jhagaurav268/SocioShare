import { LightningElement, track } from 'lwc';
import fetchConfigurations from "@salesforce/apex/PlatformSettingsController.fetchConfigurations";
import upsertExternalServiceSetting from "@salesforce/apex/PlatformSettingsController.upsertExternalServiceSetting";
// //  import checkAccessTokenGenerated from "@salesforce/apex/PlatformSettingsController.checkAccessTokenGenerated";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


import { EXTERNAL_SERVICES, POPUP_CONFIGURATIONS } from './platformSettingsConstants';

export default class PlatformSettings extends LightningElement {


  @track externalServices = EXTERNAL_SERVICES;
  @track popupConfigurations = POPUP_CONFIGURATIONS; // Stores required inputs for each services

  currentPopupConfiguration = null; // Stores current Popup Configuration for Selected Service by User
  currentHelpPopup = null; // Stores current Help Popup Configuration for a selected input on Selected Popup 
  selectedService = null; // Stores the currently selected service
  isLoading = false;// Flag which determines when to show/hide Loading animation
  redirectUrls = null; // Contains redirect URL required for OAuth Based Services like GCP Storage, OneDrive
  oAuthSettings = null; // Stores OAuth URLs and other settings for OAuth Based Services like GCP Storage, OneDrive
  showInputPopup = false; // Flag which determines when to show/hide Input Popup

  connectedCallback() {
    var that = this;
    this.fetchConfigs(that); // Load all existing data (Existing records, oAuth Settings, Redirect URLS dynamically)

  }
  fetchConfigs(that) {
    that.isLoading = true;
    that.popupConfigurations = JSON.parse(JSON.stringify(POPUP_CONFIGURATIONS));

    fetchConfigurations({}).then(res => {
      console.log('Response==>', res);
      that.isLoading = false;
      if (res.success) {
        that.processExistingRecords(res.data.records, that);
        console.log(res.data.redirect_urls);
        that.processRedirectUrls(res.data.redirect_urls, that);
        that.redirectUrls = res.data.redirect_urls;
        that.oAuthSettings = res.data.oAuth_urls;
      } else {

      }
    }).catch(err => {
      that.isLoading = false;
      that.showToastMessage('Error!', err.body.message, 'error');
    })
  }

  /* 
Maps the existing records data (Active Field, Value etc) with Existing Json Structure.
*/
  processExistingRecords(records, that) {
    console.log('records==>', JSON.parse(JSON.stringify(records)));
    for (let settingName in records) {
      console.log(settingName, records[settingName]);
      let setting = records[settingName];
      console.log('settingName==>', JSON.parse(JSON.stringify(settingName)));
      // Mark enable/disable internal Services based on Existing records.
      // that.internalServices.forEach(function (service) {
      //   if (service.name == settingName) {
      //     service.enable = setting.Active__c;
      //   }
      // });

      // Mark enable/disable external Services based on Existing records.

      that.externalServices.forEach(function (service) {
        console.log('Extenster Servuce Inside ==>', service);
        if (service.name == settingName) {
          service.enable = setting.Active__c;
          service.disableDelete = service.disableEdit = false;

        }
      });

      // Populate Values if Settings already exists in Salesforce.
      if (that.popupConfigurations[settingName]) {
        console.log('in after if ==>', that.popupConfigurations[settingName]);
        that.popupConfigurations[settingName].inputs.forEach(function (input) {
          console.log('==input==>', JSON.parse(JSON.stringify(input)));
          for (const fieldName in setting) {
            console.log('input.name--', input.name);
            console.log('setting.--', setting);
            let fieldNameKey = input.name + '__c';
            console.log('fieldNameKey.-new-', fieldNameKey);

            if (fieldNameKey == fieldName) {
              input.value = setting[fieldName];
              console.log(' input.value.--', input.value);

            }
          }
        });
      }
      console.log('this.popupConfigurations--05' + JSON.stringify(this.popupConfigurations));
    }
  }

  /* 
    Maps the Redirect URL for each OAuth Based service with Popup readonly Input.
  */

  processRedirectUrls(redirectUrls, that) {
    for (const serviceName in redirectUrls) {
      console.log('serviceName', redirectUrls[serviceName]);
      that.popupConfigurations[serviceName].readOnly[0].value = redirectUrls[serviceName];
    }
  }


  /* 
   Event which handles enable/disable on all External Services
 */
  handleExternalService(e) {
    var that = this;
    if (e.target.checked) { // If one service is marked enabled
      this.currentPopupConfiguration = this.popupConfigurations[e.target.value];
      // Load the relevant Popup configuration based on selected service
      console.log('this.popupConfigurations==>', this.popupConfigurations);
      console.log(' this.currentPopupConfiguration---- in external Services ', JSON.stringify(this.currentPopupConfiguration));
      // Enable the selected service and display relevant Input popup.
      this.externalServices.forEach(function (service) {
        if (service.name == e.target.value) {
          that.showInputPopup = true;
          service.enable = true; // Enable the service
          that.selectedService = service.name;// Mark which service is selected.
          // console.log('Service Name=',that.selectedService);
          // Show the relevant input popup
        }
      });
    } else {  // If one service is marked disabled
      // Disable service
      that.isLoading = true;

      // Disable the selected service.
      this.externalServices.forEach(function (service) {
        if (service.name == e.target.value) {
          service.enable = false;
          that.selectedService = service.name;
        }
      })

      // Update the existing setting record if it's marked disabled
      upsertExternalServiceSetting({
        settingName: that.selectedService,
        active: false,
        credentials: {}
      })
        .then((res) => {
          console.log('125', that.selectedService);
          that.showToastMessage('Success!', res.message, 'success');
          that.selectedService = null;
          that.isLoading = false;
        }).catch(err => {
          that.selectedService = null;
          that.isLoading = false;
          that.showToastMessage('Error!', err.body.message, 'error');
        })
    }
  }

  /*
Checks the user provided the required inputs 
*/
  hasUserInputs(userInputs) {
    var hasInputs = true;
    if (userInputs && Object.keys(userInputs).length > 0) {
      // check input has value
      for (var key in userInputs) {
        if (key && (typeof userInputs[key] === "undefined" || userInputs[key] == null || userInputs[key].trim() == "")) {
          hasInputs = false;
        }
      }
    } else {
      // else object is empty {}
      hasInputs = false;
    }
    return hasInputs;
  }

  /*
  Returns a map of all input name and value inside the popup.
*/
  getUserInputs(that) {
    var userInputs = {}
    let inputs = that.template.querySelectorAll(".input");
    inputs.forEach(function (input) {
      if (input.dataset.readonly == 'false') {
        userInputs[input.name] = input.value.trim();
      }
    });
    console.log('userInputs', userInputs);
    return userInputs;
  }

  /*
    Event that handles the userInput and displays error message if left blank.
  */

  handleUserInputChange(e) {
    // var bh = e.target.value;
    // this.harsh = bh;
    // console.log('Apple Console--'+ this.bh);
    if (e.target.value === '') {
      this.showUserInputError(e.target, 'block');
    } else {
      this.showUserInputError(e.target, 'none');
    }
    // console.log('handleUserInputChange------s- ' + JSON.stringify(handleUserInputChange));
  }

  /*
    Hide/Show Error message below each input.
  */
  showUserInputError(ele, status) {
    ele.nextElementSibling.style.display = status;
  }

  // closeRMSPopUp(){
  //   this.rmsPopUp = false;
  //   this.showInputPopup = false;
  // }


  /*
  Event which handles closing of the input popup
*/
  closeInputPopup(e) {
    this.showInputPopup = false;
    var that = this;
    // If popup is closed without submitting, then the selected service will be marked disabled.
    this.externalServices.forEach(function (service) {
      if (service.name == that.selectedService) {
        service.enable = false;
        that.selectedService = null;
      }
    });
  }


  /*
    Event that handles copy to clipboard
  */
  copyURLToClipboard(e) {
    var that = this;
    var textToCopy = e.target.dataset.url;
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(that, textToCopy);
      return;
    }
    navigator.clipboard.writeText(textToCopy).then(function () {
      that.showToastMessage('Success!', 'Text copied to clipboard!', 'success');
    }, function (err) {
      that.showToastMessage('Error!', 'Oops, unable to copy!', 'error');
    });
  }


  /*
   Event that handles Submitted User Inputs
 */

  handleUserInputsSubmit(e) {
    console.log('seledfg', this.selectedService);


    var that = this;
    var userInputs = this.getUserInputs(that);
    if (this.hasUserInputs(userInputs)) { // Check if input is not Blank
      this.showInputPopup = false;
      that.isLoading = true;
      let active = false;

      upsertExternalServiceSetting({ settingName: that.selectedService, active: active, credentials: userInputs })
        .then((res) => {
          // if (res.success) {
          var oAuthUrl = that.oAuthSettings[that.selectedService];
          console.log('OAuthURL', oAuthUrl);
          console.log('Resss', res);
          if (oAuthUrl) {
            var oAuthWindow;
            var windowSettings = "toolbar=yes,scrollbars=yes,resizable=yes,top=200,left=300,width=900,height=500";
            var responseType = "response_type=code";
            var clientId = "client_id=" + userInputs["Client_Id"].trim();
            var clientSecret = "Client_Secret=" + userInputs["Client_Secret"].trim();
            var redirectUrl = "redirect_uri=" + that.redirectUrls[that.selectedService];
            if (that.selectedService === "Facebook_Storage") {
              var scope = 'pages_manage_engagement,pages_manage_posts,pages_read_engagement'; 

              // var offline = "access_type=offline";
              // Redirect the user to oAuth Endpoint for Authorization
              try {
                oAuthWindow = window.open(oAuthUrl.OAuth_URL__c + "?" + responseType + "&" + clientId + "&" + scope + "&" + redirectUrl + "&_blank", windowSettings);
              } catch (error) {
                console.log('error -', error.message)
              }
            } else if (that.selectedService === "LinkedIn_Storage") {
              console.log('inside LinkedIn_Storage');
              var scope = "scope=w_member_social%20openid%20profile%20r_basicprofile%20w_organization_social%20rw_ads%20r_ads%20email";

              //var scope = "scope=https://www.googleapis.com/auth/devstorage.read_write"; 
              // var offline = "access_type=offline";
              // Redirect the user to oAuth Endpoint for Authorization
              try {
                oAuthWindow = window.open(oAuthUrl.OAuth_URL__c + "authorization?" + responseType + "&" + clientId + "&" + scope + "&" + redirectUrl + "&_blank", windowSettings);
              } catch (error) {
                console.log('error -', error.message)
              }
            }

            /*
               Keep checking every second that the window is closed or not, If it's closed than check Access Token is generated or not.
             */
            var interval = setInterval(function () {
              // if (oAuthWindow.closed) {
              //   checkAccessTokenGenerated({ settingName: that.selectedService }).then((re) => { // check Access Token is generated or not.
              //     if (re.success) {
              //       that.externalServices.forEach(function (service) {
              //         if (service.name != that.selectedService) {
              //           service.enable = false;
              //         }
              //       });
              //       that.showToastMessage('Success!', re.message, 'success');
              //     } else {
              //       that.externalServices.forEach(function (service) {
              //         if (service.name == that.selectedService) {
              //           service.enable = false;
              //         }
              //       });
              //       that.showToastMessage('Error!', re.message, 'error');
              //     }
              //     that.fetchConfigs(that); // refresh all existing configuration.
              //   });
              //   clearInterval(interval);
              // }
            }, 1000);
          }
          else { // If external service does not have any oAuth Configuration Like Facebook
            that.showToastMessage('Success!', res.message, 'success');
            that.fetchConfigs(that); // refresh all existing configuration.
          }
          // } else { // If Record save/update failed.
          //   that.showToastMessage('Error!', re.message, 'error');
          //   that.fetchConfigs(that); // refresh all existing configuration.
          // }
        })
        .catch((err) => {
          //console.log('Errr', err.message);
          that.externalServices.forEach(function (service) {
            if (service.name == that.selectedService) {
              service.enable = false;
            }
          });
          that.isLoading = false;
          that.selectedService = null;
          that.showToastMessage('Error!', err.body.message, 'error');
        })
    }
    else {
      // Show error when one or more inputs are empty and user clicks on Submit button.
      console.log('in here 393')
      let inputs = that.template.querySelectorAll(".input");
      inputs.forEach(function (input) {
        if (input.dataset.readonly == 'false') {
          if (input.value.trim() === '') {
            that.showUserInputError(input, 'block');
          }
        }
      });
    }
  }

  /*
   Method to show toast Message
 */
  showToastMessage = (title, message, variant) => {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }

}