using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using Microsoft.Dynamics.Commerce.Runtime.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using SystemDataAnnotations = System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.Runtime.Model.Customer
{
    [DataContract]
    public class CountryCode : CommerceEntity
    {
        public const string CountryRegionColumn = "COUNTRYREGIONID";
        public const string MobileCountryCodeColumn = "MOBILECOUNTRYCODE";
        public const string MobileNumberLengthColumn = "MOBILENUMBERLENGTH";
        public const string ShortNameColumn = "SHORTNAME";
        public const string LongNameColumn = "LONGNAME";
        public const string LanguageIdColumn = "LANGUAGEID";
        public CountryCode() : base("TSCLOGISTICSADDRESSCOUNTRYREGION")
        {
        }


        [Column(CountryRegionColumn)]
        [DataMember]
        public string CountryRegionId
        {
            get
            {
                return (string)this[CountryRegionColumn];
            }

            set
            {
                this[CountryRegionColumn] = value;
            }
        }
        [Column(MobileCountryCodeColumn)]
        [DataMember]
        public int MobileCountryCode
        {
            get
            {
                return (int)this[MobileCountryCodeColumn];
            }

            set
            {
                this[MobileCountryCodeColumn] = value;
            }
        }
        [Column(MobileNumberLengthColumn)]
        [DataMember]
        public int MobileNumberLength
        {
            get
            {
                return (int)this[MobileNumberLengthColumn];
            }

            set
            {
                this[MobileNumberLengthColumn] = value;
            }
        }
        [Column(ShortNameColumn)]
        [DataMember]
        public string ShortName
        {
            get
            {
                return (string)this[ShortNameColumn];
            }

            set
            {
                this[ShortNameColumn] = value;
            }
        }
        [Column(LongNameColumn)]
        [DataMember]
        public string LongName
        {
            get
            {
                return (string)this[LongNameColumn];
            }

            set
            {
                this[LongNameColumn] = value;
            }
        }
        [Column(LanguageIdColumn)]
        [DataMember]
        public string LanguageId
        {
            get
            {
                return (string)this[LanguageIdColumn];
            }

            set
            {
                this[LanguageIdColumn] = value;
            }
        }
    }
}
