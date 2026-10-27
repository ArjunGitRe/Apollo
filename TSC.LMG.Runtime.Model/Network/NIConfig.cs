using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Model.Network
{
    public class NIConfig
    {
        public string NITokenUrl { get; set; }
        public string NITransactionsBaseUrl { get; set; }
        public string NISubscriptionKey { get; set; }
        public string NIChainId { get; set; }
        public string NIGrantType { get; set; }
        public string NIClientId { get; set; }
        public string NIClientSecret { get; set; }
        public string NITID { get; set; }   
        public string NIMID { get; set; }
        public string NISubscriptionKeyHeader { get; set; } 
        public string NIChainIdHeader { get; set; }
    }
}
