using Azure.Core;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.Runtime.Messages.Network.Receipts;
using TSC.LMG.Runtime.Messages.Network.Transaction;
using TSC.LMG.Runtime.Messages.Payment;
using TSC.LMG.Runtime.Messages.Receipts;
using TSC.LMG.Runtime.Model.Network.Transactions;
using TSC.LMG.Runtime.Model.Receipts;

namespace TSC.LMG.CommerceRuntime.DataServices
{
    public class NIDataService:IRequestHandlerAsync
    {
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {
                    typeof(GetNIPaymentDetailsRequest),
                    typeof(GetNiPayDetailsForReceiptRequest)

                };
            }
        }

        public Task<Response> Execute ( Microsoft.Dynamics.Commerce.Runtime.Messages.Request request )
        {
            if(request == null)
            {
                throw new ArgumentNullException ("request");
            }
            else if(request is GetNIPaymentDetailsRequest niRequest)
            {
                return HandleGetNIPaymentDetailsRequest(niRequest);
            }
            else if(request is GetNiPayDetailsForReceiptRequest niPayRequest)
            {
                return HandleGetNIPaymenteceiptDetailsRequest (niPayRequest);
            }
            else
            {
                string message = string.Format ("Request '{0}' is not supported.","");

                throw new NotSupportedException (message);
            }
        }

        private async Task<Response> HandleGetNIPaymenteceiptDetailsRequest ( GetNiPayDetailsForReceiptRequest niPayRequest )
        {
            string sql = @"SELECT TRANSACTIONID,SOURCEID,AMOUNT,TRANSACTIONDATE,LINENUM,PAYMENTID,MID, TID, AID, AUTHCODE, LABEL,RECEIPTNO 
                            FROM ext.TSCRETAILNIPAYMENTTRANSACTIONTABLEEXT WHERE TRANSACTIONID=@transId AND STOREID=@storeId";

            using(var dbContext = new DatabaseContext (niPayRequest.RequestContext))
            {
                SqlQuery query = new SqlQuery ();
                query.QueryString = sql;
                query.Parameters.Add ("@transId",niPayRequest.TransactionID);
                query.Parameters.Add ("@storeId",niPayRequest.RequestContext.GetDeviceConfiguration ().StoreNumber);

                PagedResult<NIPaymentDetails> result = await dbContext.ReadEntityAsync<NIPaymentDetails> (query).ConfigureAwait (false);
                //NIPaymentDetails details = result.FirstOrDefault ();
                return new GetNiPayDetailsForReceiptResponse (result);
            }
        }

        private async Task<Response> HandleGetNIPaymentDetailsRequest ( GetNIPaymentDetailsRequest niRequest )
        {
            string sql = @"SELECT TRANSACTIONID,SOURCEID,AMOUNT,TRANSACTIONDATE,LINENUM,PAYMENTID,MID, TID, AID, AUTHCODE, LABEL,RECEIPTNO 
                            FROM ext.TSCRETAILNIPAYMENTTRANSACTIONTABLEEXT WHERE TRANSACTIONID=@transId AND STOREID=@storeId AND LINENUM = @lineNum";

            using(var dbContext = new DatabaseContext (niRequest.RequestContext))
            {
                SqlQuery query = new SqlQuery ();
                query.QueryString = sql;
                query.Parameters.Add ("@transId",niRequest.TransactionId);
                query.Parameters.Add ("@storeId",niRequest.RequestContext.GetDeviceConfiguration ().StoreNumber);
                query.Parameters.Add ("@lineNum",niRequest.LineNum);

                PagedResult<NIPaymentDetails> result = await dbContext.ReadEntityAsync<NIPaymentDetails> (query).ConfigureAwait (false);
                //NIPaymentDetails details = result.FirstOrDefault ();
                return new GetNIPaymentDetailsResponse(result);
            }
        }
    }
}
