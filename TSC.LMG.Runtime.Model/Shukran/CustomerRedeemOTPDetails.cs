using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    [DataContract]
    public class CustomerRedeemOTPDetails
    {
        [DataMember]
        public string errorMessage { get; set; }

        [DataMember]
        public long recipientId { get; set; }

        [DataMember]
        public bool success { get; set; }
    }
}
