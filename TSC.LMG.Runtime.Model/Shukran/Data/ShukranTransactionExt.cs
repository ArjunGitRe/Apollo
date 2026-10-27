using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran.Data
{
    public class ShukranTransactionExt
    {
        public string Store { get; set; }
        public string Terminal { get; set; }
        public string TransactionId { get; set; }
        public long Channel { get; set; }
        public string DataAreaId { get; set; }
        public string ProfileId { get; set; }
        public int TotalPointsRedeemed { get; set; }
        public decimal TotalPointsEarned { get; set; }
        public int TotalPointsBalance { get; set; }
        public bool IsSynced { get; set; }
        public int StatusCode { get; set; }
        public string ReceiptId { get;set;}

        public string CardNumber { get; set; }
        public string RedemptionCashValue { get; set; }
        public string ConceptCode { get; set; }
        public string OriginalTransactionId { get; set; }
        public DateTime CreatedDateTime { get; set; }

        public string CrossBorderFlag { get; set; }
        public string StoreCountryCode { get; set; }
        public string Tier { get; set; }
    }
}
