import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const CORS_API = 'https://cors-anywhere.herokuapp.com/';
const LINKEDIN_API = 'https://api.linkedin.com';
const GRANT_TYPE = 'refresh_token';
const REFRESH_TOKEN = 'AQUG4P-QRkhc2bRlItZ1XcnTilChZnRn5iSG8gZYXgDnEjLH1A1lCs_NTCcGi3liVF-eYc5CecU48Uwi6keNqPdjQgHRc1xZ0i_sLkZaididiWiFQtSntTCFTeP_fb1je2Z1xPgIEZketGiaHeQQ4So712lCNySF3XUvRnQWAi6fC6jwPd0tXwrgyQenOrvkP5egFttje5AzE6_jKpkHiW6C9tY8yWDwwpwXAovnyTwDAfh8-vZRAiDsHHK0whkE6cPgJGW3CDdAH9qAHbToCvaqnvR7gyaEWI8vydDqwfKSLzhd61K6XAPJTCtyUqA3r_9EvRPb5A64VIsuaPZo07dALFrcbA';
const CLIENT_ID = '77mylzbhvl2qwv';
const CLIENT_SECRET = 'EaG4583mE2fdgRqz';
const AUTH_TOKEN_API = 'https://www.linkedin.com';

export default class PublishPost extends LightningElement {
    @api textDetail;
    @api imgDetail;

    isLoading = false;
    accessToken;
    userId;

    async connectedCallback() {
        try {
            const accessToken = await this.fetchAccessToken();

            if (accessToken) {
                const userInfo = await this.fetchUserInfo(accessToken);

                if (userInfo) {
                    this.userId = userInfo.sub;
                    console.log(this.userId);
                }
            }
        }
        catch (error) {
            console.error('API Request Error:', error);
        }
    }

    async fetchAccessToken() {
        const apiUrl = `${CORS_API}${AUTH_TOKEN_API}/oauth/v2/accessToken`;
        const formData = new URLSearchParams();
        formData.append('grant_type', GRANT_TYPE);
        formData.append('refresh_token', REFRESH_TOKEN);
        formData.append('client_id', CLIENT_ID);
        formData.append('client_secret', CLIENT_SECRET);

        try {

            const headers = {
                'Origin': 'https://connect-innovation-1672-dev-ed.scratch.lightning.force.com',
                'Content-Type': 'application/x-www-form-urlencoded',
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: formData.toString(),
            });

            if (response.ok) {
                const responseData = await response.json();
                this.accessToken = responseData.access_token;
                return this.accessToken;
            } else {
                return null;
            }
        } catch (error) {
            console.error('API Request Error:', error);
        }
    }

    async fetchUserInfo(accessToken) {
        const userInfoUrl = `${CORS_API}${LINKEDIN_API}/v2/userinfo`;
        const userInfoHeader = {
            'Authorization': 'Bearer ' + accessToken,
        };

        const userInfoResponse = await fetch(userInfoUrl, {
            method: 'GET',
            headers: userInfoHeader,
        });

        if (userInfoResponse.ok) {
            const userResponseData = await userInfoResponse.json();
            return userResponseData;
        } else {
            console.error('Request failed with status:', userInfoResponse.status);
            return null;
        }
    }

    handlePublish() {
        this.textDetail = this.textDetail.replace(/<\/?p>/g, '')
        this.postMessageToLinkedIn();
    }

    async callLinkedInAPI(apiUrl, apiHeaders, payload) {
        try {
            const headers = {
                'Origin': 'https://connect-innovation-1672-dev-ed.scratch.lightning.force.com',
                'Content-Type': apiHeaders,
                'Authorization': 'Bearer ' + this.accessToken
            };
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: payload
            });
            if (response.ok) {
                let responseData = null;

                const etag = response.headers.get('ETag');

                if (etag) {
                    return etag;
                }

                if (response.headers.get('content-length') !== '0') {
                    responseData = await response.json();
                }

                return responseData;
            } else {
                this.isLoading = false;
                console.error('API Request failed:', response.statusText);
            }
        } catch (error) {
            this.isLoading = false;
            console.error('API Request Error:', error);
        }
    }

    showToast(message, variant, title) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    postMessageToLinkedIn() {
        var selectedEvent = new CustomEvent('postclicked', {
            detail: true
        });
        this.dispatchEvent(selectedEvent);

        const apiUrl = `${CORS_API}${LINKEDIN_API}/v2/ugcPosts`;

        const payload = {
            author: 'urn:li:person:' + this.userId,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: this.textDetail
                    },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        };

        this.callLinkedInAPI(apiUrl, 'application/json', JSON.stringify(payload)).then((data) => {
            if (data) {
                var selectedEvent = new CustomEvent('postclicked', {
                    detail: false
                });
                this.dispatchEvent(selectedEvent);
                this.showToast('Message posted on LinkedIn', 'success', 'Successful');
                window.location.reload();
            }
        }).catch((error) => {
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }
}