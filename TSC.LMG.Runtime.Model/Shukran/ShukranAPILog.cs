using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    [DataContract]
    public class ShukranAPILog
    {
        [DataMember]
        public string TransactionId { get; set; }= string.Empty;
        [DataMember]
        public string APIName { get; set; } = string.Empty;
        [DataMember]
        public string APIRequest { get; set; } = string.Empty;
        [DataMember]
        public string APIResponse { get; set; } = string.Empty;
        [DataMember]
        public string RequestOn { get; set; }
        [DataMember]
        public string ResponseOn { get; set; } = string.Empty;
        [DataMember]
        public string ErrorMessage { get; set; } = string.Empty;
        [DataMember]
        public int StatusCode { get; set; } = 0;
    }
}
