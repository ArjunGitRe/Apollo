using System;
using System.Collections.Generic;
using System.Text;

namespace Contoso.HardwareStation.Peripherals.PaymentDevice
{
    public class NeoPayTasks
    {
        public const string ReconciliationTask = "RECONCILIATION";
        public const string GetTotalsTask = "GETTOTALS";
        public const string GetLastTransactionTask = "GETLASTTRANSACTION";
        public const string DateTimeSyncTask = "DATETIMESYNC";
        public const string DuplicateTask = "DUPLICATE";
        public const string StandAloneTask = "STANDALONE";
    }
}
