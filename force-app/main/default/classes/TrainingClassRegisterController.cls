/**
 * @description       : registerForTrainingClasses LWC Controller
 * @author            : Anderson Morino
 * @group             : 
 * @last modified on  : 09-13-2022
 * @last modified by  : Anderson Morino
**/
public with sharing class TrainingClassRegisterController {
    /**
    * @description Get all upcoming training classes (Event object)
    * @author Anderson Morino | 09-12-2022 
    * @return List<Event> 
    **/
    @AuraEnabled(cacheable=true)
    public static List<Event> getTrainingClasses() {
        Id TrainingClassRT = Schema.SObjectType.Event.getRecordTypeInfosByName().get('Training Class').getRecordTypeId();
        Datetime currentTime = System.now();

        List<Event> trainingClasses = 
        [
            SELECT Id, Subject, DurationInMinutes, StartDateTime, EndDateTime
            FROM Event
            WHERE RecordTypeId =: TrainingClassRT
            AND Owner.Name = 'Training Classes'
            AND StartDateTime >: currentTime
            ORDER BY StartDateTime ASC
        ];

        return trainingClasses;
    }
  
    /**
    * @description Register for all selected training classes (insert each EventRelation related to the Event)
    * @author Anderson Morino | 09-12-2022 
    * @param trainingClasses 
    **/
    @AuraEnabled
    public static void bookTrainingClasses(List<Id> trainingClasses) {
        List<EventRelation> attendeeList = new List<EventRelation>();

        for (Id tc : trainingClasses) {
            EventRelation attendee = new EventRelation();
            attendee.EventId = tc;
            attendee.RelationId = UserInfo.getUserId();

            attendeeList.add(attendee);
        }

        try {
            insert attendeeList;
        } catch (Exception e) {
            throw new AuraHandledException('You are already registered for one or more Training Classes!');
        }
    }    
}