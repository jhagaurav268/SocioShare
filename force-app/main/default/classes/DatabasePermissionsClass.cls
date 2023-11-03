abstract public with sharing class DatabasePermissionsClass {
    public abstract class DatabasePermissionsException extends Exception{}
    public class SobjectPermissionsException extends DatabasePermissionsException{}
    public class FieldPermissionsException extends DatabasePermissionsException{}

    private Map<String,Object> resultsMap;
    protected DatabasePermissionsClass(){
        this.resultsMap = new Map<String,Object>{'isSuccess' => true};
    }

    /**
     * @description This method will use to check the Accessible Permission on Field
     * @params
     *      objectName  String          Name of Object
     *      fields      Set<String>     Set of Field Names for Which we need to check permission
     * @return Boolean TRUE is has Permission, else FALSE
     */
    
    protected Map<String,Object> isAccessible(String objectName, Set<String> fields){
        DescribeSObjectResult objectDSR = this.getDescribeSObjectResult(objectName);
        Boolean result = true;
        List<String> inAccessibleFields = new List<String>();
        Map<String,Schema.SObjectField> fieldNameToFieldDesc = objectDSR.fields.getMap(); //this set is used for not check field permisssion
        for(String fieldName : fields){
                if(fieldNameToFieldDesc.containsKey(fieldName)){
                    if(!fieldNameToFieldDesc.get(fieldName).getDescribe().isAccessible()){ // Field InAccessible
                        result = false;
                        inAccessibleFields.add(fieldName);
                    }
                }else{ // Unknown Field.
                    inAccessibleFields.add(fieldName);
                }
        
        }
        this.resultsMap.put('isSuccess', result);
        this.resultsMap.put('inAccessibleFields', inAccessibleFields);
        return this.resultsMap;
    }

    /**
     * @description This method will use to check the Createable Permission on Field
     * @params
     *      objectName  String          Name of Object
     *      fields      Set<String>     Set of Field Names for Which we need to check permission
     * @return Boolean TRUE is has Permission, else FALSE
     */
    protected boolean isCreateable(String objectName, Set<String> fields){
        DescribeSObjectResult objectDSR = getDescribeSObjectResult(objectName);
        Boolean result = true;
        if(objectDSR.isAccessible()){
            Map<String,Schema.SObjectField> fieldNameToFieldDesc = objectDSR.fields.getMap();
            for(String fieldName : fields){
                if(fieldNameToFieldDesc.containsKey(fieldName)){
                    if(!fieldNameToFieldDesc.get(fieldName).getDescribe().isCreateable()){
                        result = false;
                    }
                }
            }
        }else{
            result = false;
        }
        return result;
    }

    /**
     * @description This method will use to check the Updateable Permission on Field
     * @params
     *      objectName  String          Name of Object
     *      fields      Set<String>     Set of Field Names for Which we need to check permission
     * @return Boolean TRUE is has Permission, else FALSE
     */
    protected boolean isUpdateable(String objectName, Set<String> fields){
        DescribeSObjectResult objectDSR = getDescribeSObjectResult(objectName);
        Boolean result = true;
        if(objectDSR.isAccessible()){
            Map<String,Schema.SObjectField> fieldNameToFieldDesc = objectDSR.fields.getMap();
            for(String fieldName : fields){
                if(fieldNameToFieldDesc.containsKey(fieldName)){
                    if(!fieldNameToFieldDesc.get(fieldName).getDescribe().isUpdateable()){
                        result = false;
                    }
                }
            }
        }else{
            result = false;
        }
        return result;
    }

    /**
     * @description This method will use to check the All Permissions Permission on Field
     * @params
     *      objectName  String          Name of Object
     *      fields      Set<String>     Set of Field Names for Which we need to check permission
     * @return Boolean TRUE is has Permission, else FALSE
     */
    protected Map<String,Object> checkAllPermissionsOnField(String objectName, Set<String> fields){
        DescribeSObjectResult objectDSR = getDescribeSObjectResult(objectName);
        Boolean result = true;
        List<String> inAccessibleFields = new List<String>();
        Map<String,Schema.SObjectField> fieldNameToFieldDesc = objectDSR.fields.getMap();
        Map<String,String> unaccessibleFieldMap = new Map<String,String>{'Id'=>'Id', 'Title' => 'Title'}; // here we can add field which are not isCreatable and  not isAccessible
        for(String fieldName : fields){
            if(unaccessibleFieldMap.containsKey(fieldName)){
                result = true;
                inAccessibleFields.add(fieldName);
            }
            else{
            if(fieldNameToFieldDesc.containsKey(fieldName)){
                DescribeFieldResult dfr = fieldNameToFieldDesc.get(fieldName).getDescribe();
                if(!(dfr.isCreateable() && dfr.isAccessible())){
                    result = false;
                    inAccessibleFields.add(fieldName);
                }
            
            }
        }
        }
        this.resultsMap.put('isSuccess', result);
        this.resultsMap.put('inAccessibleFields', inAccessibleFields);
        return this.resultsMap;
    }



    /**
     * @description This method will use to check the Delete  Permission on Object
     * @params
     *      objectName  String          Name of Object
     * @return Boolean TRUE is has Permission, else FALSE
     */
    protected boolean checkDeletePermissionOnObject(String objectName){
        DescribeSObjectResult objectDSR = getDescribeSObjectResult(objectName);
        return objectDSR.isDeletable();
    }

    /**
     * @description This method will use to check the All Permissions on Object
     * @params
     *      objectName  String          Name of Object
     * @return Boolean TRUE is has Permission, else FALSE
     */
    protected boolean checkAllPermissionsOnObject(String objectName){
        DescribeSObjectResult objectDSR = getDescribeSObjectResult(objectName);
      // Map<String,String> notIsCreatableObjectMap = new Map<String,String>{'objectName'=>'ContentDocument'}; 
        system.debug('data inside object check ');
            if(objectName=='ContentDocument'){  // changes pending ()
                if(objectDSR.isAccessible()  && objectDSR.isUpdateable() && objectDSR.isQueryable()){
                    system.debug('data inside if block for contentdocument obj check ');
                    return true;
                }
                else{
                    return false;
                }
            }
            else{
        if(objectDSR.isAccessible() && objectDSR.isCreateable() && objectDSR.isUpdateable() && objectDSR.isQueryable()){
            return true;
        }
        return false;
        }
        
    }
    

    /**
     * @description This method will use to check the createable permissions on Object
     * @params
     *      objectName  String          Name of Object
     * @return Boolean TRUE is has Permission, else FALSE
     */
    protected boolean checkCreateablePermissionOnObject(String objectName){
        DescribeSObjectResult objectDSR = getDescribeSObjectResult(objectName);
        
        if(objectDSR.isAccessible() && objectDSR.isCreateable()){
            return true;
        }
        return false;
    }

    /**
     * @description This method will use to check the Queryable Permission on Object
     * @params
     *      objectName  String          Name of Object
     * @return Boolean TRUE is has Permission, else FALSE
     */
    protected boolean checkQueryPermissionsOnObject(String objectName){
        DescribeSObjectResult objectDSR = getDescribeSObjectResult(objectName);
        if(objectDSR.isAccessible() && objectDSR.isQueryable()){
            return true;
        }
        return false;
    }

    /**
     * @description This method will use to get the DescribeSObjectResult
     * @params
     *      objectName  String          Name of Object
     * @return DescribeSObjectResult 
     */
    private DescribeSObjectResult getDescribeSObjectResult(String objectName){
        
        return Schema.getGlobalDescribe().get(objectName).getDescribe();
    }
}