using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.ComponentModel.DataAnnotations;
using SystemDataAnnotations = System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model
{
    public class PriceRRSP : CommerceEntity
    {
        public const string RecIdColumn = "RECID";
        public const string ItemIdColumn = "ITEMID";
        public const string BarcodeColumn = "BARCODE";
        public const string ColorColumn = "COLOR";
        public const string SizeColumn = "SIZE";
        public const string RRSPColumn = "RRSP";
        public const string PriceFlagColumn = "LTPRICEFLAG";


        public PriceRRSP()
            : base("PriceRRSP")
        {
        }

        [SystemDataAnnotations.Key]
        [Column(RecIdColumn)]
        [DataMember]
        public int RecId
        {
            get { return (int)this[RecIdColumn]; }
            set { this[RecIdColumn] = value; }
        }

        [Column(ItemIdColumn)]
        [DataMember]
        public string ItemId
        {
            get { return (string)this[ItemIdColumn]; }
            set { this[ItemIdColumn] = value; }
        }


        [Column(BarcodeColumn)]
        [DataMember]
        public string Barcode
        {
            get { return (string)this[BarcodeColumn]; }
            set { this[BarcodeColumn] = value; }
        }


        [Column(ColorColumn)]
        [DataMember]
        public string Color
        {
            get { return (string)this[ColorColumn]; }
            set { this[ColorColumn] = value; }
        }

        [Column(SizeColumn)]
        [DataMember]
        public string Size
        {
            get { return (string)this[SizeColumn]; }
            set { this[SizeColumn] = value; }
        }



        [Column(RRSPColumn)]
        [DataMember]
        public decimal RRSP
        {
            get { return (decimal)this[RRSPColumn]; }
            set { this[RRSPColumn] = value; }
        }


        [Column(PriceFlagColumn)]
        [DataMember]
        public int PrciceFlag
        {
            get { return (int)this[PriceFlagColumn]; }
            set { this[PriceFlagColumn] = value; }
        }
    }
}
