

using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Data.Types;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.DataServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Services.Messages;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Threading.Tasks;
using TSC.LMG.CommerceRuntime.Helper;
using TSC.LMG.Runtime.Messages.Services;
using TSC.LMG.Runtime.Messages.Shukran;
using TSC.LMG.Runtime.Model.Shukran;
using TSC.LMG.Runtime.Model.Shukran.Data;

namespace TSC.LMG.CommerceRuntime.Services
{
    public class ShukranService : IRequestHandlerAsync
    {
        private static ObjectCache ShukranConfigCache = System.Runtime.Caching.MemoryCache.Default;
        private static ObjectCache ShukranTokenCache = System.Runtime.Caching.MemoryCache.Default;
        private static readonly double defaultCacheItemExpirationInMinutes = 30;
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {
                    typeof(GetShukranConfigurationServiceRequest),
                    typeof(GetShukranTokenServiceRequest),
                    typeof(GetShukranCustomerProfileServiceRequest),
                    typeof(GetShukranCustomerEnrollServiceRequest),
                    typeof(GetShukranCustomerCouponServiceRequest),
                    typeof(GetShukranEnrollOTPServiceRequest),
                    typeof(GetShukranRedeemOTPServiceRequest),
                    typeof(GetShukranCustomerVoucherServiceRequest)
                };
            }
        }

        public async Task<Response> Execute(Request request)
        {
            if (request is GetShukranConfigurationServiceRequest)
            {
                GetShukranConfigurationServiceRequest req = request as GetShukranConfigurationServiceRequest;
                return await HandleGetShukranConfigurationServiceRequest(req).ConfigureAwait(false);
            }
            if (request is GetShukranTokenServiceRequest)
            {
                GetShukranTokenServiceRequest req = request as GetShukranTokenServiceRequest;
                return await HandleGetShukranTokenServiceRequest(req).ConfigureAwait(false);
            }
            if (request is GetShukranCustomerProfileServiceRequest)
            {
                GetShukranCustomerProfileServiceRequest req = request as GetShukranCustomerProfileServiceRequest;
                return await HandleGetShukranCustomerProfileServiceRequest(req).ConfigureAwait(false);
            }
            if (request is GetShukranCustomerEnrollServiceRequest)
            {
                GetShukranCustomerEnrollServiceRequest req = request as GetShukranCustomerEnrollServiceRequest;
                return await HandleEnrollShukranCustomerServiceRequest(req).ConfigureAwait(false);
            }
            if (request is GetShukranCustomerCouponServiceRequest)
            {
                GetShukranCustomerCouponServiceRequest req = request as GetShukranCustomerCouponServiceRequest;
                return await HandleShukranCustomerCouponServiceRequest(req).ConfigureAwait(false);
            }
            if (request is GetShukranEnrollOTPServiceRequest)
            {
                GetShukranEnrollOTPServiceRequest req = request as GetShukranEnrollOTPServiceRequest;
                return await HandleShukranEnrollOTPServiceRequest(req).ConfigureAwait(false);
            }
            if (request is GetShukranRedeemOTPServiceRequest)
            {
                GetShukranRedeemOTPServiceRequest req = request as GetShukranRedeemOTPServiceRequest;
                return await HandleShukranRedeemOTPServiceRequest(req).ConfigureAwait(false);
            }
            if (request is GetShukranCustomerVoucherServiceRequest)
            {
                GetShukranCustomerVoucherServiceRequest req = request as GetShukranCustomerVoucherServiceRequest;
                return await HandleShukranCustomerVoucherServiceRequest(req).ConfigureAwait(false);
            }

            throw new NotImplementedException();
        }

       

        private async Task<Response> HandleGetShukranConfigurationServiceRequest(GetShukranConfigurationServiceRequest request)
        {

            ShukranConfig config = null;
            string cacheKey = $"SHUKRANCONFIG-{request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId}";

            //string cacheDuration = request.RequestContext.Runtime.Configuration.GetSettingValue(extAttributeCacheItemExpirationInMinutesKey);
            //var cacheDurationTest= request.RequestContext.Runtime.Configuration;

            //if (cacheDuration.IsNullOrEmpty())
            //{
            double cacheDuration = defaultCacheItemExpirationInMinutes;
            //}



            var cachedSettings = ShukranConfigCache.Get(cacheKey);

            if (cachedSettings == null)
            {
                ShukranConfig shukranConfig = await GetShukranConfigParameter(request.RequestContext).ConfigureAwait(false);
                if (shukranConfig!= null)
                {
                    CacheItemPolicy cacheItemPolicy = new CacheItemPolicy { AbsoluteExpiration = DateTimeOffset.Now.AddMinutes(cacheDuration) };
                    ShukranConfigCache.Set(cacheKey, shukranConfig, cacheItemPolicy);
                    config = shukranConfig;
                }
            }
            else
            {
                config = (ShukranConfig)cachedSettings;
            }

            return new GetShukranConfigurationServiceResponse(config);
        }

        private async Task<ShukranConfig> GetShukranConfigParameter(RequestContext requestContext)
        {
            ShukranConfig config = new ShukranConfig();
            GetConfigurationParametersDataRequest dataRequest = new GetConfigurationParametersDataRequest(requestContext.GetPrincipal().ChannelId);
            EntityDataServiceResponse<RetailConfigurationParameter> configResp =
                await requestContext.ExecuteAsync<EntityDataServiceResponse<RetailConfigurationParameter>>(dataRequest).ConfigureAwait(false);

            config =new ShukranConfig()
            {
                AzureTokenUrl = configResp.FirstOrDefault(x => x.Name.Equals("AzureTokenUrl", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                AzureClientId = configResp.FirstOrDefault(x => x.Name.Equals("AzureClientId", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                AzureClientSecret = configResp.FirstOrDefault(x => x.Name.Equals("AzureClientSecret", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                AzureScope = configResp.FirstOrDefault(x => x.Name.Equals("AzureScope", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                AzureGrantType = configResp.FirstOrDefault(x => x.Name.Equals("AzureGrantType", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,

                EPCLTokenUrl= configResp.FirstOrDefault(x => x.Name.Equals("EPCLTokenUrl", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLToken = configResp.FirstOrDefault(x => x.Name.Equals("EPCLToken", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLAPIKey = configResp.FirstOrDefault(x => x.Name.Equals("EPCLAPIKey", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLGrantType = configResp.FirstOrDefault(x => x.Name.Equals("EPCLGrantType", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLUsername = configResp.FirstOrDefault(x => x.Name.Equals("EPCLUsername", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLPassword = configResp.FirstOrDefault(x => x.Name.Equals("EPCLPassword", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLResponseType = configResp.FirstOrDefault(x => x.Name.Equals("EPCLResponseType", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLSearchProfileUrl= configResp.FirstOrDefault(x => x.Name.Equals("EPCLSearchProfileUrl", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLEnrollProfileUrl= configResp.FirstOrDefault(x => x.Name.Equals("EPCLEnrollProfileUrl", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLEnrollOTPUrl= configResp.FirstOrDefault(x => x.Name.Equals("EPCLEnrollOTPUrl", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLCouponInquiryUrl = configResp.FirstOrDefault(x => x.Name.Equals("EPCLCouponInquiryUrl", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLTransactionUrl = configResp.FirstOrDefault(x => x.Name.Equals("EPCLTransactionUrl", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLRedeemOTPUrl = configResp.FirstOrDefault(x => x.Name.Equals("EPCLRedeemOTPUrl", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EPCLVoucherRedRevUrl = configResp.FirstOrDefault(x => x.Name.Equals("EPCLVoucherRedRevUrl", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,

                SourceCode = configResp.FirstOrDefault(x => x.Name.Equals("SKRNSourceCode", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                EnrollChannelCode = configResp.FirstOrDefault(x => x.Name.Equals("SKRNEnrollChannelCode", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                ProgramCode = configResp.FirstOrDefault(x => x.Name.Equals("SKRNProgramCode", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                ItemNumberTypeCode = configResp.FirstOrDefault(x => x.Name.Equals("SKRNItemNumberTypeCode", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                ConceptCode = configResp.FirstOrDefault(x => x.Name.Equals("SKRNConceptCode", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                CardnumberLength = configResp.FirstOrDefault(x => x.Name.Equals("SKRNCardnumberLength", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                VirtualCardScanIdentifierLength = configResp.FirstOrDefault(x => x.Name.Equals("SKRNVirtualCardScanIdentifierLength", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                CustAccount=configResp.FirstOrDefault(x => x.Name.Equals("SKRNCustAccount", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                CountryCode=configResp.FirstOrDefault(x => x.Name.Equals("SKRNInvoiceTerritory", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                SourceApplication=configResp.FirstOrDefault(x => x.Name.Equals("SKRNSourceApplication", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                DecimalPer=configResp.FirstOrDefault(x => x.Name.Equals("SKRNDecimal", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                CreditMemoTenderId=configResp.FirstOrDefault(x => x.Name.Equals("CreditMemoTenderId", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                StoreCountryCode=configResp.FirstOrDefault(x => x.Name.Equals("StoreCountryCode", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty

            };
            return config;
        }

        private async Task<Response> HandleGetShukranTokenServiceRequest(GetShukranTokenServiceRequest request)
        {
            ShukranAPIToken token = null;
            string cacheKey = $"SHUKRANTOKEN-{request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId}";
            double cacheDuration = 50;
            var cachedSettings = ShukranTokenCache.Get(cacheKey);
            if (cachedSettings == null)
            {
                ShukranAPIToken tokenResp = await GetShukranAPIToken(request.RequestContext).ConfigureAwait(false);
                if (tokenResp!= null)
                {
                    CacheItemPolicy cacheItemPolicy = new CacheItemPolicy { AbsoluteExpiration = DateTimeOffset.Now.AddMinutes(cacheDuration) };
                    ShukranTokenCache.Set(cacheKey, tokenResp, cacheItemPolicy);
                    token=tokenResp;
                }
            }
            else
            {
                token = (ShukranAPIToken)cachedSettings;
            }

            return new GetShukranTokenServiceResponse(token);
        }

        private async Task<ShukranAPIToken> GetShukranAPIToken(RequestContext requestContext)
        {
            ShukranAPIToken token = new ShukranAPIToken();

            GetShukranConfigurationServiceRequest configRequest = new GetShukranConfigurationServiceRequest();
            GetShukranConfigurationServiceResponse configResp = await requestContext.ExecuteAsync<GetShukranConfigurationServiceResponse>(configRequest).ConfigureAwait(false);
            
              

            AccessTokenResponse azureToken = await APIService.ShukranApiService.GetAzureAccessToken(configResp.ShukranConfigData, requestContext).ConfigureAwait(false);
            AccessTokenResponse epclToken = await APIService.ShukranApiService.GetEPCLToken(configResp.ShukranConfigData, azureToken.access_token, requestContext).ConfigureAwait(false);

            token =new ShukranAPIToken()
            {
                AzureAccessToken=azureToken.access_token,
                EPCLAccessToken=epclToken.access_token,
            };
            return token;
        }


        private async Task<Response> HandleGetShukranCustomerProfileServiceRequest(GetShukranCustomerProfileServiceRequest request)
        {
            CustomerProfileSearchResponse respProfile = null;

            GetShukranConfigurationServiceRequest configRequest = new GetShukranConfigurationServiceRequest();
            GetShukranConfigurationServiceResponse configResp = await request.RequestContext.ExecuteAsync<GetShukranConfigurationServiceResponse>(configRequest).ConfigureAwait(false);
            

            GetShukranTokenServiceRequest tokenServiceRequest = new GetShukranTokenServiceRequest();
            GetShukranTokenServiceResponse tokenServiceResponse = await request.RequestContext.ExecuteAsync<GetShukranTokenServiceResponse>(tokenServiceRequest).ConfigureAwait(false);
            if (tokenServiceResponse.ShukranToken!=null)
            {
                CustomerProfileRequest profileRequest= new CustomerProfileRequest()
                {
                    ProfileId="",
                    FieldName=request.SearchType,
                    LookupValue=request.SearchValue,
                    Country=request.CountryCode
                };
                CustomerProfileSearchResponse profileDetails = await APIService.ShukranApiService.GetProfileDetails(configResp.ShukranConfigData, tokenServiceResponse.ShukranToken, profileRequest,request.RequestContext,request.TransactionId).ConfigureAwait(false);

                //respProfile= new CustomerProfileSearchResponse()
                //{
                //    CustomerProfileDetails=profileDetails,
                //    Status=1,
                //    Success=true,
                //    Message=string.Empty,
                //    StoreCountryCode=configResp.ShukranConfigData.CountryCode,
                //    ShukranCustAccount =configResp.ShukranConfigData.CustAccount

                //};
                if (profileDetails == null || !profileDetails.Success)
                {
                    return new GetShukranCustomerProfileServiceResponse(new CustomerProfileSearchResponse
                    {
                        CustomerProfileDetails = null,
                        Status = profileDetails?.Status ?? 0,
                        Success = false,
                        Message = profileDetails?.Message ?? "Profile search failed."
                    });
                }
                respProfile = new CustomerProfileSearchResponse
                {
                    CustomerProfileDetails = profileDetails.CustomerProfileDetails,
                    Status = profileDetails.Status,
                    Success = true,
                    Message = string.Empty,
                    StoreCountryCode = configResp.ShukranConfigData.CountryCode,
                    ShukranCustAccount = configResp.ShukranConfigData.CustAccount
                };
            }
            else
            {
                respProfile= new CustomerProfileSearchResponse()
                {
                    CustomerProfileDetails=null,
                    Status=0,
                    Success=false,
                    Message="Token service error"
                };

            }
            return new GetShukranCustomerProfileServiceResponse(respProfile);
        }

        private async Task<Response> HandleEnrollShukranCustomerServiceRequest(GetShukranCustomerEnrollServiceRequest request)
        {
            EnrollCustomerDetails enrollCustomerDetails=null;
            GetShukranConfigurationServiceRequest configRequest = new GetShukranConfigurationServiceRequest();
            GetShukranConfigurationServiceResponse configResp = await request.RequestContext.ExecuteAsync<GetShukranConfigurationServiceResponse>(configRequest).ConfigureAwait(false);


            GetShukranTokenServiceRequest tokenServiceRequest = new GetShukranTokenServiceRequest();
            GetShukranTokenServiceResponse tokenServiceResponse = await request.RequestContext.ExecuteAsync<GetShukranTokenServiceResponse>(tokenServiceRequest).ConfigureAwait(false);
            if (tokenServiceResponse.ShukranToken!=null)
            {
                request.EnrollCustomerReq.SourceCode = configResp.ShukranConfigData.SourceCode;
                request.EnrollCustomerReq.EnrollChannelCode = configResp.ShukranConfigData.EnrollChannelCode;

                enrollCustomerDetails = await APIService.ShukranApiService.EnrollCustomer(configResp.ShukranConfigData,tokenServiceResponse.ShukranToken,
                                                                                          request.EnrollCustomerReq, request.RequestContext,request.TransId).ConfigureAwait(false);

                return new GetShukranCustomerEnrollServiceResponse(enrollCustomerDetails, success: true, message: string.Empty,shukranCustAccount:configResp.ShukranConfigData.CustAccount);
            }
            else
            {
                return new GetShukranCustomerEnrollServiceResponse(null, success: false, message: "Token service error","");
            }
        }

        private async Task<Response> HandleShukranCustomerCouponServiceRequest(GetShukranCustomerCouponServiceRequest request)
        {

            GetShukranConfigurationServiceRequest configRequest = new GetShukranConfigurationServiceRequest();
            GetShukranConfigurationServiceResponse configResp = await request.RequestContext.ExecuteAsync<GetShukranConfigurationServiceResponse>(configRequest).ConfigureAwait(false);


            GetShukranTokenServiceRequest tokenServiceRequest = new GetShukranTokenServiceRequest();
            GetShukranTokenServiceResponse tokenServiceResponse = await request.RequestContext.ExecuteAsync<GetShukranTokenServiceResponse>(tokenServiceRequest).ConfigureAwait(false);
            if (tokenServiceResponse.ShukranToken!=null)
            {
                CustomerCouponRequest couponRequest= new CustomerCouponRequest
                {
                    StoreCode=request.RequestContext.GetDeviceConfiguration().StoreNumber,
                    ProfileId=request.ProfileId,
                    ConceptCode=configResp.ShukranConfigData.ConceptCode,
                    Action=request.Action
                };
               List<CustomerCouponDetails> couponDetails = await APIService.ShukranApiService.CouponDetails(configResp.ShukranConfigData, tokenServiceResponse.ShukranToken, couponRequest, request.RequestContext,request.TransId).ConfigureAwait(false);
                CustomerCouponResult couponResult = new CustomerCouponResult
                {
                    Coupons = couponDetails ?? new List<CustomerCouponDetails>(),
                    Success = true,
                    Message = string.Empty
                };
                return new GetShukranCustomerCouponServiceResponse(couponResult);
            }
            else
            {
                CustomerCouponResult couponResult = new CustomerCouponResult
                {
                    Coupons = new List<CustomerCouponDetails>(),
                    Success = false,
                    Message = "Token service error"
                };

                return new GetShukranCustomerCouponServiceResponse(couponResult);
            }
        }

        private async Task<Response> HandleShukranEnrollOTPServiceRequest(GetShukranEnrollOTPServiceRequest request)
        {
            GetShukranConfigurationServiceRequest configRequest = new GetShukranConfigurationServiceRequest();
            GetShukranConfigurationServiceResponse configResp = await request.RequestContext.ExecuteAsync<GetShukranConfigurationServiceResponse>(configRequest).ConfigureAwait(false);

            GetShukranTokenServiceRequest tokenServiceRequest = new GetShukranTokenServiceRequest();
            GetShukranTokenServiceResponse tokenServiceResponse = await request.RequestContext.ExecuteAsync<GetShukranTokenServiceResponse>(tokenServiceRequest).ConfigureAwait(false);

            if (tokenServiceResponse.ShukranToken != null)
            {

                string generatedOtp = OTPHelper.GenerateOTP();
                string generatedGuid = System.Guid.NewGuid().ToString();

                SendShukranOTPDataRequest saveOtpRequest = new SendShukranOTPDataRequest( otp: generatedOtp,guid: generatedGuid,phone: request.MobileNumber);
                SendShukranOTPDataResponse saveOtpResponse = await request.RequestContext.ExecuteAsync<SendShukranOTPDataResponse>(saveOtpRequest).ConfigureAwait(false);
                
                if (!saveOtpResponse.IsSuccess)
                {
                    return new GetShukranEnrollOTPServiceResponse(null, success: false, message: "Failed to save OTP to database");
                }

                CustomerEnrollOTPRequest.ShukranEnrollOTPModel otpRequest =
                    new CustomerEnrollOTPRequest.ShukranEnrollOTPModel
                    {
                        requestType = "ENROLLMENT",
                        mergeTriggerRecordData = new CustomerEnrollOTPRequest.MergeTriggerRecordData
                        {
                            fieldNames = new List<string>
                            {
                                "MOBILE_NUMBER_",
                                "MOBILE_COUNTRY_",
                                "LANGUAGE",
                                "CUSTOMER_ID_"
                            },
                            mergeTriggerRecords = new List<CustomerEnrollOTPRequest.MergeTriggerRecord>
                            {
                                new CustomerEnrollOTPRequest.MergeTriggerRecord
                                {
                                    fieldValues = new List<string>
                                    {
                                        request.MobileNumber,
                                        request.Territory,
                                        request.Language,
                                        request.CustomerId
                                    },
                                    optionalData = new List<CustomerEnrollOTPRequest.OptionalData>
                                    {
                                        new CustomerEnrollOTPRequest.OptionalData
                                        {
                                            name  = "PASSWORD_OTP",
                                            value = generatedOtp
                                        }
                                    }
                                }
                            }
                        },
                        mergeRule = new CustomerEnrollOTPRequest.MergeRule
                        {
                            htmlValue                  = "H",
                            matchColumnName1           = "MOBILE_NUMBER_",
                            matchColumnName2           = null,
                            optoutValue                = "O",
                            optinValue                 = "I",
                            insertOnNoMatch            = true,
                            defaultPermissionStatus    = "OPTIN",
                            rejectRecordIfChannelEmpty = null,
                            updateOnMatch              = "REPLACE_ALL",
                            textValue                  = "T",
                            matchOperator              = "NONE"
                        }
                    };

                CustomerEnrollOTPDetails otpDetails = await APIService.ShukranApiService .SendEnrollOTP(configResp.ShukranConfigData, tokenServiceResponse.ShukranToken, otpRequest, request.RequestContext,request.TransId).ConfigureAwait(false);

                return new GetShukranEnrollOTPServiceResponse(otpDetails, success: true, message: string.Empty, guid: generatedGuid);
            }
            else
            {
                return new GetShukranEnrollOTPServiceResponse(null, success: false, message: "Token service error","");
            }
        }

        private async Task<Response> HandleShukranRedeemOTPServiceRequest(GetShukranRedeemOTPServiceRequest request)
        {
            GetShukranConfigurationServiceRequest configRequest = new GetShukranConfigurationServiceRequest();
            GetShukranConfigurationServiceResponse configResp = await request.RequestContext.ExecuteAsync<GetShukranConfigurationServiceResponse>(configRequest).ConfigureAwait(false);

            GetShukranTokenServiceRequest tokenServiceRequest = new GetShukranTokenServiceRequest();
            GetShukranTokenServiceResponse tokenServiceResponse = await request.RequestContext.ExecuteAsync<GetShukranTokenServiceResponse>(tokenServiceRequest).ConfigureAwait(false);

            if (tokenServiceResponse.ShukranToken != null)
            {
                string generatedOtp = OTPHelper.GenerateOTP();
                string generatedGuid = System.Guid.NewGuid().ToString();

                SendShukranOTPDataRequest saveOtpRequest = new SendShukranOTPDataRequest(otp: generatedOtp, guid: generatedGuid, phone: request.MobileNumber);
                SendShukranOTPDataResponse saveOtpResponse = await request.RequestContext.ExecuteAsync<SendShukranOTPDataResponse>(saveOtpRequest).ConfigureAwait(false);

                if (!saveOtpResponse.IsSuccess)
                {
                    return new GetShukranRedeemOTPServiceResponse(null, success: false, message: "Failed to save OTP to database");
                }

                CustomerRedeemOTPRequest.ShukranRedeemOTPModel otpRequest =
                    new CustomerRedeemOTPRequest.ShukranRedeemOTPModel
                    {
                        requestType = "REDEMPTION",
                        mergeTriggerRecordData = new CustomerRedeemOTPRequest.MergeTriggerRecordData
                        {
                            fieldNames = new List<string>
                            {
                                "MOBILE_NUMBER_",
                                "MOBILE_COUNTRY_",
                                "LANGUAGE",
                                "CUSTOMER_ID_"
                            },
                            mergeTriggerRecords = new List<CustomerRedeemOTPRequest.MergeTriggerRecord>
                            {
                        new CustomerRedeemOTPRequest.MergeTriggerRecord
                        {
                            fieldValues = new List<string>
                            {
                                request.MobileNumber,
                                request.Territory,
                                request.Language,
                                request.CardNumber
                            },
                            optionalData = new List<CustomerRedeemOTPRequest.OptionalData>
                            {
                                new CustomerRedeemOTPRequest.OptionalData
                                {
                                    name  = "PASSWORD_OTP",
                                    value = generatedOtp
                                }
                            }
                        }
                            }
                        },
                        mergeRule = new CustomerRedeemOTPRequest.MergeRule
                        {
                            htmlValue                  = "H",
                            matchColumnName1           = "MOBILE_NUMBER_",
                            matchColumnName2           = null,
                            optoutValue                = "O",
                            optinValue                 = "I",
                            insertOnNoMatch            = true,
                            defaultPermissionStatus    = "OPTIN",
                            rejectRecordIfChannelEmpty = null,
                            updateOnMatch              = "REPLACE_ALL",
                            textValue                  = "T",
                            matchOperator              = "NONE"
                        }
                    };

                CustomerRedeemOTPDetails otpDetails = await APIService.ShukranApiService
                    .SendRedeemOTP(configResp.ShukranConfigData, tokenServiceResponse.ShukranToken, otpRequest, request.RequestContext,request.TransId).ConfigureAwait(false);

                return new GetShukranRedeemOTPServiceResponse(otpDetails, success: true, message: string.Empty, guid: generatedGuid);
            }
            else
            {
                return new GetShukranRedeemOTPServiceResponse(null, success: false, message: "Token service error", "");
            }
        }

        private async Task<Response> HandleShukranCustomerVoucherServiceRequest(GetShukranCustomerVoucherServiceRequest request)
        {
            GetShukranConfigurationServiceRequest configRequest = new GetShukranConfigurationServiceRequest();
            GetShukranConfigurationServiceResponse configResp = await request.RequestContext.ExecuteAsync<GetShukranConfigurationServiceResponse>(configRequest).ConfigureAwait(false);

            GetShukranTokenServiceRequest tokenServiceRequest = new GetShukranTokenServiceRequest();
            GetShukranTokenServiceResponse tokenServiceResponse = await request.RequestContext.ExecuteAsync<GetShukranTokenServiceResponse>(tokenServiceRequest).ConfigureAwait(false);

            if (tokenServiceResponse.ShukranToken != null)
            {
                CustomerVoucherRequest voucherRequest = new CustomerVoucherRequest
                {
                    ProfileId          = request.ProfileId,
                    StoreCode          = request.StoreCode,
                    ConceptCode        = request.ConceptCode,
                    DiscountCouponCode = request.DiscountCouponCode,
                    VoucherNumber      = request.VoucherNumber,
                    TransactionNumber  = request.TransactionNumber,
                    Action             = request.Action
                };

                List<CustomerVoucherDetails> voucherDetails = await APIService.ShukranApiService
                    .VoucherDetails(configResp.ShukranConfigData, tokenServiceResponse.ShukranToken, voucherRequest, request.RequestContext,request.TransactionNumber).ConfigureAwait(false);

                var first = voucherDetails?.FirstOrDefault ();
                bool apiSuccess = first?.Success ?? false;
                string apiMessage = first?.Message ?? string.Empty;

                CustomerVoucherResult voucherResult = new CustomerVoucherResult
                {
                    Vouchers = apiSuccess ? voucherDetails : new List<CustomerVoucherDetails> (),
                    Success  = apiSuccess,
                    Message  = apiSuccess ? string.Empty : apiMessage
                };

                return new GetShukranCustomerVoucherServiceResponse(voucherResult);
            }
            else
            {
                CustomerVoucherResult voucherResult = new CustomerVoucherResult
                {
                    Vouchers = new List<CustomerVoucherDetails>(),
                    Success  = false,
                    Message  = "Token service error"
                };

                return new GetShukranCustomerVoucherServiceResponse(voucherResult);
            }
        }

    }
}
