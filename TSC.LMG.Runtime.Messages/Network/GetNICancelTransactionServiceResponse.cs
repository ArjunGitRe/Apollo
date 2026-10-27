using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network.Transactions;

namespace TSC.LMG.Runtime.Messages.Network
{
    public class GetNICancelTransactionServiceResponse:Response
    {
        public GetNICancelTransactionServiceResponse ( NIStartTransactionResponseClass cancelResp )
        {
            this.CancelResp = cancelResp;
        }
        public NIStartTransactionResponseClass CancelResp { get;  set; }
    }
}
