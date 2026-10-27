using Microsoft.Dynamics.Commerce.Runtime.ComponentModel.DataAnnotations;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Receipts
{
    public class OrginalTransModel:CommerceEntity
    {
        public const string ReceiptIDColumn = "RECEIPTID";
        public const string TransDateTime = "TRANSDATETIME"; 
        public const string TransBiginDateTime = "BEGINDATETIME"; 
        public OrginalTransModel():base("OrginalTransModel")
        {
        }

        [Column(ReceiptIDColumn)]
        [DataMember]
        public string RECEIPTID
        {
            get
            {
                return (string)this[ReceiptIDColumn];
            }

            set
            {
                this[ReceiptIDColumn] = value;
            }
        }

        [Column(TransDateTime)]
        [DataMember]
        public DateTime TRANSDATETIME
        {
            get
            {
                return (DateTime)this[TransDateTime];
            }

            set
            {
                this[TransDateTime] = value;
            }
        }

        [Column(TransBiginDateTime)]
        [DataMember]
        public DateTime BEGINDATETIME
        {
            get
            {
                return (DateTime)this[TransBiginDateTime];
            }

            set
            {
                this[TransBiginDateTime] = value;
            }
        }
    }
}
