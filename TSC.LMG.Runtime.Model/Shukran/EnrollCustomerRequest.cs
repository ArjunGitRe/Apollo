using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    public class EnrollCustomerRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string City { get; set; }
        public string Gender { get; set; }
        public string BirthDate { get; set; }
        public string Prefix { get; set; }
        public object Addresses { get; set; }
        public List<EnrollEmail> Emails { get; set; }
        public List<EnrollPhone> Phones { get; set; }
        public string SourceCode { get; set; }
        public string EnrollmentStoreCode { get; set; }
        public string LanguageCode { get; set; }
        public string JoinDate { get; set; }
        public string CardNumber { get; set; }
        public string EnrollChannelCode { get; set; }
        public EnrollJsonExternalData JsonExternalData { get; set; }
    }
    public class EnrollEmail
    {
        public string EmailAddress { get; set; }
    }

    public class EnrollPhone
    {
        public string PhoneNumber { get; set; }
    }
    public class EnrollJsonExternalData
    {
        public string CashierID { get; set; }
        public string EnrollmentInvoiceNumber { get; set; }
        public string LandLineNumber { get; set; }
        public string Nationality { get; set; }
        public string PH_OTPVerified { get; set; }
        public string ActivatedIn { get; set; }
        public string ActivatedLanguauge { get; set; }
        public string ActivationDate { get; set; }
        public string LMG_PDPL_Flag { get; set; }
        public EnrollConsent Consent { get; set; }
    }
    public class EnrollConsent
    {
        public string ProvidedDate { get; set; }
        public string Source { get; set; }
        public string Status { get; set; }
        public string Segment { get; set; }
    }
}
