public class LinkedinPlatformLandingController {
    
    @RemoteAction
    public static Map<String,Object> getAccessToken(String code){
        List<Platform_Setting__c> settings;
        
        try {
            settings = [SELECT Id, Name, Client_Id__c, Client_Secret__c, Page_Id__c, Access_Token__c, Scope__c, User_Access_Token__c, Platform_Setting_Name__c FROM Platform_Setting__c
                        where Platform_Setting_Name__c=:PlatformContstants.LINKEDIN_STORAGE_SETTING_NAME LIMIT 1];
            system.debug('Settings=='+settings);
            if(settings.size() > 0){
                system.debug('In Settings');
                List<Storage_OAuth_Configuration__mdt> oAuthConfigs = [
                    SELECT OAuth_URL__c,Page_Token__c,Token_URL__c FROM Storage_OAuth_Configuration__mdt  
                    WHERE DeveloperName = :PlatformContstants.LINKEDIN_STORAGE_SETTING_NAME LIMIT 1
                ];
                HttpRequest req = new HttpRequest();
                req.setEndpoint(oAuthConfigs[0].Token_URL__c);
                req.setMethod('GET');
                //req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                req.setBody('code='+ code +'&client_id='+ settings[0].Client_Id__c +'&client_secret='+ settings[0].Client_Secret__c +'&redirect_uri='+ PlatformSettingsUtil.getRedirectUrls().get(PlatformContstants.LINKEDIN_STORAGE_SETTING_NAME) +'&grant_type=authorization_code');
                Http http = new Http();
                HTTPResponse res = http.send(req);
                system.debug('resNew'+res);
                system.debug('data ==>> ' + res.getBody());
                if(res.getStatusCode() == 200){
                    LinkedinPlatformOAuthWrapper data = new LinkedinPlatformOAuthWrapper().parse(res.getBody());
                    return new Map<String,Object>{'success' => true, 'message' => 'Token Fetched Successfully', 'data' => data};
                        }
                else{
                    return new Map<String,Object>{'success' => false, 'message' => 'Data Not Found!'};
                        }
            } 
        }catch (Exception e) {
            system.debug('error now' + e.getMessage());
            system.debug('error now' + e.getStackTraceString());
            update new Platform_Setting__c(Id = settings[0].Id, Access_Token__c = '', 	Expiry__c = null, Refresh_Token__c = '', Active__c = false);
        }
        
        return new Map<String,Object>{'success' => false, 'message' => 'Unknown Error Occured!'};
            }
    
    @RemoteAction
    public static Map<String,Object> saveAccessTokenSettings(String json){
        List<Platform_Setting__c> settings;
        try{
            settings = [SELECT Id, 	Client_Id__c, Client_Secret__c
                        FROM Platform_Setting__c WHERE Platform_Setting_Name__c =: PlatformContstants.LINKEDIN_STORAGE_SETTING_NAME
                        WITH SECURITY_ENFORCED LIMIT 1];
            if(settings.size() > 0){
                LinkedinPlatformOAuthWrapper data = new LinkedinPlatformOAuthWrapper().parse(json);
                update new Platform_Setting__c(Id = settings[0].Id, Access_Token__c = data.access_token, Expiry__c = data.expires_in, 	Refresh_Token__c = data.refresh_token, 	Active__c = true);
                getUserId();
                //  LinkedinPlatformOAuthWrapper.sendEmailNotification();
                return new Map<String,Object>{'success' => true, 'message' => 'Token Saved Successfully'};
                    }else{
                        return new Map<String,Object>{'success' => false, 'message' => 'Data Not Found!'};
                            }
        }catch(Exception e){
            system.debug('error now' + e.getMessage());
            system.debug('error now' + e.getStackTraceString());
            update new Platform_Setting__c(Id = settings[0].Id,Access_Token__c = '', Expiry__c = null, 	Refresh_Token__c = '', 	Active__c = false);
            //ErrorLogs.log('OneDriveStorageLandingController:saveAccessTokenSettings', e.getMessage(), e.getStackTraceString());
        }
        return new Map<String,Object>{'success' => true, 'message' => 'Token Saved Failed!'};
            }
    
    @Future(callout=true)
    public static Void getUserId(){
        List<Platform_Setting__c> settings;
        
        try {
            settings = [SELECT Id, Name, Client_Id__c, Client_Secret__c, Page_Id__c, Access_Token__c, Scope__c, User_Access_Token__c, Platform_Setting_Name__c, LinkedIn_User_ID__c FROM Platform_Setting__c
                        where Platform_Setting_Name__c=:PlatformContstants.LINKEDIN_STORAGE_SETTING_NAME LIMIT 1];
            system.debug('Settings=='+settings);
            if(settings.size() > 0){
                system.debug('In Settings');
                List<Storage_OAuth_Configuration__mdt> oAuthConfigs = [
                    SELECT OAuth_URL__c,Page_Token__c,Token_URL__c, User_Token__c FROM Storage_OAuth_Configuration__mdt  
                    WHERE DeveloperName = :PlatformContstants.LINKEDIN_STORAGE_SETTING_NAME LIMIT 1
                ];
                HttpRequest req = new HttpRequest();
                req.setEndpoint(oAuthConfigs[0].User_Token__c);
                req.setMethod('GET');
                req.setHeader('Authorization', 'Bearer ' + settings[0].Access_Token__c);
                //req.setBody(settings[0].Access_Token__c);
                Http http = new Http();
                HTTPResponse res = http.send(req);
                system.debug('resNew'+res);
                system.debug('data ==>> ' + res.getBody());
                if(res.getStatusCode() == 200){
                    LinkedinPlatformWrapper data = new LinkedinPlatformWrapper().parse(res.getBody());
                    update new Platform_Setting__c(Id = settings[0].Id, LinkedIn_User_ID__c = data.sub);
                    //saveUserId(data.sub);
                    //return new Map<String,Object>{'success' => true, 'message' => 'User Id Fetched Successfully', 'data' => data};
                }
                else{
                    //return new Map<String,Object>{'success' => false, 'message' => 'Data Not Found!'};
                }
            } 
        }catch (Exception e) {
            system.debug('error now' + e.getMessage());
            system.debug('error now' + e.getStackTraceString());
            update new Platform_Setting__c(Id = settings[0].Id, Access_Token__c = '', 	Expiry__c = null, Refresh_Token__c = '', Active__c = false, LinkedIn_User_ID__c = '');
        }
        
        //return new Map<String,Object>{'success' => false, 'message' => 'Unknown Error Occured!'};
    }  
    
    
    class LinkedinPlatformOAuthWrapper{
        public String access_token;
        public Integer expires_in;
        public String refresh_token;
        
        public LinkedinPlatformOAuthWrapper parse(String json){
            return (LinkedinPlatformOAuthWrapper) System.JSON.deserialize(json, LinkedinPlatformOAuthWrapper.class);
        }
    }
    
    class LinkedinPlatformWrapper{
        public String sub;
        
        public LinkedinPlatformWrapper parse(String UserIdJson){
            return (LinkedinPlatformWrapper) System.JSON.deserialize(UserIdJson, LinkedinPlatformWrapper.class);
        }
    }
}