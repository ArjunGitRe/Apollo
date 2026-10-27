import { PaymentTerminalAuthorizePaymentRequestHandler } from "PosApi/Extend/RequestHandlers/PeripheralsRequestHandlers";
import { PaymentTerminalAuthorizePaymentRequest, PaymentTerminalAuthorizePaymentActivityResponse } from "PosApi/Consume/Peripherals";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart"
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { PaymentHandlerHelper } from "../Helper/PaymentHandlerHelper";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import { ClientEntities } from "PosApi/Entities";

class PaymentTerminalAuthorizePaymentRequestHandlerExt extends PaymentTerminalAuthorizePaymentRequestHandler {

    executeAsync(request: PaymentTerminalAuthorizePaymentRequest<PaymentTerminalAuthorizePaymentActivityResponse>): Promise<any> {
        let cart: any = null;
        const cartRequest: GetCurrentCartClientRequest<GetCurrentCartClientResponse> = new GetCurrentCartClientRequest();
        let paymentConnectorProps: any = null;

        return this.context.runtime.executeAsync(cartRequest)
            .then((result: any) => {
                if (!(result.canceled || ObjectExtensions.isNullOrUndefined(result.data))) {
                    cart = result.data.result;
                }
            }).then(() => {
                const paymentDataRequest: GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse> = new GetDeviceConfigurationClientRequest();
                return this.context.runtime.executeAsync(paymentDataRequest)
                    .then((result: ClientEntities.ICancelableDataResult< GetDeviceConfigurationClientResponse>) => {
                        if (!(result.canceled || ObjectExtensions.isNullOrUndefined(result.data.result))) {

                            let deviceConfig = result.data.result;
                            let extensionProps = deviceConfig.ExtensionProperties;

                            let comPortProp = extensionProps.find(p => p.Key === "TSCEFTCOMPORT");
                            let comPort = comPortProp && comPortProp.Value ? comPortProp.Value.StringValue : "";


                            paymentConnectorProps = {
                                ExtensionProperties: [
                                    {
                                        Key: "TSCEFTCOMPORT",
                                        Value: {
                                            StringValue: comPort
                                        }
                                    }
                                ]
                            };
                        }
                    });
            }).then(() => {
                const newRequest = new PaymentTerminalAuthorizePaymentRequest(
                    request.paymentConnectorId,
                    request.amount,
                    request.tenderInfo,
                    request.voiceAuthorization,
                    request.isManualEntry,
                    PaymentHandlerHelper.FillExtensionProperties(cart, paymentConnectorProps),
                    request.correlationId,
                    request.paymentTransactionReferenceData
                );
                return this.defaultExecuteAsync(newRequest);
            });
    }
}

export default PaymentTerminalAuthorizePaymentRequestHandlerExt;