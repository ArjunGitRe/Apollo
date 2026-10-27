using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran.Data;

namespace TSC.LMG.Runtime.Messages.Shukran
{
    public class SaveShukranCustomerDataRequest:Request
    {
        public SaveShukranCustomerDataRequest(ShukranEnrollmentData shukranCustomer)
        {
            ShukranCustomer=shukranCustomer;
        }
        public ShukranEnrollmentData ShukranCustomer { get;set;}
    }
}
