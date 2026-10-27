using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.ComponentModel.DataAnnotations;
using SystemDataAnnotations = System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    public class ShukranConfig
    {

        //Azure
        public string AzureTokenUrl { get; set; }
        public string AzureClientId { get; set; }
        public string AzureClientSecret { get; set; }
        public string AzureScope { get; set; }
        public string AzureGrantType { get; set; }

        //EPCL
        public string EPCLTokenUrl { get; set; }
        public string EPCLToken { get; set; }
        public string EPCLAPIKey { get; set; }
        public string EPCLGrantType { get; set; }
        public string EPCLUsername { get; set; }
        public string EPCLPassword { get; set; }
        public string EPCLResponseType { get; set; }
        
        public string EPCLSearchProfileUrl { get;set;}
        public string EPCLEnrollProfileUrl { get; set; }
        public string EPCLCouponInquiryUrl { get; set; }
        public string EPCLEnrollOTPUrl { get; set; }
        public string EPCLTransactionUrl { get; set; }
        public string EPCLRedeemOTPUrl { get;set;}
        public string EPCLVoucherRedRevUrl { get;set;}

        //Transaction
        public string SourceCode { get; set; }
        public string EnrollChannelCode { get; set; }
        public string ProgramCode { get; set; }
        public string ItemNumberTypeCode { get; set; }
        public string ConceptCode { get; set; }
        public string CardnumberLength { get; set; }
        public string SourceApplication { get; set; }

        public  string VirtualCardScanIdentifierLength { get;set;}
        public  string CountryCode { get;set;}
        public string CustAccount { get;set;}
        public string DecimalPer { get;set;}
        public string CreditMemoTenderId { get;set;}
        public string StoreCountryCode { get;set;}
    }
}
