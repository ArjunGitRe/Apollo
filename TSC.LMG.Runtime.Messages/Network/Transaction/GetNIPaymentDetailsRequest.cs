using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Network.Transaction
{
    public class GetNIPaymentDetailsRequest:Request
    {
        public GetNIPaymentDetailsRequest ( string transactionId ,decimal lineNum )
        {
            TransactionId = transactionId;
            LineNum=lineNum;
        }
        public string TransactionId { get; set;}
        public decimal LineNum { get; set;}
    }
}
