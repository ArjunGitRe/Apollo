using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class ShukranTransactionServiceRequest:Request
    {
        public ShukranTransactionServiceRequest(ShukranTransactionRequest shukranTransactionRequest)
        {
            ShukranTransactionRequest=shukranTransactionRequest;
        }
        public ShukranTransactionRequest ShukranTransactionRequest { get;set;}
    }
}
