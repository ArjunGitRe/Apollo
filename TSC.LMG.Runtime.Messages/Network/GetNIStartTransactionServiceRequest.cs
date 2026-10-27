using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network.Transactions;

namespace TSC.LMG.Runtime.Messages.Network
{
    public class GetNIStartTransactionServiceRequest:Request
    {
        public GetNIStartTransactionServiceRequest ( NIStartTransactionsRequestClass startTransactionReq,string transId )
        {
            this.StartTransactionReq = startTransactionReq;
            this.TransId = transId;
        }
        public NIStartTransactionsRequestClass StartTransactionReq { get; private set; }
        public string TransId { get; private set; }
    }
}
