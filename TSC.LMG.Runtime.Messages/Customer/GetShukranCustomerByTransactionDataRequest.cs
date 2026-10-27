using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Customer
{
    public class GetShukranCustomerByTransactionDataRequest:Request
    {
        public GetShukranCustomerByTransactionDataRequest(string transactionId)
        {
            this.TransactionId = transactionId;
        }
        public string TransactionId { get; }
    }
}
