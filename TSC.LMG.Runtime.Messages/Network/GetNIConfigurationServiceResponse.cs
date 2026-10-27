using Azure;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network;
using Response = Microsoft.Dynamics.Commerce.Runtime.Messages.Response;

namespace TSC.LMG.Runtime.Messages.Network
{
    public class GetNIConfigurationServiceResponse:Response
    {
        public GetNIConfigurationServiceResponse ( NIConfig niConfigData )
        {
            this.NIConfigData = niConfigData;
        }
        public NIConfig NIConfigData { get; private set; }
    }
}
