using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Customer
{
    public class GetAddressCityDataResponse:Response
    {
        public GetAddressCityDataResponse(IEnumerable<CityInfo> cityInfos)
        {
            this.CityInfos = cityInfos;
        }

        public IEnumerable<CityInfo> CityInfos { get; set; }
    }
}
