using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran.Transactions;

namespace TSC.LMG.Runtime.Messages.Shukran.Transactions
{
    public class SaveShukranPendingTransactionDataRequest:Request
    {
        public SaveShukranPendingTransactionDataRequest(ShukranPendingTransaction pendingTransaction)
        {
            PendingTransaction = pendingTransaction;
        }
        public ShukranPendingTransaction PendingTransaction { get; }
    }
}
