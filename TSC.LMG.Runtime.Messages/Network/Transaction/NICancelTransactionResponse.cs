using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network;

namespace TSC.LMG.Runtime.Messages.Network.Transaction
{
    public class NICancelTransactionResponse:Response
    {
        public NICancelTransactionResponse ( NIResultTransaction entity )
        {
            Entity = entity;
        }
        public NIResultTransaction Entity { get;set; }
    }
}
