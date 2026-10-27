using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Network.Transaction
{
    public class NICancelTransactionRequest:Request
    {
        public NICancelTransactionRequest ( string transactionId,string sourceId,string amount,string tenderLineNumber )
        {
            TransactionId    = transactionId;
            SourceId         = sourceId;
            Amount           = amount;
            TenderLineNumber = tenderLineNumber;
        }
        public string TransactionId { get;set; }
        public string SourceId { get;set; }
        public string Amount { get; set;}
        public string TenderLineNumber { get;set; }
    }
}
