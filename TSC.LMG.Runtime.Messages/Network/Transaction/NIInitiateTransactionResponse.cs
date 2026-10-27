using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network;

namespace TSC.LMG.Runtime.Messages.Network.Transaction
{
    public class NIInitiateTransactionResponse:Response
    {
        public NIInitiateTransactionResponse ( NIStartTransaction entity )
        {
            Entity = entity;
        }
        public NIStartTransaction Entity { get;set; }
    }
}
