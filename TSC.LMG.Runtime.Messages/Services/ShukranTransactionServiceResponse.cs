using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class ShukranTransactionServiceResponse:Response
    {
        public ShukranTransactionServiceResponse(ShukranTransactionResponse shukranTransactionResponse)
        {
            GetShukranTransactionResponse=shukranTransactionResponse;
        }
        public ShukranTransactionResponse GetShukranTransactionResponse { get;set;}
    }
}
