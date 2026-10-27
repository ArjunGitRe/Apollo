using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranRedeemOTPServiceResponse:Response
    {
        public GetShukranRedeemOTPServiceResponse(CustomerRedeemOTPDetails otpDetails, bool success, string message, string guid = "")
        {
            OTPDetails = otpDetails;
            Success    = success;
            Message    = message;
            Guid       = guid;
        }
        public CustomerRedeemOTPDetails OTPDetails { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Guid { get; set; }
    }

}
