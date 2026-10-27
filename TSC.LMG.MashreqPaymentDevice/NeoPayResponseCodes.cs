using System;
using System.Collections.Generic;
using System.Text;

namespace Contoso.HardwareStation.Peripherals.PaymentDevice
{
    public class NeoPayResponseCodes
    {
        public const string CallLastTransactionStatusCode = "E067";
        public const string TransactionNotFoundCode = "E028";
        public const string TransactionAlreadyVoidedCode = "E028";
        public const string SuccessCode = "E000";
        public const string DeclinedCode = "E081";
        public const string ErrorCode = "E099";
        public const string UserCanceledCode = "E014";
    }
}
