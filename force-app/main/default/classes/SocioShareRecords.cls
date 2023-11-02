public class SocioShareRecords {
    @AuraEnabled
    public static List<Post__c> socioshareData(){
       return [SELECT Id,Caption__c, Posted_On__c,Platform_Name__c,Platform_Setting__r.Access_Token__c,Post_Id__c,Scheduled_On__c,ImageURL__c,Platform_Img__c FROM Post__c];
    }
   }