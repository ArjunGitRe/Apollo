using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Customer
{
    [DataContract]
    public class DropDownOption
    {
        [DataMember]
        public string Text { get; set; }
        [DataMember]
        public string Value { get; set; }
    }
}
