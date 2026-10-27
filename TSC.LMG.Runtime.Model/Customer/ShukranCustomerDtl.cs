using Microsoft.Dynamics.Commerce.Runtime.ComponentModel.DataAnnotations;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Customer
{
    [DataContract]
    public class ShukranCustomerDtl : CommerceEntity
    {
        private const string ProfileIdColumn = "PROFILEID";
        private const string CardNumberColumn = "CARDNUMBER";
        private const string CountryCodeColumn ="COUNTRYCODE";
        private const string CashValueColumn = "REDEMPTIONCASHVALUE";
        public ShukranCustomerDtl() : base("ShukranCustomerDtl")
        {
        }

        [Column(ProfileIdColumn)]
        [DataMember]
        public string PROFILEID
        {
            get
            {
                return (string)this[ProfileIdColumn];
            }

            set
            {
                this[ProfileIdColumn] = value;
            }
        }

        [Column(CardNumberColumn)]
        [DataMember]
        public string CARDNUMBER
        {
            get
            {
                return (string)this[CardNumberColumn];
            }

            set
            {
                this[CardNumberColumn] = value;
            }
        }

        [Column(CountryCodeColumn)]
        [DataMember]
        public string COUNTRYCODE
        {
            get
            {
                return (string)this[CountryCodeColumn];
            }

            set
            {
                this[CountryCodeColumn] = value;
            }
        }

        [Column (CashValueColumn)]
        [DataMember]
        public string REDEMPTIONCASHVALUE
        {
            get
            {
                return (string) this[CashValueColumn];
            }

            set
            {
                this[CashValueColumn] = value;
            }
        }
    }
}
