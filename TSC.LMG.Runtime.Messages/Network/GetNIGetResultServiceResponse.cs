using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network.Transactions;

namespace TSC.LMG.Runtime.Messages.Network
{
    public class GetNIGetResultServiceResponse:Response
    {
        public GetNIGetResultServiceResponse ( NIGetResultResponseClass resultResp )
        {
            this.ResultResp = resultResp;
        }
        public NIGetResultResponseClass ResultResp { get; private set; }
    }
}
