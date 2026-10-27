using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Receipts;

namespace TSC.LMG.Runtime.Messages.Receipts
{
    public class GetShukranTransactionDetailsResponse:Response
    {
        public GetShukranTransactionDetailsResponse(ShukranTransDetails shukranTransDetails)
        {
            ShukranTransDetails=shukranTransDetails;
        }
        public ShukranTransDetails ShukranTransDetails { get;set;}
    }
}
