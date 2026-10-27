using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.Runtime.Messages.Network.Transaction;
using TSC.LMG.Runtime.Model.Network;
using TSC.LMG.Runtime.Model.Network.Transactions;

namespace TSC.LMG.CommerceRuntime.Controllers.Network
{
    public class NIController:IController
    {
        [HttpPost]
        [Authorization (CommerceRoles.Anonymous,CommerceRoles.Customer,CommerceRoles.Device,CommerceRoles.Employee,CommerceRoles.Application)]
        public async Task<NIStartTransaction> InitiateNITransaction (IEndpointContext context,string TransactionId,string Amount,string TenderLineNumber,string OriginalId,bool isRefund,string transactionTypeOverride )
        {
            var request = new NIInitiateTransactionRequest (TransactionId,Amount,TenderLineNumber,OriginalId,isRefund,transactionTypeOverride)
            {
                QueryResultSettings = QueryResultSettings.SingleRecord
            };

            var response = await context.ExecuteAsync<NIInitiateTransactionResponse> (request).ConfigureAwait (false);
            return response.Entity;
        }

        [HttpPost]
        [Authorization (CommerceRoles.Anonymous,CommerceRoles.Customer,CommerceRoles.Device,CommerceRoles.Employee,CommerceRoles.Application)]
        public async Task<NIResultTransaction> GetNITransactionResult (IEndpointContext context,string TransactionId,string SourceId,string Amount,string TenderLineNumber,string PaymentType )
        {
            var request = new NIGetTransactionResultRequest (TransactionId,SourceId,Amount,TenderLineNumber,PaymentType)
            {
                QueryResultSettings = QueryResultSettings.SingleRecord
            };
            var response = await context.ExecuteAsync<NIGetTransactionResultResponse> (request).ConfigureAwait (false);
            return response.Entity;
        }

        [HttpPost]
        [Authorization (CommerceRoles.Anonymous,CommerceRoles.Customer,CommerceRoles.Device,CommerceRoles.Employee,CommerceRoles.Application)]
        public async Task<NIResultTransaction> CancelCurrentNITransaction (IEndpointContext context,string TransactionId,string SourceId,string Amount,string TenderLineNumber )
        {
            var request = new NICancelTransactionRequest (TransactionId,SourceId,Amount,TenderLineNumber)
            {
                QueryResultSettings = QueryResultSettings.SingleRecord
            };
            var response = await context.ExecuteAsync<NICancelTransactionResponse> (request).ConfigureAwait (false);
            return response.Entity;
        }

        [HttpPost]
        [Authorization (CommerceRoles.Anonymous,CommerceRoles.Customer,CommerceRoles.Device,CommerceRoles.Employee,CommerceRoles.Application)]
        public async Task<IReadOnlyCollection<NIPaymentDetails>> GetSource ( IEndpointContext context,string TransactionId,decimal LineNum )
        {
            var request = new GetNIPaymentDetailsRequest(TransactionId,LineNum)
            {
                QueryResultSettings = QueryResultSettings.SingleRecord
            };
            var response = await context.ExecuteAsync<GetNIPaymentDetailsResponse> (request).ConfigureAwait (false);
            return response.Result.Results;
        }
    }
}
