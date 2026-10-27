using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network.Transactions;

namespace TSC.LMG.Runtime.Messages.Network
{
    public class GetNIGetStatusServiceResponse:Response
    {
        public GetNIGetStatusServiceResponse ( NIGetStatusResponseClass statusResp )
        {
            this.StatusResp = statusResp;
        }
        public NIGetStatusResponseClass StatusResp { get; private set; }
    }
}
