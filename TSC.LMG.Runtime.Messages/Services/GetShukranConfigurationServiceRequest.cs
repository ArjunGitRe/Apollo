using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranConfigurationServiceResponse:Response
    {
        public GetShukranConfigurationServiceResponse(ShukranConfig config)
        {
            ShukranConfigData =config;
        }
        public ShukranConfig ShukranConfigData { get;set;}
    }
}
