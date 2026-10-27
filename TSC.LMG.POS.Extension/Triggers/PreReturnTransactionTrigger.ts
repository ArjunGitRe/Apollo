import * as Triggers from "PosApi/Extend/Triggers/TransactionTriggers";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { StoreOperations } from "../DataService/DataServiceRequests.g";
import {
    SaveExtensionPropertiesOnCartClientRequest,
    SaveExtensionPropertiesOnCartClientResponse
} from "PosApi/Consume/Cart";

export default class PreReturnTransactionTrigger extends Triggers.PreReturnTransactionTrigger {

    public execute(options: Triggers.IPreReturnTransactionTriggerOptions): Promise<ClientEntities.ICancelable> {

        if (!options || !options.cartLinesForReturn || options.cartLinesForReturn.length === 0) {
            return Promise.resolve({ canceled: false });
        }

        let txnId: string = options.cartLinesForReturn[0].ReturnTransactionId;
        if (ObjectExtensions.isNullOrUndefined(txnId) || txnId === "") {
            return Promise.resolve({ canceled: false });
        }

        let request = new StoreOperations.GetShukranCustTransDetailsRequest(txnId);

        return this.context.runtime.executeAsync(request)
            .then((response: ClientEntities.ICancelableDataResult<StoreOperations.GetShukranCustTransDetailsResponse>) => {

                if (response.canceled || ObjectExtensions.isNullOrUndefined(response.data)) {
                    return { canceled: false };
                }

                let result = response.data.result;

                // Guard against missing ShukranCustomerDtls
                if (ObjectExtensions.isNullOrUndefined(result) ||
                    ObjectExtensions.isNullOrUndefined(result.ShukranCustomerDtls)) {
                    this.context.logger.logInformational("Shukran: No ShukranCustomerDtls found for this transaction.");
                    return { canceled: false };
                }

                let profileId: string = result.ShukranCustomerDtls.PROFILEID || "";
                let cardNumber: string = result.ShukranCustomerDtls.CARDNUMBER || "";
                let countryCode: string = result.ShukranCustomerDtls.COUNTRYCODE || "";
                let cashvalue: number = Number(result.ShukranCustomerDtls.REDEMPTIONCASHVALUE || 0);

                if (!profileId && !cardNumber) {
                    this.context.logger.logInformational("Shukran: ProfileId and CardNumber are both empty, skipping.");
                    return { canceled: false };
                }

                // Build properties using SaveExtensionPropertiesOnCartClientRequest
                const strProp = (key: string, value: string): ProxyEntities.CommerceProperty => ({
                    Key: key,
                    Value: { StringValue: value || "" } as ProxyEntities.CommercePropertyValue
                });

                const decimalProp = (key: string, value: number): ProxyEntities.CommerceProperty => ({
                    Key: key,
                    Value: { DecimalValue: value } as ProxyEntities.CommercePropertyValue
                });

                const properties: ProxyEntities.CommerceProperty[] = [
                    strProp("SHUKRAN_PROFILE_ID", profileId),
                    strProp("SHUKRAN_CARDNO", cardNumber),
                    strProp("SHUKRAN_CUST_COUNTRY", countryCode),
                    decimalProp("SHUKRAN_AVAILABLE_PTS_CASHVALUE", cashvalue)
                ];

                const saveRequest = new SaveExtensionPropertiesOnCartClientRequest<SaveExtensionPropertiesOnCartClientResponse>(properties);

                return this.context.runtime.executeAsync(saveRequest)
                    .then((saveResp: ClientEntities.ICancelableDataResult<SaveExtensionPropertiesOnCartClientResponse>) => {
                        if (saveResp && saveResp.canceled) {
                            this.context.logger.logInformational("Shukran: SaveExtensionPropertiesOnCart was cancelled.");
                        } else {
                            this.context.logger.logInformational(`Shukran: Extension properties saved. ProfileId=${profileId}, CardNumber=${cardNumber}`);
                        }
                        return { canceled: false };
                    });
            })
            .catch((err: any) => {
                this.context.logger.logError(`Shukran PreReturnTransactionTrigger error: ${JSON.stringify(err)}`);
                return { canceled: false };
            });
    }
}