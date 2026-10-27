using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.DataServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TSC.LMG.Runtime.Messages.Payment;
using TSC.Runtime.Model.Customer;

namespace TSC.LMG.CommerceRuntime.Triggers
{
    public class GetDeviceConfigurationTrigger : IRequestTriggerAsync
    {
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {
                    typeof(GetDeviceConfigurationRequest)
                };
            }
        }

        public async Task OnExecuted(Request request, Response response)
        {
            GetDeviceConfigurationResponse deviceConfig = (GetDeviceConfigurationResponse)response;
            GetConfigurationParametersDataRequest dataRequest = new GetConfigurationParametersDataRequest(request.RequestContext.GetChannel().RecordId);
            EntityDataServiceResponse<RetailConfigurationParameter> configResp = await request.RequestContext.ExecuteAsync<EntityDataServiceResponse<RetailConfigurationParameter>>(dataRequest).ConfigureAwait(false);

            string countryCode = "";
            RetailConfigurationParameter defaultPrefix = configResp.Where(x => x.Name.ToUpper() == "TSCDEFAULTCOUNTRYPREFIX").FirstOrDefault();
            if (defaultPrefix != null)
            {
                countryCode = defaultPrefix.Value;
            }

            string shukranTenderType ="";
            RetailConfigurationParameter skrnTenderType = configResp.Where(x => x.Name.ToUpper() == "SKRNTENDERTYPE").FirstOrDefault();
            if (skrnTenderType != null)
            {
                shukranTenderType = skrnTenderType.Value;
            }

            string shukranEnrollChnlCode="";
            RetailConfigurationParameter skrnChnlCode = configResp.Where(x => x.Name == "SKRNEnrollChannelCode").FirstOrDefault();
            if (skrnChnlCode != null)
            {
                shukranEnrollChnlCode = skrnChnlCode.Value;
            }

            string shukranSourceCode = "";
            RetailConfigurationParameter skrnSrcCode = configResp.Where(x => x.Name == "SKRNSourceCode").FirstOrDefault();
            if (skrnSrcCode != null)
            {
                shukranSourceCode = skrnSrcCode.Value;
            }

            string dobValidation = "";
            RetailConfigurationParameter dobYear = configResp.Where(x => x.Name.ToUpper() == "TSCDEFAULTDOBYEAR").FirstOrDefault();
            if (dobYear != null)
            {
                dobValidation =dobYear.Value;
            }

            string storeCountry ="";
            RetailConfigurationParameter strCountry = configResp.Where(x => x.Name == "StoreCountryCode").FirstOrDefault();
            if (strCountry !=null)
            {
                storeCountry=strCountry.Value;
            }
            string custAccountTala = "";
            RetailConfigurationParameter talabthAccount = configResp.Where (x => x.Name == "CustomerAccount_TenderType_10").FirstOrDefault ();
            if(talabthAccount !=null)
            {
                custAccountTala=talabthAccount.Value;
            }

            string custAccountCareem = "";
            RetailConfigurationParameter careemAccount = configResp.Where (x => x.Name == "CustomerAccount_TenderType_9").FirstOrDefault ();
            if(careemAccount !=null)
            {
                custAccountCareem=careemAccount.Value;
            }

            string blockedtTenderTypes = "";
            RetailConfigurationParameter blockedIds = configResp.Where (x => x.Name == "BlockedTenderTypeIds").FirstOrDefault ();
            if(blockedIds !=null)
            {
                blockedtTenderTypes=blockedIds.Value;
            }

            string decimalPts = "";
            RetailConfigurationParameter decimalPoints = configResp.Where (x => x.Name == "TscDecimalPoint").FirstOrDefault ();
            if(decimalPoints !=null)
            {
                decimalPts=decimalPoints.Value;
            }

            string niPaymentTenderType = "";
            RetailConfigurationParameter niTender = configResp.Where (x => x.Name == "NIPAYMENTTENDERTYPE").FirstOrDefault ();
            if(niTender != null)
            {
                niPaymentTenderType = niTender.Value;
            }

            string niStatusInterval = "";
            RetailConfigurationParameter niInterval = configResp.Where (x => x.Name == "NISTATUSINTERVAL").FirstOrDefault ();
            if(niInterval != null)
            {
                niStatusInterval = niInterval.Value;
            }

            string niMaxStatusCount = "";
            RetailConfigurationParameter niMaxCount = configResp.Where (x => x.Name == "NIMAXSTATUSCOUNT").FirstOrDefault ();
            if(niMaxCount != null)
            {
                niMaxStatusCount = niMaxCount.Value;
            }

            string aaniPaymentTenderId = "";
            RetailConfigurationParameter aaniPay = configResp.Where (x => x.Name == "AANIPAYTENDERTYPE").FirstOrDefault ();
            if(aaniPay != null)
            {
                aaniPaymentTenderId = aaniPay.Value;
            }

            string ncpiPaymentTenderId = "";
            RetailConfigurationParameter ncpiPay = configResp.Where (x => x.Name == "NCPIPAYTENDERTYPE").FirstOrDefault ();
            if(ncpiPay != null)
            {
                ncpiPaymentTenderId = ncpiPay.Value;
            }

            string terminalId= deviceConfig.DeviceConfiguration.TerminalId;
            GetComPortDataRequest portReq= new GetComPortDataRequest(terminalId);
            GetComPortDataResponse portResp = await request.RequestContext.ExecuteAsync<GetComPortDataResponse>(portReq).ConfigureAwait(false);


            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("TSCDEFAULTCOUNTRYPREFIX", countryCode));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("SKRNTENDERTYPE", shukranTenderType));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("SKRNEnrollChannelCode", shukranEnrollChnlCode));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("SKRNSourceCode", shukranSourceCode));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("TSCDEFAULTDOBYEAR", dobValidation));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("StoreCountryCode", storeCountry));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("CustomerAccount_TenderType_10",custAccountTala));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("CustomerAccount_TenderType_9",custAccountCareem));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("BlockedTenderTypeIds",blockedtTenderTypes));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("TscDecimalPoint",decimalPts));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("NIPAYMENTTENDERTYPE",niPaymentTenderType));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("NISTATUSINTERVAL",niStatusInterval));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("NIMAXSTATUSCOUNT",niMaxStatusCount));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("AANIPAYTENDERTYPE",aaniPaymentTenderId));
            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("NCPIPAYTENDERTYPE",ncpiPaymentTenderId));

            deviceConfig.DeviceConfiguration.ExtensionProperties.Add(new CommerceProperty("TSCEFTCOMPORT",portResp.CPort));
        }

        public async Task OnExecuting(Request request)
        {
            //return Task.CompletedTask;
        }
    }
}
