using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Customer
{
    public class GetAddressCityDataRequest:Request
    {
        public GetAddressCityDataRequest(string regionId)
        {
            this.RegionId = regionId;
        }
        public string RegionId { get; set; }
    }
}
