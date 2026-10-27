
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.Runtime.Messages.Log
{
    public class CreateShukranApiLogDataRequest:Request
    {
        public CreateShukranApiLogDataRequest(ShukranAPILog log)
        {
            ShukranAPILogInfo=log;
        }
        public ShukranAPILog ShukranAPILogInfo { get; set; }
    }
}
