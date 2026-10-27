using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Payment
{
    public class GetComPortDataRequest:Request
    {
        public GetComPortDataRequest(string terminalId)
        {
            TerminalID=terminalId;
        }
        public string TerminalID { get;set;}
    }
}
