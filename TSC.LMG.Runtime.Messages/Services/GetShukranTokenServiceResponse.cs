
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranTokenServiceResponse:Response
    {
        public GetShukranTokenServiceResponse(ShukranAPIToken shukranTokens)
        {
            ShukranToken= shukranTokens;
        }
            
        public ShukranAPIToken ShukranToken { get;set;}
        
    }
}
