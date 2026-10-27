using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran.Voucher;

namespace TSC.LMG.Runtime.Messages.Shukran.Voucher
{
    public class GetProductDiscountOfferIdsDataResponse:Response
    {
        public GetProductDiscountOfferIdsDataResponse ( List<ProductOfferIdResult> productOfferMap )
        {
            this.ProductOfferMap = productOfferMap;
        }
        public List<ProductOfferIdResult> ProductOfferMap { get; private set; }

    }
}
