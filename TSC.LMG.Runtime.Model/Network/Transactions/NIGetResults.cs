using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Network.Transactions
{
    [DataContract]
    public class NIGetResultRequestClass
    {
        [DataMember]
        [JsonProperty ("sourceId")]
        public string SourceId { get; set; }
    }

    [DataContract]
    public class NIGetResultResponseClass
    {
        [DataMember]
        [JsonProperty ("AC")] 
        public string ApplicationCryptogram { get; set; }

        [DataMember]
        [JsonProperty ("AID")] 
        public string ApplicationIdentifier { get; set; }

        [DataMember]
        [JsonProperty ("ApplicationVersion")]
        public string ApplicationVersion { get; set; }

        [DataMember]
        [JsonProperty ("CID")] 
        public string CryptogramInformationData { get; set; }

        [DataMember]
        [JsonProperty ("ExpiryDate")] 
        public string ExpiryDate { get; set; }

        [DataMember]
        [JsonProperty ("Label")] 
        public string Label { get; set; }

        [DataMember]
        [JsonProperty ("MID")] 
        public string MerchantId { get; set; }

        [DataMember]
        [JsonProperty ("ReceiptNo")] 
        public string ReceiptNumber { get; set; }

        [DataMember]
        [JsonProperty ("TID")] 
        public string TerminalId { get; set; }

        [DataMember]
        [JsonProperty ("TSI")] 
        public string TransactionStatusInformation { get; set; }

        [DataMember]
        [JsonProperty ("TVR")] 
        public string TerminalVerificationResults { get; set; }

        [DataMember]
        [JsonProperty ("TransactionDate")] 
        public string TransactionDate { get; set; }

        [DataMember]
        [JsonProperty ("TransactionTime")] 
        public string TransactionTime { get; set; }

        // Common txn data (mirrors GetStatusResponseMessage)

        [DataMember ]
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
        public int Currency { get; set; }

        [DataMember]
        [JsonProperty ("custReceipt")]
        public List<CustReceiptItem> CustomerReceipt { get; set; }

        [DataMember]
        [JsonProperty ("merchReceipt")]
        public List<MerchReceiptItem> MerchantReceipt { get; set; }


        [DataMember]
        [JsonProperty ("offline")]
        public string OffLine { get; set; }

        [DataMember]
        [JsonProperty ("panMasked")]
        public string PanMasked { get; set; }

        [DataMember]
        [JsonProperty ("resultCode")]
        public string ResultCode { get; set; }

        [DataMember]
        [JsonProperty ("resultCodeDescription")]
        public string ResultCodeDescription { get; set; }

        [DataMember]
        [JsonProperty ("rrn")]
        public string Rrn { get; set; }

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
        [JsonProperty ("type")]
        public string Type { get; set; }
    }

    [DataContract]
    public class CustReceiptItem
    {
        [DataMember]
        [JsonProperty (PropertyName = "style")]
        public string Style { get; set; } = "";

        [DataMember]
        [JsonProperty (PropertyName = "text")]
        public string Text { get; set; } = "";

        [DataMember]
        [JsonProperty (PropertyName = "textLeft")]
        public string TextLeft { get; set; } = "";

        [DataMember]
        [JsonProperty (PropertyName = "textRight")]
        public string TextRight { get; set; } = "";
    }

    [DataContract]
    public class MerchReceiptItem
    {
        [DataMember]
        [JsonProperty (PropertyName = "style")]
        public string Style { get; set; } = "";

        [DataMember]
        [JsonProperty (PropertyName = "text")]
        public string Text { get; set; } = "";

        [DataMember]
        [JsonProperty (PropertyName = "textLeft")]
        public string TextLeft { get; set; } = "";

        [DataMember]
        [JsonProperty (PropertyName = "textRight")]
        public string TextRight { get; set; } = "";
    }

    [DataContract]
    public class NIGetResultErrorResponseClass
    {
        [DataMember]
        [JsonProperty ("errorCode")]
        public string ErrorCode { get; set; } = "";

        [DataMember]
        [JsonProperty ("errorMessage")]
        public string ErrorMessage { get; set; } = "";
    }
}
