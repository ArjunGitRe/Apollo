using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Shukran.Voucher
{
    public class GetProductDiscountOfferIdsDataRequest:Request
    {
        public GetProductDiscountOfferIdsDataRequest (string offerID )
        {
            OfferID=offerID;
        }
        public string OfferID { get;set;}
    }
}
