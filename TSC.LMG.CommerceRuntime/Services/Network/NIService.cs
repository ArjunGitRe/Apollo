//using Azure;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.DataServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Runtime.Caching;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using TSC.LMG.CommerceRuntime.APIService;
using TSC.LMG.CommerceRuntime.Helper;
using TSC.LMG.Runtime.Messages.Network;
using TSC.LMG.Runtime.Messages.Network.Transaction;
using TSC.LMG.Runtime.Model.Network;
using TSC.LMG.Runtime.Model.Network.Auth;
using TSC.LMG.Runtime.Model.Network.Transactions;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.CommerceRuntime.Services.Network
{
    public class NIService:IRequestHandlerAsync
    {
        public bool IsRefund { get; }
        private static ObjectCache NIConfigCache = MemoryCache.Default;
        private static readonly ObjectCache NITokenCache = MemoryCache.Default;
        private static readonly ObjectCache NITerminalMappingCache = MemoryCache.Default;
        private static readonly double defaultConfigCacheMinutes = 30;
        private const double TerminalMappingCacheMinutes = 60;

        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {
                    typeof(GetNIConfigurationServiceRequest),
                    typeof(GetNITokenServiceRequest),
                    typeof(NIInitiateTransactionRequest),
                    typeof(NIGetTransactionResultRequest),
                    typeof(NICancelTransactionRequest)
                };
            }
        }

        public async Task<Response> Execute ( Request request )
        {
            if(request is GetNIConfigurationServiceRequest configReq)
                return await HandleGetNIConfigurationServiceRequest (configReq).ConfigureAwait (false);

            if(request is GetNITokenServiceRequest tokenReq)
                return await HandleGetNITokenServiceRequest (tokenReq).ConfigureAwait (false);

            if(request is NIInitiateTransactionRequest initiateReq)
                return await HandleNIInitiateTransactionRequest (initiateReq).ConfigureAwait (false);
            if(request is NIGetTransactionResultRequest getResultReq)
                return await HandleNIGetTransactionResultRequest (getResultReq).ConfigureAwait (false);
            if(request is NICancelTransactionRequest cancelReq2)
                return await HandleNICancelTransactionRequest (cancelReq2).ConfigureAwait (false);

            throw new NotImplementedException ();
        }

        private async Task<Response> HandleGetNIConfigurationServiceRequest ( GetNIConfigurationServiceRequest request )
        {
            //string cacheKey = $"NICONFIG-{request.RequestContext.GetChannelConfiguration ().InventLocationDataAreaId}";
            // ── Identify current terminal ────────────────────────────────
            string storeId = request.RequestContext.GetDeviceConfiguration ()?.StoreNumber ?? "";
            string terminalId = request.RequestContext.GetDeviceConfiguration ()?.TerminalId  ?? "";
            string dataAreaId = request.RequestContext.GetChannelConfiguration ()?.InventLocationDataAreaId ?? "";
            string cacheKey = $"NITERMINAL_{storeId}_{terminalId}";

            if(NIConfigCache.Get (cacheKey) is NIConfig cached)
                return new GetNIConfigurationServiceResponse (cached);

            NIConfig fresh = await GetNIConfigParameter (request.RequestContext).ConfigureAwait (false);

            if(fresh != null)
            {
                NIConfigCache.Set (cacheKey,fresh,new CacheItemPolicy
                {
                    AbsoluteExpiration = DateTimeOffset.Now.AddMinutes (TerminalMappingCacheMinutes)
                });
            }


            return new GetNIConfigurationServiceResponse (fresh);
        }

        private async Task<NIConfig> GetNIConfigParameter ( RequestContext requestContext )
        {
            GetConfigurationParametersDataRequest dataRequest = new GetConfigurationParametersDataRequest (requestContext.GetPrincipal ().ChannelId);
            EntityDataServiceResponse<RetailConfigurationParameter> configResp =
                await requestContext.ExecuteAsync<EntityDataServiceResponse<RetailConfigurationParameter>> (dataRequest).ConfigureAwait (false);
            //Get the NI terminal Id
            NITerminalMap niTerminal = await GetTerminalMapping (requestContext).ConfigureAwait (false);

            NIConfig config = new NIConfig
            {
                NITokenUrl = configResp.FirstOrDefault (x => x.Name.Equals ("NITokenUrl",StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                NITransactionsBaseUrl = configResp.FirstOrDefault (x => x.Name.Equals ("NITransactionsBaseUrl",StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                NISubscriptionKey = configResp.FirstOrDefault (x => x.Name.Equals ("NISubscriptionKey",StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                NIChainId = configResp.FirstOrDefault (x => x.Name.Equals ("NIChainId",StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                NIGrantType = configResp.FirstOrDefault (x => x.Name.Equals ("NIGrantType",StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                NIClientId = configResp.FirstOrDefault (x => x.Name.Equals ("NIClientId",StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                NIClientSecret = configResp.FirstOrDefault (x => x.Name.Equals ("NIClientSecret",StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                NISubscriptionKeyHeader=configResp.FirstOrDefault (x => x.Name.Equals ("NISubscriptionKeyHeader",StringComparison.OrdinalIgnoreCase))?.Value ??  string.Empty,
                NIChainIdHeader=configResp.FirstOrDefault (x => x.Name.Equals ("NIChainIdHeader",StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty,
                NIMID = niTerminal?.MID??string.Empty,
                NITID = niTerminal?.TID??string.Empty
            };
            return config;
        }
        private async Task<Response> HandleGetNITokenServiceRequest ( GetNITokenServiceRequest request )
        {
            string cacheKey = $"NITOKEN-{request.TransactionId}";

            if(NITokenCache.Get (cacheKey) is NIAPIToken cached)
                return new GetNITokenServiceResponse (cached.AccessToken,string.Empty);

            NIAPIToken fresh = await GetNIAPIToken (request.RequestContext,request.TransactionId).ConfigureAwait (false);

            if(fresh != null && !string.IsNullOrEmpty (fresh.AccessToken))
            {
                NITokenCache.Set (cacheKey,fresh,new CacheItemPolicy
                {
                    AbsoluteExpiration = DateTimeOffset.Now.AddMinutes (5)//changed token cache time from 2mins to 5min
                });
            }


            return new GetNITokenServiceResponse (fresh?.AccessToken ?? string.Empty,string.Empty);
        }

        private async Task<NIAPIToken> GetNIAPIToken ( RequestContext requestContext,string TransId )
        {
            GetNIConfigurationServiceRequest configRequest = new GetNIConfigurationServiceRequest ();
            GetNIConfigurationServiceResponse configResp =
                await requestContext.ExecuteAsync<GetNIConfigurationServiceResponse> (configRequest).ConfigureAwait (false);

            TokenResponse accessToken =
                await NIApiService.GenerateToken (configResp.NIConfigData,requestContext,TransId).ConfigureAwait (false);

            await LogNIApiCall (requestContext,TransId,"GENERATE-TOKEN",configResp.NIConfigData.NITokenUrl,"",
                                Newtonsoft.Json.JsonConvert.SerializeObject (accessToken)).ConfigureAwait (false);

            return new NIAPIToken { AccessToken = accessToken.AccessToken };
        }

        private async Task<Response> HandleNIInitiateTransactionRequest ( NIInitiateTransactionRequest request )
        {
            var (config, token) = await GetConfigAndToken (request.RequestContext,request.TransactionId).ConfigureAwait (false);

            if(config == null || string.IsNullOrEmpty (token))
            {
                return new NIInitiateTransactionResponse (new NIStartTransaction
                {
                    Id     = -1,
                    errCode = "TOKEN_ERROR",
                    errMsg  = "Failed to obtain NI access token."
                });
            }

            // ── Step 1: Generate sourceId ────────────────────────────────
            // Use Unix timestamp + terminal ID suffix to guarantee uniqueness per terminal.
            // e.g. "1748765432_POS001"

            string storeNum = request.RequestContext.GetDeviceConfiguration ()?.StoreNumber;
            //string cleanStore = System.Text.RegularExpressions.Regex.Replace (storeNum,@"[^a-zA-Z0-9]","");
            //string storePart = cleanStore.Length > 5? cleanStore.Substring (0,5): cleanStore.PadRight (5,'0');
            //long unixTime = ((DateTimeOffset) DateTime.UtcNow).ToUnixTimeSeconds ();
            //string uniquePart = unixTime.ToString ("D10");

            //string sourceId = $"{storePart}{uniquePart}";

            string terminalId = request.RequestContext.GetDeviceConfiguration ()?.TerminalId;
            string sourceId = GenerateSourceId (storeNum,terminalId);

            // ── Step 2: Check terminal is idle ───────────────────────────
            var idleCheckBody = new NIGetStatusRequestClass { SourceId = "" };

            NIGetStatusResponseClass statusResp = await NIApiService.GetStatus (config,token,idleCheckBody,request.RequestContext,request.TransactionId).ConfigureAwait (false);

            await LogNIApiCall (request.RequestContext,request.TransactionId,"GET-STATUS-IDLE",
                                NIHelper.BuildUrl (config,"get-status"),
                                Newtonsoft.Json.JsonConvert.SerializeObject (idleCheckBody),
                                Newtonsoft.Json.JsonConvert.SerializeObject (statusResp)).ConfigureAwait (false);


            if(statusResp == null || statusResp.DisplayText != "NO TXN / SYSTEM IDLE")
            {
                string busyReason = statusResp?.DisplayText ?? "Terminal status unknown.";
                return new NIInitiateTransactionResponse (new NIStartTransaction
                {
                    Id     = -1,
                    errCode = "",
                    errMsg  = $"Terminal busy: {busyReason} Please try again."
                });
            }


            // ── Step 3: Start transaction ────────────────────────────────
            var startReq = new NIStartTransactionsRequestClass
            {
                TransactionType = !string.IsNullOrEmpty (request.TransactionTypeOverride)
                                    ? request.TransactionTypeOverride
                                    : string.IsNullOrEmpty (request.OriginalSourceId)
                                        ? "pushPaymentSale"
                                        : request.IsRefund
                                            ? "genericRefund"
                                            : "pushPaymentVoid",
                SourceId   = sourceId,
                Amount     = string.IsNullOrEmpty (request.OriginalSourceId) || request.IsRefund ? request.Amount : null,
                OriginalId = !string.IsNullOrEmpty (request.OriginalSourceId) ? request.OriginalSourceId : null
            };

            NIStartTransactionResponseClass startResp = await NIApiService.StartTransaction (config,token,startReq,request.RequestContext,request.TransactionId).ConfigureAwait (false);

            await LogNIApiCall (request.RequestContext,request.TransactionId,"START-TRANSACTION",
                                NIHelper.BuildUrl (config,"start-transaction"),
                                Newtonsoft.Json.JsonConvert.SerializeObject (startReq),
                                Newtonsoft.Json.JsonConvert.SerializeObject (startResp)).ConfigureAwait (false);

            if(startResp == null)
            {
                return new NIInitiateTransactionResponse (new NIStartTransaction
                {
                    Id     = -1,
                    errCode = "",
                    errMsg  = "No response from start-transaction API.",
                    SourceId = sourceId
                });
            }

            // ── Step 4: Return result ────────────────────────────────────
            if(startResp.ResponseCode == "200")
            {
                return new NIInitiateTransactionResponse (new NIStartTransaction
                {
                    Id       = 1,
                    respCode = startResp.ResponseCode,
                    respMsg  = startResp.ResponseMessage,
                    SourceId = sourceId           // POS stores this for polling
                });
            }

            // NI returned a non-200 response code
            string errMsg = !string.IsNullOrEmpty (startResp.ErrorMessage)
                ? startResp.ErrorMessage
                : (!string.IsNullOrEmpty (startResp.ErrorMessage1) ? startResp.ErrorMessage1 : startResp.ResponseMessage);

            return new NIInitiateTransactionResponse (new NIStartTransaction
            {
                Id      = -1,
                errCode = !string.IsNullOrEmpty (startResp.ErrorCode) ? startResp.ErrorCode : startResp.ResponseCode,
                errMsg  = errMsg,
                SourceId = sourceId
            });
        }

        private async Task<Response> HandleNIGetTransactionResultRequest ( NIGetTransactionResultRequest request )
        {
            var (config, token) = await GetConfigAndToken (request.RequestContext,request.TransactionId).ConfigureAwait (false);

            if(config == null || string.IsNullOrEmpty (token))
            {
                return new NIGetTransactionResultResponse (new NIResultTransaction
                {
                    Id     = -1,
                    errCode = "TOKEN_ERROR",
                    errMsg  = "Failed to obtain NI access token."
                });
            }

            // ── Step 1: Get status ───────────────────────────────────────
            var statusBody = new NIGetStatusRequestClass { SourceId = request.SourceId };

            NIGetStatusResponseClass statusResp = await NIApiService.GetStatus (config,token,statusBody,request.RequestContext,request.TransactionId).ConfigureAwait (false);

            await LogNIApiCall (request.RequestContext,request.TransactionId,"GET-STATUS",
                                NIHelper.BuildUrl (config,"get-status"),
                                Newtonsoft.Json.JsonConvert.SerializeObject (statusBody),
                                Newtonsoft.Json.JsonConvert.SerializeObject (statusResp)).ConfigureAwait (false);

            if(statusResp == null)
            {
                return new NIGetTransactionResultResponse (new NIResultTransaction
                {
                    Id    = -1,
                    errMsg = "No response from get-status API."
                });
            }

            // ── Step 2: Still in progress ────────────────────────────────
            if(statusResp.InProgress)
            {
                return new NIGetTransactionResultResponse (new NIResultTransaction
                {
                    Id    = -1,
                    errMsg = $"Transaction still in progress at device. {statusResp.DisplayText}"
                });
            }

            // ── Step 2b: "Transaction in Queue" or "Transaction not Found" ─
            if(!statusResp.Complete && !statusResp.InProgress)
            {
                return new NIGetTransactionResultResponse (new NIResultTransaction
                {
                    Id    = -1,
                    errMsg = string.IsNullOrEmpty (statusResp.DisplayText)
                        ? "Transaction not complete yet."
                        : statusResp.DisplayText
                });
            }

            // ── Step 3: Complete — get full result ───────────────────────
            var resultBody = new NIGetResultRequestClass { SourceId = request.SourceId };

            NIGetResultResponseClass resultResp = await NIApiService.GetResult (config,token,resultBody,request.RequestContext,request.TransactionId).ConfigureAwait (false);

            await LogNIApiCall (request.RequestContext,request.TransactionId,"GET-RESULT",
                                NIHelper.BuildUrl (config,"get-result"),
                                Newtonsoft.Json.JsonConvert.SerializeObject (resultBody),
                                Newtonsoft.Json.JsonConvert.SerializeObject (resultResp)).ConfigureAwait (false);

            if(resultResp == null)
            {
                return new NIGetTransactionResultResponse (new NIResultTransaction
                {
                    Id    = -1,
                    errMsg = "No response from get-result API."
                });
            }

            // ── Step 4: Return result ────────────────────────────────────
            if(resultResp.Complete && resultResp.Success)
            {
                // Amount from NI is in lowest denomination (fils/halalas), convert to decimal
                string displayAmount = "";
                if(!string.IsNullOrEmpty (resultResp.Amount))
                {
                    if(decimal.TryParse (resultResp.Amount,out decimal amountRaw))
                        displayAmount = (amountRaw / 100m).ToString ("F2");
                }

                string paymentId = string.Empty;
                if(resultResp.CustomerReceipt != null)
                {
                    var paymentIdItem = resultResp.CustomerReceipt
                        .FirstOrDefault (r => !string.IsNullOrEmpty (r.TextLeft) &&
                            r.TextLeft.Trim ().TrimEnd (':').Trim ()
                                .Equals ("PaymentId",StringComparison.OrdinalIgnoreCase));

                    if(paymentIdItem != null && !string.IsNullOrEmpty (paymentIdItem.TextRight))
                    {
                        paymentId = paymentIdItem.TextRight.Trim ();
                    }
                }
                await SaveNITransactionResult (request.RequestContext,request.TransactionId,resultResp,request.TenderLineNumber,request.PaymentType,paymentId).ConfigureAwait (false);

                return new NIGetTransactionResultResponse (new NIResultTransaction
                {
                    Id       = 1,
                    respCode = resultResp.ResultCode,
                    respMsg  = resultResp.ResultCodeDescription,
                    SourceId = resultResp.SourceId ?? request.SourceId,
                    Amount   = displayAmount,
                    CardType = resultResp.CardType,
                    PanMasked = resultResp.PanMasked,
                    AuthCode  = resultResp.AuthCode,
                    Rrn       = resultResp.Rrn
                });
            }
            else
            {
                return new NIGetTransactionResultResponse (new NIResultTransaction
                {
                    Id      = -1,
                    errCode = resultResp.ResultCode,
                    errMsg  = resultResp.ResultCodeDescription
                });
            }
        }


        private async Task<Response> HandleNICancelTransactionRequest ( NICancelTransactionRequest request )
        {
            var (config, token) = await GetConfigAndToken (request.RequestContext,request.TransactionId).ConfigureAwait (false);

            if(config == null || string.IsNullOrEmpty (token))
            {
                return new NICancelTransactionResponse (new NIResultTransaction
                {
                    Id     = -1,
                    errCode = "TOKEN_ERROR",
                    errMsg  = "Failed to obtain NI access token."
                });
            }

            var cancelBody = new NIStartTransactionsRequestClass
            {
                SourceId = request.SourceId
            };

            NIStartTransactionResponseClass cancelResp = await NIApiService.CancelTransaction (config,token,cancelBody,request.RequestContext,request.TransactionId).ConfigureAwait (false);

            await LogNIApiCall (request.RequestContext,request.TransactionId,"CANCEL-TRANSACTION",
                                NIHelper.BuildUrl (config,"cancel-transaction"),
                                Newtonsoft.Json.JsonConvert.SerializeObject (cancelBody),
                                Newtonsoft.Json.JsonConvert.SerializeObject (cancelResp)).ConfigureAwait (false);

            if(cancelResp == null)
            {
                return new NICancelTransactionResponse (new NIResultTransaction
                {
                    Id    = -1,
                    errMsg = "No response from cancel-transaction API."
                });
            }

            if(cancelResp.ResponseCode == "200")
            {
                return new NICancelTransactionResponse (new NIResultTransaction
                {
                    Id       = 1,
                    respCode = cancelResp.ResponseCode,
                    respMsg  = cancelResp.ResponseMessage
                });
            }

            string errMsg = !string.IsNullOrEmpty (cancelResp.ErrorMessage)
                ? cancelResp.ErrorMessage
                : cancelResp.ResponseMessage;

            return new NICancelTransactionResponse (new NIResultTransaction
            {
                Id      = -1,
                errCode = cancelResp.ErrorCode ?? cancelResp.ResponseCode,
                errMsg  = errMsg
            });
        }


        //private async Task<(NIConfig config, string token)> GetConfigAndToken ( RequestContext requestContext )
        //{
        //    var configResp = await requestContext
        //        .ExecuteAsync<GetNIConfigurationServiceResponse> (new GetNIConfigurationServiceRequest ())
        //        .ConfigureAwait (false);

        //    var tokenResp = await requestContext
        //        .ExecuteAsync<GetNITokenServiceResponse> (new GetNITokenServiceRequest (string.Empty))
        //        .ConfigureAwait (false);

        //    return (configResp?.NIConfigData, tokenResp?.Token);
        //}

        private async Task<(NIConfig config, string token)> GetConfigAndToken ( RequestContext requestContext,string transactionId )
        {

            var configResp = await requestContext.ExecuteAsync<GetNIConfigurationServiceResponse> (new GetNIConfigurationServiceRequest ()).ConfigureAwait (false);
            var tokenResp = await requestContext.ExecuteAsync<GetNITokenServiceResponse> (new GetNITokenServiceRequest (transactionId)).ConfigureAwait (false);

            NIConfig config = configResp?.NIConfigData;
            string token = tokenResp?.Token;

            if(config == null || string.IsNullOrEmpty (token))
                return (null, null);

            //// ── Identify current terminal ────────────────────────────────
            //string storeId = requestContext.GetDeviceConfiguration ()?.StoreNumber ?? "";
            //string terminalId = requestContext.GetDeviceConfiguration ()?.TerminalId  ?? "";
            //string dataAreaId = requestContext.GetChannelConfiguration ()?.InventLocationDataAreaId ?? "";
            //string cacheKey = $"NITERMINAL-{storeId}-{terminalId}";

            //// ── Cache lookup ─────────────────────────────────────────────
            //if(!(NITerminalMappingCache.Get (cacheKey) is NITerminalMap mapping))
            //{
            //    mapping = await GetTerminalMapping (requestContext,storeId,terminalId,dataAreaId).ConfigureAwait (false);

            //    if(mapping != null)
            //    {
            //        NITerminalMappingCache.Set (cacheKey,mapping,new CacheItemPolicy
            //        {
            //            AbsoluteExpiration = DateTimeOffset.Now.AddMinutes (TerminalMappingCacheMinutes)
            //        });
            //    }
            //}

            //if(mapping == null || string.IsNullOrEmpty (mapping.MID) || string.IsNullOrEmpty (mapping.TID))
            //{
            //    return (null, null);
            //}

            //// ── Inject MID and TID into config ───────────────────────────
            //config.NIMID = mapping.MID;
            //config.NITID = mapping.TID;

            return (config, token);
        }

        private async Task<NITerminalMap> GetTerminalMapping ( RequestContext requestContext )
        {
            string sql = @"SELECT TOP 1 [RECID],[STOREID],[TERMINALID],[MID],[TID],[DATAAREAID] FROM [ext].[TSCNIPAYMENTTERMINALMAPPING] 
                            WHERE [STOREID] = @StoreId AND [TERMINALID] = @TerminalId AND [DATAAREAID] = @DataAreaId";

            using(var dbContext = new DatabaseContext (requestContext))
            {
                SqlQuery query = new SqlQuery ();
                query.QueryString = sql;
                query.Parameters.Add ("@StoreId",requestContext.GetDeviceConfiguration ().StoreNumber);
                query.Parameters.Add ("@TerminalId",requestContext.GetDeviceConfiguration ().TerminalId);
                query.Parameters.Add ("@DataAreaId",requestContext.GetChannelConfiguration ().InventLocationDataAreaId);

                PagedResult<NITerminalMap> result = await dbContext.ReadEntityAsync<NITerminalMap> (query).ConfigureAwait (false);
                return result.FirstOrDefault ();
            }
        }

        private async Task SaveNITransactionResult ( RequestContext requestContext,string transactionId,NIGetResultResponseClass result,string lineNum,string type,string paymentId = "" )
        {
            try
            {
                //DateTime txn = this.FromStringToDateTime (result?.TransactionDate,result?.TransactionTime);

                string sql = @"INSERT INTO [ext].[TSCRETAILNIPAYMENTTRANSACTIONTABLEEXT]( [STOREID],[TERMINALID],[TRANSACTIONID],[SOURCEID],[AMOUNT],[CARDTYPE],[PANMASKED],
                               [AUTHCODE],[RESULTCODE],[RECEIPTNO],[CURRENCY],[TRANSACTIONDATE],[TRANSACTIONTIME],[RESULTCODEDESCRIPTION],[MID],[TID],[RRN],[SUCCESS],
                               [DATAAREAID],[LINENUM],[TYPE],[PAYMENTID],[AID],[LABEL])
                               VALUES(@StoreId,@TerminalId,@TransactionId, @SourceId, @Amount, @CardType, @PanMasked, @AuthCode, @ResultCode,@ReceiptNo,@Currency, @TransactionDate,
                               @TransactionTime, @ResultCodeDescription, @MID,@TID, @RRN, @Success, @DataAreaId,@LineNum,@Type,@PaymentId,@AID,@Label)";
                using(var dbContext = new DatabaseContext (requestContext))
                {
                    SqlQuery query = new SqlQuery ();
                    query.QueryString = sql;
                    query.Parameters.Add ("@StoreId",requestContext.GetDeviceConfiguration ().StoreNumber.ToString ());
                    query.Parameters.Add ("@TerminalId",requestContext.GetDeviceConfiguration ().TerminalId.ToString ());
                    query.Parameters.Add ("@TransactionId",transactionId);
                    query.Parameters.Add ("@SourceId",result.SourceId ?? "");
                    query.Parameters.Add ("@Amount",result.Amount ?? "");
                    query.Parameters.Add ("@CardType",result.CardType ?? "");
                    query.Parameters.Add ("@PanMasked",result.PanMasked ?? "");
                    query.Parameters.Add ("@AuthCode",result.AuthCode ?? "");
                    query.Parameters.Add ("@ResultCode",result.ResultCode ?? "");
                    query.Parameters.Add ("@ReceiptNo",result.ReceiptNumber ?? "");
                    query.Parameters.Add ("@Currency",result.Currency);
                    query.Parameters.Add ("@TransactionDate",this.FromStringToDateTime (result?.TransactionDate ?? "",result?.TransactionTime ?? ""));
                    query.Parameters.Add ("@TransactionTime",result.TransactionTime ?? "");
                    query.Parameters.Add ("@ResultCodeDescription",result.ResultCodeDescription ?? "");
                    query.Parameters.Add ("@MID",result.MerchantId ?? "");
                    query.Parameters.Add ("@TID",result.TerminalId ?? "");
                    query.Parameters.Add ("@RRN",result.Rrn ?? "");
                    query.Parameters.Add ("@Success",result.Success ? 1 : 0);
                    query.Parameters.Add ("@DataAreaId",requestContext.GetChannelConfiguration ().InventLocationDataAreaId);
                    query.Parameters.Add ("@LineNum",lineNum);
                    query.Parameters.Add ("@Type",type ?? "");
                    query.Parameters.Add ("@PaymentId",paymentId ?? "");
                    query.Parameters.Add ("@AID",result.ApplicationIdentifier ?? "");
                    query.Parameters.Add ("@Label",result.Label ?? "");


                    await dbContext.ExecuteNonQueryAsync (query).ConfigureAwait (false);
                }
            }
            catch(Exception ex)
            {

            }
        }

        private DateTime FromStringToDateTime ( string requestDate,string requestTime )
        {
            string dateFormat = "dd/MM/yyyy";
            string timeFormat = "HH:mm";

            // Combine date and time strings
            string combinedDateTimeStr = requestDate + " " + requestTime;

            DateTime transactionDateTime;

            // Parse the combined string into DateTime
            if(DateTime.TryParseExact (combinedDateTimeStr,dateFormat + " " + timeFormat,CultureInfo.InvariantCulture,DateTimeStyles.None,out transactionDateTime))
            {
                return transactionDateTime;
            }
            else
            {
                return DateTime.Now;
            }
        }

        private async Task LogNIApiCall ( RequestContext requestContext,string transactionId,string apiType,string apiUrl,string request,string response )
        {
            try
            {
                string sql = @"INSERT INTO [ext].[TSCNITRANSACTIONAPILOG]([TRANSACTIONID],[APITYPE],[APIURL],[REQUEST],[RESPONSE],[STOREID],[TERMINALID],[DATAAREAID])
                               VALUES(@TransactionId, @ApiType,@ApiUrl, @Request, @Response, @StoreId, @TerminalId,@dataAreaId)";

                using(var dbContext = new DatabaseContext (requestContext))
                {
                    SqlQuery query = new SqlQuery ();
                    query.QueryString = sql;
                    query.Parameters.Add ("@TransactionId",transactionId);
                    query.Parameters.Add ("@ApiType",apiType);
                    query.Parameters.Add ("@ApiUrl",apiUrl);
                    query.Parameters.Add ("@Request",StripNulls (request));
                    query.Parameters.Add ("@Response",StripNulls (response));
                    query.Parameters.Add ("@StoreId",requestContext.GetDeviceConfiguration ().StoreNumber.ToString ());
                    query.Parameters.Add ("@TerminalId",requestContext.GetDeviceConfiguration ().TerminalId.ToString ());
                    query.Parameters.Add ("@dataAreaId",requestContext.GetChannelConfiguration ().InventLocationDataAreaId);

                    await dbContext.ExecuteNonQueryAsync (query).ConfigureAwait (false);
                }
            }
            catch(Exception ex)
            {
            }
        }

        private string StripNulls ( string json )
        {
            if(string.IsNullOrEmpty (json)) return json;
            try
            {
                var jObject = Newtonsoft.Json.Linq.JObject.Parse (json);

                // Remove all properties with null values
                var toRemove = jObject.Properties ()
                                 .Where (p => p.Value.Type == Newtonsoft.Json.Linq.JTokenType.Null ||
                                             (p.Value.Type == Newtonsoft.Json.Linq.JTokenType.String &&
                                              string.IsNullOrEmpty (p.Value.Value<string> ())))
                                 .ToList ();

                foreach(var prop in toRemove)
                {
                    prop.Remove ();
                }

                return jObject.ToString (Newtonsoft.Json.Formatting.None);
            }
            catch
            {
                return json;
            }
        }
        private string GenerateSourceId ( string strStoreNum,string strTerminal )
        {
            //string strStoreNum = "ST001";
            //string strTerminal = "ST001-R04";

            // Last 3 alphanumeric chars of store number (pad left with '0' if shorter)
            string cleanStore = Regex.Replace (strStoreNum,@"[^a-zA-Z0-9]","");
            string storePart = cleanStore.Length >= 3
                ? cleanStore.Substring (cleanStore.Length - 3)
                : cleanStore.PadLeft (3,'0');

            // Last 2 digits of terminal (digits only, pad left with '0' if shorter)
            string terminalDigits = Regex.Replace (strTerminal,@"[^a-zA-Z0-9]","");
            string terminalPart = terminalDigits.Length >= 2
                ? terminalDigits.Substring (terminalDigits.Length - 2)
                : terminalDigits.PadLeft (2,'0');

            // 10-digit Unix timestamp (seconds)
            long unixTime = ((DateTimeOffset) DateTime.UtcNow).ToUnixTimeSeconds ();
            string uniquePart = unixTime.ToString ("D10");

            // storePart(3) + terminalPart(2) + uniquePart(10) = 15 chars
            string sourceId = $"{storePart}{terminalPart}{uniquePart}";
            return sourceId;
        }
    }
}
