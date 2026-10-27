using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Network.Auth
{
    [DataContract]
    public class TokenResponse
    {
        [DataMember]
        [JsonProperty ("access_token")]
        public string AccessToken { get; set; }

        [DataMember]
        [JsonProperty ("token_type")]
        public string TokenType { get; set; }

        [DataMember]
        [JsonProperty ("expires_in")]
        public int ExpiresIn { get; set; }

        [DataMember]
        [JsonProperty ("scope")]
        public string Scope { get; set; }

        [DataMember]
        [JsonProperty ("jti")]
        public string Jti { get; set; }
    }
    public class NIAPIToken
    {
        public string AccessToken { get; set; }
    }
}
