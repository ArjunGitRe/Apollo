using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Shukran
{
    public class SendShukranOTPDataRequest:Request
    {
        public SendShukranOTPDataRequest(string otp,string guid, string phone)
        {
            OTP=otp;
            Guid=guid;
            PhoneNumber=phone;
        }
        public string OTP { get;set;}
        public string Guid { get;set;}
        public string PhoneNumber { get;set;}
    }
}
