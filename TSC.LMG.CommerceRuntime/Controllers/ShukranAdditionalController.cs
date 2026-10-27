using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.Runtime.Messages.Services;
using TSC.LMG.Runtime.Messages.Shukran;
using TSC.LMG.Runtime.Messages.Shukran.Voucher;
using TSC.LMG.Runtime.Model.Shukran;
using TSC.LMG.Runtime.Model.Shukran.Data;

namespace TSC.LMG.CommerceRuntime.Controllers
{
    public class ShukranAdditionalController: IController
    {
        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<SaveShukranCustomerDataResponse> SaveShukranCustomerDetails(IEndpointContext context, ShukranEnrollmentData shukranEnrollmentData)
        {
            SaveShukranCustomerDataRequest request = new SaveShukranCustomerDataRequest(shukranEnrollmentData);
            SaveShukranCustomerDataResponse response = await context.ExecuteAsync<SaveShukranCustomerDataResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<VerifyShukranOTPResponse> VerifyShukranOTP(IEndpointContext context, string Guid, string Otp)
        {
            VerifyShukranOTPRequest request = new VerifyShukranOTPRequest(Guid,Otp);
            VerifyShukranOTPResponse response = await context.ExecuteAsync<VerifyShukranOTPResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization (CommerceRoles.Employee,CommerceRoles.Device,CommerceRoles.Application)]
        public async Task<GetProductDiscountOfferIdsDataResponse> ShukranGetProductOffers ( IEndpointContext context,string offerId )
        {
            GetProductDiscountOfferIdsDataRequest request = new GetProductDiscountOfferIdsDataRequest (offerId);
            GetProductDiscountOfferIdsDataResponse response = await context.ExecuteAsync<GetProductDiscountOfferIdsDataResponse> (request).ConfigureAwait (false);
            return response;
        }


    }
}
