using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Network.Transaction
{
    public class NIInitiateTransactionRequest:Request
    {
        public NIInitiateTransactionRequest ( string transactionId,string amount,string tenderLineNumber,string originalSourceId,bool isRefund,string transactionTypeOverride = "")
        {
            TransactionId    = transactionId;
            Amount           = amount;
            TenderLineNumber = tenderLineNumber;
            OriginalSourceId = originalSourceId;
            IsRefund = isRefund;
            TransactionTypeOverride = transactionTypeOverride;
        }
        public string TransactionId { get;set; }
        public string Amount { get; set;}
        public string TenderLineNumber { get;set; }
        public string OriginalSourceId { get;set; }
        public bool IsRefund { get;set; }
        public string TransactionTypeOverride { get; set; }
    }
}
