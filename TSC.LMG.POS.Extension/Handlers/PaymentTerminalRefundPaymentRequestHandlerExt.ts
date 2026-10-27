import { PaymentTerminalRefundPaymentRequestHandler } from "PosApi/Extend/RequestHandlers/PeripheralsRequestHandlers";
import { PaymentTerminalRefundPaymentRequest, PaymentTerminalRefundPaymentActivityResponse } from "PosApi/Consume/Peripherals";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart"
import { PaymentHandlerHelper } from "../Helper/PaymentHandlerHelper";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";

class PaymentTerminalRefundPaymentRequestHandlerExt extends PaymentTerminalRefundPaymentRequestHandler {

    executeAsync(request: PaymentTerminalRefundPaymentRequest<PaymentTerminalRefundPaymentActivityResponse>): Promise<any> {
        let cart: ProxyEntities.Cart = null;
        const cartRequest: GetCurrentCartClientRequest<GetCurrentCartClientResponse> = new GetCurrentCartClientRequest();
        let paymentConnectorProps: any = null;

        return this.context.runtime.executeAsync(cartRequest)
            .then((result: any) => {
                if (!(result.canceled || ObjectExtensions.isNullOrUndefined(result.data))) {
                    cart = result.data.result;
                }
            }).then(() => {
                let authData: string = "";
                let refundData = cart.RefundableTenderLines.find(x => x.AmountInTenderedCurrency == request.amount && x.TenderTypeId == "3");
                if (refundData) {
                    authData = refundData.Authorization;
                }
                const paymentDataRequest : GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse> = new GetDeviceConfigurationClientRequest();
                return this.context.runtime.executeAsync(paymentDataRequest)
                    .then((result: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {
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
                                    },
                                    {
                                        Key: "OrigAuthorizationData",
                                        Value: {
                                            StringValue: authData
                                        }
                                    }
                                ]
                            };
                        }
                    });
            }).then(() => {
                const newRequest = new PaymentTerminalRefundPaymentRequest(
                    request.paymentConnectorId,
                    request.amount,
                    request.tenderInfo,
                    request.isManualEntry,
                    PaymentHandlerHelper.FillExtensionProperties(cart, paymentConnectorProps)
                );
                return this.defaultExecuteAsync(newRequest);
            });
    }
}

export default PaymentTerminalRefundPaymentRequestHandlerExt;