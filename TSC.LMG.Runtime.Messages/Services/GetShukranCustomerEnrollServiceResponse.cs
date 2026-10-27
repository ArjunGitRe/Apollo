using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranCustomerEnrollServiceResponse:Response
    {
        public GetShukranCustomerEnrollServiceResponse(EnrollCustomerDetails enrollCustomerDetails, bool success, string message,string shukranCustAccount)
        {
            EnrollmentResult = enrollCustomerDetails;
            Success = success;
            Message = message;
            ShukranCustAccount=shukranCustAccount;
        }
        public EnrollCustomerDetails EnrollmentResult { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
        public string ShukranCustAccount { get; set; }
    }
}
