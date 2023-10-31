abstract public class PlatformSettingsBaseClass {
		
    public static Map<String,Object> getPlatformSettings(){
		PlatformSettingsServices pfService = new PlatformSettingsServices();
		Map<String,Object> records = new Map<String,Object>();
		Set<String> fields = new Set<String>{'Platform_Setting_Name__c', 'Client_Id__c','Active__c','Type__c', 'Client_Secret__c', 'Page_Id__c', 'Access_Token__c', 'User_Access_Token__c','Scope__c'};
            //Last_Updated__c, Expiry_Date__c
		Map<String,Object> results = pfService.getRecords(fields, new Map<String,Set<String>>());
		Boolean isSuccess = (Boolean) results.get('isSuccess');
		if(isSuccess){
			List<sObject> settings = (List<sObject>) results.get('records');
			for(sObject setting : settings){
				records.put((String) setting.get('Platform_Setting_Name__c'), setting);
			}
		}
		return records;
	}
    public static List<sObject> getPlatformSettings(String settingName, Set<String> fields){
		PlatformSettingsServices pfService = new PlatformSettingsServices();
		List<sObject> records = new List<sObject>();
		Map<String,Object> results = pfService.getRecord(fields, new Map<String,Set<String>> {'' => new Set<String> {'Storage__c = \'' + settingName + '\''} } );
		Boolean isSuccess = (Boolean) results.get('isSuccess');
		if(isSuccess){
			records = (List<sObject>) results.get('records');
		}
		return records;
	}

    public static Map<String,Object> getAllConfigurations(){
		StorageOAuthConfigurationServices sOauthConfigService = new StorageOAuthConfigurationServices();
		Map<String,Object> records = new Map<String,Object>();
		Set<String> fields = new Set<String>{'DeveloperName', 'OAuth_URL__c'};
		Map<String,Object> results = sOauthConfigService.getRecords(fields, new Map<String,Set<String>>());
		Boolean isSuccess = (Boolean) results.get('isSuccess');
		if(isSuccess){
			List<sObject> settings = (List<sObject>) results.get('records');
			for(sObject setting : settings){
				records.put((String) setting.get('DeveloperName'), setting);
			}
		}
		return records;
	}
    public static Boolean upsertPlatformSettings(Map<String,Object> inputs){
		PlatformSettingsServices pfService = new PlatformSettingsServices();
		Map<String,Object> result = pfService.upsertRecord(inputs);
		return (Boolean) result.get('isSuccess');
	}

	
}