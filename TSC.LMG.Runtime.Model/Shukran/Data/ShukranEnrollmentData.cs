using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran.Data
{
    public class ShukranEnrollmentData: CommerceEntity
    {
        private const string ProfileIdColumn = "PROFILEID";
        private const string FirstNameColumn = "FIRSTNAME";
        private const string LastNameColumn = "LASTNAME";
        private const string CardNumberColumn = "CARDNUMBER";
        private const string CountryCodeColumn = "COUNTRYCODE";
        private const string EmailAddressColumn = "EMAILADDRESS";
        private const string PhoneNumberColumn = "PHONENUMBER";
        private const string StatusColumn = "STATUS";
        private const string LanguageCodeColumn = "LANGUAGECODE";
        private const string JoinDateColumn = "JOINDATE";
        private const string PrefixColumn = "PREFIX";
        private const string RecIdColumn = "RECID";
        private const string TierColum ="TIER";

        public ShukranEnrollmentData() : base("TSCSHUKRANCUSTOMER") 
        { 

        }
        public long RECID
        {
            get { return (long)this[RecIdColumn]; }
            set { this[RecIdColumn] = value; }
        }
        public string ProfileId
        {
            get { return (string)this[ProfileIdColumn]; }
            set { this[ProfileIdColumn] = value; }
        }

        public string FirstName
        {
            get { return (string)this[FirstNameColumn]; }
            set { this[FirstNameColumn] = value; }
        }

        public string LastName
        {
            get { return (string)this[LastNameColumn]; }
            set { this[LastNameColumn] = value; }
        }

        public string CardNumber
        {
            get { return (string)this[CardNumberColumn]; }
            set { this[CardNumberColumn] = value; }
        }

        public string CountryCode
        {
            get { return (string)this[CountryCodeColumn]; }
            set { this[CountryCodeColumn] = value; }
        }

        public string EmailAddress
        {
            get { return (string)this[EmailAddressColumn]; }
            set { this[EmailAddressColumn] = value; }
        }

        public string PhoneNumber
        {
            get { return (string)this[PhoneNumberColumn]; }
            set { this[PhoneNumberColumn] = value; }
        }

        public string Status
        {
            get { return (string)this[StatusColumn]; }
            set { this[StatusColumn] = value; }
        }

        public string LanguageCode
        {
            get { return (string)this[LanguageCodeColumn]; }
            set { this[LanguageCodeColumn] = value; }
        }

        public DateTime JoinDate
        {
            get { return (DateTime)this[JoinDateColumn]; }
            set { this[JoinDateColumn] = value; }
        }

        public string Prefix
        {
            get { return (string)this[PrefixColumn]; }
            set { this[PrefixColumn] = value; }
        }

        public string Tier
        {
            get { return (string) this[TierColum]; }
            set { this[TierColum] = value; }
        }
    }
}
