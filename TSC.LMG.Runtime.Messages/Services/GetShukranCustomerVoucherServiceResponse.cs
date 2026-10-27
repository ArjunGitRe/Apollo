using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran.Data;

namespace TSC.LMG.Runtime.Messages.Services
{
    public class GetShukranCustomerVoucherServiceResponse:Response
    {
        public GetShukranCustomerVoucherServiceResponse(CustomerVoucherResult result)
        {
            VoucherResult = result;
        }
        public CustomerVoucherResult VoucherResult { get; set; }
    }

    public class CustomerVoucherResult
    {
        public List<CustomerVoucherDetails> Vouchers { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}
