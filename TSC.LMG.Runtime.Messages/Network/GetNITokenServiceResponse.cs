using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Network
{
    public class GetNITokenServiceResponse:Response
    {
        public GetNITokenServiceResponse ( string token,string message )
        {
            this.Token = token;
            this.message = message;
        }
        public string Token { get; set; }
        public string message { get; set; }
    }
}
