using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    [DataContract]
    public class EnrollCustomerDetails: BaseResponse
    {
        [DataMember]
        public string ProfileId { get; set; }

        [DataMember]
        public string CardNumber { get; set; }
    }
}
