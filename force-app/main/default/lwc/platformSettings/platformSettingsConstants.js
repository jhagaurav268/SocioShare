import FacebookLogo from "@salesforce/resourceUrl/FacebookLogo";
import LinkedInLogo from "@salesforce/resourceUrl/LinkedInLogo";
export const EXTERNAL_SERVICES = [

  {
    title: "Facebook Platform",
    subtitle: "Use Facebook Platform Powered by Marketing Autoflow.",
    name: "Facebook_Storage",
    enable: false,
    disableEdit: true,
    disableDelete: true,
    Watermark: FacebookLogo,
  },
  {
    title: "LinkedIn Platform",
    subtitle: "Use LinkedIn Platform Powered by Marketing Autoflow.",
    name: "LinkedIn_Storage",
    enable: false,
    disableEdit: true,
    disableDelete: true,
    Watermark: LinkedInLogo, //LinkedInLogo
  }
];

export const POPUP_CONFIGURATIONS = {
  "Facebook_Storage": {
    popupTitle: "Facebook Platform",
    popupHeading: "Step 1: Please copy your Redirect URI",
    helpContent: "How to Configure?",
    //link: "https://www.cloudsciencelabs.com/filemanagerconfiguration",
    readOnly: [
      {
        name: "redirect_uri",
        label: "Redirect URI",
        helpText: "Help Text",
        helpContent: "Follow the steps given in the link.",
        //link: "https://www.cloudsciencelabs.com/filemanagerconfiguration",
        value: ''
      },
    ],
    inputHeading: "Step 2: Please enter your Facebook Credentials",
    inputs: [
      {
        name: "Client_Id",
        label: "Client ID",
        helpContent: "Want to find the CLient Id? Click on the link below to see the steps:",
        helpText: "Help Text",
        //link: "https://www.cloudsciencelabs.com/filemanagerconfiguration",
        value: ''
      },
      {
        name: "Client_Secret",
        label: "Client Secret",
        helpContent: "Want to find the Client Secret? Click on the link below to see the steps:",
        helpText: "Help Text",
        //link: "https://www.cloudsciencelabs.com/filemanagerconfiguration",
        value: ''
      },
    ],
  },
  "LinkedIn_Storage": {
    popupTitle: "LinkedIn Platform",
    popupHeading: "Step 1: Please copy your Redirect URI",
    helpContent: "How to Configure?",
    //link: "https://www.cloudsciencelabs.com/filemanagerconfiguration",
    readOnly: [
      {
        name: "redirect_uri",
        label: "Redirect URI",
        helpText: "Help Text",
        helpContent: "Follow the steps given in the link.",
        //link: "https://www.cloudsciencelabs.com/filemanagerconfiguration",
        value: ''
      },
    ],
    inputHeading: "Step 2: Please enter your Facebook Credentials",
    inputs: [
      {
        name: "Client_Id",
        label: "Client ID",
        helpContent: "Want to find the CLient Id? Click on the link below to see the steps:",
        helpText: "Help Text",
        //link: "https://www.cloudsciencelabs.com/filemanagerconfiguration",
        value: ''
      },
     /* {
        name: "Scope",
        label: "Scope",
        helpContent: "Want to find the Scope? Click on the link below to see the steps:",
        helpText: "Help Text",
        //link: "https://www.cloudsciencelabs.com/filemanagerconfiguration",
        value: ''
      },*/
      {
        name: "Client_Secret",
        label: "Client Secret",
        helpContent: "Want to find the Client Secret? Click on the link below to see the steps:",
        helpText: "Help Text",
        //link: "https://www.cloudsciencelabs.com/filemanagerconfiguration",
        value: ''
      },
    ],
  }
}