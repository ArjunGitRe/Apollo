using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    public class AccessTokenResponse :BaseResponse
    {
        [JsonProperty("access_token")]
        public string access_token { get; set; }

        [JsonProperty("error")]
        public string error { get; set; }

        [JsonProperty("errorr_description")]
        public string error_description { get; set; }

        [JsonProperty("expires_in")]
        public int expires_in { get; set; }

        [JsonProperty("token_type")]
        public string token_type { get; set; }
    }
}
