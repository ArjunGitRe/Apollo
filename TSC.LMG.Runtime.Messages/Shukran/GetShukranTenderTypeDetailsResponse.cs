using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Shukran
{
    public class GetShukranTenderTypeDetailsResponse:Response
    {
        public GetShukranTenderTypeDetailsResponse(string shukranTypeName)
        {
            ShukranTypeName=shukranTypeName;
        }
        public string ShukranTypeName { get;set;}
    }
}
