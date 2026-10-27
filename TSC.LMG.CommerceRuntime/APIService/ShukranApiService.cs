
using Azure;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Framework.Exceptions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Permissions;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.Runtime.Messages.Log;
using TSC.LMG.Runtime.Messages.Services;
using TSC.LMG.Runtime.Messages.Shukran.Transactions;
using TSC.LMG.Runtime.Model.Shukran;
using TSC.LMG.Runtime.Model.Shukran.Data;
using TSC.LMG.Runtime.Model.Shukran.Transactions;
using RequestContext = Microsoft.Dynamics.Commerce.Runtime.RequestContext;

namespace TSC.LMG.CommerceRuntime.APIService
{
    public class ShukranApiService
    {
        //static HttpClient httpClient = new HttpClient();
        static ShukranAPILog log;

        public static async Task<AccessTokenResponse> GetAzureAccessToken(ShukranConfig shukranConfig, RequestContext requestContext)
        {
            log =new ShukranAPILog();
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            using (var request = new HttpRequestMessage(HttpMethod.Post, shukranConfig.AzureTokenUrl))
            {
                var dic = new Dictionary<string, string>
                {
                    { "grant_type", shukranConfig.AzureGrantType },
                    { "client_id", shukranConfig.AzureClientId },
                    { "client_secret", shukranConfig.AzureClientSecret },
                    { "scope",shukranConfig.AzureScope }
                };

                request.Content = new FormUrlEncodedContent(dic);
                request.Content.Headers.ContentType = MediaTypeHeaderValue.Parse("application/x-www-form-urlencoded");

                log.APIName =shukranConfig.AzureTokenUrl;
                log.APIRequest= string.Empty;//Convert.ToString(request.Content);
                log.RequestOn=DateTime.UtcNow.ToString(AppConstants.DateFormatDB);

                using (HttpClient httpClient = new HttpClient())
                {
                    var response = await httpClient.SendAsync(request).ConfigureAwait(false);

                    string data = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                    //Log
                    log.ResponseOn=DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                    log.APIResponse=data;
                    log.StatusCode=(int)response.StatusCode;
                    CreateShukranApiLogDataRequest createShukranApiLogDataRequest = new CreateShukranApiLogDataRequest(log);
                    await requestContext.ExecuteAsync<CreateShukranApiLogDataResponse>(createShukranApiLogDataRequest).ConfigureAwait(false);
                    //log
                    if (!response.IsSuccessStatusCode)
                    {
                        throw new HttpRequestException(
                            $"Azure token request failed. Status: {response.StatusCode}, Response: {data}");
                    }

                    var accessTokenResp = JsonConvert.DeserializeObject<AccessTokenResponse>(data);

                    if (accessTokenResp == null)
                        throw new InvalidOperationException("Failed to deserialize Azure access token response.");

                    return accessTokenResp;
                }


            }


        }

        public static async Task<AccessTokenResponse> GetEPCLToken(ShukranConfig shukranConfig, string azureAccessToken, RequestContext requestContext)
        {
            log =new ShukranAPILog();
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            using (var request = new HttpRequestMessage(HttpMethod.Post, shukranConfig.EPCLTokenUrl))
            {
                var dic = new Dictionary<string, string>
                {
                    { "grant_type", shukranConfig.EPCLGrantType },
                    { "username", shukranConfig.EPCLUsername },
                    { "password", shukranConfig.EPCLPassword },
                    {"response_type",shukranConfig.EPCLResponseType }
                };

                request.Content = new FormUrlEncodedContent(dic);
                request.Content.Headers.ContentType = MediaTypeHeaderValue.Parse("application/x-www-form-urlencoded");
                request.Headers.Add("X-EPCL-Token", "Basic " +shukranConfig.EPCLToken);
                request.Headers.Add("Accept-Language", "en-US");
                request.Headers.Add("x-api-key", shukranConfig.EPCLAPIKey);
                request.Headers.Add("Authorization", "Bearer "+azureAccessToken);
                log.APIName =shukranConfig.EPCLTokenUrl;
                log.APIRequest= string.Empty;//Convert.ToString(request.Content);
                log.RequestOn=DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                using (HttpClient httpClient = new HttpClient())
                {
                    var response = await httpClient.SendAsync(request).ConfigureAwait(false);

                    string data = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                    //Log
                    log.ResponseOn=DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                    log.APIResponse=data;
                    log.StatusCode=(int)response.StatusCode;
                    CreateShukranApiLogDataRequest createShukranApiLogDataRequest = new CreateShukranApiLogDataRequest(log);
                    await requestContext.ExecuteAsync<CreateShukranApiLogDataResponse>(createShukranApiLogDataRequest).ConfigureAwait(false);
                    //log
                    if (!response.IsSuccessStatusCode)
                    {
                        throw new HttpRequestException(
                            $"EPCL token request failed. Status: {response.StatusCode}, Response: {data}");
                    }

                    var accessTokenResp = JsonConvert.DeserializeObject<AccessTokenResponse>(data);


                    if (accessTokenResp == null)
                        throw new InvalidOperationException("Failed to deserialize Azure access token response.");

                    return accessTokenResp;
                }


            }
        }


        public static async Task<CustomerProfileSearchResponse> GetProfileDetails(ShukranConfig shukranConfig, ShukranAPIToken apiToken, CustomerProfileRequest profileRequest, RequestContext requestContext,string transId)
        {
            log =new ShukranAPILog();
            //CustomerProfileDetails customerProfile = null;
            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + apiToken.AzureAccessToken);
                httpClient.DefaultRequestHeaders.Add("Accept-Language", "en-US");
                httpClient.DefaultRequestHeaders.Add("Program-Code", shukranConfig.ProgramCode);
                httpClient.DefaultRequestHeaders.Add("X-EPCL-Token", "OAuth  " + apiToken.EPCLAccessToken);
                httpClient.DefaultRequestHeaders.Add("x-api-key", shukranConfig.EPCLAPIKey);

                string requestUrl = shukranConfig.EPCLSearchProfileUrl;
                log.APIName =requestUrl;
                log.APIRequest= JsonConvert.SerializeObject(profileRequest);
                log.RequestOn=DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                using (HttpContent httpContent = new StringContent(JsonConvert.SerializeObject(profileRequest), Encoding.UTF8, "application/json"))
                using (var response = await httpClient.PostAsync(requestUrl, httpContent).ConfigureAwait(false))
                {
                    string responseData = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                    //Log
                    log.ResponseOn=DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                    log.APIResponse=responseData;
                    log.StatusCode=(int)response.StatusCode;
                    log.TransactionId = transId;

                    CreateShukranApiLogDataRequest createShukranApiLogDataRequest = new CreateShukranApiLogDataRequest(log);
                    await requestContext.ExecuteAsync<CreateShukranApiLogDataResponse>(createShukranApiLogDataRequest).ConfigureAwait(false);
                    //log
                    //if (response.StatusCode == System.Net.HttpStatusCode.BadRequest || response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    //{
                    //    // Try to detect "profile not found" business response
                    //    try
                    //    {
                    //        var errorObj = JsonConvert.DeserializeObject<CustomerProfileSearchResponse>(responseData);
                    //        string errorCode = errorObj?.Message?.ToString() ?? "";
                    //        if (errorCode.ToLower().Contains("profile is not found"))
                    //        {

                    //            return null; // Return null = "no profile", not a crash
                    //        }
                    //        if (errorCode.ToLower().Contains("profile is not active"))
                    //        {
                    //            return null;
                    //        }
                    //    }
                    //    catch(HttpRequestException)
                    //    {
                    //        throw;
                    //    }


                    //}
                    if (!response.IsSuccessStatusCode)
                    {
                        string errorMessage = $"Profile search failed. Status: {response.StatusCode}";
                        try
                        {
                            var errorObj = JsonConvert.DeserializeObject<CustomerProfileSearchResponse>(responseData);
                            string apiMsg = errorObj?.Message ?? "";
                            if (!string.IsNullOrWhiteSpace(apiMsg))
                                errorMessage = apiMsg;
                        }
                        catch { }

                        // ✅ Return the wrapper with error fields populated
                        return new CustomerProfileSearchResponse
                        {
                            Success = false,
                            Message = errorMessage,
                            Status = (int)response.StatusCode
                        };
                    }



                    if (!response.IsSuccessStatusCode)
                    {
                        throw new HttpRequestException(
                            $"EPCL GetProfileDetails request failed. Status: {response.StatusCode}, Response: {responseData}");
                    }
                   var customerProfile =JsonConvert.DeserializeObject<CustomerProfileDetails>(responseData);
                    return new CustomerProfileSearchResponse
                    {
                        Success = true,
                        Message = string.Empty,
                        Status = (int)response.StatusCode,
                        CustomerProfileDetails = customerProfile   // ✅ properly nested now
                    };
                    //return customerProfile;
                }
            }
           // return customerProfile;

        }


        public static async Task<EnrollCustomerDetails> EnrollCustomer(ShukranConfig shukranConfig, ShukranAPIToken apiToken, EnrollCustomerRequest enrollRequest,RequestContext requestContext,string transId)
        {
            log =new ShukranAPILog();
            EnrollCustomerDetails enrollDetails = null;

            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + apiToken.AzureAccessToken);
                httpClient.DefaultRequestHeaders.Add("Accept-Language", "en-US");
                httpClient.DefaultRequestHeaders.Add("Program-Code", shukranConfig.ProgramCode);
                httpClient.DefaultRequestHeaders.Add("X-EPCL-Token", "OAuth  " + apiToken.EPCLAccessToken);
                httpClient.DefaultRequestHeaders.Add("x-api-key", shukranConfig.EPCLAPIKey);

                string requestUrl = shukranConfig.EPCLEnrollProfileUrl;

                log.APIName = requestUrl;
                log.APIRequest = JsonConvert.SerializeObject(enrollRequest);
                log.RequestOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);

                using (HttpContent httpContent = new StringContent(JsonConvert.SerializeObject(enrollRequest), Encoding.UTF8, "application/json"))
                using (var response = await httpClient.PostAsync(requestUrl, httpContent).ConfigureAwait(false))
                {
                    string responseData = await response.Content.ReadAsStringAsync().ConfigureAwait(false);


                    log.ResponseOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                    log.APIResponse = responseData;
                    log.StatusCode = (int)response.StatusCode;
                    log.TransactionId = transId;

                    CreateShukranApiLogDataRequest createShukranApiLogDataRequest = new CreateShukranApiLogDataRequest(log);
                    await requestContext.ExecuteAsync<CreateShukranApiLogDataResponse>(createShukranApiLogDataRequest).ConfigureAwait(false);


                    //if (!response.IsSuccessStatusCode)
                    //{
                    //    throw new HttpRequestException(
                    //        $"EPCL EnrollCustomer request failed. Status: {response.StatusCode}, Response: {responseData}");
                    //}
                    if (!response.IsSuccessStatusCode)
                    {
                        string errorMessage = $"Enrollment failed. Status: {response.StatusCode}";
                        try
                        {
                            var errorObj = JsonConvert.DeserializeObject<EnrollCustomerDetails>(responseData);
                            string apiMsg = errorObj?.Message?.ToString() ?? errorObj?.Message?.ToString() ?? "";
                            if (!string.IsNullOrWhiteSpace(apiMsg))
                                errorMessage = apiMsg;
                        }
                        catch { }
                        return new EnrollCustomerDetails
                        {
                            Success = false,
                            Message = errorMessage,
                            Status = (int)response.StatusCode
                        };
                    }

                    enrollDetails = JsonConvert.DeserializeObject<EnrollCustomerDetails>(responseData);

                    if (!string.IsNullOrEmpty(enrollDetails?.ProfileId))
                    {
                        enrollDetails.Success = true;
                    }
                }
            }
            return enrollDetails;
        }

        public static async Task<List<CustomerCouponDetails>> CouponDetails(ShukranConfig shukranConfig, ShukranAPIToken apiToken, CustomerCouponRequest couponRequest,RequestContext requestContext,string transId)
        {
            log =new ShukranAPILog();
            List<CustomerCouponDetails> couponDetails = null;

            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + apiToken.AzureAccessToken);
                httpClient.DefaultRequestHeaders.Add("Accept-Language", "en-US");
                httpClient.DefaultRequestHeaders.Add("Program-Code", shukranConfig.ProgramCode);
                httpClient.DefaultRequestHeaders.Add("X-EPCL-Token", "OAuth  " + apiToken.EPCLAccessToken);
                httpClient.DefaultRequestHeaders.Add("x-api-key", shukranConfig.EPCLAPIKey);
                httpClient.DefaultRequestHeaders.Add("Source-Application", "SHUKRANDIGITAL");

                string requestUrl = shukranConfig.EPCLCouponInquiryUrl;

                log.APIName = requestUrl;
                log.APIRequest = JsonConvert.SerializeObject(couponRequest);
                log.RequestOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);

                using (HttpContent httpContent = new StringContent(JsonConvert.SerializeObject(couponRequest), Encoding.UTF8, "application/json"))
                using (var response = await httpClient.PostAsync(requestUrl, httpContent).ConfigureAwait(false))
                {
                    string responseData = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                    log.ResponseOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                    log.APIResponse = responseData;
                    log.StatusCode = (int)response.StatusCode;
                    log.TransactionId=transId;

                    CreateShukranApiLogDataRequest createShukranApiLogDataRequest = new CreateShukranApiLogDataRequest(log);
                    await requestContext.ExecuteAsync<CreateShukranApiLogDataResponse>(createShukranApiLogDataRequest).ConfigureAwait(false);

                    if (!response.IsSuccessStatusCode)
                    {
                        throw new HttpRequestException(
                            $"EPCL EnrollCustomer request failed. Status: {response.StatusCode}, Response: {responseData}");
                    }

                    couponDetails = JsonConvert.DeserializeObject<List<CustomerCouponDetails>>(responseData);
                }
            }
            return couponDetails;
        }

        public static async Task<List<CustomerVoucherDetails>> VoucherDetails(ShukranConfig shukranConfig,ShukranAPIToken apiToken,CustomerVoucherRequest voucherRequest, RequestContext requestContext,string transactionId)
        {
            log = new ShukranAPILog();
            List<CustomerVoucherDetails> voucherDetails = null;

            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + apiToken.AzureAccessToken);
                httpClient.DefaultRequestHeaders.Add("Accept-Language", "en-US");
                httpClient.DefaultRequestHeaders.Add("Program-Code", shukranConfig.ProgramCode);
                httpClient.DefaultRequestHeaders.Add("X-EPCL-Token", "OAuth  " + apiToken.EPCLAccessToken);
                httpClient.DefaultRequestHeaders.Add("Source-Application",shukranConfig.SourceApplication);
                httpClient.DefaultRequestHeaders.Add("x-api-key", shukranConfig.EPCLAPIKey);

                string requestUrl = shukranConfig.EPCLVoucherRedRevUrl; // Add this config key
                log.APIName = requestUrl;
                log.APIRequest = JsonConvert.SerializeObject(voucherRequest);
                log.RequestOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);

                using (HttpContent httpContent = new StringContent(JsonConvert.SerializeObject(voucherRequest), Encoding.UTF8, "application/json"))
                using (var response = await httpClient.PostAsync(requestUrl, httpContent).ConfigureAwait(false))
                {
                    string responseData = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                    log.ResponseOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                    log.APIResponse = responseData;
                    log.StatusCode = (int)response.StatusCode;
                    log.TransactionId=transactionId;

                    CreateShukranApiLogDataRequest createShukranApiLogDataRequest = new CreateShukranApiLogDataRequest(log);
                    await requestContext.ExecuteAsync<CreateShukranApiLogDataResponse>(createShukranApiLogDataRequest).ConfigureAwait(false);

                    if (!response.IsSuccessStatusCode)
                    {
                        string errorMessage = $"Voucher request failed. Status: {response.StatusCode}";
                        try
                        {
                            var errorObj = JsonConvert.DeserializeObject<CustomerVoucherDetails> (responseData);
                            string apiMsg = errorObj?.Message ?? string.Empty;
                            if(!string.IsNullOrWhiteSpace (apiMsg))
                                errorMessage = apiMsg;
                        }
                        catch { /* body wasn't JSON — fall back to default message */ }

                        return new List<CustomerVoucherDetails>
                        {
                            new CustomerVoucherDetails
                            {
                                Success = false,
                                Message = errorMessage,
                                Status  = (int)response.StatusCode
                            }
                        };
                    }

                    voucherDetails = JsonConvert.DeserializeObject<List<CustomerVoucherDetails>>(responseData);
                    if(voucherDetails != null)
                    {
                        foreach(var v in voucherDetails)
                        {
                            v.Success = true;
                            v.Status  = (int) response.StatusCode;
                        }
                    }
                }
            }

            return voucherDetails;
        }

        public static async Task<CustomerEnrollOTPDetails> SendEnrollOTP(ShukranConfig shukranConfig, ShukranAPIToken apiToken, CustomerEnrollOTPRequest.ShukranEnrollOTPModel otpRequest, RequestContext requestContext,string transId)
        {
            log =new ShukranAPILog();
            CustomerEnrollOTPDetails otpDetails = null;

            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Accept.Add(
                    new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + apiToken.AzureAccessToken);
                httpClient.DefaultRequestHeaders.Add("x-api-key", shukranConfig.EPCLAPIKey);

                string requestUrl = shukranConfig.EPCLEnrollOTPUrl;

                log.APIName = requestUrl;
                log.APIRequest = JsonConvert.SerializeObject(otpRequest);
                log.RequestOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                log.TransactionId = transId;


                using (HttpContent httpContent = new StringContent(JsonConvert.SerializeObject(otpRequest), Encoding.UTF8, "application/json"))
                using (var response = await httpClient.PostAsync(requestUrl, httpContent).ConfigureAwait(false))
                {
                    string responseData = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                    log.ResponseOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                    log.APIResponse = responseData;
                    log.StatusCode = (int)response.StatusCode;
                    CreateShukranApiLogDataRequest createShukranApiLogDataRequest = new CreateShukranApiLogDataRequest(log);
                    await requestContext.ExecuteAsync<CreateShukranApiLogDataResponse>(createShukranApiLogDataRequest).ConfigureAwait(false);

                    if (!response.IsSuccessStatusCode)
                    {
                        throw new HttpRequestException(
                            $"EPCL SendEnrollOTP request failed. Status: {response.StatusCode}, Response: {responseData}");
                    }

                    var otpList = JsonConvert.DeserializeObject<List<CustomerEnrollOTPDetails>>(responseData);
                    otpDetails = otpList?.FirstOrDefault();
                }
            }

            return otpDetails;
        }

        public static async Task<CustomerRedeemOTPDetails> SendRedeemOTP(ShukranConfig shukranConfig, ShukranAPIToken apiToken, CustomerRedeemOTPRequest.ShukranRedeemOTPModel otpRequest, RequestContext requestContext,string transId)
        {
            log = new ShukranAPILog();
            CustomerRedeemOTPDetails otpDetails = null;
            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Accept.Add(
                    new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + apiToken.AzureAccessToken);
                httpClient.DefaultRequestHeaders.Add("x-api-key", shukranConfig.EPCLAPIKey);

                string requestUrl = shukranConfig.EPCLRedeemOTPUrl;
                log.APIName = requestUrl;
                log.APIRequest = JsonConvert.SerializeObject(otpRequest);
                log.RequestOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);

                using (HttpContent httpContent = new StringContent(JsonConvert.SerializeObject(otpRequest), Encoding.UTF8, "application/json"))
                using (var response = await httpClient.PostAsync(requestUrl, httpContent).ConfigureAwait(false))
                {
                    string responseData = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                    log.ResponseOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                    log.APIResponse = responseData;
                    log.StatusCode = (int)response.StatusCode;
                    log.TransactionId = transId;

                    CreateShukranApiLogDataRequest createShukranApiLogDataRequest = new CreateShukranApiLogDataRequest(log);
                    await requestContext.ExecuteAsync<CreateShukranApiLogDataResponse>(createShukranApiLogDataRequest).ConfigureAwait(false);

                    if (!response.IsSuccessStatusCode)
                    {
                        throw new HttpRequestException(
                            $"EPCL SendRedeemOTP request failed. Status: {response.StatusCode}, Response: {responseData}");
                    }

                    var otpList = JsonConvert.DeserializeObject<List<CustomerRedeemOTPDetails>>(responseData);
                    otpDetails = otpList?.FirstOrDefault();
                }
            }
            return otpDetails;
        }

        public static async Task<ShukranTransactionResponse> ShukranTransaction(ShukranConfig shukranConfig, ShukranAPIToken apiToken, ShukranTransactionRequest transactionRequest, RequestContext requestContext,string transactionId,bool isOfflineTransaction )
        {
            log =new ShukranAPILog();
            ShukranTransactionResponse transactionDetails = null;
            string serializedPayload = JsonConvert.SerializeObject(transactionRequest);

            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Accept.Add(
                    new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + apiToken.AzureAccessToken);
                httpClient.DefaultRequestHeaders.Add("Accept-Language", "en-US");
                httpClient.DefaultRequestHeaders.Add("Program-Code", shukranConfig.ProgramCode);
                httpClient.DefaultRequestHeaders.Add("X-EPCL-Token", "OAuth  " + apiToken.EPCLAccessToken);
                httpClient.DefaultRequestHeaders.Add("x-api-key", shukranConfig.EPCLAPIKey);

                string requestUrl = shukranConfig.EPCLTransactionUrl;


                log.APIName = requestUrl;
                log.APIRequest = JsonConvert.SerializeObject(transactionRequest);
                log.RequestOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);

                using (HttpContent httpContent = new StringContent(JsonConvert.SerializeObject(transactionRequest), Encoding.UTF8, "application/json"))
                using (var response = await httpClient.PostAsync(requestUrl, httpContent).ConfigureAwait(false))
                {
                    string responseData = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                    log.TransactionId = transactionId;
                    log.ResponseOn = DateTime.UtcNow.ToString(AppConstants.DateFormatDB);
                    log.APIResponse = responseData;
                    log.StatusCode = (int)response.StatusCode;

                    CreateShukranApiLogDataRequest createShukranApiLogDataRequest = new CreateShukranApiLogDataRequest(log);
                    await requestContext.ExecuteAsync<CreateShukranApiLogDataResponse>(createShukranApiLogDataRequest).ConfigureAwait(false);

                    if (!response.IsSuccessStatusCode || isOfflineTransaction)
                    {
                        await SavePendingTransactionAsync(requestContext, transactionId, serializedPayload,responseData, (int)response.StatusCode).ConfigureAwait(false);
                        if(!response.IsSuccessStatusCode)
                        {
                            return new ShukranTransactionResponse
                            {
                                HttpStatusCode = (int) response.StatusCode
                            };
                        }
                           

                    }


                    transactionDetails = JsonConvert.DeserializeObject<ShukranTransactionResponse>(responseData);
                    transactionDetails.HttpStatusCode = (int)response.StatusCode;
                }
            }
             
            return transactionDetails;
        }

        private static async Task SavePendingTransactionAsync(RequestContext requestContext,string transactionId, string serializedPayload,string responseMessage,int statusCode)
        {
            try
            {
                var deviceConfig = requestContext.GetDeviceConfiguration();

                var pending = new ShukranPendingTransaction
                {
                    TransactionId   = transactionId ?? string.Empty,
                    IsSynced        = 0,
                    StatusCode      = statusCode,
                    Payload         = serializedPayload,
                    ResponseMessage = responseMessage
                };

                var saveRequest = new SaveShukranPendingTransactionDataRequest(pending);
                await requestContext.ExecuteAsync<SaveShukranPendingTransactionDataResponse>(saveRequest).ConfigureAwait(false);
            }
            catch
            {
                
            }
        }
    }
}
