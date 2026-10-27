import { ObjectExtensions, StringExtensions } from "PosApi/TypeExtensions";
import { ProxyEntities } from "PosApi/Entities"; 

//interface Cart {
//    Id: string;
//    ChannelId?: string | number;
//    TerminalId: string;
//    StaffId: string;
//    CustomerId?: string;
//    ShippingAddress?: {
//        ZipCode?: string;
//    };
//}

interface ExtensionProperty {
    Key: string;
    Value: {
        StringValue: string;
    };
}

interface ExtraProperties {
    ExtensionProperties: ExtensionProperty[];
}

class PaymentHandlerHelper {
    static FillExtensionProperties(cart: ProxyEntities.Cart | null, extensionProperties?: ExtraProperties): ExtraProperties | undefined {
        let extraProperties: ExtraProperties | null = null;

        if (!ObjectExtensions.isNullOrUndefined(cart)) {
            extraProperties = {
                ExtensionProperties: [
                    {
                        Key: "CartId",
                        Value: {
                            StringValue: !ObjectExtensions.isNullOrUndefined(cart) ? cart.Id : ""
                        }
                    },
                    {
                        Key: "ChannelId",
                        Value: {
                            StringValue: (ObjectExtensions.isNullOrUndefined(cart.ChannelId)) ? "" : cart.ChannelId.toString()
                        }
                    },
                    {
                        Key: "TerminalId",
                        Value: {
                            StringValue: cart.TerminalId
                        }
                    },
                    {
                        Key: "StaffId",
                        Value: { StringValue: cart.StaffId }
                    },
                    {
                        Key: "CustomerId",
                        Value: {
                            StringValue: (StringExtensions.isNullOrWhitespace(cart.CustomerId)) ? "" : cart.CustomerId
                        }
                    },
                    {
                        Key: "ShippingZipCode",
                        Value: {
                            StringValue:
                                !ObjectExtensions.isNullOrUndefined(cart.ShippingAddress) ?
                                    (StringExtensions.isNullOrWhitespace(cart.ShippingAddress.ZipCode) ? "" : cart.ShippingAddress.ZipCode) : ""
                        }
                    }
                ]
            };
        }

        if (ObjectExtensions.isNullOrUndefined(extensionProperties)) {
            extensionProperties = extraProperties;
        } else if (extraProperties) {
            for (let i = 0; i < extraProperties.ExtensionProperties.length; i++) {
                extensionProperties.ExtensionProperties.push(extraProperties.ExtensionProperties[i]);
            }
        }

        return extensionProperties;
    }
}

export { PaymentHandlerHelper };