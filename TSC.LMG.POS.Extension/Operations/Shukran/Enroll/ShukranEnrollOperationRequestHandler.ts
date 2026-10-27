import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations";
import ShukranEnrollOperationResponse from "../../Shukran/Enroll/ShukranEnrollOperationResponse";
import ShukranEnrollOperationRequest from "../../Shukran/Enroll/ShukranEnrollOperationRequest";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";
import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";

export default class ShukranEnrollOperationRequestHandler<TResponse extends ShukranEnrollOperationResponse> extends ExtensionOperationRequestHandlerBase<TResponse> {

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return ShukranEnrollOperationRequest;
    }


    public async executeAsync(printRequest: ShukranEnrollOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        const cartRequest = new GetCurrentCartClientRequest<GetCurrentCartClientResponse>();
        const cartResponse = await this.context.runtime.executeAsync(cartRequest);

        if (cartResponse.canceled || !cartResponse.data) {
            // Could not retrieve cart — proceed safely to enroll view
            this.context.navigator.navigate("ShukranCustomerEnrollmentView");
            return Promise.resolve({ canceled: false, data: <TResponse>new ShukranEnrollOperationResponse() });
        }
        const cart: ProxyEntities.Cart = cartResponse.data.result;

        if (!cart.CartLines || cart.CartLines.length === 0) {
            this.showMessage("Cart is empty. Please add items to the cart before enrolling.");
            return Promise.resolve({ canceled: true, data: <TResponse>new ShukranEnrollOperationResponse() });
        }
        //const customerId: string = cart.CustomerId;
        const shukranProfileId = cart.ExtensionProperties?.find((prop) => prop.Key === "SHUKRAN_PROFILE_ID")?.Value?.StringValue;

        if (shukranProfileId && shukranProfileId.trim().length > 0) {
            // Step 3: Customer is present — block enrollment and show a message
            this.showMessage("A customer is present in cart. Cannot enroll now. Please clear the customer from the cart to enroll.")
            return Promise.resolve({ canceled: true, data: <TResponse>new ShukranEnrollOperationResponse() });
        }

        this.context.navigator.navigate("ShukranCustomerEnrollmentView");

        return Promise.resolve({ canceled: false, data: <TResponse>new ShukranEnrollOperationResponse() });
    }

    private showMessage(message: string): void {
        let options: IMessageDialogOptions = {
            message: message
        };
        let dialogRequest = new ShowMessageDialogClientRequest(options);
        this.context.runtime.executeAsync(dialogRequest).catch(() => { /* Ignore UI error */ });
    }

}