using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Network.Transactions
{
    [DataContract]
    public class NIStartTransactionsRequestClass
    {
        [DataMember]
        [JsonProperty ("transactionType")]
        public string TransactionType { get; set; }
        
        [DataMember]
        [JsonProperty ("sourceId")]
        public string SourceId { get; set; }
       
        [DataMember]
        [JsonProperty ("amount")]
        public string Amount { get; set; }

        [DataMember]
        [JsonProperty ("authCode")] 
        public string AuthCode { get; set; }

        [DataMember ]
        [JsonProperty ("otherAmount")] 
        public string OtherAmount { get; set; }

        [DataMember]
        [JsonProperty ("tokenTxn")] 
        public string TokenTxn { get; set; }

        [DataMember]
        [JsonProperty ("voidOriginalId")] 
        public string VoidOriginalId { get; set; }

        [DataMember]
        [JsonProperty ("originalId")] 
        public string OriginalId { get; set; }

        [DataMember]
        [JsonProperty ("refundApprovalCode")] 
        public string RefundApprovalCode { get; set; }
     
        [DataMember]
        [JsonProperty ("barcode")] 
        public string Barcode { get; set; }

        [DataMember]
        [JsonProperty ("phone")] 
        public string Phone { get; set; }

        [DataMember]
        [JsonProperty ("genericTransactionType")] 
        public string GenericTransactionType { get; set; }

        [DataMember]
        [JsonProperty ("rrn")] 
        public string Rrn { get; set; }
    }

    [DataContract]
    [JsonObject]
    public class NIStartTransactionResponseClass
    {
        [DataMember]
        [JsonProperty (PropertyName = "responseCode")]
        public string ResponseCode { get; set; } = "";

        [DataMember]
        [JsonProperty (PropertyName = "responseMessage")]
        public string ResponseMessage { get; set; } = "";

        [DataMember]
        [JsonProperty (PropertyName = "errorCode")]
        public string ErrorCode { get; set; } = "";

        [DataMember]
        [JsonProperty (PropertyName = "errorMessage")]
        public string ErrorMessage { get; set; } = "";

        [DataMember]
        [JsonProperty (PropertyName = "error_code")]
        public string ErrorCode1 { get; set; } = "";

        [DataMember]
        [JsonProperty (PropertyName = "error_description")]
        public string ErrorMessage1 { get; set; } = "";

    }

    //[DataContract]
    //[JsonObject]
    //public class NIStartTransactionErrorResponseClass
    //{
    //    [DataMember]
    //    [JsonProperty (PropertyName = "errorCode")]
    //    public string ErrorCode { get; set; } = "";

    //    [DataMember]
    //    [JsonProperty (PropertyName = "errorMessage")]
    //    public string ErrorMessage { get; set; } = "";

    //    [DataMember]
    //    [JsonProperty (PropertyName = "error_code")]
    //    public string ErrorCode1 { get; set; } = "";

    //    [DataMember]
    //    [JsonProperty (PropertyName = "error_description")]
    //    public string ErrorMessage1 { get; set; } = "";

    //}
}
