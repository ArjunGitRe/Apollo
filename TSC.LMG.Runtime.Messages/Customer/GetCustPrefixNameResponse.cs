using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using TSC.LMG.Runtime.Model.Customer;

namespace TSC.LMG.Runtime.Messages.Customer
{
    public class GetCustPrefixNameResponse:Response
    {
        public GetCustPrefixNameResponse(Collection<PrefixOption> prefixOptions)
        {
            PrefixOptions=prefixOptions;
        }
        public Collection<PrefixOption> PrefixOptions { get;set;}
    }
}
