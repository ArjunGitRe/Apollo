using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Customer
{
    public class GetShukranCountryDetailsRequest:Request
    {
        public GetShukranCountryDetailsRequest(string languageId)
        {
            languageId=languageId;
        }
        public string LanguageId { get;set;}
    }
}
