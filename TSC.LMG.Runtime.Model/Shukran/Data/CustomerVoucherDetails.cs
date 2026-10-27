using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran.Data
{
    [DataContract]
    public class CustomerVoucherDetails:BaseResponse
    {
        [DataMember]
        public string ProfileId { get; set; }

        [DataMember]
        public string VoucherNumber { get; set; }

        [DataMember]
        public string AmountOff { get; set; }

        [DataMember]
        public string VoucherStatus { get; set; }

        [DataMember]
        public string ConceptCode { get; set; }

        [DataMember]
        public string DiscountCode { get; set; }

        [DataMember]
        public string ThresholdAmount { get; set; }

        [DataMember]
        public string PercentageOff { get; set; }

        [DataMember]
        public string PrintStartDate { get; set; }

        [DataMember]
        public string PrintEndDate { get; set; }

        [DataMember]
        public string StoreCode { get; set; }

        [DataMember]
        public string OfferDetailsAR { get; set; }

        [DataMember]
        public string OfferDetailsEN { get; set; }
    }
}
