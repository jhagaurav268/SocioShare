public class PlatformSettingsServices extends DatabaseOperationsClass {
    private String SOBJECT_NAME = 'Platform_Setting__c';
    
    public Map<String,Object> getRecord(Set<String> fields,Map<String,Set<String>> conditions){
        return this.executeQuery(this.SOBJECT_NAME,fields,conditions, 1);
    }
    public Map<String,Object> getRecords(Set<String> fields,Map<String,Set<String>> conditions){
        return this.executeQuery(this.SOBJECT_NAME,fields,conditions, Limits.getLimitQueryRows());
    }
    public Map<String,Object> insertRecord(Map<String,object> inputs){
        return this.save(this.SOBJECT_NAME, inputs);
    }
    public Map<String,Object> insertRecords(List<Map<String,Object>> inputs){
        return this.saveMultiple(this.SOBJECT_NAME, inputs);
    }
    public Map<String,Object> upsertRecord(Map<String,object> inputs){
        return this.save(this.SOBJECT_NAME, inputs);
    }
    public Map<String,Object> upsertRecords(List<Map<String,Object>> inputs){
        return this.saveMultiple(this.SOBJECT_NAME, inputs);
    }
    public Map<String,Object> updateRecords(List<Map<String,Object>> inputs){
        return this.saveMultiple(this.SOBJECT_NAME, inputs);
    }
    public Map<String,Object> updateRecord(Map<String,object> inputs){
        return this.save(this.SOBJECT_NAME, inputs);
    }
    public Map<String,Object> deleteRecord(Id recordId){
        return this.remove(recordId);
    }
    public Map<String,Object> deleteRecords(List<Id> recordIds){
        return this.removeMultiple(recordIds);
    }
}