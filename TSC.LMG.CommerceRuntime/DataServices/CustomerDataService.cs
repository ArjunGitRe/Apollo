using Azure.Core;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.DataServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.Runtime.Messages.Customer;
using TSC.LMG.Runtime.Messages.Language;
using TSC.LMG.Runtime.Messages.Receipts;
using TSC.LMG.Runtime.Model.Customer;
using TSC.LMG.Runtime.Model.Language;
using TSC.LMG.Runtime.Model.Receipts;
using TSC.Runtime.Model.Customer;
using CountryRegion = TSC.Runtime.Model.Customer.CountryRegion;
using Request = Microsoft.Dynamics.Commerce.Runtime.Messages.Request;

namespace TSC.LMG.CommerceRuntime.DataServices
{
    public  class CustomerDataService : IRequestHandlerAsync
    {
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {

                    typeof (GetCountryCodeDetailsDataRequest),
                    typeof(GetAddressCityDataRequest),
                    typeof(GetCountryRegionsDataRequest),
                    typeof(GetGenderDetailsRequest),
                    typeof(GetCustPrefixNameRequest),
                    typeof(GetShukranCountryDetailsRequest),
                    typeof(GetShukranCustomerByTransactionDataRequest),
                    typeof(GetLanguageDetailsRequest)
                };
            }
        }

        public async Task<Response> Execute(Request request)
        {
            if (request == null)
            {
                throw new ArgumentNullException("request");
            }
            else if (request is GetCountryCodeDetailsDataRequest getCustomerCodeRequest)
            {
                return await GetCountryCodeDetails(getCustomerCodeRequest).ConfigureAwait(false);
            }
            else if (request is GetAddressCityDataRequest getAddressCityRequest)
            {
                return await GetAddressCityAsync(getAddressCityRequest).ConfigureAwait(false);
            }
            else if (request is GetCountryRegionsDataRequest getcountryRegionyRequest)
            {
                return await GetCountryRegionAsync(getcountryRegionyRequest).ConfigureAwait(false);
            }
            else if (request is GetGenderDetailsRequest getGenderRequest)
            {
                return await GetGenderDetailsAsync(getGenderRequest).ConfigureAwait(false);
            }
            else if (request is GetCustPrefixNameRequest getPrefixNameRequest)
            {
                return await GetCustPrefixDetailsAsync(getPrefixNameRequest).ConfigureAwait(false);
            }
            else if (request is GetShukranCountryDetailsRequest getSkrnCountryRequest)
            {
                return await GetSkrnCountryDetailsAsync(getSkrnCountryRequest).ConfigureAwait(false);
            }
            else if (request is GetShukranCustomerByTransactionDataRequest getSkrnCustRequest)
            {
                return await GetSkrnCustDetailsAsync(getSkrnCustRequest).ConfigureAwait(false);
            }
            else if(request is GetLanguageDetailsRequest getlanguageRequest)
            {
                return await GetLanguageDetailsAsync(getlanguageRequest).ConfigureAwait (false);
            }

            else
            {
                string message = string.Format("Request '{0}' is not supported.", "");
                
                throw new NotSupportedException(message);
            }
        }

       

        private async Task<Response> GetAddressCityAsync(GetAddressCityDataRequest request)
        {
            PagingInfo pagingInfo = PagingInfo.AllRecords;
            QueryResultSettings querySetting = new QueryResultSettings(pagingInfo);
            GetCitiesDataRequest getCitiesDataRequest = new GetCitiesDataRequest(request.RegionId, "", "", querySetting);
            EntityDataServiceResponse<CityInfo> entityData = await request.RequestContext.ExecuteAsync<EntityDataServiceResponse<CityInfo>>(getCitiesDataRequest).ConfigureAwait(false);
            if (entityData != null)
            {
                return new GetAddressCityDataResponse(entityData.AsEnumerable());
            }
            return new GetAddressCityDataResponse(null);
        }

        private async Task<Response> GetCountryCodeDetails(GetCountryCodeDetailsDataRequest request)
        {

            if (string.IsNullOrEmpty(request.LanguageId))
            {
                request.LanguageId = request.RequestContext.LanguageId;
            }
            string sql = @"select MOBILECOUNTRYCODE,MOBILENUMBERLENGTH,COUNTRYREGIONID,LONGNAME,SHORTNAME,LANGUAGEID from ext.TSCSHUKRANMOBCOUNTRYCODEVIEW WHERE LANGUAGEID=@languageId";
            using (DatabaseContext dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@languageId", request.LanguageId);
                PagedResult<CountryCode> result = await dbContext.ReadEntityAsync<CountryCode>(query).ConfigureAwait(false);
                if (result != null && result.TotalCount > 0)
                {
                    result = result.OrderBy(x => x.LongName).AsPagedResult();
                }
                Collection<CountryCode> colData = new Collection<CountryCode>();
                colData.AddRange(result);
                return new GetCountryCodeDetailsDataResponse(colData);
            }


        }
        public async Task<Response> GetCountryRegionAsync(GetCountryRegionsDataRequest request)
        {
            if (string.IsNullOrEmpty(request.LanguageId))
            {
                request.LanguageId = request.RequestContext.LanguageId;
            }
            string sql = @"select COUNTRYREGIONID,ISOCODE,LANGUAGEID,LONGNAME,SHORTNAME from ext.TSCCOUNTRYREGIONVIEW WHERE LANGUAGEID=@languageId ORDER BY SHORTNAME ASC";
            using (DatabaseContext dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@languageId", request.LanguageId);
                PagedResult<CountryRegion> result = await dbContext.ReadEntityAsync<CountryRegion>(query).ConfigureAwait(false);
                //if (result != null && result.TotalCount > 0)
                //{
                //    result = result.OrderBy(x => x.LongName).AsPagedResult();
                //}
                Collection<CountryRegion> colData = new Collection<CountryRegion>();
                colData.AddRange(result);
                return new GetCountryRegionsDataResponse(colData);
            }

        }
        public async Task<Response> GetGenderDetailsAsync(GetGenderDetailsRequest request)
        {

            try
            {
                Collection<GenderOption> genderOptions = new Collection<GenderOption>();


                foreach (var name in Enum.GetNames(typeof(Gender)))
                {
                    Gender genderEnum = (Gender)Enum.Parse(typeof(Gender), name);

                    GenderOption genderOption = new GenderOption();
                    genderOption.Text = name;
                    genderOption.Value = genderEnum == Gender.Male ? "M" : "F";
                    genderOptions.Add(genderOption);
                }

                return new GetGenderDetailsResponse(genderOptions);

            }
            catch (Exception ex)
            {

                throw;
            }

        }

        private async Task<Response> GetCustPrefixDetailsAsync(GetCustPrefixNameRequest getPrefixNameRequest)
        {
            try
            {
                Collection<PrefixOption> prefixOptions = new Collection<PrefixOption>();


                foreach (var name in Enum.GetNames(typeof(Prefix)))
                {
                    PrefixOption custPrefixOption = new PrefixOption();
                    custPrefixOption.Text = name;
                    custPrefixOption.Value = ((int)Enum.Parse(typeof(Prefix), name)).ToString();
                    prefixOptions.Add(custPrefixOption);
                }

                return new GetCustPrefixNameResponse(prefixOptions);

            }
            catch (Exception ex)
            {

                throw;
            }
        }


        private async Task<Response> GetSkrnCountryDetailsAsync(GetShukranCountryDetailsRequest request)
        {
            if (string.IsNullOrEmpty(request.LanguageId))
            {
                request.LanguageId = request.RequestContext.LanguageId;
            }
            string sql = @"select COUNTRYREGIONID,LONGNAME,SHORTNAME,LANGUAGEID from ext.TSCSHUKRANCOUNTRYCODEVIEW WHERE LANGUAGEID=@languageId";
            using (DatabaseContext dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@languageId", request.LanguageId);
                PagedResult<ShukranCountries> result = await dbContext.ReadEntityAsync<ShukranCountries>(query).ConfigureAwait(false);
                if (result != null && result.TotalCount > 0)
                {
                    result = result.OrderBy(x => x.LongName).AsPagedResult();
                }
                Collection<ShukranCountries> colData = new Collection<ShukranCountries>();
                colData.AddRange(result);
                return new GetShukranCountryDetailsResponse(colData);
            }

        }

        private async Task<Response> GetSkrnCustDetailsAsync(GetShukranCustomerByTransactionDataRequest request)
        {
            string sql = @"SELECT TSC.PROFILEID,TSC.CARDNUMBER,TSC.COUNTRYCODE,TRTE.REDEMPTIONCASHVALUE FROM [ext].[TSCRETAILTRANSACTIONTABLEEXT]  TRTE
                           JOIN [ext].[TSCSHUKRANCUSTOMER] TSC ON TSC.PROFILEID = TRTE.PROFILEID WHERE TRTE.TRANSACTIONID = @transId";

            using (var dbContext = new DatabaseContext(request.RequestContext))
            {
                SqlQuery query = new SqlQuery();
                query.QueryString = sql;
                query.Parameters.Add("@transId", request.TransactionId);

                PagedResult<ShukranCustomerDtl> result = await dbContext.ReadEntityAsync<ShukranCustomerDtl>(query).ConfigureAwait(false);
                ShukranCustomerDtl details = result.FirstOrDefault();
                return new GetShukranCustomerByTransactionDataResponse(details);
            }
        }

        public async Task<Response> GetLanguageDetailsAsync(GetLanguageDetailsRequest reques )
        {
            try
            {
                Collection<LanguageOption> languageOptions = new Collection<LanguageOption> ();

                foreach(var name in Enum.GetNames (typeof (Language)))
                {
                    var memberInfo = typeof (Language).GetMember (name)[0];
                    var enumMember = memberInfo
                        .GetCustomAttributes (typeof (EnumMemberAttribute),false)
                        .FirstOrDefault () as EnumMemberAttribute;

                    LanguageOption languageOption = new LanguageOption ();
                    languageOption.Value = name;                                   
                    languageOption.Text  = enumMember?.Value ?? name;              
                    languageOptions.Add (languageOption);
                }

                return new GetLanguageDetailsResponse (languageOptions);
            }
            catch(Exception ex)
            {
                throw;
            }
        }
    }
}
