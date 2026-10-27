using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    public class CustomerVoucherRequest
    {
        public string ProfileId { get; set; }
        public string StoreCode { get; set; }
        public string ConceptCode { get; set; }
        public string DiscountCouponCode { get; set; }
        public string VoucherNumber { get; set; }
        public string TransactionNumber { get; set; }
        public string Action { get; set; }
    }
}
