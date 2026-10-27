using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Shukran
{
    public class SendShukranOTPDataResponse:Response
    {
        public SendShukranOTPDataResponse(bool isSuccess, string guid)
        {
            IsSuccess=isSuccess;
            Guid = guid;
        }
        public bool IsSuccess { get;set;}
        public string Guid { get; set; }
    }
}
