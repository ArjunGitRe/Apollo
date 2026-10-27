using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network.Transactions;

namespace TSC.LMG.Runtime.Messages.Network
{
    public class GetNIStartTransactionServiceResponse:Response
    {
        public GetNIStartTransactionServiceResponse ( NIStartTransactionResponseClass startTransactionResp )
        {
            this.StartTransactionResp = startTransactionResp;
        }
        public NIStartTransactionResponseClass StartTransactionResp { get; private set; }
    }
}
