using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Network
{
    [DataContract]
    public class NIStartTransaction
    {
        [DataMember]
        public int Id { get; set; } = 0;

        [DataMember]
        public string SourceId { get; set; } = "";

        [DataMember]
        public string respCode { get; set; } = "";

        [DataMember]
        public string respMsg { get; set; } = "";

        [DataMember]
        public string errCode { get; set; } = "";

        [DataMember]
        public string errMsg { get; set; } = "";

    }
    public class NIResultTransaction
    {
        [DataMember]
        public int Id { get; set; } = 0;

        [DataMember]
        public string SourceId { get; set; } = "";

        [DataMember]
        public string respCode { get; set; } = "";

        [DataMember]
        public string respMsg { get; set; } = "";

        [DataMember]
        public string errCode { get; set; } = "";

        [DataMember]
        public string errMsg { get; set; } = "";

        [DataMember]
        public string Amount { get; set; } = "";

        [DataMember]
        public string CardType { get; set; } = "";

        [DataMember]
        public string PanMasked { get; set; } = "";

        [DataMember]
        public string AuthCode { get; set; } = "";

        [DataMember]
        public string Rrn { get; set; } = "";

    }
}
