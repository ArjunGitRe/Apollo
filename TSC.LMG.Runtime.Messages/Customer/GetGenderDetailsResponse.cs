using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Runtime.Serialization;
using System.Text;
using TSC.LMG.Runtime.Model.Customer;

namespace TSC.LMG.Runtime.Messages.Customer
{
    [DataContract]
    public class GetGenderDetailsResponse:Response
    {
        public GetGenderDetailsResponse(Collection<GenderOption> genderOptions)
        {
            this.GenderOptions = genderOptions;
        }
        [DataMember]
        public Collection<GenderOption> GenderOptions { get; set; }
    }
}
