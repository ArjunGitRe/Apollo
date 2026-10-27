using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Payment
{
    public class GetComPortDataResponse:Response
    {
        public GetComPortDataResponse(string cPort)
        {
            CPort=cPort;
        }
        public string CPort { get;set;}
    }
}
