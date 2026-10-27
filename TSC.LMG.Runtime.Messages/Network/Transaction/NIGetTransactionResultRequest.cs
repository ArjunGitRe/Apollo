using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Network.Transaction
{
    public class NIGetTransactionResultRequest:Request
    {
        public NIGetTransactionResultRequest ( string transactionId,string sourceId,string amount,string tenderLineNumber,string paymentType )
        {
            TransactionId    = transactionId;
            SourceId         = sourceId;
            Amount           = amount;
            TenderLineNumber = tenderLineNumber;
            PaymentType      = paymentType;
        }
        public string TransactionId { get; set;}
        public string SourceId { get;set; }
        public string Amount { get; set;}
        public string TenderLineNumber { get;set; }
        public string PaymentType { get;set; }
    }
}
