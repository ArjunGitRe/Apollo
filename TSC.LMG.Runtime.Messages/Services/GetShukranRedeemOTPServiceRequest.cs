using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranRedeemOTPServiceRequest:Request
    {
        public GetShukranRedeemOTPServiceRequest(string mobileNumber, string territory, string language, string cardNumber, string otpValue,string transId)
        {
            MobileNumber = mobileNumber;
            Territory    = territory;
            Language     = language;
            CardNumber   = cardNumber;
            OTPValue     = otpValue;
            TransId      = transId;
        }
        public string MobileNumber { get; set; }
        public string Territory { get; set; }
        public string Language { get; set; }
        public string CardNumber { get; set; }
        public string OTPValue { get; set; }
        public string TransId { get; set; }
    }

}
