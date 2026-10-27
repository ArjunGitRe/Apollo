using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network.Transactions;

namespace TSC.LMG.Runtime.Messages.Network.Transaction
{
    public class GetNIPaymentDetailsResponse:Response
    {
        public GetNIPaymentDetailsResponse ( PagedResult<NIPaymentDetails> result )
        {
            Result = result;
        }
        public PagedResult<NIPaymentDetails> Result { get;set; }
    }
}
