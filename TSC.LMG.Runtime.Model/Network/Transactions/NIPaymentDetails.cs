using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Network.Transactions
{
    [DataContract]
    public class NIPaymentDetails:CommerceEntity
    {
        private const string transIdColumn = "TransactionId";
        private const string sourceIdColumn = "SourceId";
        private const string amtColumn = "Amount";
        private const string transDateColumn = "TransactionDate";
        private const string lineNumColumn = "LineNum";
        private const string paymentIdColumn = "PaymentId";
        private const string midColumn = "MID";
        private const string tidColumn = "TID";
        private const string aidColumn = "AID";
        private const string authCodeColumn = "AuthCode";
        private const string labelColumn = "Label";
        private const string niReceiptNoColumn = "ReceiptNo";

        public NIPaymentDetails ( ):base("NIPaymentDetails") 
        {
        }

        [Column(transIdColumn)]
        [DataMember]
        public string TransactionId
        {
            get
            {
                return(string) this[transIdColumn];
            }
            set
            {
                this[transIdColumn]=value;
            }
        }

        [Column (sourceIdColumn)]
        [DataMember]
        public string SourceId
        {
            get
            {
                return (string) this[sourceIdColumn];
            }
            set
            {
                this[sourceIdColumn]=value;
            }
        }

        [Column (amtColumn)]
        [DataMember]
        public decimal Amount
        {
            get
            {
                return (decimal) this[amtColumn];
            }
            set
            {
                this[amtColumn]=value;
            }
        }

        [Column (transDateColumn)]
        [DataMember]
        public DateTime TransactionDate
        {
            get
            {
                return (DateTime) this[transDateColumn];
            }
            set
            {
                this[transDateColumn]=value;
            }
        }

        [Column (lineNumColumn)]
        [DataMember]
        public decimal LineNum
        {
            get
            {
                return (decimal) this[lineNumColumn];
            }
            set
            {
                this[lineNumColumn]=value;
            }
        }

        [Column (paymentIdColumn)]
        [DataMember]
        public string PaymentId
        {
            get
            {
                return (string) this[paymentIdColumn];
            }
            set
            {
                this[paymentIdColumn]=value;
            }
        }

        [Column (midColumn)]
        [DataMember]
        public string MID
        {
            get { return (string) this[midColumn]; }
            set { this[midColumn] = value; }
        }

        [Column (tidColumn)]
        [DataMember]
        public string TID
        {
            get { return (string) this[tidColumn]; }
            set { this[tidColumn] = value; }
        }

        [Column (aidColumn)]
        [DataMember]
        public string AID
        {
            get { return (string) this[aidColumn]; }
            set { this[aidColumn] = value; }
        }

        [Column (authCodeColumn)]
        [DataMember]
        public string AuthCode
        {
            get { return (string) this[authCodeColumn]; }
            set { this[authCodeColumn] = value; }
        }

        [Column (labelColumn)]
        [DataMember]
        public string Label
        {
            get { return (string) this[labelColumn]; }
            set { this[labelColumn] = value; }
        }

        [Column (niReceiptNoColumn)]
        [DataMember]
        public string ReceiptNo
        {
            get { return (string) this[niReceiptNoColumn]; }
            set { this[niReceiptNoColumn] = value; }
        }
    }
}
