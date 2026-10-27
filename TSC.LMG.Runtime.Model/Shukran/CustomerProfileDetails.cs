using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    [DataContract]
    public class CustomerProfileDetails
    {
        [DataMember] public string QualifyingTranxCount { get; set; }
        [DataMember] public DateTime? LastEvaluateDate { get; set; }
        [DataMember] public string TierExpiryDate { get; set; }
        [DataMember] public Guid ProfileId { get; set; }
        [DataMember] public string Prefix { get; set; }
        [DataMember] public string SourcePrefix { get; set; }
        [DataMember] public string FirstName { get; set; }
        [DataMember] public string SourceFirstName { get; set; }
        [DataMember] public string LastName { get; set; }
        [DataMember] public string SourceLastName { get; set; }
        [DataMember] public bool GlobalOptOut { get; set; }
        [DataMember] public string LanguageCode { get; set; }
        [DataMember] public string Gender { get; set; }
        [DataMember] public string BirthDate { get; set; }
        [DataMember] public string SourceGender { get; set; }
        [DataMember] public string Country { get; set; }
        [DataMember] public bool InLinkedPool { get; set; }
        [DataMember] public bool InBusinessLinkedPool { get; set; }

        [DataMember] public List<Address> Addresses { get; set; }
        [DataMember] public List<Email> Emails { get; set; }
        [DataMember] public List<Phone> Phones { get; set; }

        [DataMember] public string ProgramCode { get; set; }
        [DataMember] public string SourceCode { get; set; }
        [DataMember] public string EnrollmentStatus { get; set; }
        [DataMember] public DateTime JoinDate { get; set; }
        [DataMember] public string EnrollChannelCode { get; set; }
        [DataMember] public string TierCode { get; set; }
        [DataMember] public string TierName { get; set; }
        [DataMember] public DateTime TierStartDate { get; set; }
        [DataMember] public string CardNumber { get; set; }

        [DataMember] public string AccountSourceCode { get; set; }
        [DataMember] public string SourceAccountNumber { get; set; }
        [DataMember] public string BrandOrgCode { get; set; }
        [DataMember] public DateTime ActivityDate { get; set; }

        [DataMember] public bool AutoRewardOptInInd { get; set; }
        [DataMember] public string EnrollmentStoreCode { get; set; }
        [DataMember] public string EnrollmentStoreName { get; set; }

        [DataMember] public bool IsSocialMediaProfile { get; set; }
        [DataMember] public bool IsEnrollmentActivation { get; set; }
        [DataMember] public bool IsEnrollmentEmailReminder { get; set; }
        [DataMember] public bool BypassRequiredFields { get; set; }
        [DataMember] public bool IsTestProfile { get; set; }
        [DataMember] public bool IsUpdate { get; set; }
        [DataMember] public bool IsAddProfile { get; set; }
        [DataMember] public bool ReturnRawMomentData { get; set; }
        [DataMember] public bool SkipMomentEngine { get; set; }

        [DataMember] public string CreateUser { get; set; }
        [DataMember] public DateTime CreateDate { get; set; }
        [DataMember] public string UpdateUser { get; set; }
        [DataMember] public DateTime UpdateDate { get; set; }

        [DataMember] public JsonExternalData JsonExternalData { get; set; }
    }

    [DataContract]
    public class Address
    {
        [DataMember] public Guid ProfileId { get; set; }
        [DataMember] public Guid AddressId { get; set; }
        [DataMember] public string CountryCode { get; set; }
        [DataMember] public string SourceCountryCode { get; set; }
        [DataMember] public string ChannelCode { get; set; }
        [DataMember] public string LocationCode { get; set; }
        [DataMember] public string LocationDescription { get; set; }
        [DataMember] public bool IsPreferred { get; set; }
        [DataMember] public string DeliveryStatus { get; set; }
        [DataMember] public string DeliveryStatusDescription { get; set; }
        [DataMember] public bool DoNotStandardize { get; set; }
        [DataMember] public string AccountSourceCode { get; set; }
        [DataMember] public string SourceAccountNumber { get; set; }
        [DataMember] public string BrandOrgCode { get; set; }
        [DataMember] public DateTime ActivityDate { get; set; }
        [DataMember] public string Status { get; set; }
        [DataMember] public string CreateUser { get; set; }
        [DataMember] public DateTime CreateDate { get; set; }
        [DataMember] public string UpdateUser { get; set; }
        [DataMember] public DateTime UpdateDate { get; set; }
    }

    [DataContract]
    public class Email
    {
        [DataMember] public Guid ProfileId { get; set; }
        [DataMember] public Guid EmailId { get; set; }
        [DataMember] public string EmailAddress { get; set; }
        [DataMember] public string SourceEmailAddress { get; set; }
        [DataMember] public string ChannelCode { get; set; }
        [DataMember] public bool IsPreferred { get; set; }
        [DataMember] public string DeliveryStatus { get; set; }
        [DataMember] public string DeliveryStatusDescription { get; set; }
        [DataMember] public string AccountSourceCode { get; set; }
        [DataMember] public string SourceAccountNumber { get; set; }
        [DataMember] public string BrandOrgCode { get; set; }
        [DataMember] public DateTime ActivityDate { get; set; }
        [DataMember] public bool CreateContactPointIndicator { get; set; }
        [DataMember] public string Status { get; set; }
        [DataMember] public string CreateUser { get; set; }
        [DataMember] public DateTime CreateDate { get; set; }
        [DataMember] public string UpdateUser { get; set; }
        [DataMember] public DateTime UpdateDate { get; set; }
    }

    [DataContract]
    public class Phone
    {
        [DataMember] public Guid ProfileId { get; set; }
        [DataMember] public Guid PhoneId { get; set; }
        [DataMember] public string PhoneNumber { get; set; }
        [DataMember] public string SourcePhoneNumber { get; set; }
        [DataMember] public bool AcceptsText { get; set; }
        [DataMember] public string ChannelCode { get; set; }
        [DataMember] public bool IsPreferred { get; set; }
        [DataMember] public string DeliveryStatus { get; set; }
        [DataMember] public string DeliveryStatusDescription { get; set; }
        [DataMember] public string AccountSourceCode { get; set; }
        [DataMember] public string SourceAccountNumber { get; set; }
        [DataMember] public string BrandOrgCode { get; set; }
        [DataMember] DateTime ActivityDate { get; set; }
        [DataMember] public bool CreateContactPointIndicator { get; set; }
        [DataMember] public string Status { get; set; }
        [DataMember] string CreateUser { get; set; }
        [DataMember] public DateTime CreateDate { get; set; }
        [DataMember] public string UpdateUser { get; set; }
        [DataMember] public DateTime UpdateDate { get; set; }
    }

    [DataContract]
    public class JsonExternalData
    {
        [DataMember] public string Language { get; set; }
        [DataMember] public string MemberCity { get; set; }
        [DataMember] public string Nationality { get; set; }
        [DataMember] public double AvailablePoints { get; set; }
        [DataMember] public double AvailablePointsCashValue { get; set; }
        [DataMember] public string Consentstatus { get; set; }
        [DataMember] public string IsLMSLinked { get; set; }
        [DataMember] public string ConsentSource { get; set; }
        [DataMember] public DateTime? ConsentProvided { get; set; }
        [DataMember] public string ReqQualTxnForNxtTier { get; set; }
        [DataMember] public string RetTierQualTxn { get; set; }
        [DataMember] public string TierActivity { get; set; }
        [DataMember] public string PreviousTierName { get; set; }
        [DataMember] public string PreviousTierEndDate { get; set; }
        [DataMember] public string TIER_NUDGE_FLAG { get; set; }
        //public ADCBCBCCInfo ADCBCBCCInfo { get; set; }
    }

    //public class ADCBCBCCInfo
    //{
    //    public string ADCBCBCCActive { get; set; }
    //    public string ADCBCardstatus { get; set; }
    //    public string ADCB_App_Ref_Number { get; set; }
    //    public string Approval_Date { get; set; }
    //    public string LM_App_Ref_Number { get; set; }
    //    public string End_Of_Subscription_Date { get; set; }
    //    public string Source { get; set; }
    //    public string System_Ref_No { get; set; }
    //    public string Cobrand_Card_Type { get; set; }
    //}
}
