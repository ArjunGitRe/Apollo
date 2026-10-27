using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network.Transactions;

namespace TSC.LMG.Runtime.Messages.Network.Receipts
{
    public class GetNiPayDetailsForReceiptResponse:Response
    {
        public GetNiPayDetailsForReceiptResponse ( PagedResult<NIPaymentDetails> paymentNi )
        {
            PaymentNi = paymentNi;
        }
        public PagedResult<NIPaymentDetails> PaymentNi { get; set; }
    }
}
