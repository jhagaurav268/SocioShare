public class SocialShareController {
    @AuraEnabled
    public static List<Platform_Setting__c> getPlatformDetails(){
        return [SELECT Id, Access_Token__c, LinkedIn_User_ID__c 
                FROM Platform_Setting__c
                where Platform__c = 'LinkedIn_Platform' AND Active__c = true LIMIT 1];
    }
}