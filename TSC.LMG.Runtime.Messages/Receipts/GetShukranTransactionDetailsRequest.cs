using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Receipts
{
    public class GetShukranTransactionDetailsRequest:Request
    {
        public GetShukranTransactionDetailsRequest(string transId)
        {
            TransId=transId;
        }
        public string TransId { get;set;}
    }
}
