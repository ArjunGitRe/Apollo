using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Customer
{
    public class ShukranCountries: CommerceEntity
    {
        public const string CountryRegionColumn = "COUNTRYREGIONID";
        public const string LongNameColumn = "LONGNAME";
        public const string ShortNameColumn = "SHORTNAME";
        public const string LanguageIdColumn = "LANGUAGEID";
        public ShukranCountries() : base("ShukranCountries")
        {
        }
        [Key]
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
