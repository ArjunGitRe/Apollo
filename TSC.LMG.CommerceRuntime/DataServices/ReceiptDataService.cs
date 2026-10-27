using Azure.Core;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.Runtime.Messages.Log;
using TSC.LMG.Runtime.Messages.Receipts;
using TSC.LMG.Runtime.Messages.Shukran;
using TSC.LMG.Runtime.Model.Receipts;
using Request = Microsoft.Dynamics.Commerce.Runtime.Messages.Request;

namespace TSC.LMG.CommerceRuntime.DataServices
{
    public class ReceiptDataService : IRequestHandlerAsync
    {
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {
                    typeof(GetShukranTransactionDetailsRequest),
                    typeof(GetOrginalReceiptIdDataRequest)
                   
                };
            }
        }

        public async Task<Response> Execute(Request request)
        {
            if (request == null)
            {
                throw new ArgumentNullException("request");
            }
            else if (request is GetShukranTransactionDetailsRequest skrnDataRequest)
            {
                return await GetShukranTransDataRequest(skrnDataRequest).ConfigureAwait(false);
            }
            else if (request is GetOrginalReceiptIdDataRequest transDataRequest)
            {
                return await GetOrginalTransDataRequest(transDataRequest).ConfigureAwait(false);
            }
            else
            {
                string message = string.Format("Request '{0}' is not supported.", "");

                throw new NotSupportedException(message);
            }
        }

        private async Task<Response> GetOrginalTransDataRequest(GetOrginalReceiptIdDataRequest request)
        {
            string sql = @"SELECT RECEIPTID,TRANSDATETIME,BEGINDATETIME FROM ext.TSRETAILTRANSACTIONTABLEVIEW WHERE TRANSACTIONID=@transId AND STORE=@storeId";

            using (var dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@transId", request.TransaactionId);
                query.Parameters.Add("@storeId", request.RequestContext.GetDeviceConfiguration().StoreNumber);

                PagedResult<OrginalTransModel> result = await dbContext.ReadEntityAsync<OrginalTransModel>(query).ConfigureAwait(false);
                OrginalTransModel details = result.FirstOrDefault();
                return new GetOrginalReceiptIdDataResponse(details);
            }
        }

        private async Task<Response> GetShukranTransDataRequest(GetShukranTransactionDetailsRequest request)
        {
            string sql = @"SELECT PROFILEID,TOTALPOINTSREDEEMED,TOTALPOINTSEARNED,TOTALPOINTSBALANCE FROM EXT.TSCRETAILTRANSACTIONTABLEEXT WHERE TRANSACTIONID=@transId AND DATAAREAID=@dataAreaId";

            using (var dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@transId", request.TransId);
                query.Parameters.Add("@DATAAREAID", request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId);

                PagedResult<ShukranTransDetails> result = await dbContext.ReadEntityAsync<ShukranTransDetails>(query).ConfigureAwait(false);
                ShukranTransDetails details = result.FirstOrDefault();
                return new GetShukranTransactionDetailsResponse(details);
            }
        }
    }
}
