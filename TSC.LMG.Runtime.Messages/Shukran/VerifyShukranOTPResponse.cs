using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Shukran
{
    public class VerifyShukranOTPResponse:Response
    {
        public VerifyShukranOTPResponse(bool isValid)
        {
            IsValid = isValid;
        }
        public bool IsValid { get; set; }
    }
}
