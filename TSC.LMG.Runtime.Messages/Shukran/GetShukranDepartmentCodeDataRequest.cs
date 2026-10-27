using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Shukran
{
    public class GetShukranDepartmentCodeDataRequest:Request
    {
        public GetShukranDepartmentCodeDataRequest(List<long> productIds)
        {
            ProductIds   = productIds;
        }
        public List<long> ProductIds { get; private set; }
    }
}
