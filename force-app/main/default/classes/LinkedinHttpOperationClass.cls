abstract public with sharing class LinkedinHttpOperationClass {
    public class ExternalServiceException extends Exception{}
    public static HttpRequest getHttpRequestObject(	List<Platform_APIs_Metadata__mdt> linkedInCustomMetadata, String accessToken, String textMessage, String userId){
        HttpRequest request = new HttpRequest();
        request.setMethod(linkedInCustomMetadata[0].Method__c);
        request.setEndpoint(linkedInCustomMetadata[0].API_URL__c);
        request.setHeader('Authorization','Bearer'+' '+ accessToken); //provide authentication code
        request.setHeader('Content-Type', 'application/json');
        Map<String, Object> requestBodyMap = new Map<String, Object>();
        
        Map<String, Object> specificContentMap = new Map<String, Object>();
        specificContentMap.put('com.linkedin.ugc.ShareContent', new Map<String, Object>{
            'shareCommentary' => new Map<String, Object>{'text' => textMessage},
                'shareMediaCategory' => 'NONE'
                });
        
        Map<String, Object> visibilityMap = new Map<String, Object>{'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'};
            
            
            requestBodyMap.put('author', 'urn:li:person:'+ String.valueOf(userId));
        requestBodyMap.put('lifecycleState', 'PUBLISHED');
        requestBodyMap.put('specificContent', specificContentMap);
        requestBodyMap.put('visibility', visibilityMap);
        
        
        String requestBody = JSON.serialize(requestBodyMap);
        
        request.setBody(requestBody);
        return request;
    }
    
    public static HttpRequest getHttpRequestObjectForUploadUrl(List<Platform_APIs_Metadata__mdt> linkedInCustomMetadata, String accessToken, String userId){
        HttpRequest request = new HttpRequest();
        request.setMethod(linkedInCustomMetadata[0].Method__c);
        request.setEndpoint(linkedInCustomMetadata[0].API_URL__c);
        
        Map<String, Object> bodyMap = new Map<String, Object>();
        Map<String, Object> registerUploadRequest = new Map<String,Object>();
        registerUploadRequest.put('recipes', new List<String>{'urn:li:digitalmediaRecipe:feedshare-image'});
        registerUploadRequest.put('owner' , 'urn:li:person:'+ String.valueOf(userId));
        
        Map<String, Object> serviceRelationships = new Map<String, Object>();
        serviceRelationships.put('relationshipType', 'OWNER');
        serviceRelationships.put('identifier', 'urn:li:userGeneratedContent');
        registerUploadRequest.put('serviceRelationships', new List<Map<String, Object>>{serviceRelationships});
        bodyMap.put('registerUploadRequest', registerUploadRequest);
        request.setHeader('Authorization','Bearer'+' '+ accessToken);
        
        String requestBody = JSON.serialize(bodyMap);
        request.setHeader('Content-Length', String.valueOf(requestBody.Length()));
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Host', linkedInCustomMetadata[0].HOST__c);
        request.setBody(requestBody);
        return request;
    }
    
    public static HttpRequest getHttpRequestObjectForUploadImage(List<Platform_APIs_Metadata__mdt> linkedInCustomMetadata, Blob uploadImg, String accessToken, String uploadURL){
        HttpRequest request = new HttpRequest();
        request.setHeader('Authorization','Bearer'+' '+ accessToken);
        request.setHeader('Content-Type','image/jpeg');
        request.setMethod('POST');
        request.setEndpoint(uploadURL);
        request.setBodyAsBlob(uploadImg);
        request.setHeader('Content-Length', String.valueOf(uploadImg.size()));
        request.setHeader('Host',  linkedInCustomMetadata[0].HOST__c);
        system.debug('request------>' + request);
        return request;
    }
    
    public static HttpRequest getHttpRequestObjectForPostImage(List<Platform_APIs_Metadata__mdt> linkedInCustomMetadata, String userId, String accessToken, String asset, String textMessage){
        HttpRequest request = new HttpRequest();
        request.setMethod(linkedInCustomMetadata[0].Method__c);
        request.setEndpoint(linkedInCustomMetadata[0].API_URL__c);
        system.debug('linkedInCustomMetadata[0].Method__c' + linkedInCustomMetadata[0].Method__c);
        system.debug('linkedInCustomMetadata[0].API_URL__c' + linkedInCustomMetadata[0].API_URL__c);
        
        Map<String, Object> requestBodyMap = new Map<String, Object>();
        
        Map<String, Object> specificContentMap = new Map<String, Object>();
        
        Map<String, Object> shareCommentaryMap = new Map<String, Object>();
        shareCommentaryMap.put('text', textMessage);
        
        specificContentMap.put('com.linkedin.ugc.ShareContent', new Map<String, Object>{
            'shareCommentary' => shareCommentaryMap,
                'shareMediaCategory' => 'IMAGE',
                'media' => new List<Map<String, Object>>{
                    new Map<String, Object>{
                        'status' => 'READY',
                            'description' => new Map<String, Object>{
                                'text' => 'Center stage!'
                                    },
                                        'media' => asset ,
                                        'title' => new Map<String, Object>{
                                            'text' => 'LinkedIn Talent Connect 2021'
                                                }
                    }
                }
        });
        
        Map<String, Object> visibilityMap = new Map<String, Object>{'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'};
            
            requestBodyMap.put('author', 'urn:li:person:' + userId);
        requestBodyMap.put('lifecycleState', 'PUBLISHED');
        requestBodyMap.put('specificContent', specificContentMap);
        requestBodyMap.put('visibility', visibilityMap);
        
        String requestBody = JSON.serialize(requestBodyMap);
        
        request.setHeader('Authorization', 'Bearer ' + accessToken);
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Content-Length', String.valueOf(requestBody.Length()));
        request.setHeader('Host',  linkedInCustomMetadata[0].HOST__c);
        request.setBody(requestBody);
        
        return request;
    }
    
    public static HttpRequest getHttpRequestObjectForInitializeVideoUpload(List<Platform_APIs_Metadata__mdt> linkedInCustomMetadata, String accessToken, String userId){
        HttpRequest request = new HttpRequest();
        request.setMethod(linkedInCustomMetadata[0].Method__c);
        request.setEndpoint(linkedInCustomMetadata[0].API_URL__c);
        
        Map<String, Object> requestBodyMap = new Map<String, Object>();
        
        Map<String, Object> initializeUploadRequestMap = new Map<String, Object>();
        initializeUploadRequestMap.put('owner', 'urn:li:person:' + userId);
        initializeUploadRequestMap.put('fileSizeBytes', 2233657);
        initializeUploadRequestMap.put('uploadCaptions', false);
        initializeUploadRequestMap.put('uploadThumbnail', false);
        
        requestBodyMap.put('initializeUploadRequest', initializeUploadRequestMap);
        
        String requestBody = JSON.serialize(requestBodyMap);
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Authorization', 'Bearer ' + accessToken);
        request.setHeader('Content-Length', String.valueOf(requestBody.Length()));
        request.setHeader('Host',  linkedInCustomMetadata[0].HOST__c);
        request.setHeader('LinkedIn-Version', '202308');
        request.setBody(requestBody);
        
        return request;
    }
    
    
    public static HttpRequest getHttpRequestObjectForUploadVideo(List<Platform_APIs_Metadata__mdt> linkedInCustomMetadata, Blob uploadVideo, String accessToken, String uploadURL){
        HttpRequest request = new HttpRequest();
        request.setHeader('Authorization','Bearer'+' '+ accessToken);
        request.setHeader('Content-Type','video/mp4');
        request.setMethod('POST');
        request.setEndpoint(uploadURL);
        request.setBodyAsBlob(uploadVideo);
        request.setHeader('Content-Length', String.valueOf(uploadVideo.size()));
        request.setHeader('Host',  linkedInCustomMetadata[0].HOST__c);
        system.debug('request------>' + request);
        return request;
    }
    
    
    public static HttpResponse getHttpResponseObjectAccess(HttpRequest req){
        System.debug('>>>'+req);
        System.debug('>>>'+req.getHeader('Content-Length'));
        System.debug('>>>'+req.getHeader('Host'));
        System.debug('>>>'+req.getBody());
        Http http = new Http();
        req.setTimeout(30000);
        HttpResponse res = http.send(req);
        //system.debug('resss--'+ res);
        system.debug('rs-' + res.getBody());
        system.debug('resss--' + res.getStatusCode());
        if(res.getStatusCode() == 200 || res.getStatusCode() == 201 || res.getStatusCode() == 204){
            system.debug('rs-inside' + res.getBody());
            return res;
        }
        
        else {
            system.debug('i am error--.'+res);
            return null;
        }
    }
    
}