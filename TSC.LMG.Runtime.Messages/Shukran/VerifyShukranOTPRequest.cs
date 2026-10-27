using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Shukran
{
    public class VerifyShukranOTPRequest:Request
    {
        public VerifyShukranOTPRequest(string guid, string otpValue)
        {
            Guid     = guid;
            OTPValue = otpValue;
        }
        public string Guid { get; set; }
        public string OTPValue { get; set; }
    }
}
