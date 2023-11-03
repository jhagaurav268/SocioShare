public with sharing class PlatformSettingsUtil{
	public static Map<String,String> getRedirectUrls(){
		return new Map<String,String>{
			PlatformContstants.FACEBOOK_STORAGE_SETTING_NAME => System.Url.getOrgDomainUrl().toExternalForm() + Page.FacebookStorageLandingPage.getUrl(),
			PlatformContstants.LINKEDIN_STORAGE_SETTING_NAME => System.Url.getOrgDomainUrl().toExternalForm() + Page.LinkedinStorageLandingPage.getUrl()
		};
    }
}