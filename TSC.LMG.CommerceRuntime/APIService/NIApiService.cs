using Microsoft.Dynamics.Commerce.Runtime;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.CommerceRuntime.Helper;
using TSC.LMG.Runtime.Model.Network;
using TSC.LMG.Runtime.Model.Network.Auth;
using TSC.LMG.Runtime.Model.Network.Transactions;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.CommerceRuntime.APIService
{
    public class NIApiService
    {
        //private const string SubscriptionKeyHeader = "NI-api-dev_network_global";
        //private const string ChainIdHeader = "Chain-ID";

        public static async Task<TokenResponse> GenerateToken( NIConfig niConfig,RequestContext requestContext,string transId )
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            using(var request = new HttpRequestMessage (HttpMethod.Post,niConfig.NITokenUrl))
            {
                var dic = new Dictionary<string,string>
                {
                    { "grant_type", string.IsNullOrEmpty(niConfig.NIGrantType) ? "client_credentials" : niConfig.NIGrantType },
                    { "client_id", niConfig.NIClientId },
                    { "client_secret", niConfig.NIClientSecret }
                };

                request.Content = new FormUrlEncodedContent (dic);
                request.Headers.Add ("Accept","application/json");
                request.Headers.Add (niConfig.NISubscriptionKeyHeader,niConfig.NISubscriptionKey);
                request.Headers.Add (niConfig.NIChainIdHeader,niConfig.NIChainId);
                request.Content.Headers.ContentType = MediaTypeHeaderValue.Parse ("application/x-www-form-urlencoded");

                using(HttpClient httpClient = new HttpClient ())
                {
                    var response = await httpClient.SendAsync (request).ConfigureAwait (false);
                    string data = await response.Content.ReadAsStringAsync ().ConfigureAwait (false);

                    
                    if(!response.IsSuccessStatusCode)
                    {
                        throw new HttpRequestException (
                            $"NI token request failed. Status: {response.StatusCode}, Response: {data}");
                    }

                    var tokenResp = JsonConvert.DeserializeObject<TokenResponse> (data);

                    if(tokenResp == null)
                        throw new InvalidOperationException ("Failed to deserialize NI access token response.");

                    return tokenResp;
                }
            }
        }

        public static async Task<NIStartTransactionResponseClass> StartTransaction ( NIConfig niConfig,string apiToken,NIStartTransactionsRequestClass startRequest,RequestContext requestContext,string transId )
        {
            using(var httpClient = new HttpClient ())
            {
                httpClient.DefaultRequestHeaders.Add ("Accept","application/json");
                httpClient.DefaultRequestHeaders.Accept.Add (new MediaTypeWithQualityHeaderValue ("application/json"));
                httpClient.DefaultRequestHeaders.Add ("Authorization","Bearer " + apiToken);
                httpClient.DefaultRequestHeaders.Add (niConfig.NISubscriptionKeyHeader,niConfig.NISubscriptionKey);
                httpClient.DefaultRequestHeaders.Add (niConfig.NIChainIdHeader,niConfig.NIChainId);

                string requestUrl = NIHelper.BuildUrl(niConfig,"start-transaction");

                using(HttpContent httpContent = new StringContent (JsonConvert.SerializeObject (startRequest),Encoding.UTF8,"application/json"))
                using(var response = await httpClient.PostAsync (requestUrl,httpContent).ConfigureAwait (false))
                {
                    string responseData = await response.Content.ReadAsStringAsync ().ConfigureAwait (false);

                    // TODO: API logging (see ShukranAPILog pattern)

                    if(!response.IsSuccessStatusCode)
                    {
                        return NIHelper.SafeDeserialize<NIStartTransactionResponseClass> (responseData)
                            ?? new NIStartTransactionResponseClass
                            {
                                ErrorCode = ((int) response.StatusCode).ToString (),
                                ErrorMessage = $"Start transaction failed. HTTP {response.StatusCode}"
                            };
                    }

                    return NIHelper.SafeDeserialize<NIStartTransactionResponseClass> (responseData)
                       ?? new NIStartTransactionResponseClass
                       {
                           ResponseCode = "200",
                           ResponseMessage = responseData
                       };
                }
            }
        }

        public static async Task<NIGetStatusResponseClass> GetStatus ( NIConfig niConfig,string apiToken,NIGetStatusRequestClass statusRequest,RequestContext requestContext,string transId )
        {
            using(var httpClient = new HttpClient ())
            {
                httpClient.DefaultRequestHeaders.Add ("Accept","application/json");
                httpClient.DefaultRequestHeaders.Accept.Add (new MediaTypeWithQualityHeaderValue ("application/json"));
                httpClient.DefaultRequestHeaders.Add ("Authorization","Bearer " + apiToken);
                httpClient.DefaultRequestHeaders.Add (niConfig.NISubscriptionKeyHeader,niConfig.NISubscriptionKey);
                httpClient.DefaultRequestHeaders.Add (niConfig.NIChainIdHeader,niConfig.NIChainId);

                string requestUrl = NIHelper.BuildUrl (niConfig,"get-status");

                using(HttpContent httpContent = new StringContent (JsonConvert.SerializeObject (statusRequest),Encoding.UTF8,"application/json"))
                using(var response = await httpClient.PostAsync (requestUrl,httpContent).ConfigureAwait (false))
                {
                    string responseData = await response.Content.ReadAsStringAsync ().ConfigureAwait (false);

                    // TODO: API logging (see ShukranAPILog pattern)

                    if(!response.IsSuccessStatusCode)
                    {
                        var httpErr = NIHelper.SafeDeserialize<NIGetStatusErrorResponseClass> (responseData);
                        return new NIGetStatusResponseClass
                        {
                            Success     = false,
                            ResultCode  = httpErr != null ? httpErr.ErrorCode.ToString () : ((int) response.StatusCode).ToString (),
                            DisplayText = httpErr?.ErrorMessage ?? $"HTTP {response.StatusCode}"
                        };
                    }

                    try
                    {
                        var envelope = JObject.Parse (responseData);

                        // ── Error shape: { "errorCode": 404, "errorMessage": "..." } ──
                        var errorCodeToken = envelope["errorCode"];
                        var errorMsgToken = envelope["errorMessage"];

                        if(errorCodeToken != null || errorMsgToken != null)
                        {
                            return new NIGetStatusResponseClass
                            {
                                Success     = false,
                                ResultCode  = errorCodeToken?.ToString () ?? "",
                                DisplayText = errorMsgToken?.Value<string> () ?? "Unknown error"
                            };
                        }

                        // ── Normal status shape — object is at root level ─────────────
                        // { "amount": "...", "complete": true, "displayText": "...", ... }
                        var mapped = JsonConvert.DeserializeObject<NIGetStatusResponseClass> (responseData);
                        return mapped;

                    }
                    catch { /* leave as null on parse error */ }

                    return new NIGetStatusResponseClass { Success = false };
                }
            }
        }

        public static async Task<NIGetResultResponseClass> GetResult ( NIConfig niConfig,string apiToken,NIGetResultRequestClass resultRequest,RequestContext requestContext,string transId )
        {
            using(var httpClient = new HttpClient ())
            {
                httpClient.DefaultRequestHeaders.Accept.Add (new MediaTypeWithQualityHeaderValue ("application/json"));
                httpClient.DefaultRequestHeaders.Add ("Authorization","Bearer " + apiToken);
                httpClient.DefaultRequestHeaders.Add (niConfig.NISubscriptionKeyHeader,niConfig.NISubscriptionKey);
                httpClient.DefaultRequestHeaders.Add (niConfig.NIChainIdHeader,niConfig.NIChainId);

                string requestUrl = NIHelper.BuildUrl(niConfig,"get-result");

                using(HttpContent httpContent = new StringContent (JsonConvert.SerializeObject (resultRequest),Encoding.UTF8,"application/json"))
                using(var response = await httpClient.PostAsync (requestUrl,httpContent).ConfigureAwait (false))
                {
                    string responseData = await response.Content.ReadAsStringAsync ().ConfigureAwait (false);

                    // TODO: API logging (see ShukranAPILog pattern)

                    if(!response.IsSuccessStatusCode)
                    {
                        var httpErr = NIHelper.SafeDeserialize<NIGetResultErrorResponseClass> (responseData);
                        return new NIGetResultResponseClass
                        {
                            Success    = false,
                            ResultCode = httpErr != null ? httpErr.ErrorCode.ToString () : ((int) response.StatusCode).ToString (),
                            ResultCodeDescription = httpErr?.ErrorMessage ?? $"HTTP {response.StatusCode}"
                        };
                    }

                    try
                    {
                        var envelope = JObject.Parse (responseData);
                        // ── Error shape: { "errorCode": 400, "errorMessage": "Source ID is Invalid" } ──
                        var errorCodeToken = envelope["errorCode"];
                        var errorMsgToken = envelope["errorMessage"];
                        if(errorCodeToken != null || errorMsgToken != null)
                        {
                            return new NIGetResultResponseClass
                            {
                                Success    = false,
                                ResultCode = errorCodeToken?.ToString () ?? "",
                                ResultCodeDescription = errorMsgToken?.Value<string> () ?? "Unknown error"
                            };
                        }
                       
                        var mapped = JsonConvert.DeserializeObject<NIGetResultResponseClass> (responseData);
                        return mapped ?? new NIGetResultResponseClass { Success = false };
                    }
                    catch { }

                    return new NIGetResultResponseClass { Success = false };
                }
            }
        }


        public static async Task<NIStartTransactionResponseClass> CancelTransaction ( NIConfig niConfig,string apiToken,NIStartTransactionsRequestClass cancelRequest,RequestContext requestContext,string transId )
        {
            using(var httpClient = new HttpClient ())
            {
                httpClient.DefaultRequestHeaders.Accept.Add (new MediaTypeWithQualityHeaderValue ("application/json"));
                httpClient.DefaultRequestHeaders.Add ("Authorization","Bearer " + apiToken);
                httpClient.DefaultRequestHeaders.Add (niConfig.NISubscriptionKeyHeader,niConfig.NISubscriptionKey);
                httpClient.DefaultRequestHeaders.Add (niConfig.NIChainIdHeader,niConfig.NIChainId);

                string requestUrl = NIHelper.BuildUrl(niConfig, "cancel-transaction");

                using(HttpContent httpContent = new StringContent (JsonConvert.SerializeObject (cancelRequest),Encoding.UTF8,"application/json"))
                using(var response = await httpClient.PostAsync (requestUrl,httpContent).ConfigureAwait (false))
                {
                    string responseData = await response.Content.ReadAsStringAsync ().ConfigureAwait (false);

                    // TODO: API logging 

                    if(!response.IsSuccessStatusCode)
                    {
                        return NIHelper.SafeDeserialize<NIStartTransactionResponseClass> (responseData)
                            ?? new NIStartTransactionResponseClass
                            {
                                ErrorCode = ((int) response.StatusCode).ToString (),
                                ErrorMessage = $"Cancel transaction failed. HTTP {response.StatusCode}"
                            };
                    }

                    return NIHelper.SafeDeserialize<NIStartTransactionResponseClass> (responseData)
                        ?? new NIStartTransactionResponseClass { ResponseCode = "200",ResponseMessage = responseData };
                }
            }
        }

    }
}
