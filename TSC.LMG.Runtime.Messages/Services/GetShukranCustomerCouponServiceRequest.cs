using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranCustomerCouponServiceRequest:Request
    {
        public GetShukranCustomerCouponServiceRequest(string storeCode,string profileId,string conceptCode,string action,string transId)
        {
            StoreCode=storeCode;
            ProfileId=profileId;
            ConceptCode=conceptCode;
            Action=action;
            TransId=transId;
        }
        public string StoreCode { get;set;}
        public string ProfileId { get;set;}
        public string ConceptCode { get;set;}
        public string Action { get;set;}
        public string TransId { get;set;}
    }
}
