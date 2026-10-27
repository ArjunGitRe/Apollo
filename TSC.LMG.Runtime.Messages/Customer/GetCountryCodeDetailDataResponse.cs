using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using TSC.Runtime.Model.Customer;

namespace TSC.LMG.Runtime.Messages.Customer
{
    public  class GetCountryCodeDetailsDataResponse: Response
    {
        public GetCountryCodeDetailsDataResponse (Collection<CountryCode> countryCodeDetails)
        {
            this.CountryCodeDetails=countryCodeDetails;
        }

        public Collection<CountryCode> CountryCodeDetails { get;set;}
    }
}
