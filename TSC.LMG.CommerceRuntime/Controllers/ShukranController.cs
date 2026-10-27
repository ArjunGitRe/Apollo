using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using TSC.LMG.Runtime.Messages.Services;
using TSC.LMG.Runtime.Model.Shukran;

namespace TSC.LMG.CommerceRuntime.Controllers
{
    public  class ShukranController : IController
    {
        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<CustomerProfileSearchResponse> SearchShukranCustomer(IEndpointContext context, string searchType, string searchValue, string countryCode, string scanMode,string transId)
        {
            GetShukranCustomerProfileServiceRequest request = new GetShukranCustomerProfileServiceRequest(searchType, searchValue, countryCode, scanMode, transId);
            GetShukranCustomerProfileServiceResponse response = await context.ExecuteAsync<GetShukranCustomerProfileServiceResponse>(request).ConfigureAwait(false);
            return response.CustomerProfileResponse;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetShukranCustomerCouponServiceResponse> CustomerCoupnDetails(IEndpointContext context, string storeCode, string profileId, string conceptCode, string action,string transId)
        {
            GetShukranCustomerCouponServiceRequest request = new GetShukranCustomerCouponServiceRequest(storeCode, profileId, conceptCode, action, transId);
            GetShukranCustomerCouponServiceResponse response = await context.ExecuteAsync<GetShukranCustomerCouponServiceResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetShukranCustomerEnrollServiceResponse> EnrollShukranCustomer(IEndpointContext context, EnrollCustomerRequest enrollCustomerRequest,string transId)
        {
            GetShukranCustomerEnrollServiceRequest request = new GetShukranCustomerEnrollServiceRequest(enrollCustomerRequest, transId);
            GetShukranCustomerEnrollServiceResponse response = await context.ExecuteAsync<GetShukranCustomerEnrollServiceResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetShukranEnrollOTPServiceResponse> CustomerEnrollOTPDetails(IEndpointContext context, string mobileNumber, string territory, string language, string customerId,string otpValue,string transId)
        {
            GetShukranEnrollOTPServiceRequest request = new GetShukranEnrollOTPServiceRequest(mobileNumber, territory, language, customerId, otpValue, transId);
            GetShukranEnrollOTPServiceResponse response = await context.ExecuteAsync<GetShukranEnrollOTPServiceResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetShukranRedeemOTPServiceResponse> CustomerRedeemOTPDetails(IEndpointContext context, string mobileNumber, string territory, string language, string cardNumber, string otpValue,string transId)
        {
            GetShukranRedeemOTPServiceRequest request = new GetShukranRedeemOTPServiceRequest(mobileNumber, territory, language, cardNumber, otpValue, transId);
            GetShukranRedeemOTPServiceResponse response = await context.ExecuteAsync<GetShukranRedeemOTPServiceResponse>(request).ConfigureAwait(false);
            return response;
        }

        [HttpPost]
        [Authorization(CommerceRoles.Employee, CommerceRoles.Device, CommerceRoles.Application)]
        public async Task<GetShukranCustomerVoucherServiceResponse> CustomerVoucherDetails(IEndpointContext context, string profileId, string storeCode, string conceptCode, string disCouponCode,string voucherCode,string transId,string action)
        {
            GetShukranCustomerVoucherServiceRequest request = new GetShukranCustomerVoucherServiceRequest(profileId,storeCode, conceptCode, disCouponCode, voucherCode, transId,action);
            GetShukranCustomerVoucherServiceResponse response = await context.ExecuteAsync<GetShukranCustomerVoucherServiceResponse>(request).ConfigureAwait(false);
            return response;
        }
    }
}
