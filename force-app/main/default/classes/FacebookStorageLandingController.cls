public class FacebookStorageLandingController {
     @RemoteAction
	public static Map<String,Object> getAccessToken(String code){
        List<Platform_Setting__c> settings;

        	
        	settings = [SELECT Id, Name, Client_Id__c, Client_Secret__c, Page_Id__c, Access_Token__c, Scope__c, User_Access_Token__c, Platform_Setting_Name__c FROM Platform_Setting__c
                       		where Platform_Setting_Name__c=:PlatformContstants.FACEBOOK_STORAGE_SETTING_NAME LIMIT 1];
        	system.debug('Settings=='+settings);
        if(settings.size() > 0){
            	system.debug('In Settings');
                 List<Storage_OAuth_Configuration__mdt> oAuthConfigs = [
                    SELECT OAuth_URL__c,Page_Token__c,Token_URL__c FROM Storage_OAuth_Configuration__mdt  
                    WHERE DeveloperName = :PlatformContstants.FACEBOOK_STORAGE_SETTING_NAME LIMIT 1
                ];
                HttpRequest req = new HttpRequest();
                req.setEndpoint(oAuthConfigs[0].Token_URL__c);
                req.setMethod('GET');
                req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                req.setBody('code='+ code +'&client_id='+ settings[0].Client_Id__c +'&client_secret='+ settings[0].Client_Secret__c +'&redirect_uri='+ PlatformSettingsUtil.getRedirectUrls().get(PlatformContstants.FACEBOOK_STORAGE_SETTING_NAME) +'&grant_type=authorization_code');
                //https://graph.facebook.com/v17.0/oauth/access_token?
                //client_id=632457732352283&redirect_uri=https%3A%2F%2Flogin.salesforce.com%2F&client_secret=b8c22aabe1a3c20574c12c6e716ac0dd&
                //code=AQBZU5euMRV0g7ng_ACUgYwbvtNWwfXkaPoDoQBOo-VeXMUPi0Qe8ti6pTtm8FP__1xCXl987Eg1Bh6q4E5j3gHGmllxdKRhkBV5izDrJNziZCShCm2To3jE7I8jqT8j1aXHSFG-0L4jgiVag08fd6m3TCf5m_OTSpIaKHIqFDQtXm_7B1DUxsA0M0f8dJ9yfvFm7DCqfVFsHO3MtIIy0_RqrT3KawEcU5FqPLxbSgyfKeB19EYuHDo8tnm-l5KqeLcWafWoKjCq78If5v-zd7WIci8UjpY3qNUB3QVwcc8kjwx8BCtA85UGly1qHFt4ff2UVMp6W2H4cZlPtdZGQAhS0gKt_kQusFhKGqJu4_qCBW3S-YKdIq41uGS8REdLpfE%23_=_
                Http http = new Http();
                HTTPResponse res = http.send(req);
                system.debug('resNew'+res);
                system.debug('data ==>> ' + res.getBody());
            }
        return new Map<String,Object>{'success' => false, 'message' => 'Unknown Error Occured!'};
    }
}