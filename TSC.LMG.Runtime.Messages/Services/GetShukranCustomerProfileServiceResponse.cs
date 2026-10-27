using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.Runtime.Messages.Services
{
    [DataContract]
    public class GetShukranCustomerProfileServiceResponse:Response
    {
        public GetShukranCustomerProfileServiceResponse(CustomerProfileSearchResponse customerProfile)
        {
            this.CustomerProfileResponse =customerProfile;
        }
        [DataMember]
       public  CustomerProfileSearchResponse CustomerProfileResponse { get;set;}
    }
}
