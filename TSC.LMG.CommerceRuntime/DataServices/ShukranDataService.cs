using Azure.Core;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.CommerceRuntime.Helper;
using TSC.LMG.Runtime.Messages.Customer;
using TSC.LMG.Runtime.Messages.Log;
using TSC.LMG.Runtime.Messages.Shukran;
using TSC.LMG.Runtime.Messages.Shukran.Transactions;
using TSC.LMG.Runtime.Messages.Shukran.Voucher;
using TSC.LMG.Runtime.Model.Customer;
using TSC.LMG.Runtime.Model.Shukran.Voucher;
using Request = Microsoft.Dynamics.Commerce.Runtime.Messages.Request;

namespace TSC.LMG.CommerceRuntime.DataServices
{
    public class ShukranDataService : IRequestHandlerAsync
    {
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {

                    typeof(CreateShukranApiLogDataRequest),
                    typeof(SaveShukranTransactionDataRequest),
                    typeof(SaveShukranCustomerDataRequest),
                    typeof(SendShukranOTPDataRequest),
                    typeof(VerifyShukranOTPRequest),
                    typeof(GetShukranTenderTypeDetailsRequest),
                    typeof(SaveShukranPendingTransactionDataRequest),
                    typeof(GetProductDiscountOfferIdsDataRequest)

                };
            }
        }

        public async Task<Response> Execute(Request request)
        {
            if (request == null)
            {
                throw new ArgumentNullException("request");
            }
            else if (request is CreateShukranApiLogDataRequest logDataRequest)
            {
                return await HandleCreateShukranApiLogDataRequest(logDataRequest).ConfigureAwait(false);
            }
            else if (request is SaveShukranTransactionDataRequest saveRequest)
            {
                return await HandleSaveShukranTransactionDataRequest(saveRequest).ConfigureAwait(false);
            }
            else if (request is SaveShukranCustomerDataRequest saveCustRequest)
            {
                return await HandleSaveShukranCustomerDataRequest(saveCustRequest).ConfigureAwait(false);
            }
            else if (request is SendShukranOTPDataRequest sendOtptRequest)
            {
                return await HandleSendOtpDataRequest(sendOtptRequest).ConfigureAwait(false);
            }
            else if (request is VerifyShukranOTPRequest verifyOtptRequest)
            {
                return await HandleVerifyShukranOTPRequest(verifyOtptRequest).ConfigureAwait(false);
            }
            else if (request is GetShukranTenderTypeDetailsRequest shukranTendertRequest)
            {
                return await GetShukranTenderDetailsRequest(shukranTendertRequest).ConfigureAwait(false);
            }
            else if (request is SaveShukranPendingTransactionDataRequest savePendingTxnRequest)
            {
                return await HandleSaveShukranPendingTransactionDataRequest(savePendingTxnRequest).ConfigureAwait(false);
            }
            else if(request is GetProductDiscountOfferIdsDataRequest productOffersRequest)
            {
                return await HandleProductOffersRequestDataRequest (productOffersRequest).ConfigureAwait (false);
            }

            else
            {
                string message = string.Format("Request '{0}' is not supported.", "");

                throw new NotSupportedException(message);
            }
        }

        private async Task<Response> HandleProductOffersRequestDataRequest ( GetProductDiscountOfferIdsDataRequest request )
        {
            string sql = @"SELECT PRODUCTID,OFFERID,COUPONCODE  FROM EXT.TSCPRODUCTOFFERVIEW WHERE COUPONCODE=@offerId";

            using(var dbContext = new DatabaseContext (request.RequestContext))
            {
                SqlQuery query = new SqlQuery ();
                query.QueryString = sql;
                query.Parameters.Add ("@offerId",request.OfferID);

                PagedResult<ProductOfferIdResult> result = await dbContext.ReadEntityAsync<ProductOfferIdResult> (query).ConfigureAwait (false);
                List<ProductOfferIdResult> details = result.Results.ToList ();
                return new GetProductDiscountOfferIdsDataResponse (details);
            }
        }

        private async Task<Response> HandleCreateShukranApiLogDataRequest(CreateShukranApiLogDataRequest request)
        {
            string sql = @"INSERT INTO [ext].[TSCSHUKRANAPILOG] (CHANNEL,STORE,TERMINAL,TRANSACTIONID,DATAAREAID,APINAME,APIREQUEST,APIRESPONSE,REQUESTON,RESPONSEON,ERRORMESSAGE,STATUSCODE)
                          VALUES (@CHANNEL,@STORE,@TERMINAL,@TRANSACTIONID,@DATAAREAID,@APINAME,@APIREQUEST,@APIRESPONSE,@REQUESTON,@RESPONSEON,@ERRORMESSAGE,@STATUSCODE)";

            using (var dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@CHANNEL", request.RequestContext.GetDeviceConfiguration().ChannelId);
                query.Parameters.Add("@STORE", request.RequestContext.GetDeviceConfiguration().StoreNumber);
                query.Parameters.Add("@TERMINAL", request.RequestContext.GetDeviceConfiguration().TerminalId);
                query.Parameters.Add("@TRANSACTIONID", request.ShukranAPILogInfo.TransactionId);                
                query.Parameters.Add("@DATAAREAID", request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId);
                query.Parameters.Add("@APINAME",request.ShukranAPILogInfo.APIName);
                query.Parameters.Add("@APIREQUEST", request.ShukranAPILogInfo.APIRequest);
                query.Parameters.Add("@APIRESPONSE", request.ShukranAPILogInfo.APIResponse);
                query.Parameters.Add("@REQUESTON", request.ShukranAPILogInfo.RequestOn);
                query.Parameters.Add("@RESPONSEON", request.ShukranAPILogInfo.ResponseOn);
                query.Parameters.Add("@ERRORMESSAGE", request.ShukranAPILogInfo.ErrorMessage);
                query.Parameters.Add("@STATUSCODE", request.ShukranAPILogInfo.StatusCode);
                
                await dbContext.ExecuteNonQueryAsync(query).ConfigureAwait(false);
                return new CreateShukranApiLogDataResponse();
            }
        }

        private async Task<SaveShukranTransactionDataResponse> HandleSaveShukranTransactionDataRequest(SaveShukranTransactionDataRequest request)
        {
            string sql = @"INSERT INTO [ext].[TSCRETAILTRANSACTIONTABLEEXT](STORE, TERMINAL, TRANSACTIONID, CHANNEL, DATAAREAID,PROFILEID, TOTALPOINTSREDEEMED, TOTALPOINTSEARNED,TOTALPOINTSBALANCE,ISSYNCED, STATUSCODE,
                           RECEIPTID,CARDNUMBER,REDEMPTIONCASHVALUE,CONCEPTCODE,ORIGINALTRANSACTIONID,CROSSBORDERFLAG,TERRITORY,TIER) 
                           VALUES (@store, @terminal, @transactionId, @channel, @dataAreaId,@profileId, @totalPointsRedeemed, @totalPointsEarned, @totalPointsBalance, @isSynced, @statusCode,@receiptId,
                                   @cardNumber,@redemptionCashValue,@conceptCode,@orginalTransactionId,@crossBorderFlag,@territory,@tier)";

            using (var dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@STORE", request.RequestContext.GetDeviceConfiguration().StoreNumber);
                query.Parameters.Add("@TERMINAL", request.RequestContext.GetDeviceConfiguration().TerminalId);
                query.Parameters.Add("@TRANSACTIONID", request.ShukranTransactionExt.TransactionId);
                query.Parameters.Add("@CHANNEL", request.RequestContext.GetDeviceConfiguration().ChannelId);
                query.Parameters.Add("@DATAAREAID", request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId);
                query.Parameters.Add("@profileId", request.ShukranTransactionExt.ProfileId);
                query.Parameters.Add("@totalPointsRedeemed", request.ShukranTransactionExt.TotalPointsRedeemed);
                query.Parameters.Add("@totalPointsEarned", request.ShukranTransactionExt.TotalPointsEarned);
                query.Parameters.Add("@totalPointsBalance", request.ShukranTransactionExt.TotalPointsBalance);
                query.Parameters.Add("@isSynced", request.ShukranTransactionExt.IsSynced);
                query.Parameters.Add("@statusCode", request.ShukranTransactionExt.StatusCode);
                query.Parameters.Add("@receiptId", request.ShukranTransactionExt.ReceiptId);
                query.Parameters.Add("@cardNumber",request.ShukranTransactionExt.CardNumber ?? string.Empty);
                query.Parameters.Add("@redemptionCashValue",request.ShukranTransactionExt.RedemptionCashValue ?? string.Empty);
                query.Parameters.Add("@conceptCode",request.ShukranTransactionExt.ConceptCode ?? string.Empty);
                query.Parameters.Add("@orginalTransactionId",request.ShukranTransactionExt.OriginalTransactionId ?? string.Empty);
                query.Parameters.Add("@crossBorderFlag",request.ShukranTransactionExt.CrossBorderFlag ?? string.Empty);
                query.Parameters.Add("@territory",request.ShukranTransactionExt.StoreCountryCode ?? string.Empty);
                query.Parameters.Add("@tier",request.ShukranTransactionExt.Tier ?? string.Empty);


                await dbContext.ExecuteNonQueryAsync(query).ConfigureAwait(false);
                return new SaveShukranTransactionDataResponse(true,"");
            }
        }
        //private async Task<Response> HandleSaveShukranCustomerDataRequest(SaveShukranCustomerDataRequest request)
        //{
        //    string sql = @"INSERT INTO EXT.TSCSHUKRANCUSTOMER (RECID,PROFILEID,FIRSTNAME,LASTNAME,CARDNUMBER,COUNTRYCODE,EMAILADDRESS,PHONENUMBER,STATUS,LANGUAGECODE,JOINDATE,PREFIX)
        //                               VALUES (@RECID,@PROFILEID,@FIRSTNAME,@LASTNAME,@CARDNUMBER,@COUNTRYCODE,@EMAILADDRESS,@PHONENUMBER,@STATUS,@LANGUAGECODE,@JOINDATE,@PREFIX)";
        //    using (var dbContext = new DatabaseContext(request.RequestContext))
        //    {
        //        SqlQuery query = new SqlQuery();
        //        query.QueryString = sql;
        //        query.Parameters.Add("@RECID", request.ShukranCustomer.RECID);
        //        query.Parameters.Add("@PROFILEID", request.ShukranCustomer.ProfileId);
        //        query.Parameters.Add("@FIRSTNAME", request.ShukranCustomer.FirstName);
        //        query.Parameters.Add("@LASTNAME", request.ShukranCustomer.LastName);
        //        query.Parameters.Add("@CARDNUMBER", request.ShukranCustomer.CardNumber);
        //        query.Parameters.Add("@COUNTRYCODE", request.ShukranCustomer.CountryCode);
        //        query.Parameters.Add("@EMAILADDRESS", string.IsNullOrWhiteSpace(request.ShukranCustomer.EmailAddress) 
        //                                                ? string.Empty
        //                                                : request.ShukranCustomer.EmailAddress);
        //        query.Parameters.Add("@PHONENUMBER", request.ShukranCustomer.PhoneNumber);
        //        query.Parameters.Add("@STATUS", request.ShukranCustomer.Status);
        //        query.Parameters.Add("@LANGUAGECODE", request.ShukranCustomer.LanguageCode);
        //        query.Parameters.Add("@JOINDATE", request.ShukranCustomer.JoinDate);
        //        query.Parameters.Add("@PREFIX", string.IsNullOrWhiteSpace(request.ShukranCustomer.Prefix)
        //                                                ? string.Empty
        //                                                : request.ShukranCustomer.Prefix);

        //        await dbContext.ExecuteNonQueryAsync(query).ConfigureAwait(false);
        //        return new SaveShukranCustomerDataResponse(true, "");
        //    }
        //}

        private async Task<Response> HandleSendOtpDataRequest(SendShukranOTPDataRequest request)
        {
            string sql = @" INSERT INTO ext.TSCSHUKRANOTP (OTPGUID, OTPVALUE, PHONENUMBER, ISUSED) VALUES (@OTPGUID,@OTPVALUE,@PHONENUMBER,0)";

            using (var dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@OTPGUID", request.Guid);
                query.Parameters.Add("@OTPVALUE", request.OTP);
                query.Parameters.Add("@PHONENUMBER", request.PhoneNumber);

                await dbContext.ExecuteNonQueryAsync(query).ConfigureAwait(false);
                return new SendShukranOTPDataResponse(true,request.Guid);
            }
        }
        private async Task<Response> HandleVerifyShukranOTPRequest(VerifyShukranOTPRequest request)
        {
            string sql = @"SELECT COUNT(1) FROM ext.TSCSHUKRANOTP WHERE OTPGUID = @guid AND OTPVALUE = @otp AND ISUSED   = 0";  

            using (var dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@guid", request.Guid);
                query.Parameters.Add("@otp", request.OTPValue);

                int count = await dbContext.ExecuteScalarAsync<int>(query).ConfigureAwait(false);
                bool isValid = count > 0;

                if (isValid)
                {
                    //Mark OTP as used so it can't be reused
                    await MarkOTPAsUsed(request.Guid, request.RequestContext).ConfigureAwait(false);
                }

                return new VerifyShukranOTPResponse(isValid);
            }
        }

        private async Task MarkOTPAsUsed(string guid, RequestContext requestContext)
        {
            string sql = @"UPDATE ext.TSCSHUKRANOTP SET ISUSED = 1 WHERE OTPGUID = @guid";

            using (var dbContext = new DatabaseContext(requestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@guid", guid);
                await dbContext.ExecuteNonQueryAsync(query).ConfigureAwait(false);
            }
        }

        private async Task<Response> GetShukranTenderDetailsRequest(GetShukranTenderTypeDetailsRequest request)
        {
            string sql= @"select TSCSHUKRANTENDERCODE from EXT.TSCTENDERTYPESHUKRAN WHERE TENDERTYPEID=@tenderTypeId";

            using (var dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@tenderTypeId", request.TenderTypeId);;

                string result = await dbContext.ExecuteScalarAsync<string>(query).ConfigureAwait(false);
                return new GetShukranTenderTypeDetailsResponse(result);
            }
        }


        private async Task<Response> HandleSaveShukranPendingTransactionDataRequest(SaveShukranPendingTransactionDataRequest request)
        {
            string sql = @"INSERT INTO [ext].[TSCSHUKRANPENDINGTRANSACTIONS] (STORE, TERMINAL, TRANSACTIONID, DATAAREAID,ISSYNCED, STATUSCODE,PAYLOAD,RESPONSEMESSAGE) 
                                       VALUES (@store, @terminal, @transactionId, @dataAreaId, @isSynced, @statusCode,@Payload,@ResponseMessage)";

            using (var dbContext = new DatabaseContext(request.RequestContext))
            { 
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@store", request.RequestContext.GetDeviceConfiguration().StoreNumber);
                query.Parameters.Add("@terminal", request.RequestContext.GetDeviceConfiguration().TerminalId);
                query.Parameters.Add("@transactionId", request.PendingTransaction.TransactionId   ?? string.Empty);
                query.Parameters.Add("@dataAreaId", request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId);
                query.Parameters.Add("@isSynced", request.PendingTransaction.IsSynced);
                query.Parameters.Add("@statusCode", request.PendingTransaction.StatusCode);
                query.Parameters.Add("@Payload", request.PendingTransaction.Payload ?? string.Empty);
                query.Parameters.Add("@ResponseMessage", request.PendingTransaction.ResponseMessage ?? string.Empty);


                await dbContext.ExecuteNonQueryAsync(query).ConfigureAwait(false);
                return new SaveShukranPendingTransactionDataResponse();
            }

        }

        private async Task<Response> HandleSaveShukranCustomerDataRequest(SaveShukranCustomerDataRequest request)
        {
            bool exists = await ShukranCustomerExistsAsync(request.RequestContext, request.ShukranCustomer.ProfileId).ConfigureAwait(false);

            if (exists)
            {
                await UpdateShukranCustomerAsync(request).ConfigureAwait(false);
            }
            else
            {
                await InsertShukranCustomerAsync(request).ConfigureAwait(false);
            }

            return new SaveShukranCustomerDataResponse(true, "");
        }

        private async Task<bool> ShukranCustomerExistsAsync(RequestContext requestContext, string profileId)
        {
            string sql = @"SELECT COUNT(1) FROM EXT.TSCSHUKRANCUSTOMER WHERE PROFILEID = @PROFILEID";

            using (var dbContext = new DatabaseContext(requestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@PROFILEID", profileId);

                var result = await dbContext.ExecuteScalarAsync<int>(query).ConfigureAwait(false);
                return result > 0;
            }
        }

        private async Task InsertShukranCustomerAsync(SaveShukranCustomerDataRequest request)
        {
            string sql = @"INSERT INTO EXT.TSCSHUKRANCUSTOMER 
                        (RECID, PROFILEID, FIRSTNAME, LASTNAME, CARDNUMBER, COUNTRYCODE, 
                        EMAILADDRESS, PHONENUMBER, STATUS, LANGUAGECODE, JOINDATE, PREFIX,TIER)
                        VALUES 
                        (@RECID, @PROFILEID, @FIRSTNAME, @LASTNAME, @CARDNUMBER, @COUNTRYCODE, 
                        @EMAILADDRESS, @PHONENUMBER, @STATUS, @LANGUAGECODE, @JOINDATE, @PREFIX,@TIER)";

            using (var dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@RECID", request.ShukranCustomer.RECID);
                query.Parameters.Add("@PROFILEID", request.ShukranCustomer.ProfileId ?? string.Empty);
                query.Parameters.Add("@FIRSTNAME", request.ShukranCustomer.FirstName ?? string.Empty);
                query.Parameters.Add("@LASTNAME", request.ShukranCustomer.LastName ?? string.Empty);
                query.Parameters.Add("@CARDNUMBER", request.ShukranCustomer.CardNumber ?? string.Empty);
                query.Parameters.Add("@COUNTRYCODE", request.ShukranCustomer.CountryCode ?? string.Empty);
                query.Parameters.Add("@EMAILADDRESS", string.IsNullOrWhiteSpace(request.ShukranCustomer.EmailAddress)
                                                        ? string.Empty
                                                        : request.ShukranCustomer.EmailAddress);
                query.Parameters.Add("@PHONENUMBER", request.ShukranCustomer.PhoneNumber ?? string.Empty);
                query.Parameters.Add("@STATUS", request.ShukranCustomer.Status ?? string.Empty);
                query.Parameters.Add("@LANGUAGECODE", request.ShukranCustomer.LanguageCode ?? string.Empty);
                query.Parameters.Add("@JOINDATE", request.ShukranCustomer.JoinDate);
                query.Parameters.Add("@PREFIX", string.IsNullOrWhiteSpace(request.ShukranCustomer.Prefix)
                                                        ? string.Empty
                                                        : request.ShukranCustomer.Prefix);
                query.Parameters.Add ("@TIER",string.IsNullOrWhiteSpace(request.ShukranCustomer.Tier) ? string.Empty: request.ShukranCustomer.Tier);

                await dbContext.ExecuteNonQueryAsync(query).ConfigureAwait(false);
            }
        }

        private async Task UpdateShukranCustomerAsync(SaveShukranCustomerDataRequest request)
        {
            string sql = @"UPDATE EXT.TSCSHUKRANCUSTOMER SET
                            FIRSTNAME = @FIRSTNAME,
                            LASTNAME  = @LASTNAME,
                            COUNTRYCODE = @COUNTRYCODE,
                            TIER = @TIER
                            WHERE PROFILEID = @PROFILEID";

            using (var dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@PROFILEID", request.ShukranCustomer.ProfileId);
                query.Parameters.Add("@FIRSTNAME", request.ShukranCustomer.FirstName);
                query.Parameters.Add("@LASTNAME", request.ShukranCustomer.LastName);
                query.Parameters.Add("@COUNTRYCODE", request.ShukranCustomer.CountryCode);
                query.Parameters.Add("@TIER", request.ShukranCustomer.Tier);

                await dbContext.ExecuteNonQueryAsync(query).ConfigureAwait(false);
            }
        }
    }
}
