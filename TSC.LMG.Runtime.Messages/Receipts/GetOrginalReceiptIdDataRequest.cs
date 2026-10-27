using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Receipts
{
    public class GetOrginalReceiptIdDataRequest:Request
    {
        public GetOrginalReceiptIdDataRequest(string transactionId)
        {
            TransaactionId=transactionId;
        }
        public string TransaactionId { get;set;}
    }
}
