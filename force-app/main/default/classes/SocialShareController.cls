public class SocialShareController {
    @AuraEnabled
    public static Map<String, Object> postTextContent(String textMessage, String platformName){
        Map<String,Object> getPostTextContent;
        switch on platformName {
            when 'LinkedIn_Storage' {
                Platform_Setting__c data = [SELECT Id, Name, Access_Token__c, Client_Id__c, Client_Secret__c, Platform_Setting_Name__c, LinkedIn_User_ID__c FROM Platform_Setting__c where Platform_Setting_Name__c = 'LinkedIn_Storage' LIMIT 1];
                
                getPostTextContent = LinkedinService.postContent(data.LinkedIn_User_ID__c, textMessage, data.Access_Token__c);
                system.debug('getPostTextContent' + getPostTextContent);
                
            }
        }
        return getPostTextContent;
    }
    @AuraEnabled
    public static Map<String, Object> postImage (String fileData, String textMessage, String platformName){
        Object obj = JSON.deserializeUntyped(fileData);
        System.debug('file data in postImage======>' + obj);
        
        Map<String, Object> fileDataMap = (Map<String, Object>) JSON.deserializeUntyped(JSON.serialize(obj));
        Map<String,Object> postImage;
        String fileBase64 = String.valueOf(fileDataMap.get('base64'));
        system.debug('fileBase64 Line 24 ======>' + fileBase64);
        /*List<String> fileBase = fileBase64.split(',');
String baseFile = fileBase[1]; */
        String baseFile = fileBase64.substringAfter(',');
        //Blob abc = Blob.valueOf(baseFile);
        //system.debug('base file data abc::: ' + abc);
        //system.debug('fileDataMap split full ::: ' + fileBase);
        //system.debug('fileDataMap split ::: ' + fileBase[1]);
        system.debug('base file data ::: ' + baseFile);
        switch on platformName {
            when 'LinkedIn_Storage' {
                Platform_Setting__c data = [SELECT Id, Name, Access_Token__c, Client_Id__c, Client_Secret__c, Platform_Setting_Name__c, LinkedIn_User_ID__c FROM Platform_Setting__c where Platform_Setting_Name__c = 'LinkedIn_Storage' LIMIT 1];
                postImage = LinkedinService.getImageUploadUrl(baseFile , data.LinkedIn_User_ID__c, data.Access_Token__c, textMessage);
                // postImage = LinkedinService.getImageUploadUrl(fileData , data.LinkedIn_User_ID__c, data.Access_Token__c, textMessage);
                system.debug('postImage' + postImage);           
            } 
        }
        return postImage;
    }
}