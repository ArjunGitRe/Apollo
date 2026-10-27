using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Network.Receipts
{
    public class GetNiPayDetailsForReceiptRequest:Request
    {
        public GetNiPayDetailsForReceiptRequest (string transactionID )
        {
            TransactionID=transactionID;
        }
        public string TransactionID { get;set;}
    }
}
