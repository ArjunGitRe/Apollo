using Azure;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.DataServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using Microsoft.Dynamics.Commerce.Runtime.RealtimeServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Services.Messages;
using Microsoft.Dynamics.Retail.Diagnostics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.CommerceRuntime.APIService;
using TSC.LMG.Runtime.Messages.Receipts;
using TSC.LMG.Runtime.Messages.Services;
using TSC.LMG.Runtime.Messages.Shukran;
using TSC.LMG.Runtime.Model.Receipts;
using TSC.LMG.Runtime.Model.Shukran;
using TSC.LMG.Runtime.Model.Shukran.Data;
using TSC.LMG.Runtime.Model.Shukran.Enum;
using RequestContext = Microsoft.Dynamics.Commerce.Runtime.RequestContext;

namespace TSC.LMG.CommerceRuntime.Triggers
{
    public class SaveSalesTransactionTrigger : IRequestTriggerAsync
    {
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {
                    typeof(SaveSalesTransactionDataRequest)
                };
            }
        }

        public async Task OnExecuted(Request request, Microsoft.Dynamics.Commerce.Runtime.Messages.Response response)
        {
            try
            {
                if (request is SaveSalesTransactionDataRequest)
                {
                    SaveSalesTransactionDataRequest saveSalesTransactionDataRequest = (SaveSalesTransactionDataRequest)request;
                    SalesTransaction salesTransaction = saveSalesTransactionDataRequest.SalesTransaction;

                    if (salesTransaction == null)
                        return;

                    if (salesTransaction.EntryStatus == TransactionStatus.Voided)
                    {
                        return;
                    }

                    string profileId = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_PROFILE_ID")?.Value?.StringValue ?? string.Empty;

                    string cardNumber = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_CARDNO")?.Value?.StringValue ?? string.Empty;

                    bool isOfflineCapture = salesTransaction.ExtensionProperties.FirstOrDefault (p => p.Key == "OFFLINETRANSACTION")?.Value?.BooleanValue ?? false;


                    if(string.IsNullOrWhiteSpace(profileId) && string.IsNullOrWhiteSpace(cardNumber)&& !isOfflineCapture)
                    {
                        // No Shukran customer on this transaction — skip
                        return;
                    }


                    GetShukranConfigurationServiceRequest configRequest = new GetShukranConfigurationServiceRequest();
                    GetShukranConfigurationServiceResponse configResp = await request.RequestContext.ExecuteAsync<GetShukranConfigurationServiceResponse>(configRequest).ConfigureAwait(false);

                    if (configResp?.ShukranConfigData == null)
                        return;

                    GetShukranTokenServiceRequest tokenServiceRequest = new GetShukranTokenServiceRequest();
                    GetShukranTokenServiceResponse tokenServiceResponse = await request.RequestContext.ExecuteAsync<GetShukranTokenServiceResponse>(tokenServiceRequest).ConfigureAwait(false);

                    if (tokenServiceResponse.ShukranToken == null)
                        return;

                    ShukranTransactionRequest transRequest = await BuildTransactionRequest(salesTransaction, configResp.ShukranConfigData, request.RequestContext).ConfigureAwait(false); ;

                    ShukranTransactionResponse transResponse = await ShukranApiService.ShukranTransaction(configResp.ShukranConfigData, tokenServiceResponse.ShukranToken, transRequest, request.RequestContext,salesTransaction.Id,isOfflineCapture).ConfigureAwait(false);

                    if (transResponse == null)
                    {
                        return;
                    }
                    bool isSuccess = transResponse.HttpStatusCode >= 200 && transResponse.HttpStatusCode <= 299;

                    var extData = transResponse.JsonExternalData;
                    string custProfileId = !string.IsNullOrWhiteSpace(transResponse.ProfileId) ? transResponse.ProfileId : salesTransaction.ExtensionProperties
                                                  .FirstOrDefault(p => p.Key == "SHUKRAN_PROFILE_ID")?.Value?.StringValue ?? string.Empty;

                    string originalTransactionId = string.Empty;
                    if(salesTransaction.IsReturnByReceipt && salesTransaction.SalesLines != null)
                    {
                        originalTransactionId = salesTransaction.SalesLines.FirstOrDefault (l => !string.IsNullOrWhiteSpace (l.ReturnTransactionId))
                                                                            ?.ReturnTransactionId ?? string.Empty;
                    }
                    decimal? cashValueDecimal = salesTransaction.ExtensionProperties.FirstOrDefault (p => p.Key == "SHUKRAN_AVAILABLE_PTS_CASHVALUE")
                                                 ?.Value?.DecimalValue;
                    string cashValue = cashValueDecimal?.ToString () ?? string.Empty;
                    string tier = salesTransaction.ExtensionProperties.FirstOrDefault (p => p.Key == "SHUKRAN_TIER")?.Value?.StringValue ?? string.Empty;
                    string storeCountryCode = configResp.ShukranConfigData.StoreCountryCode;
                    string crossBorderFlag = transRequest.JsonExternalData.CrossBorderFlag;

                    ShukranTransactionExt shukranTransactionExt = new ShukranTransactionExt
                    {
                        Store=request.RequestContext.GetDeviceConfiguration().StoreNumber,
                        Terminal = request.RequestContext.GetDeviceConfiguration().TerminalId,
                        TransactionId=salesTransaction.Id,
                        Channel=request.RequestContext.GetDeviceConfiguration().ChannelId,
                        DataAreaId=request.RequestContext.GetDeviceConfiguration().InventLocationId,
                        ProfileId=custProfileId,
                        TotalPointsRedeemed= extData?.TotalPointsRedeemed ?? 0,
                        TotalPointsEarned=extData != null ? Convert.ToInt32(extData.TotalPointsEarned) : 0,
                        TotalPointsBalance=extData?.TotalPointsBalance  ?? 0,
                        IsSynced=isSuccess,
                        StatusCode=transResponse.HttpStatusCode,
                        ReceiptId=salesTransaction.ReceiptId,
                        CardNumber = !string.IsNullOrWhiteSpace(transResponse.CardNumber) ? transResponse.CardNumber : cardNumber,
                        ConceptCode = configResp.ShukranConfigData.ConceptCode,
                        OriginalTransactionId = originalTransactionId,
                        RedemptionCashValue = cashValue,
                        CrossBorderFlag = crossBorderFlag,
                        StoreCountryCode = storeCountryCode,
                        Tier = tier
                    };
                    
                    SaveShukranTransactionDataRequest saveExtRequest = new SaveShukranTransactionDataRequest(shukranTransactionExt);
                    await request.RequestContext.ExecuteAsync<SaveShukranTransactionDataResponse>(saveExtRequest).ConfigureAwait(false);

                    if (isSuccess && !isOfflineCapture)
                    {
                        //RTS for customer sync
                        await SetShukranCustomerDataAsync(transResponse, salesTransaction, request.RequestContext).ConfigureAwait(false);

                    }

                }
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        private async Task<ShukranTransactionRequest> BuildTransactionRequest(SalesTransaction salesTransaction, ShukranConfig shukranConfigData, RequestContext requestContext)
        {
            string txDateTime = (salesTransaction.BeginDateTime == DateTimeOffset.MinValue ? DateTimeOffset.UtcNow : salesTransaction.BeginDateTime).ToString(AppConstants.DateTimeFormatSkrn);
            bool isReturn = salesTransaction.IsReturnByReceipt;
            string profileId = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_PROFILE_ID")?.Value?.StringValue ?? string.Empty;
            string cardNumber = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_CARDNO")?.Value?.StringValue ?? string.Empty;
            string searchType = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_SEARCH_TYPE")?.Value?.StringValue ?? string.Empty;
            string inputMethod = salesTransaction.ExtensionProperties.FirstOrDefault (p => p.Key == "SHUKRAN_INPUT_METHOD")?.Value?.StringValue ?? string.Empty;


            string shukranCountry = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_CUST_COUNTRY")?.Value?.StringValue ?? string.Empty;
            string storeCountryCode = shukranConfigData.StoreCountryCode;

            //offline

            bool isOfflineTransaction = salesTransaction.ExtensionProperties.FirstOrDefault (p => p.Key == "OFFLINETRANSACTION")?.Value?.BooleanValue ?? false;
            string offlineMobileNumber = salesTransaction.ExtensionProperties.FirstOrDefault (p => p.Key == "OFFLINEMOBNUMBER")?.Value?.StringValue ?? string.Empty;

            string storeCurrency = requestContext.GetChannelConfiguration().Currency;
            string virtualCardIdentifier = MapSearchTypeToVirtualIdentifier(searchType,inputMethod);
            bool hasCashOrCardTender = isReturn && HasCashOrCardTender(salesTransaction, shukranConfigData);

            List<TransactionTender> tendersTrans = new List<TransactionTender>();

            if (salesTransaction.TenderLines != null)
            {
                foreach (var t in salesTransaction.TenderLines.Where(t => t.Status != TenderLineStatus.Voided))
                {
                    GetShukranTenderTypeDetailsRequest tenderRequest = new GetShukranTenderTypeDetailsRequest(t.TenderTypeId);
                    GetShukranTenderTypeDetailsResponse tenderResponse = await requestContext.ExecuteAsync<GetShukranTenderTypeDetailsResponse>(tenderRequest).ConfigureAwait(false);

                    string tenderCode = string.IsNullOrWhiteSpace(tenderResponse?.ShukranTypeName) ? t.TenderTypeId : tenderResponse.ShukranTypeName;
                    string surrogateNumber = ResolveSurrogateNumber(t);

                    tendersTrans.Add(new TransactionTender
                    {
                        TenderCode = tenderCode.ToUpper(),
                        TenderAmount = t.Amount,
                        TransactionDateTime = txDateTime,
                        SurrogateNumber = surrogateNumber
                    });
                }
            }

            bool isPurchase = GetTransactionTypeCode(salesTransaction) == "PR";

            tendersTrans = tendersTrans.GroupBy(t => t.TenderCode, StringComparer.OrdinalIgnoreCase)
                            .Select(g => new TransactionTender
                            {
                                TenderCode          = g.Key,
                                TenderAmount        = g.Sum(t => t.TenderAmount),
                                TransactionDateTime = g.First().TransactionDateTime,
                                SurrogateNumber     = g.First().SurrogateNumber
                            })
                            .Where(t => !isPurchase || t.TenderAmount > 0).ToList();

            //sales Line
            var filteredLines = salesTransaction.SalesLines?.Where(l => !l.IsVoided).ToList()
                    ?? new List<SalesLine>();
            Dictionary<long, bool> blockLoyaltyMap = await GetBlockLoyaltyEarnMapAsync(salesTransaction, requestContext).ConfigureAwait(false);
            var salesDetails = new List<TransactionDetail>();


            Dictionary<long, string> departmentCodeMap = await GetDepartmentCodeMapAsync(salesTransaction, requestContext).ConfigureAwait(false);

            string originalReceiptId = string.Empty;
            string originalTransDateTime = string.Empty;

            foreach (var l in filteredLines)
            {
                bool blockLoyalty = blockLoyaltyMap.TryGetValue(l.ProductId, out bool val) && val;

                bool hasDiscount = l.DiscountLines != null && l.DiscountLines.Any();
                string saleFlag = hasDiscount ? "Y" : "N";

               
                string productName = ResolveProductName(blockLoyalty, isReturn, hasCashOrCardTender);

                departmentCodeMap.TryGetValue(l.ProductId, out string departmentCode);
                departmentCode = string.IsNullOrWhiteSpace(departmentCode) ? "0000" : departmentCode;


                if (isReturn && !string.IsNullOrWhiteSpace(l.ReturnTransactionId))
                {
                    OrginalTransModel origData = await GetOriginalTransDataAsync(l.ReturnTransactionId, requestContext).ConfigureAwait(false);
                    if (origData != null)
                    {
                        originalReceiptId     = origData.RECEIPTID ?? string.Empty;
                        originalTransDateTime = origData.BEGINDATETIME != default(DateTime)
                            ? origData.BEGINDATETIME.ToString(AppConstants.DateTimeFormatSkrn)
                            : string.Empty;
                    }
                }

                salesDetails.Add(new TransactionDetail
                {
                    LineNumber                  = (int)l.LineNumber,
                    ItemNumber                  = l.ItemId,
                    ItemNumberTypeCode          = shukranConfigData.ItemNumberTypeCode,
                    ItemDescription             = l.Description,
                    Quantity                    = Math.Abs(l.Quantity),
                    DollarValueGross            = 0,
                    DollarValueNet              = decimal.Parse(l.NetAmountWithoutTax.ToString(shukranConfigData.DecimalPer)),
                    TaxAmount                   = l.TaxAmount,
                    DiscountAmount              = l.TotalDiscount,
                    ShippingAndHandlingAmount   = 0m,
                    TransactionDateTime         = txDateTime,
                    TransactionNumber           = salesTransaction.Id,
                    FulfillStoreCode            = salesTransaction.StoreId /*"54LMSTYLISA"*/,
                    Uom                         = null,
                    OriginalTransactionNumber   = originalReceiptId,
                    OriginalTransactionDateTime = originalTransDateTime,
                    OriginalStoreCode           = isReturn ? l.ReturnStore ?? string.Empty : string.Empty,
                    JsonExternalData = new TransactionDetailExternalData
                    {
                        lmsmultiplier      = null,
                        PromoCode          = null,
                        LMSMultiplier      = null,
                        ItemDescription    = l.Description,
                        ItemDescription_AR = "",
                        SaleFlag           = saleFlag,
                        ConceptCode        = shukranConfigData.ConceptCode,
                        DepartmentCode     = departmentCode,
                        ProductName        = productName,
                        IsBeautyBay        = "N",
                        InvoiceTerritory   = shukranConfigData.CountryCode
                    }
                });

            }

            return new ShukranTransactionRequest
            {
                ProfileId                   = profileId,
                TransactionTypeCode         = GetTransactionTypeCode(salesTransaction),
                CardNumber                  = cardNumber,
                CurrencyCode                = storeCurrency,
                GrossAmount                 = salesTransaction.TotalAmount,
                TransactionNetTotal         = salesTransaction.NetAmountWithoutTax,
                TransactionTotalTax         = salesTransaction.TaxAmount,
                DiscountAmount              = salesTransaction.TotalDiscount,
                ShippingAndHandling         = 0m,
                StoreCode                   = salesTransaction.StoreId,   
                TransactionNumber           = salesTransaction.ReceiptId,
                TransactionDateTime         = txDateTime,
                ProgramCode                 = shukranConfigData.ProgramCode,
                DeviceId                    = salesTransaction.TerminalId,
                DeviceUserid                = salesTransaction.StaffId,
                OriginalTransactionNumber   = originalReceiptId,
                OriginalTransactionDateTime = originalTransDateTime,
                OriginalStoreCode           = isReturn ? salesTransaction.StoreId : string.Empty,
                TransactionDetails          = salesDetails,
                Tenders                     = tendersTrans,
                JsonExternalData = new TransactionExternalData
                {
                    VirtualCardIdentifier        = virtualCardIdentifier,
                    InvoiceTotalQty              = (int)salesDetails.Sum (d => d.Quantity),
                    IsCoD                        = "N",
                    ProcessReturnFlag            = isReturn && hasCashOrCardTender ? "Y" : "N",
                    IsCancel                     = "N",
                    IsOfflineTransaction         = isOfflineTransaction ? "Y" : "N",
                    IsRetroTransaction           = "N",
                    IsExternalPartnerTransaction = "N",
                    CrossBorderFlag              = GetCrossBorderFlag(shukranCountry, storeCountryCode),
                    PhoneNumber                  = offlineMobileNumber,
                    LMSCartId                    = ""
                }
            };
        }


        private string GetCrossBorderFlag(string shukranCountry, string storeCountryCode)
        {
            if (string.IsNullOrWhiteSpace(shukranCountry) || string.IsNullOrWhiteSpace(storeCountryCode))
                return "N";

            return string.Equals(shukranCountry, storeCountryCode, StringComparison.OrdinalIgnoreCase) ? "N" : "Y";
        }

        private async Task<OrginalTransModel> GetOriginalTransDataAsync(string transactionId, RequestContext requestContext)
        {
            if (string.IsNullOrWhiteSpace(transactionId))
                return null;

            GetOrginalReceiptIdDataRequest request = new GetOrginalReceiptIdDataRequest(transactionId);
            GetOrginalReceiptIdDataResponse response = await requestContext.ExecuteAsync<GetOrginalReceiptIdDataResponse>(request).ConfigureAwait(false);
            return response?.OrginalTransModels;
        }


        private string GetTransactionTypeCode(SalesTransaction salesTransaction)
        {
            if (salesTransaction.IsReturnByReceipt)
                return "RT";

            if (salesTransaction.SalesLines != null && salesTransaction.SalesLines.Any() && salesTransaction.SalesLines.All(l => l.IsVoided))
                return "VD";

            return "PR";
        }

        public Task OnExecuting(Request request)
        {
            return Task.CompletedTask;
        }

        //private async Task<Dictionary<string, string>> GetTenderTypeMapAsync(RequestContext requestContext)
        //{
        //    var tenderTypeRequest = new GetChannelTenderTypesDataRequest(requestContext.GetPrincipal().ChannelId, QueryResultSettings.AllRecords);
        //    var tenderTypeResponse = await requestContext.ExecuteAsync<EntityDataServiceResponse<TenderType>>(tenderTypeRequest).ConfigureAwait(false);

        //    return tenderTypeResponse?.PagedEntityCollection?.Results.ToDictionary(t => t.TenderTypeId, t => t.Name, StringComparer.OrdinalIgnoreCase)
        //        ?? new Dictionary<string, string>();
        //}



        private async Task<Dictionary<long, bool>> GetBlockLoyaltyEarnMapAsync(SalesTransaction salesTransaction, RequestContext requestContext)
        {
            try
            {
                long channelId = salesTransaction.ChannelId;
                var result = new Dictionary<long, bool>();
                var filteredLines = salesTransaction.SalesLines?.Where(l => !l.IsVoided).ToList() ?? new List<SalesLine>();

                foreach (var line in filteredLines)
                {
                    long catalogId = line.CatalogId;
                    long productId = line.ProductId;

                    var attrRequest = new GetProductAttributeValuesServiceRequest(
                        channelId,
                        catalogId,
                        productId,
                        QueryResultSettings.AllRecords
                    );

                    var attrResponse = await requestContext.ExecuteAsync<GetProductAttributeValuesServiceResponse>(attrRequest).ConfigureAwait(false);

                    var blockAttr = attrResponse?.AttributeValues?.Results?.FirstOrDefault(a => string.Equals(a.Name, "BlockLoyaltyEarn", StringComparison.OrdinalIgnoreCase));


                    result[productId] = blockAttr?.BooleanValue ?? false;
                }

                return result;
            }
            catch
            {
                return new Dictionary<long, bool>();
            }
        }

        private string MapSearchTypeToVirtualIdentifier(string searchType,string inputMethod )
        {
            switch (searchType?.Trim().ToUpperInvariant())
            {
                case "PHONENUMBER":
                    return VirtualIdentifier.MOBILE.ToString();   // "MOBILE"

                case "CARDNUMBER":
                    //return VirtualIdentifier.VO.ToString ();
                    return string.Equals (inputMethod,"CARD",StringComparison.OrdinalIgnoreCase)
                                            ? VirtualIdentifier.CARD.ToString ()
                                            : VirtualIdentifier.VO.ToString ();

                case "EMAIL":
                        return VirtualIdentifier.EMAIL.ToString ();

                default:
                        return VirtualIdentifier.VI.ToString();       // "VI" — fallback
            }
        }

        private bool HasCashOrCardTender(SalesTransaction salesTransaction, ShukranConfig shukranConfigData)
        {
            if (salesTransaction.TenderLines == null)
                return false;

           
            string creditNoteTenderCode = shukranConfigData.CreditMemoTenderId; 

            return salesTransaction.TenderLines.Where(t => t.Status != TenderLineStatus.Voided)
                .Any(t => !string.Equals(t.TenderTypeId, creditNoteTenderCode, StringComparison.OrdinalIgnoreCase));
        }

        private string ResolveProductName(bool blockLoyalty, bool isReturn, bool hasCashOrCardTender)
        {
            // Return scenarios take priority
            if (isReturn)
            {
                if (hasCashOrCardTender)
                    return ProductaName.GoodsCashReturn.ToString();

                // Fully on credit note only
                return ProductaName.GoodsCreditNoteReturn.ToString();
            }

            // Normal sale — check blockLoyalty flag
            if (blockLoyalty)
                return ProductaName.NonTradingItemProduct.ToString();       // "NonTradingItemProduct"  

            return ProductaName.BasicAccrual.ToString();         // "BasicAccrual"                 
        }


        private async Task<Dictionary<long, string>> GetDepartmentCodeMapAsync(SalesTransaction salesTransaction,RequestContext requestContext)
        {
            var filteredLines = salesTransaction.SalesLines?.Where(l => !l.IsVoided).ToList() ?? new List<SalesLine>();
            var productIds = filteredLines.Select(l => l.ProductId).Distinct().ToList();

            if (!productIds.Any())
            {
                return new Dictionary<long, string>();
            }
              
            var deptRequest = new GetShukranDepartmentCodeDataRequest(productIds);
            var deptResponse = await requestContext.ExecuteAsync<GetShukranDepartmentCodeDataResponse>(deptRequest).ConfigureAwait(false);

            
            var map = new Dictionary<long, string>();

            if (deptResponse?.DepartmentCodes == null)
            {
                return map;
            }
               
            foreach (var entity in deptResponse.DepartmentCodes.OrderByDescending(e => e.LEVEL))
            {
                if (!map.ContainsKey(entity.PRODUCT))
                {
                    map[entity.PRODUCT] = entity.CATEGORYNAME  ?? string.Empty;
                }
            }

            return map;
        }

        private async Task SetShukranCustomerDataAsync(ShukranTransactionResponse transResponse, SalesTransaction salesTransaction, RequestContext requestContext)
        {
            try
            {
                if (salesTransaction.IsReturnByReceipt)
                {
                    return;
                }
                    

                string profileId = transResponse.ProfileId   ?? string.Empty;
                string cardNumber = transResponse.CardNumber ?? string.Empty;

                //  From ExtensionProperties
                string firstName = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_FIRST_NAME")?.Value?.StringValue       ?? string.Empty;
                string lastName = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_LAST_NAME")?.Value?.StringValue         ?? string.Empty;
                string phone = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_PHONE")?.Value?.StringValue                ?? string.Empty;
                string countryCode = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_CUST_COUNTRY")?.Value?.StringValue   ?? string.Empty;
                string email = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_EMAIL")?.Value?.StringValue                ?? string.Empty;
                string status = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_STATUS")?.Value?.StringValue              ?? string.Empty;
                string languageCode = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_LANGUAGE_CODE")?.Value?.StringValue ?? string.Empty;
                string prefix = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_PREFIX")?.Value?.StringValue              ?? string.Empty;

                string gender = salesTransaction.ExtensionProperties.FirstOrDefault (p => p.Key == "SHUKRAN_GENDER")?.Value?.StringValue              ?? string.Empty;
                string nationality = salesTransaction.ExtensionProperties.FirstOrDefault (p => p.Key == "SHUKRAN_NATIONALITY")?.Value?.StringValue    ?? string.Empty;
                string country = salesTransaction.ExtensionProperties.FirstOrDefault (p => p.Key == "SHUKRAN_COUNTRY")?.Value?.StringValue            ?? string.Empty;
                string tier = salesTransaction.ExtensionProperties.FirstOrDefault (p => p.Key == "SHUKRAN_TIER")?.Value?.StringValue                  ?? string.Empty;

                //DOB
                string birthDateRaw = salesTransaction.ExtensionProperties.FirstOrDefault (p => p.Key == "SHUKRAN_BIRTH_DATE")?.Value?.StringValue ?? string.Empty;
                DateTime? birthDate = null;
                if(!string.IsNullOrEmpty (birthDateRaw))
                {
                    if(DateTime.TryParse (birthDateRaw,out DateTime parsedBirthDate))
                    {
                        birthDate = parsedBirthDate;
                    }
                }

                // JoinDate
                string joinDateRaw = salesTransaction.ExtensionProperties.FirstOrDefault(p => p.Key == "SHUKRAN_JOIN_DATE")?.Value?.StringValue ?? string.Empty;
                DateTime? joinDate =null;
                if (!string.IsNullOrEmpty(joinDateRaw))
                {
                    if (DateTime.TryParse(joinDateRaw, out DateTime parsedDate))
                    {
                        
                        joinDate = parsedDate;
                    }
                }

                InvokeExtensionMethodRealtimeRequest rtsRequest =new InvokeExtensionMethodRealtimeRequest("setShukranCustomerData",profileId,firstName,lastName,cardNumber,countryCode,email,
                                                                      phone,status,languageCode, joinDate,birthDate,nationality,country,gender,prefix,tier);

                InvokeExtensionMethodRealtimeResponse rtsResponse = await requestContext.ExecuteAsync<InvokeExtensionMethodRealtimeResponse>(rtsRequest).ConfigureAwait(false);

                var result = rtsResponse?.Result;

                bool rtsSuccess = result != null && result.Count > 0 && Convert.ToBoolean(result[0]);
                long recId = (result != null && result.Count >= 3 && result[2] != null) ? Convert.ToInt64(result[2]) : 0L;

                ShukranEnrollmentData shukranCustomer = new ShukranEnrollmentData
                {
                    ProfileId    = profileId,
                    FirstName    = firstName,
                    LastName     = lastName,
                    CardNumber   = cardNumber,
                    CountryCode  = countryCode,
                    EmailAddress = email ?? string.Empty,
                    PhoneNumber  = phone,
                    Status       = status,
                    LanguageCode = languageCode,
                    JoinDate     = (DateTime)joinDate,
                    Prefix       = prefix ?? string.Empty,
                    RECID        = recId,
                    Tier         = tier
                };
                SaveShukranCustomerDataRequest saveRequest = new SaveShukranCustomerDataRequest(shukranCustomer);
                await requestContext.ExecuteAsync<SaveShukranCustomerDataResponse>(saveRequest).ConfigureAwait(false);

            }
            catch (Exception ex)
            {
                throw ex;
                //requestContext.Logger.LogError(this, ex, $"[Shukran] setShukranCustomerData RTS failed. ProfileId={transResponse?.ProfileId}. " +
                //    $"Exception: {ex.Message}");
            }
        }

        private string ResolveSurrogateNumber(TenderLine tenderLine)
        {
            
            string masked = tenderLine.MaskedCardNumber;

            if (!string.IsNullOrWhiteSpace(masked))
            {
                
                string digitsOnly = new string(masked.Where(char.IsDigit).ToArray());

                if (digitsOnly.Length >= 4)
                    return digitsOnly.Substring(digitsOnly.Length - 4);
            }

            return string.Empty;
        }
    }
}
