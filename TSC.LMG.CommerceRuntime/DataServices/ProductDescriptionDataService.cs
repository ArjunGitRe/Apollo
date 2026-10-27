using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Data.Types;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.Runtime.Messages.Arabic;
using TSC.LMG.Runtime.Messages.Shukran;
using TSC.LMG.Runtime.Model.Arabic;
using TSC.LMG.Runtime.Model.Shukran.Data;

namespace TSC.LMG.CommerceRuntime.DataServices
{
    public class ProductDescriptionDataService : IRequestHandlerAsync
    {
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {
                    typeof(GetArabicDescriptionListRequest),
                    typeof(GetShukranDepartmentCodeDataRequest)
                };
            }
        }

        public Task<Response> Execute(Request request)
        {
            if (request == null)
            {
                throw new ArgumentNullException("request");
            }

            Type reqType = request.GetType();

            if (reqType == typeof(GetArabicDescriptionListRequest))
            {
                return this.GetArabicNameListAsync((GetArabicDescriptionListRequest)request);
            }
            if (reqType == typeof(GetShukranDepartmentCodeDataRequest))
            {
                return this.GetDepartmentCodeAsync((GetShukranDepartmentCodeDataRequest)request);
            }
            else
            {
                string message = string.Format("Request '{0}' is not Supported", reqType);
            }
            throw new NotImplementedException();
        }

        private async Task<Response> GetDepartmentCodeAsync(GetShukranDepartmentCodeDataRequest request)
        {
             string sql = @"SELECT PRODUCT, CATEGORYNAME, LEVEL FROM ext.TSCECORESPRODUCTCATEGORYVIEW WHERE PRODUCT IN (@productIds) ORDER BY PRODUCT, LEVEL ASC ";

            using (DatabaseContext dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                StringBuilder whereCondition = new StringBuilder();
                foreach (long productId in request.ProductIds)
                {
                    whereCondition.Append($"{productId}, ");
                }
                string parameterValue = whereCondition.ToString().Trim().Trim(',');
                sql = sql.Replace("@productIds", parameterValue);
                query.QueryString = sql;

                DataSet resultList = await dbContext.ExecuteQueryDataSetAsync(sql, new ParameterSet()).ConfigureAwait(false);

                List<DepartmentCodeEntity> departmentCodes = new List<DepartmentCodeEntity>();
                foreach (DataRow item in resultList.Tables[0].Rows)
                {
                    long productId = Convert.ToInt64(item["PRODUCT"]);
                    string categoryName = Convert.ToString(item["CATEGORYNAME"]);
                    int level = Convert.ToInt32(item["LEVEL"]);

                    departmentCodes.Add(new DepartmentCodeEntity { CATEGORYNAME = categoryName, LEVEL=level,PRODUCT=productId});
                }

                    return new GetShukranDepartmentCodeDataResponse(departmentCodes);
            }

        }

        private async Task<Response> GetArabicNameListAsync(GetArabicDescriptionListRequest request)
        {
            try
            {
                string sql = @"SELECT NAME,PRODUCT FROM EXT.ECORESPRODUCTTRANSLATIONVIEW WHERE PRODUCT IN (@productIds)  AND LANGUAGEID = 'ar'";

                using (DatabaseContext dbContext = new DatabaseContext(request.RequestContext))
                {

                    SqlQuery query = new SqlQuery();

                    StringBuilder whereCondition = new StringBuilder();
                    foreach (long productId in request.ProductIds)
                    {
                        whereCondition.Append($"{productId}, ");
                    }
                    string parameterValue = whereCondition.ToString().Trim().Trim(',');
                    sql = sql.Replace("@productIds", parameterValue);
                    query.QueryString = sql;
                    //query.Parameters.Add("@productIds", parameterValue);
                    DataSet resultList = await dbContext.ExecuteQueryDataSetAsync(sql, new ParameterSet()).ConfigureAwait(false);

                    List<ItemNames> itemNames = new List<ItemNames>();

                    foreach (DataRow item in resultList.Tables[0].Rows)
                    {

                        long productId = Convert.ToInt64(item["PRODUCT"]);
                        string name = Convert.ToString(item["NAME"]);

                        // Create a new ItemName object and add it to the list.
                        itemNames.Add(new ItemNames { ProductId = productId, Name = name });


                    }

                    return new GetArabicDescriptionListResponse(itemNames);
                }
            }
            catch (Exception)
            {
                return new GetArabicDescriptionListResponse(null);
            }
    }
} }
