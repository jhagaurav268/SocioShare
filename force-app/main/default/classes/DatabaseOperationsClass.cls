public abstract with sharing class DatabaseOperationsClass extends DatabasePermissionsClass{
    public class DatabaseException extends Exception{}
    private final Boolean ALL_OR_NONE = true;
    private final String BASE_QUERY = 'SELECT {0} FROM {1} {2} LIMIT {3}';
    private Map<String,Object> resultsMap;

    protected DatabaseOperationsClass(){
        super();
        this.resultsMap = new Map<String,Object>{'isSuccess' => true};
    }    

    /**
     * @description This method will use fetch existing records in a sObject.
     * @params
     *      sobjectName     String         Name of sObject
     *      fields          Set<String>    Set of Field Names which we need to add in query Eg. ['field1__c', 'field2__c']
     *      conditions      Set<String>    Set of Conditions which we need to add in query Eg. { 'AND' => ['Field1__c <> abc', 'Field2__c > 2000'], 'OR' => ['Field2__c <> xyz', 'Field3__c > 2000'] }
     *      lmt             Integer        Number of records to be fetched. 
     * @return Map<String,Object>          Result of SOQL query with either success and error
     */
    protected Map<String,Object> executeQuery(String sobjectName,Set<String> fields, Map<String,Set<String>> conditions, Integer lmt){
        
        if(!this.checkQueryPermissionsOnObject(sobjectName)){
            throw new DatabasePermissionsClass.SobjectPermissionsException(sobjectName + ' is not queryable!');
        }
        Map<String,Object> result = this.isAccessible(sobjectName, fields);
        Boolean isSuccess = (Boolean) result.get('isSuccess');
        List<String> inAccessibleFields = (List<String>) result.get('inAccessibleFields');
        if(!isSuccess){
            throw new DatabasePermissionsClass.FieldPermissionsException('Following fields are inaccessible: ' + String.join(inAccessibleFields, ','));
        }

        String strFields = '';
        if(fields.size() > 0){
            strFields = String.join(new List<String>(fields), ',');
        }
        String strConditions = '';
        if(conditions.size() > 0){
            strConditions = ' WHERE ';
            for(String operator : conditions.keySet()){
                List<String> settings = new List<String>(conditions.get(operator));
                strConditions += ' ' +  String.join(settings, operator) + ' ';
            }
        }
        String queryString = String.format(this.BASE_QUERY,new List<String>{strFields,sobjectName,strConditions,String.valueOf(lmt)});
        system.debug('queryString ==>' + queryString);
        this.resultsMap.put('records', System.Database.query(queryString));
        System.debug('hello');
        return this.resultsMap;
    }
    /**
     * @description This method will use upsert records in a sObject.
     * @params
     *      sobjectName     String               Name of sObject
     *      inputs          Map<String,object>   Map of Field Names and Values on which DML operations will be performed
     * @return Map<String,Object>                Result of DML operation with either success and error
     */
    protected Map<String,Object> save(String sobjectName, Map<String,object> inputs){
        if(!this.checkAllPermissionsOnObject(sobjectName)){
            throw new DatabasePermissionsClass.SobjectPermissionsException('DML is not allowed on ' + sobjectName);
        }

        set<String> fields = inputs.keySet();
        system.debug('fields---' + fields);
        Map<String,Object> result = this.checkAllPermissionsOnField(sobjectName, fields);
        Boolean isSuccess = (Boolean) result.get('isSuccess');
        List<String> inAccessibleFields = (List<String>) result.get('inAccessibleFields');
        if(!isSuccess){
            throw new DatabasePermissionsClass.FieldPermissionsException('DML is not allowed on following fields: ' + String.join(inAccessibleFields, ','));
        }
		System.debug('sobj - ' + sobjectName);
        sObject sobj = Schema.getGlobalDescribe().get(sobjectName).newSObject();
        for(String fieldName : inputs.keySet()){
            sobj.put(fieldName,inputs.get(fieldName));
        }
        System.debug('sobj55 - ' + sobj);
        Database.UpsertResult upsertResult = Database.upsert(sobj, this.ALL_OR_NONE);
        if(!upsertResult.isSuccess()){
            List<String> errMessages = new List<String>();
            String recordIdString = upsertResult.isCreated() ? 'Record Id: ' + upsertResult.getId() + ' - ' : '';
            for(Database.Error err : upsertResult.getErrors()){
                errMessages.add(recordIdString + err.getStatusCode() + ': ' + err.getMessage() + ': ' + err.getFields());
            }
            throw new DatabaseException('Following DML errors occurred: ' + String.join(errMessages, ' and '));
        }
        this.resultsMap.put('Id', upsertResult.getId());
        return this.resultsMap;
    }

   /**
     * @description This method will use upsert records in a sObject.
     * @params
     *      sobjectName     String                      Name of sObject
     *      inputs          List<Map<String,object>>    List of Map of Field Names and Values on which DML operations will be performed
     * @return Map<String,Object>                       Result of DML operation with either success and error
     */
    protected Map<String,Object> saveMultiple(String sobjectName, List<Map<String,Object>> inputs){
        if(!this.checkAllPermissionsOnObject(sobjectName)){
            throw new DatabasePermissionsClass.SobjectPermissionsException('DML is not allowed on ' + sobjectName);
        }

        // Add all fields into a set and check permission on them.
        set<String> allFields = new Set<String>(); 
        for(Map<String,Object> input : inputs){
            allFields.addAll(input.keySet());
        }

        
        Map<String,Object> result = this.checkAllPermissionsOnField(sobjectName, allFields);
        system.debug('idddd---' +result);
        Boolean isSuccess = (Boolean) result.get('isSuccess');
        List<String> inAccessibleFields = (List<String>) result.get('inAccessibleFields');
        if(!isSuccess){
            throw new DatabasePermissionsClass.FieldPermissionsException('DML is not allowed on following fields: ' + String.join(inAccessibleFields, ','));
        }

        List<sObject> sobjs = new List<sObject>();
        for(Map<String,Object> input : inputs){
            sObject sobj = Schema.getGlobalDescribe().get(sobjectName).newSObject();
            for(String fieldName : input.keySet()){
                sobj.put(fieldName,input.get(fieldName));
            }
            sobjs.add(sobj);
        }

        Set<String> allErrors = new Set<String>();
        Boolean dmlSuccess = true;
        for(Database.UpsertResult upsertResult : Database.upsert(sobjs, this.ALL_OR_NONE)){
            if(!upsertResult.isSuccess()){
                dmlSuccess = false;
                String recordIdString = upsertResult.isCreated() ? 'Record Id: ' + upsertResult.getId() + ' - ' : '';
                for(Database.Error err : upsertResult.getErrors()){
                    allErrors.add(recordIdString + err.getStatusCode() + ': ' + err.getMessage() + ': ' + err.getFields());
                }
            }
        }
        if(!dmlSuccess){
            throw new DatabaseException('Following DML errors occurred: ' + String.join( new List<String>(allErrors) , ' and '));
        }
        return this.resultsMap;
    }

    /**
     * @description This method will use delete record.
     * @params
     *      recordId     Id               sObject Id
     * @return Map<String,Object>                Result of DML operation with either success and error
     */
    protected Map<String,Object> remove(Id recordId){
        String sobjectName = recordId.getSobjectType().getDescribe().getName();
        if(!this.checkDeletePermissionOnObject(sobjectName)){
            throw new DatabasePermissionsClass.SobjectPermissionsException('DML is not allowed on ' + sobjectName);
        }
        Database.DeleteResult deleteResult = Database.delete(recordId, this.ALL_OR_NONE);
        if(!deleteResult.isSuccess()){
            List<String> errMessages = new List<String>();
            for(Database.Error err : deleteResult.getErrors()){
                errMessages.add(err.getStatusCode() + ': ' + err.getMessage() + ': ' + err.getFields());
            }
            throw new DatabaseException('Following DML errors occurred: ' + String.join(errMessages, ' and '));
        }
        return this.resultsMap;
    }

     /**
     * @description This method will use delete record.
     * @params
     *      recordId     Id               List of sObject Ids
     * @return Map<String,Object>                Result of DML operation with either success and error
     */
    protected Map<String,Object> removeMultiple(List<Id> recordIds){
        String sobjectName = recordIds[0].getSobjectType().getDescribe().getName();
        if(!this.checkDeletePermissionOnObject(sobjectName)){
            throw new DatabasePermissionsClass.SobjectPermissionsException('DML is not allowed on ' + sobjectName);
        }
        Set<String> allErrors = new Set<String>();
        Boolean dmlSuccess = true;
        for(Database.DeleteResult deleteResult : Database.delete(recordIds, this.ALL_OR_NONE)){
            if(!deleteResult.isSuccess()){
                dmlSuccess = false;
                for(Database.Error err : deleteResult.getErrors()){
                    allErrors.add('Record Id: ' + deleteResult.getId() + ': ' + err.getStatusCode() + ': ' + err.getMessage() + ': ' + err.getFields());
                }   
            }
        }
        if(!dmlSuccess){
            throw new DatabaseException('Following DML errors occurred: ' + String.join( new List<String>(allErrors) , ' and '));
        }
        return this.resultsMap;
    }
}