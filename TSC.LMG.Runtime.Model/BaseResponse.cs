using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model
{
    [DataContract]
    public class BaseResponse
    {
        [DataMember]
        public int Status { get;set;}

        [DataMember]
        public string Message { get;set;}

        [DataMember]
        public bool Success { get;set;}
    }
}
