using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;
using TSC.LMG.Runtime.Model.Customer;

namespace TSC.LMG.Runtime.Messages.Customer
{
    [DataContract]
    public class GetShukranCustomerByTransactionDataResponse:Response
    {
        
        public GetShukranCustomerByTransactionDataResponse(ShukranCustomerDtl shukranCustomerDtl)
        {
            ShukranCustomerDtls=shukranCustomerDtl;
        }
        [DataMember]
        public ShukranCustomerDtl ShukranCustomerDtls { get;set;}

    }
}
