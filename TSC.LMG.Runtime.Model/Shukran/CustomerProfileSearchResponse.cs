using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    [DataContract]
    public class CustomerProfileSearchResponse:BaseResponse
    {
        [DataMember]
        public CustomerProfileDetails CustomerProfileDetails { get;set;}

        [DataMember]
        public string StoreCountryCode { get;set;}

        [DataMember]
        public string ShukranCustAccount { get;set;}
    }
}
