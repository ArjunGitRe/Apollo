using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    public class CustomerProfileRequest
    {
        public string ProfileId { get; set; }
        public string FieldName { get; set; }
        public string LookupValue { get; set; }
        public string Country { get; set; }
    }
}
