using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    public class ShukranTransactionResponse
    {
        [JsonProperty("ProfileId")]
        public string ProfileId { get; set; }

        [JsonProperty("CardNumber")]
        public string CardNumber { get; set; }

        [JsonProperty("TransactionNumber")]
        public string TransactionNumber { get; set; }

        [JsonProperty("Coupons")]
        public List<object> Coupons { get; set; }

        [JsonProperty("JsonExternalData")]
        public TransactionResponseExternalData JsonExternalData { get; set; }

        [JsonIgnore]
        public int HttpStatusCode { get; set; }
    }
    public class TransactionResponseExternalData
    {
        [JsonProperty("TotalPointsRedeemed")]
        public int TotalPointsRedeemed { get; set; }

        [JsonProperty("TotalPointsEarned")]
        public decimal TotalPointsEarned { get; set; }

        [JsonProperty("TotalPointsBalance")]
        public int TotalPointsBalance { get; set; }
    }
}
