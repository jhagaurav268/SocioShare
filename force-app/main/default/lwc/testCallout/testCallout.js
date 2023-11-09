import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const CORS_API = 'https://cors-anywhere.herokuapp.com/';
const LINKEDIN_API = 'https://api.linkedin.com';
const GRANT_TYPE = 'refresh_token';
const REFRESH_TOKEN = 'AQUG4P-QRkhc2bRlItZ1XcnTilChZnRn5iSG8gZYXgDnEjLH1A1lCs_NTCcGi3liVF-eYc5CecU48Uwi6keNqPdjQgHRc1xZ0i_sLkZaididiWiFQtSntTCFTeP_fb1je2Z1xPgIEZketGiaHeQQ4So712lCNySF3XUvRnQWAi6fC6jwPd0tXwrgyQenOrvkP5egFttje5AzE6_jKpkHiW6C9tY8yWDwwpwXAovnyTwDAfh8-vZRAiDsHHK0whkE6cPgJGW3CDdAH9qAHbToCvaqnvR7gyaEWI8vydDqwfKSLzhd61K6XAPJTCtyUqA3r_9EvRPb5A64VIsuaPZo07dALFrcbA';
const CLIENT_ID = '77mylzbhvl2qwv';
const CLIENT_SECRET = 'EaG4583mE2fdgRqz';
const AUTH_TOKEN_API = 'https://www.linkedin.com';

export default class TestCallout extends LightningElement {
    acceptedFormats = ['.png', '.jpg', '.gif', '.mp4'];
    imageData;
    file;
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

    handleUpload(event) {
        this.file = event.detail.files[0];
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
        this.isLoading = true;
        const apiUrl = `${CORS_API}${LINKEDIN_API}/v2/ugcPosts`;

        const payload = {
            author: 'urn:li:person:' + this.userId,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: 'Congrats!!!'
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
                this.isLoading = false;
                this.showToast('Message posted on LinkedIn', 'success', 'Successful');
            }
        }).catch((error) => {
            this.isLoading = false;
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }

    async postImageToLinkedIn() {
        this.isLoading = true;
        const formData = new Blob([this.file]);
        const apiUrl = `${CORS_API}${LINKEDIN_API}/v2/assets?action=registerUpload`;

        const payload = {
            registerUploadRequest: {
                recipes: [
                    'urn:li:digitalmediaRecipe:feedshare-image'
                ],
                owner: 'urn:li:person:' + this.userId,
                serviceRelationships: [
                    {
                        relationshipType: 'OWNER',
                        identifier: 'urn:li:userGeneratedContent'
                    }
                ]
            }
        };

        this.callLinkedInAPI(apiUrl, 'application/json', JSON.stringify(payload)).then((data) => {
            if (data) {
                const uploadUrl = data.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
                const asset = data.value.asset;

                const uploadImageUrl = CORS_API + uploadUrl;
                this.uploadImage(uploadImageUrl, asset, formData);
            }
        }).catch((error) => {
            this.isLoading = false;
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }

    async uploadImage(uploadImageUrl, asset, formData) {

        this.callLinkedInAPI(uploadImageUrl, 'image/jpeg', formData).then((data) => {
            this.shareImageOnLinkedIn(asset);
        }).catch((error) => {
            this.isLoading = false;
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }

    async shareImageOnLinkedIn(assets) {
        const apiUrl = `${CORS_API}${LINKEDIN_API}/v2/ugcPosts`;

        const payload = {
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            },
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    media: [
                        {
                            title: {
                                text: 'LinkedIn Talent Connect 2021'
                            },
                            media: assets,
                            description: {
                                text: 'Center stage!'
                            },
                            status: 'READY'
                        }
                    ],
                    shareMediaCategory: 'IMAGE',
                    shareCommentary: {
                        text: '<p>Good Morning</p>'
                    }
                }
            },
            lifecycleState: 'PUBLISHED',
            author: 'urn:li:person:' + this.userId
        };
        this.callLinkedInAPI(apiUrl, 'image/jpeg', JSON.stringify(payload)).then((data) => {
            this.isLoading = false;
            this.showToast('Image Successfully posted on LinkedIn', 'success', 'Successful');
        }).catch((error) => {
            this.isLoading = false;
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }

    async postVideoToLinkedIn() {

        this.isLoading = true;
        const formData = new Blob([this.file]);
        let blobArr = this.splitBlob(formData, 4194303);
        console.log('formData', blobArr[0].size);

        console.log('MAIN aRRAY ', blobArr[0]);

        const apiUrl = `${CORS_API}${LINKEDIN_API}/v2/videos?action=initializeUpload`;

        const payload = {
            initializeUploadRequest: {
                owner: "urn:li:person:" + this.userId,
                fileSizeBytes: 174220000,
                uploadCaptions: false,
                uploadThumbnail: false
            }
        };

        this.callLinkedInAPI(apiUrl, 'application/json', JSON.stringify(payload)).then((data) => {
            const uploadUrl = data.value.uploadInstructions[0].uploadUrl;
            const uploadVideoUrl = CORS_API + uploadUrl;
            const videoKey = data.value.video;
            console.log('vIDEO KEY', videoKey);
            const uploadPromises = [];

            for (let i = 0; i < blobArr.length; i++) {
                const uploadPromise = this.uploadVideo(uploadVideoUrl, videoKey, blobArr[i]);
                uploadPromises.push(uploadPromise);
            }

            Promise.all(uploadPromises)
                .then((etagResults) => {
                    console.log(JSON.stringify(etagResults));
                    this.finalizeVideo(videoKey, etagResults);
                })
                .catch((error) => {
                    this.isLoading = false;
                    this.showToast('Error in posting message', 'error', 'Error');
                });
        }).catch((error) => {
            this.isLoading = false;
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }

    splitBlob(blob, splitSize) {
        const blobArray = [];
        let offset = 0;

        while (offset < blob.size) {
            const chunkSize = Math.min(splitSize, blob.size - offset);

            const chunk = blob.slice(offset, offset + chunkSize);

            blobArray.push(chunk);

            offset += chunkSize;
        }

        return blobArray;
    }

    async uploadVideo(uploadVideoUrl, videoKey, formData) {
        try {
            const data = await this.callLinkedInAPI(uploadVideoUrl, 'video/mp4', formData);
            return data;
        } catch (error) {
            this.isLoading = false;
            this.showToast('Error in posting message', 'error', 'Error');
            throw error;
        }

    }

    async finalizeVideo(videoKey, etag) {
        console.log('finalize video api called ', etag);
        const apiUrl = `${CORS_API}${LINKEDIN_API}/v2/videos?action=finalizeUpload`;

        const payload = {
            finalizeUploadRequest: {
                video: videoKey,
                uploadToken: "",
                uploadedPartIds: etag
            }
        };

        this.callLinkedInAPI(apiUrl, 'application/json', JSON.stringify(payload)).then((data) => {
            this.postVideo(videoKey);
        }).catch((error) => {
            this.isLoading = false;
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }

    async postVideo(videoKey) {
        const apiUrl = `${CORS_API}${LINKEDIN_API}/v2/posts`;

        const payload = {
            author: "urn:li:person:" + this.userId,
            commentary: "Sample video Post",
            visibility: "PUBLIC",
            distribution: {
                feedDistribution: "MAIN_FEED",
                targetEntities: [],
                thirdPartyDistributionChannels: [],
            },
            content: {
                media: {
                    title: "title of the video",
                    id: videoKey,
                },
            },
            lifecycleState: "PUBLISHED",
            isReshareDisabledByAuthor: false,
        };

        this.callLinkedInAPI(apiUrl, 'application/json', JSON.stringify(payload)).then((data) => {
            this.isLoading = false;
            this.showToast('Video Successfully posted on LinkedIn', 'success', 'Successful');
        }).catch((error) => {
            this.isLoading = false;
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }
}