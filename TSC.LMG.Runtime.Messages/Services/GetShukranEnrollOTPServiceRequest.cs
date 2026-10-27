using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranEnrollOTPServiceRequest:Request
    {
        public GetShukranEnrollOTPServiceRequest(string mobileNumber,string territory,string language,string customerId,string otpValue,string transId)
        {
            MobileNumber = mobileNumber;
            Territory    = territory;
            Language     = language;
            CustomerId   = customerId;
            OTPValue     = otpValue;
            TransId      = transId;
        }
        public string MobileNumber { get; set; }
        public string Territory { get; set; }
        public string Language { get; set; }
        public string CustomerId { get; set; }
        public string OTPValue { get; set; }
        public string TransId { get; set; }
    }
}
