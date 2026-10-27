using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    [DataContract]
    public class CustomerCouponDetails
    {
        [DataMember]
        public string AmountOff { get; set; }
        [DataMember]

        public string RedeemStartDate { get; set; }

        [DataMember]
        public string VoucherStatus { get; set; }

        [DataMember]
        public string RedeemEndDate { get; set; }

        [DataMember]
        public string ConceptCode { get; set; }

        [DataMember]
        public string DiscountCode { get; set; }

        [DataMember]
        public decimal ThresholdAmount { get; set; }

        [DataMember]
        public string OfferDetailsAR { get; set; }

        [DataMember]
        public string OfferDetailsEN { get; set; }

        [DataMember]
        public string MemberCardNumber { get; set; }

        [DataMember]
        public string PercentageOff { get; set; }

        [DataMember]
        public string PrintStartDate { get; set; }

        [DataMember]
        public string PrintEndDate { get; set; }

        [DataMember]
        public string StoreCode { get; set; }

        [DataMember]
        public string ProfileId { get; set; }

        [DataMember]
        public string VoucherNumber { get; set; }
    }

    [DataContract]
    public class CustomerCouponResult
    {
        [DataMember]
        public List<CustomerCouponDetails> Coupons { get; set; }
        [DataMember]
        public bool Success { get; set; }
        [DataMember]
        public string Message { get; set; }

        public CustomerCouponResult()
        {
            Coupons = new List<CustomerCouponDetails>();
        }
    }
}
