public with sharing class LinkedinService extends LinkedinHttpOperationClass implements LinkedinServiceInterface{
    public static Map<String,Object> postContent(String userId, string text, string accessToken){
        
        List<Platform_APIs_Metadata__mdt> postConfigs = [ SELECT API_URL__c, Method__c, developername FROM Platform_APIs_Metadata__mdt where developername= 'Linkedin_Upload_API' ];
        
        HttpRequest request = LinkedinHttpOperationClass.getHttpRequestObject(postConfigs, accessToken, text, userId);
        HttpResponse res = LinkedinHttpOperationClass.getHttpResponseObjectAccess(request); 
        
        system.debug('response--'+res);
        
        return new Map<String,Object>{'success' => true, 'message' => 'Content Successfully Posted', 'data' => res};      
            }
    public static Map<String,Object> getImageUploadUrl(String uploadImg, String userId, String accessToken, String textMessage){
        System.debug('upload image ------>' + uploadImg);
        System.debug('user id ------>' + userId);
        System.debug('access token ------>' + accessToken);
        System.debug('text message ------>' + textMessage);
        //String base64Content = ( String ) JSON.deserialize( uploadImg, String.class );
        //System.debug('base64Content======>' + base64Content);
        //Blob uploadImage = EncodingUtil.base64decode(base64Content);
        //System.debug('uploadImage base64=>' + uploadImage);
        
        List<Platform_APIs_Metadata__mdt> postConfigs = [ SELECT API_URL__c, Method__c, HOST__c,developername FROM Platform_APIs_Metadata__mdt where developername='LinkedIn_Register_Upload_URL' ];
        
        HttpRequest request = LinkedinHttpOperationClass.getHttpRequestObjectForUploadUrl(postConfigs, accessToken, userId);
        HttpResponse res = LinkedinHttpOperationClass.getHttpResponseObjectAccess(request); 
        
        String response = String.valueOf(res);
        System.debug('response======>' + response);
        if(res.getStatusCode() == 200){
            
            UploadUrlResponse data = UploadUrlResponse.parse(res.getBody());
            System.debug('data new' + data);
            
            UploadUrlResponse.Value val = data.value;
            System.debug('asset value' + val.asset);
            String assetValue = val.asset;
            System.debug('data upload mechanism-->' + val.uploadMechanism);
            UploadUrlResponse.UploadMechanism getUploadMechanism= val.uploadMechanism;
            system.debug('getURL-->'+getUploadMechanism);
            UploadUrlResponse.Com_linkedin_digitalmedia_uploading_MediaUploadHttpRequest getUpload = getUploadMechanism.com_linkedin_digitalmedia_uploading_MediaUploadHttpRequest;
            system.debug('getUpload' + getUpload);
            string uploadURL = getUpload.uploadUrl;
            system.debug('getUploadUrl' + uploadURL);
            System.debug('data url' + data.value);
            uploadImage(userId, uploadImg, accessToken, uploadURL, assetValue, textMessage);
            return new Map<String,Object>{'success' => true, 'message' => 'Content Successfully Posted', 'data' => data};
                }else{
                    return new Map<String,Object>{'success' => false, 'message' => 'Data Not Found!'};
                        }
    }
    
    public static Map<String,Object> uploadImage(String userId, String uploadImg, String accessToken, String uploadURL, String asset, String textMessage){
        List<Platform_APIs_Metadata__mdt> postConfigs = [ SELECT HOST__c, developername FROM Platform_APIs_Metadata__mdt where developername= 'Linkedin_Upload_API' ];
        system.debug('uploadImg------------>' + uploadImg);
        HttpRequest request = LinkedinHttpOperationClass.getHttpRequestObjectForUploadImage(postConfigs, EncodingUtil.base64Decode(uploadImg), accessToken, uploadURL);
        system.debug('uploadImg blob------------>' + EncodingUtil.base64Decode(uploadImg));
        system.debug('uploadImage request=>' + request);
        HttpResponse res = LinkedinHttpOperationClass.getHttpResponseObjectAccess(request); 
        String response = String.valueOf(res);
        if(res.getStatusCode() == 201){
            postImage(userId, accessToken, asset, textMessage);
            return new Map<String,Object>{'success' => true, 'message' => 'Content Successfully Uploaded', 'data' => res};
                }else{
                    return new Map<String,Object>{'success' => false, 'message' => 'Data Not Found!'};
                        }
    }
    
    public static Map<String,Object> postImage(String userId, String accessToken, String asset, String textMessage){
        List<Platform_APIs_Metadata__mdt> postConfigs = [ SELECT API_URL__c, Method__c, HOST__c, developername FROM Platform_APIs_Metadata__mdt where developername= 'Linkedin_Post_Image' ];
        HttpRequest request = LinkedinHttpOperationClass.getHttpRequestObjectForPostImage(postConfigs, userId, accessToken, asset, textMessage);
        HttpResponse res = LinkedinHttpOperationClass.getHttpResponseObjectAccess(request); 
        system.debug('res======>' + res);
        if(res.getStatusCode() == 201){
            return new Map<String,Object>{'success' => true, 'message' => 'Content Successfully Posted', 'data' => res};
                }else{
                    return new Map<String,Object>{'success' => false, 'message' => 'Data Not Found!'};
                        }
    }
    
    public static Map<String, Object> initializeVideoUpload(String userId, String accessToken){
        List<Platform_APIs_Metadata__mdt> postConfigs = [ SELECT API_URL__c, Method__c, HOST__c, developername FROM Platform_APIs_Metadata__mdt where developername= 'Linkedin_Initialize_Video_Upload' ];
        HttpRequest request = LinkedinHttpOperationClass.getHttpRequestObjectForInitializeVideoUpload(postConfigs, accessToken, userId);
        HttpResponse res = LinkedinHttpOperationClass.getHttpResponseObjectAccess(request); 
        system.debug('res======>' + res);
        if(res.getStatusCode() == 200){
            system.debug('response body------>' + res.getBody());
            
            VideoUploadUrl data = VideoUploadUrl.parse(res.getBody());
            System.debug('data new------>' + data);
            
            VideoUploadUrl.value val = data.value;
            system.debug('value------>' + val);
            system.debug('VideoId------>' + val.video);
            String videoId = val.video;
            
            List<VideoUploadUrl.UploadInstructions> uploadInstructions = val.uploadInstructions;
            System.debug('uploadInstructions------>' + uploadInstructions);
            
            for (VideoUploadUrl.UploadInstructions instruction : uploadInstructions) {
                String uploadURL = instruction.uploadUrl;
                System.debug('Upload URL: ' + uploadURL); 
            }
            return new Map<String,Object>{'success' => true, 'message' => 'Content Successfully Posted', 'data' => res};
                }else{
                    return new Map<String,Object>{'success' => false, 'message' => 'Data Not Found!'};
                        }        
    }
    
    public static Map<String,Object> uploadVideo( String uploadURL, Blob uploadVideo, String accessToken){
        List<Platform_APIs_Metadata__mdt> postConfigs = [ SELECT HOST__c, developername FROM Platform_APIs_Metadata__mdt where developername= 'Linkedin_Initialize_Video_Upload' ];
        system.debug('uploadVideo------------>' + uploadVideo);
        HttpRequest request = LinkedinHttpOperationClass.getHttpRequestObjectForUploadVideo(postConfigs, uploadVideo, accessToken, uploadURL);
        //system.debug('uploadVideo blob------------>' + EncodingUtil.base64Decode(uploadVideo));
        system.debug('uploadVideo request=>' + request);
        HttpResponse res = LinkedinHttpOperationClass.getHttpResponseObjectAccess(request);
        String response = String.valueOf(res);
        System.debug('response------>' + response);
        if(res.getStatusCode() == 200){
            System.debug('ABC'+ response);
            return new Map<String,Object>{'success' => true, 'message' => 'Content Successfully Uploaded', 'data' => res};
                }else{
                    return new Map<String,Object>{'success' => false, 'message' => 'Data Not Found!'};
                        }
    }
    
}