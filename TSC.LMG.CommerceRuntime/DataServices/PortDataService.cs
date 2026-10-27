using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.Runtime.Messages.Payment;
using TSC.LMG.Runtime.Messages.Receipts;
using TSC.LMG.Runtime.Model.Receipts;

namespace TSC.LMG.CommerceRuntime.DataServices
{
    public class PortDataService : IRequestHandlerAsync
    {
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {
                    typeof(GetComPortDataRequest)

                };
            }
        }

        public async Task<Response> Execute(Request request)
        {
            if (request == null)
            {
                throw new ArgumentNullException("request");
            }
            else if (request is GetComPortDataRequest cPortRequest)
            {
                return await GetEFTComPortDataRequest(cPortRequest).ConfigureAwait(false);
            }
            else
            {
                string message = string.Format("Request '{0}' is not supported.", "");

                throw new NotSupportedException(message);
            }
        }

        private async Task<Response> GetEFTComPortDataRequest(GetComPortDataRequest request)
        {
            string sql = @"SELECT TSCCOMPORT from EXT.TSCRETAILTERMINALTABLEEXT WHERE TERMINALID=@terminalId";

            using (var dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@terminalId", request.TerminalID);

                string result = string.Empty;
                try
                {
                    result = await dbContext.ExecuteScalarAsync<string>(query).ConfigureAwait(false);
                }
                catch (InvalidOperationException)
                {
                    result = string.Empty;
                }
                return new GetComPortDataResponse(result);
            }
        }
    }
}
