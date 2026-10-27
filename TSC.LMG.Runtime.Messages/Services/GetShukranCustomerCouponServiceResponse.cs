using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranCustomerCouponServiceResponse:Response
    {
        public GetShukranCustomerCouponServiceResponse(CustomerCouponResult customerCouponDetails)
        {
            CustomerCouponDetails=customerCouponDetails;
        }
        public CustomerCouponResult CustomerCouponDetails { get;set;}
    }
}
