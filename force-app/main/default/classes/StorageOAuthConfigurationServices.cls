public class StorageOAuthConfigurationServices extends DatabaseOperationsClass {
	private String SOBJECT_NAME = 'Storage_OAuth_Configuration__mdt';
    
    public Map<String,Object> getRecord(Set<String> fields,Map<String,Set<String>> conditions){
        return this.executeQuery(this.SOBJECT_NAME,fields,conditions, 1);
    }
    public Map<String,Object> getRecords(Set<String> fields,Map<String,Set<String>> conditions){
        return this.executeQuery(this.SOBJECT_NAME,fields,conditions, Limits.getLimitQueryRows());
    }
    public Map<String,Object> insertRecord(Map<String,object> inputs){
        return new Map<String,Object>();
    }
    public Map<String,Object> insertRecords(List<Map<String,Object>> inputs){
        return new Map<String,Object>();
    }
    public Map<String,Object> upsertRecord(Map<String,object> inputs){
        return new Map<String,Object>();
    }
    public Map<String,Object> upsertRecords(List<Map<String,Object>> inputs){
        return new Map<String,Object>();
    }
    public Map<String,Object> updateRecords(List<Map<String,Object>> inputs){
        return new Map<String,Object>();
    }
    public Map<String,Object> updateRecord(Map<String,object> inputs){
        return new Map<String,Object>();
    }
    public Map<String,Object> deleteRecord(Id recordId){
        return new Map<String,Object>();
    }
    public Map<String,Object> deleteRecords(List<Id> recordIds){
        return new Map<String,Object>();
    }
}