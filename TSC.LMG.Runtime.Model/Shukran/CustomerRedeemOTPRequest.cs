using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    [DataContract]
    public class CustomerRedeemOTPRequest
    {
        public class ShukranRedeemOTPModel
        {
            public MergeTriggerRecordData mergeTriggerRecordData { get; set; }
            public MergeRule mergeRule { get; set; }
            public string requestType { get; set; }
        }

        public class MergeTriggerRecordData
        {
            public List<MergeTriggerRecord> mergeTriggerRecords { get; set; }
            public List<string> fieldNames { get; set; }
        }

        public class MergeTriggerRecord
        {
            public List<string> fieldValues { get; set; }
            public List<OptionalData> optionalData { get; set; }
        }

        public class OptionalData
        {
            public string name { get; set; }
            public string value { get; set; }
        }
        public class MergeRule
        {
            public string htmlValue { get; set; }
            public string matchColumnName1 { get; set; }
            public string matchColumnName2 { get; set; }
            public string optoutValue { get; set; }
            public string optinValue { get; set; }
            public bool insertOnNoMatch { get; set; }
            public string defaultPermissionStatus { get; set; }
            public string rejectRecordIfChannelEmpty { get; set; }
            public string updateOnMatch { get; set; }
            public string textValue { get; set; }
            public string matchOperator { get; set; }
        }
    }
}
