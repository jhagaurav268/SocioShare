import { ShowToastEvent } from 'lightning/platformShowToastEvent';

async function getAccessToken() {
    const url = 'https://graph.facebook.com/v17.0/124817320705807?fields=access_token';
    console.log(url);

    const headers = {
        'Authorization': 'Bearer EAAIZCN4p46RsBO8pQRT9FeKkD1ez1iHNJ3ZC77n5cx3Ezv91qL9GxJHyc2zR2ztUHcuvDPZCg0WpVX1H0vvoJ64RZBKTje1Tpjl7mRrZA3tzNlDfN0IRDyiYfyj4eZCBOJ60VWWCOIpdePwAM1GzwZC3CVJpGWm6Jff6AquAejPtbB0YZBW2K2TvwCT5QGY9rvOuZAYVd5FlUGcLUdnEyIXnrzL0ZD'
    };
    const response = await fetch(url, {
        method: 'GET',
        headers: headers
    });

    let responseData = await response.json();
    return responseData;
}

export async function postMessageToFacebook(textDetail, accessToken) {
    var selectedEvent = new CustomEvent('postclicked', {
        detail: true
    });
    this.dispatchEvent(selectedEvent);
    getAccessToken().then(async (data) => {
        const url = 'https://graph.facebook.com/v17.0/124817320705807/feed?message=' + textDetail;
        console.log(url);

        const headers = {
            'Authorization': 'Bearer ' + data.access_token
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: headers
        });

        let responseData = await response.json();
        console.log(responseData);
    }).catch((error) => {
        return error;
    })
}

export async function postImageToFacebook(textDetail, imgDetail) {
    if (imgDetail) {
        const formData = new FormData();
        formData.append('source', imgDetail);
        if (textDetail) {
            formData.append('caption', textDetail);
        }
        const response = await fetch('https://graph.facebook.com/124817320705807/photos?access_token=EAAIZCN4p46RsBOzv5ekF7dQiZBHOxzWG032HEZABgJNjxxGPkAS0pFP2yVSpZAYSlGqesIYJ1ThOeKUPORWDq8C7ZCGgo9kYwh2oe3X7wjZBkic08GCPJNZANvcIpmAiX8EnzBs1pU6qZABLLfbehOz1wjNFq0SmGxGM0mwRf0sjsOxl21sYW6OSOwzUpAT796GCk0J0VPkZD', {
            method: 'POST',
            body: formData,
        });

        return response;
    } else {
        console.error('No file selected to post.');
    }
}

export async function postVideoToFacebook(textDetail, imgDetail) {
    const response = await initializeUpload(imgDetail);
    console.log('Final Response ', response);
    return response;
}

async function initializeUpload(imgDetail) {
    const url = 'https://graph-video.facebook.com/124817320705807/videos';
    const accessToken = 'EAAIZCN4p46RsBOzv5ekF7dQiZBHOxzWG032HEZABgJNjxxGPkAS0pFP2yVSpZAYSlGqesIYJ1ThOeKUPORWDq8C7ZCGgo9kYwh2oe3X7wjZBkic08GCPJNZANvcIpmAiX8EnzBs1pU6qZABLLfbehOz1wjNFq0SmGxGM0mwRf0sjsOxl21sYW6OSOwzUpAT796GCk0J0VPkZD';
    const uploadPhase = 'start';
    const fileSize = imgDetail.size;
    console.log('File Size ', fileSize);
    console.log('img detail ', imgDetail);

    const formData = new FormData();
    formData.append('access_token', accessToken);
    formData.append('upload_phase', uploadPhase);
    formData.append('file_size', fileSize);

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        const responseData = await response.json();
        let session_id = responseData.upload_session_id;
        return finalizeUpload(session_id, imgDetail)
    } else {
        return response;
    }
}

async function finalizeUpload(sessionId, imgDetail) {
    const formDataFile = new Blob([imgDetail]);
    const url = 'https://graph-video.facebook.com/124817320705807/videos';
    const accessToken = 'EAAIZCN4p46RsBOzv5ekF7dQiZBHOxzWG032HEZABgJNjxxGPkAS0pFP2yVSpZAYSlGqesIYJ1ThOeKUPORWDq8C7ZCGgo9kYwh2oe3X7wjZBkic08GCPJNZANvcIpmAiX8EnzBs1pU6qZABLLfbehOz1wjNFq0SmGxGM0mwRf0sjsOxl21sYW6OSOwzUpAT796GCk0J0VPkZD'; // Replace with your access token
    const uploadPhase = 'transfer';
    const startOffset = 0;
    const uploadSessionId = sessionId;

    const formData = new FormData();
    formData.append('access_token', accessToken);
    formData.append('upload_phase', uploadPhase);
    formData.append('start_offset', startOffset);
    formData.append('upload_session_id', uploadSessionId);
    formData.append('video_file_chunk', formDataFile);

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        return postToFacebook(sessionId);
    } else {
        return response;
    }
}

async function postToFacebook(sessionId) {
    const url = 'https://graph-video.facebook.com/124817320705807/videos';
    const accessToken = 'EAAIZCN4p46RsBOzv5ekF7dQiZBHOxzWG032HEZABgJNjxxGPkAS0pFP2yVSpZAYSlGqesIYJ1ThOeKUPORWDq8C7ZCGgo9kYwh2oe3X7wjZBkic08GCPJNZANvcIpmAiX8EnzBs1pU6qZABLLfbehOz1wjNFq0SmGxGM0mwRf0sjsOxl21sYW6OSOwzUpAT796GCk0J0VPkZD'; // Replace with your access token
    const uploadPhase = 'finish';
    const uploadSessionId = sessionId;

    const formData = new FormData();
    formData.append('access_token', accessToken);
    formData.append('upload_phase', uploadPhase);
    formData.append('upload_session_id', uploadSessionId);

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        const responseData = await response.json();
        return responseData;
    } else {
        return response;
    }
}