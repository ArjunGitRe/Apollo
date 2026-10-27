using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    public class CustomerCouponRequest
    {
        public string StoreCode { get;set;}
        public string ProfileId { get;set;}
        public string ConceptCode { get;set;}
        public string Action { get;set;}
    }
}
