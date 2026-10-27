import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations";
import ShukranProfileOperationResponse from "../../Shukran/Profile/ShukranProfileOperationResponse";
import ShukranProfileOperationRequest from "../../Shukran/Profile/ShukranProfileOperationRequest";
import { ClientEntities } from "PosApi/Entities";
import { StoreOperations } from "../../../DataService/DataServiceRequests.g";
import ShukranCustomerSearchDialog, { IShukranSearchResult } from "../../../Dialogs/Shukran/ShukranCustomerSearchDialog";
import { IMessageDialogOptions, ShowMessageDialogClientRequest, ShowMessageDialogClientResponse } from "PosApi/Consume/Dialogs";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";

export default class ShukranProfileOperationRequestHandler<TResponse extends ShukranProfileOperationResponse>
    extends ExtensionOperationRequestHandlerBase<TResponse> {

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return ShukranProfileOperationRequest;
    }
    private _storeCountryCode: string = "";

    public async executeAsync(request: ShukranProfileOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        await this._getStoreCountryCode();
        let cartRequest = new GetCurrentCartClientRequest<GetCurrentCartClientResponse>();
        const cartResponse = await this.context.runtime.executeAsync(cartRequest);
        const cart = cartResponse?.data?.result;

        // Read Shukran extension properties from cart
        const extensionProperties = cart?.ExtensionProperties ?? [];

        const searchType = extensionProperties.find(p => p.Key === "SHUKRAN_SEARCH_TYPE")?.Value?.StringValue;
        const shukranPhone = extensionProperties.find(p => p.Key === "SHUKRAN_PHONE")?.Value?.StringValue;
        const shukranCardNo = extensionProperties.find(p => p.Key === "SHUKRAN_CARDNO")?.Value?.StringValue;
        const searchValue = searchType === "PhoneNumber" ? shukranPhone : shukranCardNo;

        if (searchType && searchValue) {
            // Shukran customer already in cart — skip dialog, search directly
            const customerReq = new StoreOperations.SearchShukranCustomerRequest<StoreOperations.SearchShukranCustomerResponse>(searchType, searchValue, this._storeCountryCode, "", "");
            return this.context.runtime.executeAsync(customerReq)
                .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.SearchShukranCustomerResponse>) => {
                    const profileResponse = resp.data.result;
                    const hasProfile = !!(profileResponse && profileResponse.Success && profileResponse.CustomerProfileDetails);

                    if (hasProfile) {
                        this.context.navigator.navigate("ShukranCustomerProfileView", {
                            customerProfile: resp.data.result,
                            searchType: searchType
                        });
                        return { canceled: true, data: <TResponse>new ShukranProfileOperationResponse() };
                    }

                    return this._showNoProfileDialog();
                })
                .catch(() => {
                    return { canceled: true, data: <TResponse>new ShukranProfileOperationResponse() };
                });
        }

        // No Shukran customer in cart — open search dialog as usual

        let searchDialog = new ShukranCustomerSearchDialog();
        return searchDialog.open()
            .then((searchResult: IShukranSearchResult) => {

                if (!searchResult.confirmed) {
                    return { canceled: false, data: <TResponse>new ShukranProfileOperationResponse() };
                }

                let customerReq = new StoreOperations.SearchShukranCustomerRequest<StoreOperations.SearchShukranCustomerResponse>(searchResult.searchType, searchResult.searchValue, this._storeCountryCode,"","" );

                return this.context.runtime.executeAsync(customerReq)
                    .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.SearchShukranCustomerResponse>) => {

                        const profileResponse = resp.data.result;
                        const hasProfile = !!( profileResponse && profileResponse.Success && profileResponse.CustomerProfileDetails );

                        if (hasProfile) {
                            this.context.navigator.navigate("ShukranCustomerProfileView", { customerProfile: resp.data.result,searchType: searchResult.searchType});
                            return { canceled: true, data: <TResponse>new ShukranProfileOperationResponse() };
                        }

                        return this._showNoProfileDialog();
                    })
                    .catch(() => {
                        return { canceled: true, data: <TResponse>new ShukranProfileOperationResponse() };
                    });
            })
            .catch(() => {
                return { canceled: true, data: <TResponse>new ShukranProfileOperationResponse() };
            });
    }

    private _showNoProfileDialog(): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        const dialogOptions: IMessageDialogOptions = {
            title: "No Shukran Profile Found",
            message: "This customer does not have a Shukran loyalty profile."
        };

        const dialogRequest = new ShowMessageDialogClientRequest<ShowMessageDialogClientResponse>(dialogOptions);

        return this.context.runtime.executeAsync(dialogRequest)
            .then(() => {
                return { canceled: false, data: <TResponse>new ShukranProfileOperationResponse() };
            })
            .catch(() => {
                return { canceled: true, data: <TResponse>new ShukranProfileOperationResponse() };
            });
    }

    private _getStoreCountryCode(): Promise<string> {

        let deviceReq = new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>(this.context.logger.getNewCorrelationId());
        return this.context.runtime.executeAsync(deviceReq)
            .then((response: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {

                const config = response.data.result;
                const countryProp = config.ExtensionProperties.find(p => p.Key === "StoreCountryCode");
                this._storeCountryCode = countryProp?.Value?.StringValue || "";
                return this._storeCountryCode;
            });
    }
}