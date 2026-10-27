using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranCustomerEnrollServiceRequest:Request
    {
        public GetShukranCustomerEnrollServiceRequest(EnrollCustomerRequest enrollCustomerReq,string transId)
        {
            EnrollCustomerReq=enrollCustomerReq;
            TransId=transId;
        }
        public EnrollCustomerRequest EnrollCustomerReq { get;set;}
        public string TransId { get;set;}
    }
}
