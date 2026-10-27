using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranCustomerVoucherServiceRequest:Request
    {
        public GetShukranCustomerVoucherServiceRequest(string profileId,string storeCode,string conceptCode,string disCouponCode,string voucherCode,string transId,string action)
        {
            ProfileId=profileId;
            StoreCode=storeCode;
            ConceptCode=conceptCode;
            DiscountCouponCode=disCouponCode;
            VoucherNumber=voucherCode;
            TransactionNumber=transId;
            Action=action;
        }
        public string ProfileId { get; set; }
        public string StoreCode { get; set; }
        public string ConceptCode { get; set; }
        public string DiscountCouponCode { get; set; }
        public string VoucherNumber { get; set; }
        public string TransactionNumber { get; set; }
        public string Action { get; set; }
    }
}
