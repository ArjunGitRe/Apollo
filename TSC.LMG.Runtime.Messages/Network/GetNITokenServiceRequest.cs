using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Network
{
    public class GetNITokenServiceRequest:Request
    {
        public GetNITokenServiceRequest ( string transactionId )
        {
            this.TransactionId = transactionId;
        }
        public string TransactionId { get; set; }
    }
}
