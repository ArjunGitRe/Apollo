using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Customer
{
    public class GetCountryRegionsDataRequest:Request
    {
        public GetCountryRegionsDataRequest(string languageId)
        {
            this.LanguageId = languageId;
        }
        public string LanguageId { get; set; }
    }
}
