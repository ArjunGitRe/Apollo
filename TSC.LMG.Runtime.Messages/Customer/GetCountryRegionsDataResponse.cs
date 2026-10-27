using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Runtime.Serialization;
using System.Text;
using TSC.Runtime.Model.Customer;

namespace TSC.LMG.Runtime.Messages.Customer
{
    [DataContract]
    public class GetCountryRegionsDataResponse:Response
    {
        public GetCountryRegionsDataResponse(Collection<CountryRegion> countryRegions)
        {
            this.CountryRegions = countryRegions;
        }
        [DataMember]
        public Collection<CountryRegion> CountryRegions { get; set; }
    }
}
