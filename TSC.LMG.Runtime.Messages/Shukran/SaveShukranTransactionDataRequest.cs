using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran.Data;

namespace TSC.LMG.Runtime.Messages.Shukran
{
    public class SaveShukranTransactionDataRequest:Request
    {
        public SaveShukranTransactionDataRequest(ShukranTransactionExt shukranTransactionExt)
        {
            ShukranTransactionExt = shukranTransactionExt;
        }
        public ShukranTransactionExt ShukranTransactionExt { get; set; }
    }
}
