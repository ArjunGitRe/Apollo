using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Customer
{
    public  class GetCountryCodeDetailsDataRequest: Request
    {
        public GetCountryCodeDetailsDataRequest(string language)
        {
            this.LanguageId =language;
        }
        public string LanguageId { get;set;}
    }
}
