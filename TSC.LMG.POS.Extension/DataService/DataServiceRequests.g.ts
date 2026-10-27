
/* tslint:disable */
import { ProxyEntities } from "PosApi/Entities";

import { Entities } from "./DataServiceEntities.g";

import { DataServiceRequest, DataServiceResponse } from "PosApi/Consume/DataService";
export { ProxyEntities };

export { Entities };

  export namespace StoreOperations {

  export class GetMobileNumberCountryCodeResponse extends DataServiceResponse {
    public result: Entities.GetCountryCodeDetailsDataResponse;
  }

  export class GetMobileNumberCountryCodeRequest<TResponse extends GetMobileNumberCountryCodeResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(languageId: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "GetMobileNumberCountryCode";
        this._parameters = { languageId: languageId };
        this._isAction = true;
        this._returnType = Entities.GetCountryCodeDetailsDataResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetCityDetailsResponse extends DataServiceResponse {
    public result: Entities.GetAddressCityDataResponse;
  }

  export class GetCityDetailsRequest<TResponse extends GetCityDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(regionId: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "GetCityDetails";
        this._parameters = { regionId: regionId };
        this._isAction = true;
        this._returnType = Entities.GetAddressCityDataResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetCountryRegionDetailsResponse extends DataServiceResponse {
    public result: Entities.GetCountryRegionsDataResponse;
  }

  export class GetCountryRegionDetailsRequest<TResponse extends GetCountryRegionDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(languageId: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "GetCountryRegionDetails";
        this._parameters = { languageId: languageId };
        this._isAction = true;
        this._returnType = Entities.GetCountryRegionsDataResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetGenderDetailsResponse extends DataServiceResponse {
    public result: Entities.GetGenderDetailsResponse;
  }

  export class GetGenderDetailsRequest<TResponse extends GetGenderDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor() {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "GetGenderDetails";
        this._parameters = {  };
        this._isAction = true;
        this._returnType = Entities.GetGenderDetailsResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetPrefixNameDetailsResponse extends DataServiceResponse {
    public result: Entities.GetCustPrefixNameResponse;
  }

  export class GetPrefixNameDetailsRequest<TResponse extends GetPrefixNameDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor() {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "GetPrefixNameDetails";
        this._parameters = {  };
        this._isAction = true;
        this._returnType = Entities.GetCustPrefixNameResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetShukranCountryDetailsResponse extends DataServiceResponse {
    public result: Entities.GetShukranCountryDetailsResponse;
  }

  export class GetShukranCountryDetailsRequest<TResponse extends GetShukranCountryDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(languageId: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "GetShukranCountryDetails";
        this._parameters = { languageId: languageId };
        this._isAction = true;
        this._returnType = Entities.GetShukranCountryDetailsResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetShukranCustTransDetailsResponse extends DataServiceResponse {
    public result: Entities.GetShukranCustomerByTransactionDataResponse;
  }

  export class GetShukranCustTransDetailsRequest<TResponse extends GetShukranCustTransDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(transactionId: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "GetShukranCustTransDetails";
        this._parameters = { transactionId: transactionId };
        this._isAction = true;
        this._returnType = Entities.GetShukranCustomerByTransactionDataResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetLanguageDetailsResponse extends DataServiceResponse {
    public result: Entities.GetLanguageDetailsResponse;
  }

  export class GetLanguageDetailsRequest<TResponse extends GetLanguageDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor() {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "GetLanguageDetails";
        this._parameters = {  };
        this._isAction = true;
        this._returnType = Entities.GetLanguageDetailsResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class SaveShukranCustomerDetailsResponse extends DataServiceResponse {
    public result: Entities.SaveShukranCustomerDataResponse;
  }

  export class SaveShukranCustomerDetailsRequest<TResponse extends SaveShukranCustomerDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(shukranEnrollmentData: Entities.ShukranEnrollmentData) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "SaveShukranCustomerDetails";
        this._parameters = { shukranEnrollmentData: shukranEnrollmentData };
        this._isAction = true;
        this._returnType = Entities.SaveShukranCustomerDataResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class VerifyShukranOTPResponse extends DataServiceResponse {
    public result: Entities.VerifyShukranOTPResponse;
  }

  export class VerifyShukranOTPRequest<TResponse extends VerifyShukranOTPResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(Guid: string, Otp: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "VerifyShukranOTP";
        this._parameters = { Guid: Guid, Otp: Otp };
        this._isAction = true;
        this._returnType = Entities.VerifyShukranOTPResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class ShukranGetProductOffersResponse extends DataServiceResponse {
    public result: Entities.GetProductDiscountOfferIdsDataResponse;
  }

  export class ShukranGetProductOffersRequest<TResponse extends ShukranGetProductOffersResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(offerId: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "ShukranGetProductOffers";
        this._parameters = { offerId: offerId };
        this._isAction = true;
        this._returnType = Entities.GetProductDiscountOfferIdsDataResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class SearchShukranCustomerResponse extends DataServiceResponse {
    public result: Entities.CustomerProfileSearchResponse;
  }

  export class SearchShukranCustomerRequest<TResponse extends SearchShukranCustomerResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(searchType: string, searchValue: string, countryCode: string, scanMode: string, transId: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "SearchShukranCustomer";
        this._parameters = { searchType: searchType, searchValue: searchValue, countryCode: countryCode, scanMode: scanMode, transId: transId };
        this._isAction = true;
        this._returnType = Entities.CustomerProfileSearchResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class CustomerCoupnDetailsResponse extends DataServiceResponse {
    public result: Entities.GetShukranCustomerCouponServiceResponse;
  }

  export class CustomerCoupnDetailsRequest<TResponse extends CustomerCoupnDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(storeCode: string, profileId: string, conceptCode: string, action: string, transId: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "CustomerCoupnDetails";
        this._parameters = { storeCode: storeCode, profileId: profileId, conceptCode: conceptCode, action: action, transId: transId };
        this._isAction = true;
        this._returnType = Entities.GetShukranCustomerCouponServiceResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class EnrollShukranCustomerResponse extends DataServiceResponse {
    public result: Entities.GetShukranCustomerEnrollServiceResponse;
  }

  export class EnrollShukranCustomerRequest<TResponse extends EnrollShukranCustomerResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(enrollCustomerRequest: Entities.EnrollCustomerRequest, transId: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "EnrollShukranCustomer";
        this._parameters = { enrollCustomerRequest: enrollCustomerRequest, transId: transId };
        this._isAction = true;
        this._returnType = Entities.GetShukranCustomerEnrollServiceResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class CustomerEnrollOTPDetailsResponse extends DataServiceResponse {
    public result: Entities.GetShukranEnrollOTPServiceResponse;
  }

  export class CustomerEnrollOTPDetailsRequest<TResponse extends CustomerEnrollOTPDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(mobileNumber: string, territory: string, language: string, customerId: string, otpValue: string, transId: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "CustomerEnrollOTPDetails";
        this._parameters = { mobileNumber: mobileNumber, territory: territory, language: language, customerId: customerId, otpValue: otpValue, transId: transId };
        this._isAction = true;
        this._returnType = Entities.GetShukranEnrollOTPServiceResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class CustomerRedeemOTPDetailsResponse extends DataServiceResponse {
    public result: Entities.GetShukranRedeemOTPServiceResponse;
  }

  export class CustomerRedeemOTPDetailsRequest<TResponse extends CustomerRedeemOTPDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(mobileNumber: string, territory: string, language: string, cardNumber: string, otpValue: string, transId: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "CustomerRedeemOTPDetails";
        this._parameters = { mobileNumber: mobileNumber, territory: territory, language: language, cardNumber: cardNumber, otpValue: otpValue, transId: transId };
        this._isAction = true;
        this._returnType = Entities.GetShukranRedeemOTPServiceResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class CustomerVoucherDetailsResponse extends DataServiceResponse {
    public result: Entities.GetShukranCustomerVoucherServiceResponse;
  }

  export class CustomerVoucherDetailsRequest<TResponse extends CustomerVoucherDetailsResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(profileId: string, storeCode: string, conceptCode: string, disCouponCode: string, voucherCode: string, transId: string, action: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "CustomerVoucherDetails";
        this._parameters = { profileId: profileId, storeCode: storeCode, conceptCode: conceptCode, disCouponCode: disCouponCode, voucherCode: voucherCode, transId: transId, action: action };
        this._isAction = true;
        this._returnType = Entities.GetShukranCustomerVoucherServiceResponse;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class InitiateNITransactionResponse extends DataServiceResponse {
    public result: Entities.NIStartTransaction;
  }

  export class InitiateNITransactionRequest<TResponse extends InitiateNITransactionResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(TransactionId: string, Amount: string, TenderLineNumber: string, OriginalId: string, isRefund: boolean, transactionTypeOverride: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "InitiateNITransaction";
        this._parameters = { TransactionId: TransactionId, Amount: Amount, TenderLineNumber: TenderLineNumber, OriginalId: OriginalId, isRefund: isRefund, transactionTypeOverride: transactionTypeOverride };
        this._isAction = true;
        this._returnType = Entities.NIStartTransaction;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetNITransactionResultResponse extends DataServiceResponse {
    public result: Entities.NIResultTransaction;
  }

  export class GetNITransactionResultRequest<TResponse extends GetNITransactionResultResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(TransactionId: string, SourceId: string, Amount: string, TenderLineNumber: string, PaymentType: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "GetNITransactionResult";
        this._parameters = { TransactionId: TransactionId, SourceId: SourceId, Amount: Amount, TenderLineNumber: TenderLineNumber, PaymentType: PaymentType };
        this._isAction = true;
        this._returnType = Entities.NIResultTransaction;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class CancelCurrentNITransactionResponse extends DataServiceResponse {
    public result: Entities.NIResultTransaction;
  }

  export class CancelCurrentNITransactionRequest<TResponse extends CancelCurrentNITransactionResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(TransactionId: string, SourceId: string, Amount: string, TenderLineNumber: string) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "CancelCurrentNITransaction";
        this._parameters = { TransactionId: TransactionId, SourceId: SourceId, Amount: Amount, TenderLineNumber: TenderLineNumber };
        this._isAction = true;
        this._returnType = Entities.NIResultTransaction;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetSourceResponse extends DataServiceResponse {
    public result: Entities.NIPaymentDetails[];
  }

  export class GetSourceRequest<TResponse extends GetSourceResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(TransactionId: string, LineNum: number) {
        super();

        this._entitySet = "";
        this._entityType = "";
        this._method = "GetSource";
        this._parameters = { TransactionId: TransactionId, LineNum: LineNum };
        this._isAction = true;
        this._returnType = Entities.NIPaymentDetails;
        this._isReturnTypeCollection = true;
        
      }
  }

}
