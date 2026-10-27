using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using TSC.LMG.Runtime.Model.Customer;
using TSC.Runtime.Model.Customer;

namespace TSC.LMG.Runtime.Messages.Customer
{
    public class GetShukranCountryDetailsResponse:Response
    {
        public GetShukranCountryDetailsResponse(Collection<ShukranCountries> skrnCntry)
        {
            SkrnCountry=skrnCntry;
        }
        public Collection<ShukranCountries> SkrnCountry { get; set; }
    }
}
