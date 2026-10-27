using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Messages.Shukran
{
    public class SaveShukranTransactionDataResponse:Response
    {
        public SaveShukranTransactionDataResponse(bool isSuccess,string message)
        {
            IsSuccess = isSuccess;
            Message=message;
        }
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
    } 
}
   
