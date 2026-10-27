using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network.Transactions;

namespace TSC.LMG.Runtime.Messages.Network
{
    public class GetNICancelTransactionServiceRequest:Request
    {
        public GetNICancelTransactionServiceRequest ( NIStartTransactionsRequestClass cancelReq,string transId )
        {
            this.CancelReq = cancelReq;
            this.TransId = transId;
        }
        public NIStartTransactionsRequestClass CancelReq { get;  set; }
        public string TransId { get;  set; }
    }
}
