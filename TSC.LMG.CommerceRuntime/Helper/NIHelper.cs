using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Network;

namespace TSC.LMG.CommerceRuntime.Helper
{
    public class NIHelper
    {
        public static string BuildUrl( NIConfig niConfig,string path )
        {
            return string.Format ("{0}/tid:{1}/mid:{2}/{3}",(niConfig.NITransactionsBaseUrl ?? string.Empty).TrimEnd ('/'),
                                    niConfig.NITID ?? string.Empty,niConfig.NIMID ?? string.Empty,path );
        }

        public static T SafeDeserialize<T>( string json ) where T : class
        {
            try { return JsonConvert.DeserializeObject<T> (json); }
            catch { return null; }
        }
    }
}
