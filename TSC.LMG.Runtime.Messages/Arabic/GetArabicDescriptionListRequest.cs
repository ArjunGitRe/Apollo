using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Arabic
{
    public class GetArabicDescriptionListRequest:Request
    {
        public GetArabicDescriptionListRequest(List<long> productIds)
        {
            this.ProductIds = productIds;
        }
        public List<long> ProductIds { get; set; }
    }
}
