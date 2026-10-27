using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.Runtime.Messages.Customer;
using TSC.LMG.Runtime.Messages.Language;

namespace TSC.LMG.CommerceRuntime.Controllers
{
    public class CustomerAdditionalInfoController: IController
    {
        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetCountryCodeDetailsDataResponse> GetMobileNumberCountryCode(IEndpointContext context, string languageId)
        {
            GetCountryCodeDetailsDataRequest request = new GetCountryCodeDetailsDataRequest(languageId);
            GetCountryCodeDetailsDataResponse response = await context.ExecuteAsync<GetCountryCodeDetailsDataResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetAddressCityDataResponse> GetCityDetails(IEndpointContext context, string regionId)
        {

            GetAddressCityDataRequest request = new GetAddressCityDataRequest(regionId);
            GetAddressCityDataResponse response = await context.ExecuteAsync<GetAddressCityDataResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetCountryRegionsDataResponse> GetCountryRegionDetails(IEndpointContext context, string languageId)
        {

            GetCountryRegionsDataRequest request = new GetCountryRegionsDataRequest(languageId);
            GetCountryRegionsDataResponse response = await context.ExecuteAsync<GetCountryRegionsDataResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetGenderDetailsResponse> GetGenderDetails(IEndpointContext context)
        {

            GetGenderDetailsRequest request = new GetGenderDetailsRequest();
            GetGenderDetailsResponse response = await context.ExecuteAsync<GetGenderDetailsResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetCustPrefixNameResponse> GetPrefixNameDetails(IEndpointContext context)
        {

            GetCustPrefixNameRequest request = new GetCustPrefixNameRequest();
            GetCustPrefixNameResponse response = await context.ExecuteAsync<GetCustPrefixNameResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetShukranCountryDetailsResponse> GetShukranCountryDetails(IEndpointContext context, string languageId)
        {
            GetShukranCountryDetailsRequest request = new GetShukranCountryDetailsRequest(languageId);
            GetShukranCountryDetailsResponse response = await context.ExecuteAsync<GetShukranCountryDetailsResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetShukranCustomerByTransactionDataResponse> GetShukranCustTransDetails(IEndpointContext context, string transactionId)
        {
            GetShukranCustomerByTransactionDataRequest request = new GetShukranCustomerByTransactionDataRequest(transactionId);
            GetShukranCustomerByTransactionDataResponse response = await context.ExecuteAsync<GetShukranCustomerByTransactionDataResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization (CommerceRoles.Employee,CommerceRoles.Device,CommerceRoles.Application)]
        public async Task<GetLanguageDetailsResponse>GetLanguageDetails(IEndpointContext context)
        {
            GetLanguageDetailsRequest request = new GetLanguageDetailsRequest();
            GetLanguageDetailsResponse response = await context.ExecuteAsync<GetLanguageDetailsResponse> (request).ConfigureAwait (false);
            return response;
        }
    }
}
