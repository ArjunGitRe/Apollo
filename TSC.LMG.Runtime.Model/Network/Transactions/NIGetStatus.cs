using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Network.Transactions
{
    [DataContract]
    public class NIGetStatusRequestClass
    {
        [DataMember]
        [JsonProperty ("sourceId")]
        public string SourceId { get; set; } = "";
    }

    [DataContract]
    public class NIGetStatusResponseClass
    {
        [DataMember]
        [JsonProperty ("amount")] 
        public string Amount { get; set; }

        [DataMember]
        [JsonProperty ("authCode")]
        public string AuthCode { get; set; }

        [DataMember]
        [JsonProperty ("cardInserted")] 
        public bool CardInserted { get; set; }

        [DataMember]
        [JsonProperty ("cardReadMode")] 
        public string CardReadMode { get; set; }

        [DataMember]
        [JsonProperty ("cardType")] 
        public string CardType { get; set; }

        [DataMember]
        [JsonProperty ("cashback")] 
        public string Cashback { get; set; }

        [DataMember]
        [JsonProperty ("complete")] 
        public bool Complete { get; set; }

        [DataMember]
        [JsonProperty ("currency")] 
        public string Currency { get; set; }

        [DataMember]
        [JsonProperty ("currencyDecimalPlaces")] 
        public string CurrencyDecimalPlaces { get; set; }

        [DataMember]
        [JsonProperty ("dccAccepted")] 
        public bool DccAccepted { get; set; }

        [DataMember]
        [JsonProperty ("dccAmount")] 
        public string DccAmount { get; set; }

        [DataMember]
        [JsonProperty ("dccCurrencyCode")] 
        public string DccCurrencyCode { get; set; }

        [DataMember]
        [JsonProperty ("dccDecimalPlaces")] 
        public string DccDecimalPlaces { get; set; }

        [DataMember]
        [JsonProperty ("dccExchangeRate")] 
        public string DccExchangeRate { get; set; }

        [DataMember]
        [JsonProperty ("dccExchangeRateProvider")]
        public string DccExchangeRateProvider { get; set; }

        [DataMember]
        [JsonProperty ("dccMargin")] 
        public string DccMargin { get; set; }

        [DataMember ]
        [JsonProperty ("dccOffered")] 
        public bool DccOffered { get; set; }

        [DataMember ]
        [JsonProperty ("declined")] 
        public bool Declined { get; set; }

        [DataMember]
        [JsonProperty ("discountAmount")] 
        public string DiscountAmount { get; set; }

        [DataMember]
        [JsonProperty ("displayText")] 
        public string DisplayText { get; set; }

        [DataMember]
        [JsonProperty ("eposCheckCard")] 
        public bool EposCheckCard { get; set; }

        [DataMember]
        [JsonProperty ("inProgress")] 
        public bool InProgress { get; set; }

        [DataMember]
        [JsonProperty ("maxTipAmount")] 
        public string MaxTipAmount { get; set; }

        [DataMember]
        [JsonProperty ("newAmount")] 
        public string NewAmount { get; set; }

        [DataMember]
        [JsonProperty ("offline")] 
        public bool Offline { get; set; }

        [DataMember]
        [JsonProperty ("panMasked")] 
        public string PanMasked { get; set; }

        [DataMember]
        [JsonProperty ("parameter")] 
        public string Parameter { get; set; }

        [DataMember]
        [JsonProperty ("parameterType")] 
        public string ParameterType { get; set; }

        [DataMember]
        [JsonProperty ("result")]
        public string Result { get; set; }

        [DataMember]
        [JsonProperty ("resultCode")] 
        public string ResultCode { get; set; }

        [DataMember]
        [JsonProperty ("resultCodeDescription")] 
        public string ResultCodeDescription { get; set; }

        [DataMember]
        [JsonProperty ("signatureRequired")] 
        public bool SignatureRequired { get; set; }

        [DataMember]
        [JsonProperty ("sourceid")] 
        public string SourceId { get; set; }

        [DataMember]
        [JsonProperty ("success")] 
        public bool Success { get; set; }

        [DataMember]
        [JsonProperty ("tokenTransaction")] 
        public bool TokenTransaction { get; set; }

        [DataMember]
        [JsonProperty ("rrn")]
        public string Rrn { get; set; }

        [DataMember]
        [JsonProperty ("type")]
        public string Type { get; set; }
    }

    [DataContract]
    public class NIGetStatusErrorResponseClass
    {
        [DataMember]
        [JsonProperty ("errorCode")]
        public string ErrorCode { get; set; } = "";

        [DataMember]
        [JsonProperty ("errorMessage")]
        public string ErrorMessage { get; set; } = "";
    }
}
