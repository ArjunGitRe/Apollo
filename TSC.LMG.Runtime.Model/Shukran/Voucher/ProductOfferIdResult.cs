using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran.Voucher
{
    public class ProductOfferIdResult:CommerceEntity
    {
        private const string ProductIdColumn = "PRODUCTID";
        private const string OfferIdColumn = "OFFERID";
        private const string CouponCodeColumn = "COUPONCODE";
        public ProductOfferIdResult ( ) : base ("ProductOfferIdResult") 
        { 
        }

        [DataMember]
        public long ProductId
        {
            get => (long) (this[ProductIdColumn] ?? 0L);
            set => this[ProductIdColumn] = value;
        }

        [DataMember]
        public string OfferId
        {
            get => (string) (this[OfferIdColumn] ?? string.Empty);
            set => this[OfferIdColumn] = value;
        }

        [DataMember]
        public string CouponCode
        {
            get => (string) (this[CouponCodeColumn] ?? string.Empty);
            set => this[CouponCodeColumn] = value;
        }
    }
}
