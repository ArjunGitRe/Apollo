using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Network
{
    public class GetNIGetResultServiceRequest:Request
    {
        public GetNIGetResultServiceRequest ( string sourceId,string transId )
        {
            this.SourceId = sourceId;
            this.TransId = transId;
        }
        public string SourceId { get; private set; }
        public string TransId { get; private set; }
    }
}
