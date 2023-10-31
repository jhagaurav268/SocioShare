public with sharing class PlatformSettingsController extends PlatformSettingsBaseClass {
    
    @AuraEnabled
    public static Map<String,Object> fetchConfigurations() {
        Map<String,Object> data = new Map<String,Object>();
        Map<String,Object> oAuthUrls = new Map<String,Object>();
        data.put('redirect_urls', PlatformSettingsUtil.getRedirectUrls());
        data.put('records', PlatformSettingsController.getPlatformSettings());
        data.put('oAuth_urls', PlatformSettingsController.getAllConfigurations());
        System.debug('Data125=>'+data);
        return new Map<String,Object>{'success' => true, 'message' => 'Fetched successfully', 'data' =>  data};
            } 
    
    
    @AuraEnabled
    public static Map<String,Object> upsertExternalServiceSetting(string settingName, Boolean active, Map<string,string> credentials) {
        system.debug('settingName:: '+ settingName);
        system.debug('credentials:: '+ credentials);
        Map<String,Object> inputs = new Map<String,Object>();
        Set<String> fields = new Set<String>{'Id'};
            List<Platform_Setting__c> settings = (List<Platform_Setting__c>)PlatformSettingsController.getPlatformSettings(settingName, fields);
        system.debug('settings -->'+settings);
        if (settings.size() == 0) {
            inputs.put('Platform_Setting_Name__c',settingName);
            inputs.put('Type__c','External Service');
           // inputs.put('Platform__c', settingName);
            for(String fieldName : credentials.keySet()){
                inputs.put(fieldName + '__c',credentials.get(fieldName));
            }
        } else {
            inputs.put('Id',settings[0].Id);
            for(String fieldName : credentials.keySet()){
                inputs.put(fieldName + '__c',credentials.get(fieldName));
            }
        }
        inputs.put('Active__c',active);
        System.debug('credentials - ' + credentials);
        System.debug('settingName - ' + settingName);
        Boolean success = PlatformSettingsController.upsertPlatformSettings(inputs);
        
        /*String awsRemoteUrl = ''; 
if(settingName=='AWS_S3_Bucket_Platform'){
String bucketName = String.valueof(credentials.get('Bucket_Name'));
System.debug('Bucket_Name:: '+ bucketName);
String regionName = String.valueof(credentials.get('Region'));
awsRemoteUrl = 'https://' + bucketName +'.s3.'+regionName+'.amazonaws.com'; //https://bucketName.s3.ap-south-1.amazonaws.com  (make string like this)
}else{
awsRemoteUrl ='no url';
}  

system.debug('awsRemoteUrl aws new -->'+awsRemoteUrl);*/
        //return new Map<String,Object>{ 'success' => success, 'message' => 'Operation successful!', 'awsurl' => };   
        Map<String, Object> response = new Map<String, Object>();
        //response.put('success', success);
        response.put('message', success ? 'Operation successful!' : 'Operation failed.');
        
        return response; 
        
    }
    
}