using Azure;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Arabic;
using Response = Microsoft.Dynamics.Commerce.Runtime.Messages.Response;

namespace TSC.LMG.Runtime.Messages.Arabic
{
    public class GetArabicDescriptionListResponse:Response
    {
        public GetArabicDescriptionListResponse(List<ItemNames> productName)
        {
            this.ProductName = productName;
        }
        public List<ItemNames> ProductName { get; set; }
    }
}
