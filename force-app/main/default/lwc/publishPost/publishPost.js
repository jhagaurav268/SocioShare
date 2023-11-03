//latest

import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPlatformDetails from '@salesforce/apex/SocialShareController.getPlatformDetails';
import { createRecord } from 'lightning/uiRecordApi';
import POST_OBJECT from '@salesforce/schema/Post__c';
import POSTID_FIELD from '@salesforce/schema/Post__c.Post_Id__c';
import PLATFORM_Setting_FIELD from '@salesforce/schema/Post__c.Platform_Setting__c';
import PLATFORM_FIELD from '@salesforce/schema/Post__c.Platform__c';
import IMAGEURL_FIELD from '@salesforce/schema/Post__c.ImageURL__c';
import CAPTION_FIELD from '@salesforce/schema/Post__c.Caption__c';

const CORS_API = 'https://cors-anywhere.herokuapp.com/';
const LINKEDIN_API = 'https://api.linkedin.com';

export default class PublishPost extends LightningElement {
    @api textDetail;
    @api imgDetail;
    accessToken;
    userId;
    platformId;
    currentDate;
    linkedInPostId;

    async connectedCallback() {
        try {
            const currDate = new Date();
            const day = currDate.getDate();
            const month = currDate.getMonth() + 1;
            const year = currDate.getFullYear();

            this.currentDate = `${day}/${month}/${year}`;

            getPlatformDetails().then((data) => {
                this.platformId = data[0].Id;
                this.accessToken = data[0].Access_Token__c;
                this.userId = data[0].LinkedIn_User_ID__c;
            }).catch((error) => {
                console.log(error);
            })
        }
        catch (error) {
            console.error('Error', error);
        }
    }

    handlePublish() {
        // console.log('imgd ', this.imgDetail);

        if (this.textDetail && (this.imgDetail == undefined || this.imgDetail == null)) {
            //console.log('Under If');
            this.textDetail = this.textDetail.replace(/<\/?p>/g, '');
            this.postMessageToLinkedIn();
        } else if (this.imgDetail) {
            //console.log('Under else If');
            var jpgPattern = /\.jpg$/i;
            var mp4Pattern = /\.mp4$/i;
            if (this.textDetail != undefined) {
                this.textDetail = this.textDetail.replace(/<\/?p>/g, '');
            }
            if (jpgPattern.test(this.imgDetail.name)) {
                this.postImageToLinkedIn();
            } else if (mp4Pattern.test(this.imgDetail.name)) {
                this.postVideoToLinkedIn();
                // console.log("File has a .mp4 extension.");
            } else {
                console.log("File does not have a .jpg or .mp4 extension.");
            }
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
            // console.log('response ', response);
            if (response.ok) {
                let responseData = null;

                const etag = response.headers.get('ETag');
                this.linkedInPostId = response.headers.get('x-linkedin-id');

                if (etag) {
                    return etag;
                }

                if (response.headers.get('content-length') !== '0') {
                    responseData = await response.json();
                }
                // console.log('responseData ', responseData);
                return responseData;
            } else {
                var selectedEvent = new CustomEvent('postclicked', {
                    detail: false
                });
                this.dispatchEvent(selectedEvent);
                this.showToast(response.statusText, 'error', 'API Request failed:');
            }
        } catch (error) {
            var selectedEvent = new CustomEvent('postclicked', {
                detail: false
            });
            this.dispatchEvent(selectedEvent);
            this.showToast(response.statusText, 'error', 'API Request failed:');
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
                // console.log('data ', data);
                var selectedEvent = new CustomEvent('postclicked', {
                    detail: false
                });
                this.dispatchEvent(selectedEvent);

                const fields = {};
                fields[POSTID_FIELD.fieldApiName] = data.id;
                fields[PLATFORM_Setting_FIELD.fieldApiName] = this.platformId;
                fields[PLATFORM_FIELD.fieldApiName] = 'LinkedIn';
                fields[CAPTION_FIELD.fieldApiName] = this.textDetail;

                const recordInput = { apiName: POST_OBJECT.objectApiName, fields };
                createRecord(recordInput)
                    .then(post => {
                        let postId = post.id;
                        console.log(postId);
                    })
                    .catch(error => {
                        this.showToast(error.body.message, 'error', 'Error creating record');
                    });
                this.showToast('Message posted on LinkedIn', 'success', 'Successful');
                window.location.reload();
            }
        }).catch((error) => {
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }

    async postImageToLinkedIn() {
        var selectedEvent = new CustomEvent('postclicked', {
            detail: true
        });
        this.dispatchEvent(selectedEvent);

        const formData = new Blob([this.imgDetail]);
        // console.log('formData ', formData);
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
                // console.log(asset);
                const uploadImageUrl = CORS_API + uploadUrl;
                this.uploadImage(uploadImageUrl, asset, formData);
            }
        }).catch((error) => {
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }

    async uploadImage(uploadImageUrl, asset, formData) {

        this.callLinkedInAPI(uploadImageUrl, 'image/jpeg', formData).then((data) => {
            this.shareImageOnLinkedIn(asset);
        }).catch((error) => {
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
                        text: this.textDetail
                    }
                }
            },
            lifecycleState: 'PUBLISHED',
            author: 'urn:li:person:' + this.userId
        };
        this.callLinkedInAPI(apiUrl, 'image/jpeg', JSON.stringify(payload)).then((data) => {
            if (data) {
                console.log('Assets ', assets);
                const urn = assets;
                const parts = urn.split(":");
                const assetId = parts[parts.length - 1];
                console.log(assetId);
                this.getAssetUrl(assetId, 'images');
            }
        }).catch((error) => {
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }

    async getAssetUrl(assets, assetData) {
        console.log('assets ', assets);
        console.log('assetData ', assetData);
        let apiData = '';

        if (assetData === 'images') {
            apiData = 'image';
        } else if (assetData === 'videos') {
            apiData = 'video';
        }
        const apiUrl = `${CORS_API}${LINKEDIN_API}/v2/${assetData}/urn:li:${apiData}:${assets}`;
        const headers = {
            'Origin': 'https://connect-innovation-1672-dev-ed.scratch.lightning.force.com',
            'Authorization': 'Bearer ' + this.accessToken
        };
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers
        });
        if (response.ok) {
            let responseData = await response.json();
            console.log('responseData ', responseData.downloadUrl);
            console.log('responseData origin ', responseData);

            const fields = {};
            fields[POSTID_FIELD.fieldApiName] = this.linkedInPostId;
            fields[PLATFORM_Setting_FIELD.fieldApiName] = this.platformId;
            fields[PLATFORM_FIELD.fieldApiName] = 'LinkedIn';
            if (apiData === 'image') {
                fields[IMAGEURL_FIELD.fieldApiName] = responseData.downloadUrl;
            } else if (apiData === 'video') {
                fields[IMAGEURL_FIELD.fieldApiName] = responseData.thumbnail;
            }
            fields[CAPTION_FIELD.fieldApiName] = this.textDetail;

            const recordInput = { apiName: POST_OBJECT.objectApiName, fields };
            createRecord(recordInput).then(post => {
                var selectedEvent = new CustomEvent('postclicked', {
                    detail: false
                });

                this.dispatchEvent(selectedEvent);
                if (apiData === 'video') {
                    this.showToast('Video Successfully posted on LinkedIn', 'success', 'Successful');
                } else if (apiData === 'image') {
                    this.showToast('Image Successfully posted on LinkedIn', 'success', 'Successful');
                }
                window.location.reload();
            }).catch(error => {
                this.showToast(error.body.message, 'error', 'Message Posted on LinkedIn but in Error creating record');
                var selectedEvent = new CustomEvent('postclicked', {
                    detail: false
                });
                this.dispatchEvent(selectedEvent);
            });
        } else {
            this.showToast(response.statusText, 'error', 'API Request failed:');
            var selectedEvent = new CustomEvent('postclicked', {
                detail: false
            });
            this.dispatchEvent(selectedEvent);
        }
    }

    async postVideoToLinkedIn() {
        var selectedEvent = new CustomEvent('postclicked', {
            detail: true
        });

        this.dispatchEvent(selectedEvent);
        const formData = new Blob([this.imgDetail]);
        let blobArr = this.splitBlob(formData, 4194303);
        // console.log('formData', blobArr[0].size);

        // console.log('MAIN aRRAY ', blobArr[0]);

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
            // console.log('vIDEO KEY', videoKey);
            const uploadPromises = [];

            for (let i = 0; i < blobArr.length; i++) {
                const uploadPromise = this.uploadVideo(uploadVideoUrl, blobArr[i]);
                uploadPromises.push(uploadPromise);
            }

            Promise.all(uploadPromises)
                .then((etagResults) => {
                    console.log(JSON.stringify(etagResults));
                    this.finalizeVideo(videoKey, etagResults);
                })
                .catch((error) => {
                    this.showToast('Error in posting message', 'error', 'Error');
                });
        }).catch((error) => {
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

    async uploadVideo(uploadVideoUrl, formData) {
        try {
            const data = await this.callLinkedInAPI(uploadVideoUrl, 'video/mp4', formData);
            return data;
        } catch (error) {
            this.showToast('Error in posting message', 'error', 'Error');
            throw error;
        }

    }

    async finalizeVideo(videoKey, etag) {
        // console.log('finalize video api called ', etag);

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
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }

    async postVideo(videoKey) {
        // console.log('videoKey ', videoKey);
        const apiUrl = `${CORS_API}${LINKEDIN_API}/v2/posts`;

        const payload = {
            author: "urn:li:person:" + this.userId,
            commentary: '',
            visibility: "PUBLIC",
            distribution: {
                feedDistribution: "MAIN_FEED",
                targetEntities: [],
                thirdPartyDistributionChannels: [],
            },
            content: {
                media: {
                    title: '',
                    id: videoKey,
                },
            },
            lifecycleState: "PUBLISHED",
            isReshareDisabledByAuthor: false,
        };

        if (this.textDetail !== undefined && this.textDetail !== null) {
            payload.commentary = this.textDetail;
            payload.content.media.title = this.textDetail;
        }

        this.callLinkedInAPI(apiUrl, 'application/json', JSON.stringify(payload)).then((data) => {
            const urn = videoKey;
            const parts = urn.split(":");
            const assetId = parts[parts.length - 1];
            // console.log(assetId);
            setTimeout(() => {
                this.getAssetUrl(assetId, 'videos');
            }, 5000);
            // window.location.reload();
        }).catch((error) => {
            this.showToast('Error in posting message', 'error', 'Error');
        });
    }
}