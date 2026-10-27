
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranCustomerProfileServiceRequest :Request
    {
        public GetShukranCustomerProfileServiceRequest(string searchType, string searchValue, string countryCode,string scanMode,string transactionId="")
        {
            SearchType= searchType;
            SearchValue=searchValue;
            CountryCode=countryCode;
            ScanMode =scanMode;
            TransactionId=transactionId;
        }

        public string SearchType { get;set;}
        public string SearchValue { get; set; }
        public string CountryCode { get; set; }
        public string ScanMode { get; set; }
        public string TransactionId { get; set; }
    }
}
