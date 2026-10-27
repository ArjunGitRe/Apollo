using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Shukran
{
    public class GetShukranTenderTypeDetailsRequest:Request
    {
        public GetShukranTenderTypeDetailsRequest(string tenderTypeId)
        {
            TenderTypeId=tenderTypeId;
        }
        public string TenderTypeId { get;set;}
    }
}
