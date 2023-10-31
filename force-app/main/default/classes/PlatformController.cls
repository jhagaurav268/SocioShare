public class PlatformController {
    @AuraEnabled
    public static String postOnMeta(String textMessage){
        Platform_Setting__c data = [SELECT Id, Name, Access_Token__c, Client_Id__c, Client_Secret__c, Platform_Setting_Name__c, LinkedIn_User_ID__c FROM Platform_Setting__c where Platform_Setting_Name__c = 'LinkedIn_Storage' LIMIT 1];
        List<Storage_OAuth_Configuration__mdt> oAuthConfigs = [
            SELECT OAuth_URL__c,Page_Token__c,Token_URL__c,Base_URL__c FROM Storage_OAuth_Configuration__mdt  
            WHERE DeveloperName = :PlatformContstants.LINKEDIN_STORAGE_SETTING_NAME LIMIT 1
        ];
        String endPoint = oAuthConfigs[0].Base_Url__c + 'v2/ugcPosts';
        System.debug('Endpoint ' + endPoint);
        System.debug('Acccess Token ' + data.Access_Token__c);
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(endPoint);
        request.setMethod('POST');
        request.setHeader('Authorization', 'Bearer ' + data.Access_Token__c);
        request.setHeader('Content-Type', 'application/json');
        
        Map<String, Object> requestBodyMap = new Map<String, Object>();
        
        Map<String, Object> specificContentMap = new Map<String, Object>();
        specificContentMap.put('com.linkedin.ugc.ShareContent', new Map<String, Object>{
            'shareCommentary' => new Map<String, Object>{'text' => textMessage},
                'shareMediaCategory' => 'NONE'
                });
        
        Map<String, Object> visibilityMap = new Map<String, Object>{'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'};
            
            
        requestBodyMap.put('author', 'urn:li:person:'+ String.valueOf(data.LinkedIn_User_ID__c));
        requestBodyMap.put('lifecycleState', 'PUBLISHED');
        requestBodyMap.put('specificContent', specificContentMap);
        requestBodyMap.put('visibility', visibilityMap);
        
        
        String requestBody = JSON.serialize(requestBodyMap);
        
        //System.debug(requestBody); // This will display the JSON string
        
        //request.setHeader('Cookie', 'lidc=\"b=VB69:s=V:r=V:a=V:p=V:g=4123:u=5:x=1:i=1695794940:t=1695806679:v=2:sig=AQHX46hjBWntN6OOJXgWvpFNGjgYWdZT\"; bcookie=\"v=2&f3397cae-a203-4883-8bfd-65ad8f6ec171\'');
        // String bdy ='{"author": "urn:li:person:TYR0aqmL_k", "lifecycleState": "PUBLISHED", "specificContent": { "com.linkedin.ugc.ShareContent": { "shareCommentary": { "text": + '' }, "shareMediaCategory": "NONE" } }, "visibility": { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" } }';
        request.setBody(requestBody);
        
        // String body = 'message=' + message;
        // request.setBody(body);
        system.debug('request--.'+request);
        HttpResponse response = http.send(request);
        
        system.debug('response'+response.getBody());
        //refresh();
        //debugAccessToken();
        return response.getBody();
    }
    
   
}