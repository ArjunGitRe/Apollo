
  /* tslint:disable */
  import { ProxyEntities } from "PosApi/Entities";
  // @ts-ignore
  import { DateExtensions } from "PosApi/TypeExtensions";
  export { ProxyEntities };

  export namespace Entities {
  
  /**
   * CountryCode entity class.
   */
  export class CountryCode {
      public CountryRegionId: string;
	  public MobileCountryCode: number;
	  public MobileNumberLength: number;
	  public ShortName: string;
	  public LongName: string;
	  public LanguageId: string;
	  public ExtensionProperties: ProxyEntities.CommerceProperty[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.CountryRegionId = odataObject.CountryRegionId;
              
            this.MobileCountryCode = odataObject.MobileCountryCode;
              
            this.MobileNumberLength = odataObject.MobileNumberLength;
              
            this.ShortName = odataObject.ShortName;
              
            this.LongName = odataObject.LongName;
              
            this.LanguageId = odataObject.LanguageId;
              
        this.ExtensionProperties = undefined;
        if (odataObject.ExtensionProperties) {
        this.ExtensionProperties = [];
        for (var i = 0; i < odataObject.ExtensionProperties.length; i++) {
        if (odataObject.ExtensionProperties[i] != null) {
        if (odataObject.ExtensionProperties[i]['@odata.type'] != null) {
        var className: string = odataObject.ExtensionProperties[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.ExtensionProperties[i] = new ProxyEntities[className](odataObject.ExtensionProperties[i])
        } else {
        this.ExtensionProperties[i] = new ProxyEntities.CommercePropertyClass(odataObject.ExtensionProperties[i]);
        }
                    } else {
        this.ExtensionProperties[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * CountryRegion entity class.
   */
  export class CountryRegion {
      public CountryRegionId: string;
	  public Isocode: string;
	  public LongName: string;
	  public ShortName: string;
	  public LanguageId: string;
	  public ExtensionProperties: ProxyEntities.CommerceProperty[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.CountryRegionId = odataObject.CountryRegionId;
              
            this.Isocode = odataObject.Isocode;
              
            this.LongName = odataObject.LongName;
              
            this.ShortName = odataObject.ShortName;
              
            this.LanguageId = odataObject.LanguageId;
              
        this.ExtensionProperties = undefined;
        if (odataObject.ExtensionProperties) {
        this.ExtensionProperties = [];
        for (var i = 0; i < odataObject.ExtensionProperties.length; i++) {
        if (odataObject.ExtensionProperties[i] != null) {
        if (odataObject.ExtensionProperties[i]['@odata.type'] != null) {
        var className: string = odataObject.ExtensionProperties[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.ExtensionProperties[i] = new ProxyEntities[className](odataObject.ExtensionProperties[i])
        } else {
        this.ExtensionProperties[i] = new ProxyEntities.CommercePropertyClass(odataObject.ExtensionProperties[i]);
        }
                    } else {
        this.ExtensionProperties[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * GetCountryCodeDetailsDataResponse entity class.
   */
  export class GetCountryCodeDetailsDataResponse {
      public CountryCodeDetails: Entities.CountryCode[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        this.CountryCodeDetails = undefined;
        if (odataObject.CountryCodeDetails) {
        this.CountryCodeDetails = [];
        for (var i = 0; i < odataObject.CountryCodeDetails.length; i++) {
        if (odataObject.CountryCodeDetails[i] != null) {
        if (odataObject.CountryCodeDetails[i]['@odata.type'] != null) {
        var className: string = odataObject.CountryCodeDetails[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.CountryCodeDetails[i] = new ProxyEntities[className](odataObject.CountryCodeDetails[i])
        } else {
        this.CountryCodeDetails[i] = new Entities.CountryCode(odataObject.CountryCodeDetails[i]);
        }
                    } else {
        this.CountryCodeDetails[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * GetAddressCityDataResponse entity class.
   */
  export class GetAddressCityDataResponse {
      public CityInfos: ProxyEntities.CityInfo[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        this.CityInfos = undefined;
        if (odataObject.CityInfos) {
        this.CityInfos = [];
        for (var i = 0; i < odataObject.CityInfos.length; i++) {
        if (odataObject.CityInfos[i] != null) {
        if (odataObject.CityInfos[i]['@odata.type'] != null) {
        var className: string = odataObject.CityInfos[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.CityInfos[i] = new ProxyEntities[className](odataObject.CityInfos[i])
        } else {
        this.CityInfos[i] = new ProxyEntities.CityInfoClass(odataObject.CityInfos[i]);
        }
                    } else {
        this.CityInfos[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * GetCountryRegionsDataResponse entity class.
   */
  export class GetCountryRegionsDataResponse {
      public CountryRegions: Entities.CountryRegion[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        this.CountryRegions = undefined;
        if (odataObject.CountryRegions) {
        this.CountryRegions = [];
        for (var i = 0; i < odataObject.CountryRegions.length; i++) {
        if (odataObject.CountryRegions[i] != null) {
        if (odataObject.CountryRegions[i]['@odata.type'] != null) {
        var className: string = odataObject.CountryRegions[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.CountryRegions[i] = new ProxyEntities[className](odataObject.CountryRegions[i])
        } else {
        this.CountryRegions[i] = new Entities.CountryRegion(odataObject.CountryRegions[i]);
        }
                    } else {
        this.CountryRegions[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * GetGenderDetailsResponse entity class.
   */
  export class GetGenderDetailsResponse {
      public GenderOptions: Entities.GenderOption[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        this.GenderOptions = undefined;
        if (odataObject.GenderOptions) {
        this.GenderOptions = [];
        for (var i = 0; i < odataObject.GenderOptions.length; i++) {
        if (odataObject.GenderOptions[i] != null) {
        if (odataObject.GenderOptions[i]['@odata.type'] != null) {
        var className: string = odataObject.GenderOptions[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.GenderOptions[i] = new ProxyEntities[className](odataObject.GenderOptions[i])
        } else {
        this.GenderOptions[i] = new Entities.GenderOption(odataObject.GenderOptions[i]);
        }
                    } else {
        this.GenderOptions[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * GetCustPrefixNameResponse entity class.
   */
  export class GetCustPrefixNameResponse {
      public PrefixOptions: Entities.PrefixOption[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        this.PrefixOptions = undefined;
        if (odataObject.PrefixOptions) {
        this.PrefixOptions = [];
        for (var i = 0; i < odataObject.PrefixOptions.length; i++) {
        if (odataObject.PrefixOptions[i] != null) {
        if (odataObject.PrefixOptions[i]['@odata.type'] != null) {
        var className: string = odataObject.PrefixOptions[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.PrefixOptions[i] = new ProxyEntities[className](odataObject.PrefixOptions[i])
        } else {
        this.PrefixOptions[i] = new Entities.PrefixOption(odataObject.PrefixOptions[i]);
        }
                    } else {
        this.PrefixOptions[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * GetShukranCountryDetailsResponse entity class.
   */
  export class GetShukranCountryDetailsResponse {
      public SkrnCountry: Entities.ShukranCountries[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        this.SkrnCountry = undefined;
        if (odataObject.SkrnCountry) {
        this.SkrnCountry = [];
        for (var i = 0; i < odataObject.SkrnCountry.length; i++) {
        if (odataObject.SkrnCountry[i] != null) {
        if (odataObject.SkrnCountry[i]['@odata.type'] != null) {
        var className: string = odataObject.SkrnCountry[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.SkrnCountry[i] = new ProxyEntities[className](odataObject.SkrnCountry[i])
        } else {
        this.SkrnCountry[i] = new Entities.ShukranCountries(odataObject.SkrnCountry[i]);
        }
                    } else {
        this.SkrnCountry[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * GetShukranCustomerByTransactionDataResponse entity class.
   */
  export class GetShukranCustomerByTransactionDataResponse {
      public ShukranCustomerDtls: Entities.ShukranCustomerDtl;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        if (odataObject.ShukranCustomerDtls == null) {
        this.ShukranCustomerDtls = undefined;
        } else if (odataObject.ShukranCustomerDtls['@odata.type'] == null) {
        this.ShukranCustomerDtls = new Entities.ShukranCustomerDtl(odataObject.ShukranCustomerDtls);
        } else {
        var className: string = odataObject.ShukranCustomerDtls['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.ShukranCustomerDtls = new ProxyEntities[className](odataObject.ShukranCustomerDtls)
        }

      
      }
  }

  /**
   * GenderOption entity class.
   */
  export class GenderOption {
      public Text: string;
	  public Value: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.Text = odataObject.Text;
              
            this.Value = odataObject.Value;
              
      }
  }

  /**
   * PrefixOption entity class.
   */
  export class PrefixOption {
      public Text: string;
	  public Value: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.Text = odataObject.Text;
              
            this.Value = odataObject.Value;
              
      }
  }

  /**
   * ShukranCountries entity class.
   */
  export class ShukranCountries {
      public CountryRegionId: string;
	  public LongName: string;
	  public ShortName: string;
	  public LanguageId: string;
	  public ExtensionProperties: ProxyEntities.CommerceProperty[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.CountryRegionId = odataObject.CountryRegionId;
              
            this.LongName = odataObject.LongName;
              
            this.ShortName = odataObject.ShortName;
              
            this.LanguageId = odataObject.LanguageId;
              
        this.ExtensionProperties = undefined;
        if (odataObject.ExtensionProperties) {
        this.ExtensionProperties = [];
        for (var i = 0; i < odataObject.ExtensionProperties.length; i++) {
        if (odataObject.ExtensionProperties[i] != null) {
        if (odataObject.ExtensionProperties[i]['@odata.type'] != null) {
        var className: string = odataObject.ExtensionProperties[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.ExtensionProperties[i] = new ProxyEntities[className](odataObject.ExtensionProperties[i])
        } else {
        this.ExtensionProperties[i] = new ProxyEntities.CommercePropertyClass(odataObject.ExtensionProperties[i]);
        }
                    } else {
        this.ExtensionProperties[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * ShukranCustomerDtl entity class.
   */
  export class ShukranCustomerDtl {
      public PROFILEID: string;
	  public CARDNUMBER: string;
	  public COUNTRYCODE: string;
	  public REDEMPTIONCASHVALUE: string;
	  public ExtensionProperties: ProxyEntities.CommerceProperty[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.PROFILEID = odataObject.PROFILEID;
              
            this.CARDNUMBER = odataObject.CARDNUMBER;
              
            this.COUNTRYCODE = odataObject.COUNTRYCODE;
              
            this.REDEMPTIONCASHVALUE = odataObject.REDEMPTIONCASHVALUE;
              
        this.ExtensionProperties = undefined;
        if (odataObject.ExtensionProperties) {
        this.ExtensionProperties = [];
        for (var i = 0; i < odataObject.ExtensionProperties.length; i++) {
        if (odataObject.ExtensionProperties[i] != null) {
        if (odataObject.ExtensionProperties[i]['@odata.type'] != null) {
        var className: string = odataObject.ExtensionProperties[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.ExtensionProperties[i] = new ProxyEntities[className](odataObject.ExtensionProperties[i])
        } else {
        this.ExtensionProperties[i] = new ProxyEntities.CommercePropertyClass(odataObject.ExtensionProperties[i]);
        }
                    } else {
        this.ExtensionProperties[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * LanguageOption entity class.
   */
  export class LanguageOption {
      public Text: string;
	  public Value: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.Text = odataObject.Text;
              
            this.Value = odataObject.Value;
              
      }
  }

  /**
   * GetLanguageDetailsResponse entity class.
   */
  export class GetLanguageDetailsResponse {
      public LanguageOptions: Entities.LanguageOption[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        this.LanguageOptions = undefined;
        if (odataObject.LanguageOptions) {
        this.LanguageOptions = [];
        for (var i = 0; i < odataObject.LanguageOptions.length; i++) {
        if (odataObject.LanguageOptions[i] != null) {
        if (odataObject.LanguageOptions[i]['@odata.type'] != null) {
        var className: string = odataObject.LanguageOptions[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.LanguageOptions[i] = new ProxyEntities[className](odataObject.LanguageOptions[i])
        } else {
        this.LanguageOptions[i] = new Entities.LanguageOption(odataObject.LanguageOptions[i]);
        }
                    } else {
        this.LanguageOptions[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * ShukranEnrollmentData entity class.
   */
  export class ShukranEnrollmentData {
      public RECID: number;
	  public ProfileId: string;
	  public FirstName: string;
	  public LastName: string;
	  public CardNumber: string;
	  public CountryCode: string;
	  public EmailAddress: string;
	  public PhoneNumber: string;
	  public Status: string;
	  public LanguageCode: string;
	  public JoinDate: Date;
	  public Prefix: string;
	  public Tier: string;
	  public ExtensionProperties: ProxyEntities.CommerceProperty[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.RECID = (odataObject.RECID != null) ? parseInt(odataObject.RECID, 10) : undefined;
              
            this.ProfileId = odataObject.ProfileId;
              
            this.FirstName = odataObject.FirstName;
              
            this.LastName = odataObject.LastName;
              
            this.CardNumber = odataObject.CardNumber;
              
            this.CountryCode = odataObject.CountryCode;
              
            this.EmailAddress = odataObject.EmailAddress;
              
            this.PhoneNumber = odataObject.PhoneNumber;
              
            this.Status = odataObject.Status;
              
            this.LanguageCode = odataObject.LanguageCode;
              
            this.JoinDate = (odataObject.JoinDate instanceof Date) ? odataObject.JoinDate
                : (odataObject.JoinDate != null) ? DateExtensions.convertStringToDateObject(odataObject.JoinDate)  : undefined;
              
            this.Prefix = odataObject.Prefix;
              
            this.Tier = odataObject.Tier;
              
        this.ExtensionProperties = undefined;
        if (odataObject.ExtensionProperties) {
        this.ExtensionProperties = [];
        for (var i = 0; i < odataObject.ExtensionProperties.length; i++) {
        if (odataObject.ExtensionProperties[i] != null) {
        if (odataObject.ExtensionProperties[i]['@odata.type'] != null) {
        var className: string = odataObject.ExtensionProperties[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.ExtensionProperties[i] = new ProxyEntities[className](odataObject.ExtensionProperties[i])
        } else {
        this.ExtensionProperties[i] = new ProxyEntities.CommercePropertyClass(odataObject.ExtensionProperties[i]);
        }
                    } else {
        this.ExtensionProperties[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * CustomerVoucherDetails entity class.
   */
  export class CustomerVoucherDetails {
      public ProfileId: string;
	  public VoucherNumber: string;
	  public AmountOff: string;
	  public VoucherStatus: string;
	  public ConceptCode: string;
	  public DiscountCode: string;
	  public ThresholdAmount: string;
	  public PercentageOff: string;
	  public PrintStartDate: string;
	  public PrintEndDate: string;
	  public StoreCode: string;
	  public OfferDetailsAR: string;
	  public OfferDetailsEN: string;
	  public Status: number;
	  public Message: string;
	  public Success: boolean;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.ProfileId = odataObject.ProfileId;
              
            this.VoucherNumber = odataObject.VoucherNumber;
              
            this.AmountOff = odataObject.AmountOff;
              
            this.VoucherStatus = odataObject.VoucherStatus;
              
            this.ConceptCode = odataObject.ConceptCode;
              
            this.DiscountCode = odataObject.DiscountCode;
              
            this.ThresholdAmount = odataObject.ThresholdAmount;
              
            this.PercentageOff = odataObject.PercentageOff;
              
            this.PrintStartDate = odataObject.PrintStartDate;
              
            this.PrintEndDate = odataObject.PrintEndDate;
              
            this.StoreCode = odataObject.StoreCode;
              
            this.OfferDetailsAR = odataObject.OfferDetailsAR;
              
            this.OfferDetailsEN = odataObject.OfferDetailsEN;
              
            this.Status = odataObject.Status;
              
            this.Message = odataObject.Message;
              
            this.Success = odataObject.Success;
              
      }
  }

  /**
   * SaveShukranCustomerDataResponse entity class.
   */
  export class SaveShukranCustomerDataResponse {
      public IsSuccess: boolean;
	  public Message: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.IsSuccess = odataObject.IsSuccess;
              
            this.Message = odataObject.Message;
              
      }
  }

  /**
   * VerifyShukranOTPResponse entity class.
   */
  export class VerifyShukranOTPResponse {
      public IsValid: boolean;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.IsValid = odataObject.IsValid;
              
      }
  }

  /**
   * ProductOfferIdResult entity class.
   */
  export class ProductOfferIdResult {
      public ProductId: number;
	  public OfferId: string;
	  public CouponCode: string;
	  public ExtensionProperties: ProxyEntities.CommerceProperty[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.ProductId = (odataObject.ProductId != null) ? parseInt(odataObject.ProductId, 10) : undefined;
              
            this.OfferId = odataObject.OfferId;
              
            this.CouponCode = odataObject.CouponCode;
              
        this.ExtensionProperties = undefined;
        if (odataObject.ExtensionProperties) {
        this.ExtensionProperties = [];
        for (var i = 0; i < odataObject.ExtensionProperties.length; i++) {
        if (odataObject.ExtensionProperties[i] != null) {
        if (odataObject.ExtensionProperties[i]['@odata.type'] != null) {
        var className: string = odataObject.ExtensionProperties[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.ExtensionProperties[i] = new ProxyEntities[className](odataObject.ExtensionProperties[i])
        } else {
        this.ExtensionProperties[i] = new ProxyEntities.CommercePropertyClass(odataObject.ExtensionProperties[i]);
        }
                    } else {
        this.ExtensionProperties[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * GetProductDiscountOfferIdsDataResponse entity class.
   */
  export class GetProductDiscountOfferIdsDataResponse {
      public ProductOfferMap: Entities.ProductOfferIdResult[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        this.ProductOfferMap = undefined;
        if (odataObject.ProductOfferMap) {
        this.ProductOfferMap = [];
        for (var i = 0; i < odataObject.ProductOfferMap.length; i++) {
        if (odataObject.ProductOfferMap[i] != null) {
        if (odataObject.ProductOfferMap[i]['@odata.type'] != null) {
        var className: string = odataObject.ProductOfferMap[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.ProductOfferMap[i] = new ProxyEntities[className](odataObject.ProductOfferMap[i])
        } else {
        this.ProductOfferMap[i] = new Entities.ProductOfferIdResult(odataObject.ProductOfferMap[i]);
        }
                    } else {
        this.ProductOfferMap[i] = undefined;
        }
        }
        }
      
      }
  }

  /**
   * Address entity class.
   */
  export class Address {
      public ProfileId: string;
	  public AddressId: string;
	  public CountryCode: string;
	  public SourceCountryCode: string;
	  public ChannelCode: string;
	  public LocationCode: string;
	  public LocationDescription: string;
	  public IsPreferred: boolean;
	  public DeliveryStatus: string;
	  public DeliveryStatusDescription: string;
	  public DoNotStandardize: boolean;
	  public AccountSourceCode: string;
	  public SourceAccountNumber: string;
	  public BrandOrgCode: string;
	  public ActivityDate: Date;
	  public Status: string;
	  public CreateUser: string;
	  public CreateDate: Date;
	  public UpdateUser: string;
	  public UpdateDate: Date;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.ProfileId = odataObject.ProfileId;
              
            this.AddressId = odataObject.AddressId;
              
            this.CountryCode = odataObject.CountryCode;
              
            this.SourceCountryCode = odataObject.SourceCountryCode;
              
            this.ChannelCode = odataObject.ChannelCode;
              
            this.LocationCode = odataObject.LocationCode;
              
            this.LocationDescription = odataObject.LocationDescription;
              
            this.IsPreferred = odataObject.IsPreferred;
              
            this.DeliveryStatus = odataObject.DeliveryStatus;
              
            this.DeliveryStatusDescription = odataObject.DeliveryStatusDescription;
              
            this.DoNotStandardize = odataObject.DoNotStandardize;
              
            this.AccountSourceCode = odataObject.AccountSourceCode;
              
            this.SourceAccountNumber = odataObject.SourceAccountNumber;
              
            this.BrandOrgCode = odataObject.BrandOrgCode;
              
            this.ActivityDate = (odataObject.ActivityDate instanceof Date) ? odataObject.ActivityDate
                : (odataObject.ActivityDate != null) ? DateExtensions.convertStringToDateObject(odataObject.ActivityDate)  : undefined;
              
            this.Status = odataObject.Status;
              
            this.CreateUser = odataObject.CreateUser;
              
            this.CreateDate = (odataObject.CreateDate instanceof Date) ? odataObject.CreateDate
                : (odataObject.CreateDate != null) ? DateExtensions.convertStringToDateObject(odataObject.CreateDate)  : undefined;
              
            this.UpdateUser = odataObject.UpdateUser;
              
            this.UpdateDate = (odataObject.UpdateDate instanceof Date) ? odataObject.UpdateDate
                : (odataObject.UpdateDate != null) ? DateExtensions.convertStringToDateObject(odataObject.UpdateDate)  : undefined;
              
      }
  }

  /**
   * Email entity class.
   */
  export class Email {
      public ProfileId: string;
	  public EmailId: string;
	  public EmailAddress: string;
	  public SourceEmailAddress: string;
	  public ChannelCode: string;
	  public IsPreferred: boolean;
	  public DeliveryStatus: string;
	  public DeliveryStatusDescription: string;
	  public AccountSourceCode: string;
	  public SourceAccountNumber: string;
	  public BrandOrgCode: string;
	  public ActivityDate: Date;
	  public CreateContactPointIndicator: boolean;
	  public Status: string;
	  public CreateUser: string;
	  public CreateDate: Date;
	  public UpdateUser: string;
	  public UpdateDate: Date;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.ProfileId = odataObject.ProfileId;
              
            this.EmailId = odataObject.EmailId;
              
            this.EmailAddress = odataObject.EmailAddress;
              
            this.SourceEmailAddress = odataObject.SourceEmailAddress;
              
            this.ChannelCode = odataObject.ChannelCode;
              
            this.IsPreferred = odataObject.IsPreferred;
              
            this.DeliveryStatus = odataObject.DeliveryStatus;
              
            this.DeliveryStatusDescription = odataObject.DeliveryStatusDescription;
              
            this.AccountSourceCode = odataObject.AccountSourceCode;
              
            this.SourceAccountNumber = odataObject.SourceAccountNumber;
              
            this.BrandOrgCode = odataObject.BrandOrgCode;
              
            this.ActivityDate = (odataObject.ActivityDate instanceof Date) ? odataObject.ActivityDate
                : (odataObject.ActivityDate != null) ? DateExtensions.convertStringToDateObject(odataObject.ActivityDate)  : undefined;
              
            this.CreateContactPointIndicator = odataObject.CreateContactPointIndicator;
              
            this.Status = odataObject.Status;
              
            this.CreateUser = odataObject.CreateUser;
              
            this.CreateDate = (odataObject.CreateDate instanceof Date) ? odataObject.CreateDate
                : (odataObject.CreateDate != null) ? DateExtensions.convertStringToDateObject(odataObject.CreateDate)  : undefined;
              
            this.UpdateUser = odataObject.UpdateUser;
              
            this.UpdateDate = (odataObject.UpdateDate instanceof Date) ? odataObject.UpdateDate
                : (odataObject.UpdateDate != null) ? DateExtensions.convertStringToDateObject(odataObject.UpdateDate)  : undefined;
              
      }
  }

  /**
   * Phone entity class.
   */
  export class Phone {
      public ProfileId: string;
	  public PhoneId: string;
	  public PhoneNumber: string;
	  public SourcePhoneNumber: string;
	  public AcceptsText: boolean;
	  public ChannelCode: string;
	  public IsPreferred: boolean;
	  public DeliveryStatus: string;
	  public DeliveryStatusDescription: string;
	  public AccountSourceCode: string;
	  public SourceAccountNumber: string;
	  public BrandOrgCode: string;
	  public CreateContactPointIndicator: boolean;
	  public Status: string;
	  public CreateDate: Date;
	  public UpdateUser: string;
	  public UpdateDate: Date;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.ProfileId = odataObject.ProfileId;
              
            this.PhoneId = odataObject.PhoneId;
              
            this.PhoneNumber = odataObject.PhoneNumber;
              
            this.SourcePhoneNumber = odataObject.SourcePhoneNumber;
              
            this.AcceptsText = odataObject.AcceptsText;
              
            this.ChannelCode = odataObject.ChannelCode;
              
            this.IsPreferred = odataObject.IsPreferred;
              
            this.DeliveryStatus = odataObject.DeliveryStatus;
              
            this.DeliveryStatusDescription = odataObject.DeliveryStatusDescription;
              
            this.AccountSourceCode = odataObject.AccountSourceCode;
              
            this.SourceAccountNumber = odataObject.SourceAccountNumber;
              
            this.BrandOrgCode = odataObject.BrandOrgCode;
              
            this.CreateContactPointIndicator = odataObject.CreateContactPointIndicator;
              
            this.Status = odataObject.Status;
              
            this.CreateDate = (odataObject.CreateDate instanceof Date) ? odataObject.CreateDate
                : (odataObject.CreateDate != null) ? DateExtensions.convertStringToDateObject(odataObject.CreateDate)  : undefined;
              
            this.UpdateUser = odataObject.UpdateUser;
              
            this.UpdateDate = (odataObject.UpdateDate instanceof Date) ? odataObject.UpdateDate
                : (odataObject.UpdateDate != null) ? DateExtensions.convertStringToDateObject(odataObject.UpdateDate)  : undefined;
              
      }
  }

  /**
   * JsonExternalData entity class.
   */
  export class JsonExternalData {
      public Language: string;
	  public MemberCity: string;
	  public Nationality: string;
	  public AvailablePoints: number;
	  public AvailablePointsCashValue: number;
	  public Consentstatus: string;
	  public IsLMSLinked: string;
	  public ConsentSource: string;
	  public ConsentProvided: Date;
	  public ReqQualTxnForNxtTier: string;
	  public RetTierQualTxn: string;
	  public TierActivity: string;
	  public PreviousTierName: string;
	  public PreviousTierEndDate: string;
	  public TIER_NUDGE_FLAG: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.Language = odataObject.Language;
              
            this.MemberCity = odataObject.MemberCity;
              
            this.Nationality = odataObject.Nationality;
              
            this.AvailablePoints = (odataObject.AvailablePoints != null) ? parseFloat(odataObject.AvailablePoints) : undefined;
              
            this.AvailablePointsCashValue = (odataObject.AvailablePointsCashValue != null) ? parseFloat(odataObject.AvailablePointsCashValue) : undefined;
              
            this.Consentstatus = odataObject.Consentstatus;
              
            this.IsLMSLinked = odataObject.IsLMSLinked;
              
            this.ConsentSource = odataObject.ConsentSource;
              
            this.ConsentProvided = (odataObject.ConsentProvided instanceof Date) ? odataObject.ConsentProvided
                : (odataObject.ConsentProvided != null) ? DateExtensions.convertStringToDateObject(odataObject.ConsentProvided)  : undefined;
              
            this.ReqQualTxnForNxtTier = odataObject.ReqQualTxnForNxtTier;
              
            this.RetTierQualTxn = odataObject.RetTierQualTxn;
              
            this.TierActivity = odataObject.TierActivity;
              
            this.PreviousTierName = odataObject.PreviousTierName;
              
            this.PreviousTierEndDate = odataObject.PreviousTierEndDate;
              
            this.TIER_NUDGE_FLAG = odataObject.TIER_NUDGE_FLAG;
              
      }
  }

  /**
   * CustomerProfileDetails entity class.
   */
  export class CustomerProfileDetails {
      public QualifyingTranxCount: string;
	  public LastEvaluateDate: Date;
	  public TierExpiryDate: string;
	  public ProfileId: string;
	  public Prefix: string;
	  public SourcePrefix: string;
	  public FirstName: string;
	  public SourceFirstName: string;
	  public LastName: string;
	  public SourceLastName: string;
	  public GlobalOptOut: boolean;
	  public LanguageCode: string;
	  public Gender: string;
	  public BirthDate: string;
	  public SourceGender: string;
	  public Country: string;
	  public InLinkedPool: boolean;
	  public InBusinessLinkedPool: boolean;
	  public Addresses: Entities.Address[];
	  public Emails: Entities.Email[];
	  public Phones: Entities.Phone[];
	  public ProgramCode: string;
	  public SourceCode: string;
	  public EnrollmentStatus: string;
	  public JoinDate: Date;
	  public EnrollChannelCode: string;
	  public TierCode: string;
	  public TierName: string;
	  public TierStartDate: Date;
	  public CardNumber: string;
	  public AccountSourceCode: string;
	  public SourceAccountNumber: string;
	  public BrandOrgCode: string;
	  public ActivityDate: Date;
	  public AutoRewardOptInInd: boolean;
	  public EnrollmentStoreCode: string;
	  public EnrollmentStoreName: string;
	  public IsSocialMediaProfile: boolean;
	  public IsEnrollmentActivation: boolean;
	  public IsEnrollmentEmailReminder: boolean;
	  public BypassRequiredFields: boolean;
	  public IsTestProfile: boolean;
	  public IsUpdate: boolean;
	  public IsAddProfile: boolean;
	  public ReturnRawMomentData: boolean;
	  public SkipMomentEngine: boolean;
	  public CreateUser: string;
	  public CreateDate: Date;
	  public UpdateUser: string;
	  public UpdateDate: Date;
	  public JsonExternalData: Entities.JsonExternalData;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.QualifyingTranxCount = odataObject.QualifyingTranxCount;
              
            this.LastEvaluateDate = (odataObject.LastEvaluateDate instanceof Date) ? odataObject.LastEvaluateDate
                : (odataObject.LastEvaluateDate != null) ? DateExtensions.convertStringToDateObject(odataObject.LastEvaluateDate)  : undefined;
              
            this.TierExpiryDate = odataObject.TierExpiryDate;
              
            this.ProfileId = odataObject.ProfileId;
              
            this.Prefix = odataObject.Prefix;
              
            this.SourcePrefix = odataObject.SourcePrefix;
              
            this.FirstName = odataObject.FirstName;
              
            this.SourceFirstName = odataObject.SourceFirstName;
              
            this.LastName = odataObject.LastName;
              
            this.SourceLastName = odataObject.SourceLastName;
              
            this.GlobalOptOut = odataObject.GlobalOptOut;
              
            this.LanguageCode = odataObject.LanguageCode;
              
            this.Gender = odataObject.Gender;
              
            this.BirthDate = odataObject.BirthDate;
              
            this.SourceGender = odataObject.SourceGender;
              
            this.Country = odataObject.Country;
              
            this.InLinkedPool = odataObject.InLinkedPool;
              
            this.InBusinessLinkedPool = odataObject.InBusinessLinkedPool;
              
        this.Addresses = undefined;
        if (odataObject.Addresses) {
        this.Addresses = [];
        for (var i = 0; i < odataObject.Addresses.length; i++) {
        if (odataObject.Addresses[i] != null) {
        if (odataObject.Addresses[i]['@odata.type'] != null) {
        var className: string = odataObject.Addresses[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.Addresses[i] = new ProxyEntities[className](odataObject.Addresses[i])
        } else {
        this.Addresses[i] = new Entities.Address(odataObject.Addresses[i]);
        }
                    } else {
        this.Addresses[i] = undefined;
        }
        }
        }
      
        this.Emails = undefined;
        if (odataObject.Emails) {
        this.Emails = [];
        for (var i = 0; i < odataObject.Emails.length; i++) {
        if (odataObject.Emails[i] != null) {
        if (odataObject.Emails[i]['@odata.type'] != null) {
        var className: string = odataObject.Emails[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.Emails[i] = new ProxyEntities[className](odataObject.Emails[i])
        } else {
        this.Emails[i] = new Entities.Email(odataObject.Emails[i]);
        }
                    } else {
        this.Emails[i] = undefined;
        }
        }
        }
      
        this.Phones = undefined;
        if (odataObject.Phones) {
        this.Phones = [];
        for (var i = 0; i < odataObject.Phones.length; i++) {
        if (odataObject.Phones[i] != null) {
        if (odataObject.Phones[i]['@odata.type'] != null) {
        var className: string = odataObject.Phones[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.Phones[i] = new ProxyEntities[className](odataObject.Phones[i])
        } else {
        this.Phones[i] = new Entities.Phone(odataObject.Phones[i]);
        }
                    } else {
        this.Phones[i] = undefined;
        }
        }
        }
      
            this.ProgramCode = odataObject.ProgramCode;
              
            this.SourceCode = odataObject.SourceCode;
              
            this.EnrollmentStatus = odataObject.EnrollmentStatus;
              
            this.JoinDate = (odataObject.JoinDate instanceof Date) ? odataObject.JoinDate
                : (odataObject.JoinDate != null) ? DateExtensions.convertStringToDateObject(odataObject.JoinDate)  : undefined;
              
            this.EnrollChannelCode = odataObject.EnrollChannelCode;
              
            this.TierCode = odataObject.TierCode;
              
            this.TierName = odataObject.TierName;
              
            this.TierStartDate = (odataObject.TierStartDate instanceof Date) ? odataObject.TierStartDate
                : (odataObject.TierStartDate != null) ? DateExtensions.convertStringToDateObject(odataObject.TierStartDate)  : undefined;
              
            this.CardNumber = odataObject.CardNumber;
              
            this.AccountSourceCode = odataObject.AccountSourceCode;
              
            this.SourceAccountNumber = odataObject.SourceAccountNumber;
              
            this.BrandOrgCode = odataObject.BrandOrgCode;
              
            this.ActivityDate = (odataObject.ActivityDate instanceof Date) ? odataObject.ActivityDate
                : (odataObject.ActivityDate != null) ? DateExtensions.convertStringToDateObject(odataObject.ActivityDate)  : undefined;
              
            this.AutoRewardOptInInd = odataObject.AutoRewardOptInInd;
              
            this.EnrollmentStoreCode = odataObject.EnrollmentStoreCode;
              
            this.EnrollmentStoreName = odataObject.EnrollmentStoreName;
              
            this.IsSocialMediaProfile = odataObject.IsSocialMediaProfile;
              
            this.IsEnrollmentActivation = odataObject.IsEnrollmentActivation;
              
            this.IsEnrollmentEmailReminder = odataObject.IsEnrollmentEmailReminder;
              
            this.BypassRequiredFields = odataObject.BypassRequiredFields;
              
            this.IsTestProfile = odataObject.IsTestProfile;
              
            this.IsUpdate = odataObject.IsUpdate;
              
            this.IsAddProfile = odataObject.IsAddProfile;
              
            this.ReturnRawMomentData = odataObject.ReturnRawMomentData;
              
            this.SkipMomentEngine = odataObject.SkipMomentEngine;
              
            this.CreateUser = odataObject.CreateUser;
              
            this.CreateDate = (odataObject.CreateDate instanceof Date) ? odataObject.CreateDate
                : (odataObject.CreateDate != null) ? DateExtensions.convertStringToDateObject(odataObject.CreateDate)  : undefined;
              
            this.UpdateUser = odataObject.UpdateUser;
              
            this.UpdateDate = (odataObject.UpdateDate instanceof Date) ? odataObject.UpdateDate
                : (odataObject.UpdateDate != null) ? DateExtensions.convertStringToDateObject(odataObject.UpdateDate)  : undefined;
              
        if (odataObject.JsonExternalData == null) {
        this.JsonExternalData = undefined;
        } else if (odataObject.JsonExternalData['@odata.type'] == null) {
        this.JsonExternalData = new Entities.JsonExternalData(odataObject.JsonExternalData);
        } else {
        var className: string = odataObject.JsonExternalData['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.JsonExternalData = new ProxyEntities[className](odataObject.JsonExternalData)
        }

      
      }
  }

  /**
   * CustomerProfileSearchResponse entity class.
   */
  export class CustomerProfileSearchResponse {
      public CustomerProfileDetails: Entities.CustomerProfileDetails;
	  public StoreCountryCode: string;
	  public ShukranCustAccount: string;
	  public Status: number;
	  public Message: string;
	  public Success: boolean;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        if (odataObject.CustomerProfileDetails == null) {
        this.CustomerProfileDetails = undefined;
        } else if (odataObject.CustomerProfileDetails['@odata.type'] == null) {
        this.CustomerProfileDetails = new Entities.CustomerProfileDetails(odataObject.CustomerProfileDetails);
        } else {
        var className: string = odataObject.CustomerProfileDetails['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.CustomerProfileDetails = new ProxyEntities[className](odataObject.CustomerProfileDetails)
        }

      
            this.StoreCountryCode = odataObject.StoreCountryCode;
              
            this.ShukranCustAccount = odataObject.ShukranCustAccount;
              
            this.Status = odataObject.Status;
              
            this.Message = odataObject.Message;
              
            this.Success = odataObject.Success;
              
      }
  }

  /**
   * CustomerCouponDetails entity class.
   */
  export class CustomerCouponDetails {
      public AmountOff: string;
	  public RedeemStartDate: string;
	  public VoucherStatus: string;
	  public RedeemEndDate: string;
	  public ConceptCode: string;
	  public DiscountCode: string;
	  public ThresholdAmount: number;
	  public OfferDetailsAR: string;
	  public OfferDetailsEN: string;
	  public MemberCardNumber: string;
	  public PercentageOff: string;
	  public PrintStartDate: string;
	  public PrintEndDate: string;
	  public StoreCode: string;
	  public ProfileId: string;
	  public VoucherNumber: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.AmountOff = odataObject.AmountOff;
              
            this.RedeemStartDate = odataObject.RedeemStartDate;
              
            this.VoucherStatus = odataObject.VoucherStatus;
              
            this.RedeemEndDate = odataObject.RedeemEndDate;
              
            this.ConceptCode = odataObject.ConceptCode;
              
            this.DiscountCode = odataObject.DiscountCode;
              
            this.ThresholdAmount = (odataObject.ThresholdAmount != null) ? parseFloat(odataObject.ThresholdAmount) : undefined;
              
            this.OfferDetailsAR = odataObject.OfferDetailsAR;
              
            this.OfferDetailsEN = odataObject.OfferDetailsEN;
              
            this.MemberCardNumber = odataObject.MemberCardNumber;
              
            this.PercentageOff = odataObject.PercentageOff;
              
            this.PrintStartDate = odataObject.PrintStartDate;
              
            this.PrintEndDate = odataObject.PrintEndDate;
              
            this.StoreCode = odataObject.StoreCode;
              
            this.ProfileId = odataObject.ProfileId;
              
            this.VoucherNumber = odataObject.VoucherNumber;
              
      }
  }

  /**
   * CustomerCouponResult entity class.
   */
  export class CustomerCouponResult {
      public Coupons: Entities.CustomerCouponDetails[];
	  public Success: boolean;
	  public Message: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        this.Coupons = undefined;
        if (odataObject.Coupons) {
        this.Coupons = [];
        for (var i = 0; i < odataObject.Coupons.length; i++) {
        if (odataObject.Coupons[i] != null) {
        if (odataObject.Coupons[i]['@odata.type'] != null) {
        var className: string = odataObject.Coupons[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.Coupons[i] = new ProxyEntities[className](odataObject.Coupons[i])
        } else {
        this.Coupons[i] = new Entities.CustomerCouponDetails(odataObject.Coupons[i]);
        }
                    } else {
        this.Coupons[i] = undefined;
        }
        }
        }
      
            this.Success = odataObject.Success;
              
            this.Message = odataObject.Message;
              
      }
  }

  /**
   * EnrollEmail entity class.
   */
  export class EnrollEmail {
      public EmailAddress: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.EmailAddress = odataObject.EmailAddress;
              
      }
  }

  /**
   * EnrollPhone entity class.
   */
  export class EnrollPhone {
      public PhoneNumber: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.PhoneNumber = odataObject.PhoneNumber;
              
      }
  }

  /**
   * EnrollConsent entity class.
   */
  export class EnrollConsent {
      public ProvidedDate: string;
	  public Source: string;
	  public Status: string;
	  public Segment: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.ProvidedDate = odataObject.ProvidedDate;
              
            this.Source = odataObject.Source;
              
            this.Status = odataObject.Status;
              
            this.Segment = odataObject.Segment;
              
      }
  }

  /**
   * EnrollJsonExternalData entity class.
   */
  export class EnrollJsonExternalData {
      public CashierID: string;
	  public EnrollmentInvoiceNumber: string;
	  public LandLineNumber: string;
	  public Nationality: string;
	  public PH_OTPVerified: string;
	  public ActivatedIn: string;
	  public ActivatedLanguauge: string;
	  public ActivationDate: string;
	  public LMG_PDPL_Flag: string;
	  public Consent: Entities.EnrollConsent;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.CashierID = odataObject.CashierID;
              
            this.EnrollmentInvoiceNumber = odataObject.EnrollmentInvoiceNumber;
              
            this.LandLineNumber = odataObject.LandLineNumber;
              
            this.Nationality = odataObject.Nationality;
              
            this.PH_OTPVerified = odataObject.PH_OTPVerified;
              
            this.ActivatedIn = odataObject.ActivatedIn;
              
            this.ActivatedLanguauge = odataObject.ActivatedLanguauge;
              
            this.ActivationDate = odataObject.ActivationDate;
              
            this.LMG_PDPL_Flag = odataObject.LMG_PDPL_Flag;
              
        if (odataObject.Consent == null) {
        this.Consent = undefined;
        } else if (odataObject.Consent['@odata.type'] == null) {
        this.Consent = new Entities.EnrollConsent(odataObject.Consent);
        } else {
        var className: string = odataObject.Consent['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.Consent = new ProxyEntities[className](odataObject.Consent)
        }

      
      }
  }

  /**
   * EnrollCustomerRequest entity class.
   */
  export class EnrollCustomerRequest {
      public FirstName: string;
	  public LastName: string;
	  public City: string;
	  public Gender: string;
	  public BirthDate: string;
	  public Prefix: string;
	  public Emails: Entities.EnrollEmail[];
	  public Phones: Entities.EnrollPhone[];
	  public SourceCode: string;
	  public EnrollmentStoreCode: string;
	  public LanguageCode: string;
	  public JoinDate: string;
	  public CardNumber: string;
	  public EnrollChannelCode: string;
	  public JsonExternalData: Entities.EnrollJsonExternalData;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.FirstName = odataObject.FirstName;
              
            this.LastName = odataObject.LastName;
              
            this.City = odataObject.City;
              
            this.Gender = odataObject.Gender;
              
            this.BirthDate = odataObject.BirthDate;
              
            this.Prefix = odataObject.Prefix;
              
        this.Emails = undefined;
        if (odataObject.Emails) {
        this.Emails = [];
        for (var i = 0; i < odataObject.Emails.length; i++) {
        if (odataObject.Emails[i] != null) {
        if (odataObject.Emails[i]['@odata.type'] != null) {
        var className: string = odataObject.Emails[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.Emails[i] = new ProxyEntities[className](odataObject.Emails[i])
        } else {
        this.Emails[i] = new Entities.EnrollEmail(odataObject.Emails[i]);
        }
                    } else {
        this.Emails[i] = undefined;
        }
        }
        }
      
        this.Phones = undefined;
        if (odataObject.Phones) {
        this.Phones = [];
        for (var i = 0; i < odataObject.Phones.length; i++) {
        if (odataObject.Phones[i] != null) {
        if (odataObject.Phones[i]['@odata.type'] != null) {
        var className: string = odataObject.Phones[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.Phones[i] = new ProxyEntities[className](odataObject.Phones[i])
        } else {
        this.Phones[i] = new Entities.EnrollPhone(odataObject.Phones[i]);
        }
                    } else {
        this.Phones[i] = undefined;
        }
        }
        }
      
            this.SourceCode = odataObject.SourceCode;
              
            this.EnrollmentStoreCode = odataObject.EnrollmentStoreCode;
              
            this.LanguageCode = odataObject.LanguageCode;
              
            this.JoinDate = odataObject.JoinDate;
              
            this.CardNumber = odataObject.CardNumber;
              
            this.EnrollChannelCode = odataObject.EnrollChannelCode;
              
        if (odataObject.JsonExternalData == null) {
        this.JsonExternalData = undefined;
        } else if (odataObject.JsonExternalData['@odata.type'] == null) {
        this.JsonExternalData = new Entities.EnrollJsonExternalData(odataObject.JsonExternalData);
        } else {
        var className: string = odataObject.JsonExternalData['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.JsonExternalData = new ProxyEntities[className](odataObject.JsonExternalData)
        }

      
      }
  }

  /**
   * EnrollCustomerDetails entity class.
   */
  export class EnrollCustomerDetails {
      public ProfileId: string;
	  public CardNumber: string;
	  public Status: number;
	  public Message: string;
	  public Success: boolean;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.ProfileId = odataObject.ProfileId;
              
            this.CardNumber = odataObject.CardNumber;
              
            this.Status = odataObject.Status;
              
            this.Message = odataObject.Message;
              
            this.Success = odataObject.Success;
              
      }
  }

  /**
   * CustomerEnrollOTPDetails entity class.
   */
  export class CustomerEnrollOTPDetails {
      public errorMessage: string;
	  public recipientId: number;
	  public success: boolean;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.errorMessage = odataObject.errorMessage;
              
            this.recipientId = (odataObject.recipientId != null) ? parseInt(odataObject.recipientId, 10) : undefined;
              
            this.success = odataObject.success;
              
      }
  }

  /**
   * CustomerRedeemOTPDetails entity class.
   */
  export class CustomerRedeemOTPDetails {
      public errorMessage: string;
	  public recipientId: number;
	  public success: boolean;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.errorMessage = odataObject.errorMessage;
              
            this.recipientId = (odataObject.recipientId != null) ? parseInt(odataObject.recipientId, 10) : undefined;
              
            this.success = odataObject.success;
              
      }
  }

  /**
   * GetShukranCustomerCouponServiceResponse entity class.
   */
  export class GetShukranCustomerCouponServiceResponse {
      public CustomerCouponDetails: Entities.CustomerCouponResult;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        if (odataObject.CustomerCouponDetails == null) {
        this.CustomerCouponDetails = undefined;
        } else if (odataObject.CustomerCouponDetails['@odata.type'] == null) {
        this.CustomerCouponDetails = new Entities.CustomerCouponResult(odataObject.CustomerCouponDetails);
        } else {
        var className: string = odataObject.CustomerCouponDetails['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.CustomerCouponDetails = new ProxyEntities[className](odataObject.CustomerCouponDetails)
        }

      
      }
  }

  /**
   * GetShukranCustomerEnrollServiceResponse entity class.
   */
  export class GetShukranCustomerEnrollServiceResponse {
      public EnrollmentResult: Entities.EnrollCustomerDetails;
	  public Success: boolean;
	  public Message: string;
	  public ShukranCustAccount: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        if (odataObject.EnrollmentResult == null) {
        this.EnrollmentResult = undefined;
        } else if (odataObject.EnrollmentResult['@odata.type'] == null) {
        this.EnrollmentResult = new Entities.EnrollCustomerDetails(odataObject.EnrollmentResult);
        } else {
        var className: string = odataObject.EnrollmentResult['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.EnrollmentResult = new ProxyEntities[className](odataObject.EnrollmentResult)
        }

      
            this.Success = odataObject.Success;
              
            this.Message = odataObject.Message;
              
            this.ShukranCustAccount = odataObject.ShukranCustAccount;
              
      }
  }

  /**
   * GetShukranEnrollOTPServiceResponse entity class.
   */
  export class GetShukranEnrollOTPServiceResponse {
      public OTPDetails: Entities.CustomerEnrollOTPDetails;
	  public Success: boolean;
	  public Message: string;
	  public Guid: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        if (odataObject.OTPDetails == null) {
        this.OTPDetails = undefined;
        } else if (odataObject.OTPDetails['@odata.type'] == null) {
        this.OTPDetails = new Entities.CustomerEnrollOTPDetails(odataObject.OTPDetails);
        } else {
        var className: string = odataObject.OTPDetails['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.OTPDetails = new ProxyEntities[className](odataObject.OTPDetails)
        }

      
            this.Success = odataObject.Success;
              
            this.Message = odataObject.Message;
              
            this.Guid = odataObject.Guid;
              
      }
  }

  /**
   * GetShukranRedeemOTPServiceResponse entity class.
   */
  export class GetShukranRedeemOTPServiceResponse {
      public OTPDetails: Entities.CustomerRedeemOTPDetails;
	  public Success: boolean;
	  public Message: string;
	  public Guid: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        if (odataObject.OTPDetails == null) {
        this.OTPDetails = undefined;
        } else if (odataObject.OTPDetails['@odata.type'] == null) {
        this.OTPDetails = new Entities.CustomerRedeemOTPDetails(odataObject.OTPDetails);
        } else {
        var className: string = odataObject.OTPDetails['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.OTPDetails = new ProxyEntities[className](odataObject.OTPDetails)
        }

      
            this.Success = odataObject.Success;
              
            this.Message = odataObject.Message;
              
            this.Guid = odataObject.Guid;
              
      }
  }

  /**
   * CustomerVoucherResult entity class.
   */
  export class CustomerVoucherResult {
      public Vouchers: Entities.CustomerVoucherDetails[];
	  public Success: boolean;
	  public Message: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        this.Vouchers = undefined;
        if (odataObject.Vouchers) {
        this.Vouchers = [];
        for (var i = 0; i < odataObject.Vouchers.length; i++) {
        if (odataObject.Vouchers[i] != null) {
        if (odataObject.Vouchers[i]['@odata.type'] != null) {
        var className: string = odataObject.Vouchers[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.Vouchers[i] = new ProxyEntities[className](odataObject.Vouchers[i])
        } else {
        this.Vouchers[i] = new Entities.CustomerVoucherDetails(odataObject.Vouchers[i]);
        }
                    } else {
        this.Vouchers[i] = undefined;
        }
        }
        }
      
            this.Success = odataObject.Success;
              
            this.Message = odataObject.Message;
              
      }
  }

  /**
   * GetShukranCustomerVoucherServiceResponse entity class.
   */
  export class GetShukranCustomerVoucherServiceResponse {
      public VoucherResult: Entities.CustomerVoucherResult;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
        if (odataObject.VoucherResult == null) {
        this.VoucherResult = undefined;
        } else if (odataObject.VoucherResult['@odata.type'] == null) {
        this.VoucherResult = new Entities.CustomerVoucherResult(odataObject.VoucherResult);
        } else {
        var className: string = odataObject.VoucherResult['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.VoucherResult = new ProxyEntities[className](odataObject.VoucherResult)
        }

      
      }
  }

  /**
   * NIStartTransaction entity class.
   */
  export class NIStartTransaction {
      public Id: number;
	  public SourceId: string;
	  public respCode: string;
	  public respMsg: string;
	  public errCode: string;
	  public errMsg: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.Id = odataObject.Id;
              
            this.SourceId = odataObject.SourceId;
              
            this.respCode = odataObject.respCode;
              
            this.respMsg = odataObject.respMsg;
              
            this.errCode = odataObject.errCode;
              
            this.errMsg = odataObject.errMsg;
              
      }
  }

  /**
   * NIResultTransaction entity class.
   */
  export class NIResultTransaction {
      public Id: number;
	  public SourceId: string;
	  public respCode: string;
	  public respMsg: string;
	  public errCode: string;
	  public errMsg: string;
	  public Amount: string;
	  public CardType: string;
	  public PanMasked: string;
	  public AuthCode: string;
	  public Rrn: string;
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.Id = odataObject.Id;
              
            this.SourceId = odataObject.SourceId;
              
            this.respCode = odataObject.respCode;
              
            this.respMsg = odataObject.respMsg;
              
            this.errCode = odataObject.errCode;
              
            this.errMsg = odataObject.errMsg;
              
            this.Amount = odataObject.Amount;
              
            this.CardType = odataObject.CardType;
              
            this.PanMasked = odataObject.PanMasked;
              
            this.AuthCode = odataObject.AuthCode;
              
            this.Rrn = odataObject.Rrn;
              
      }
  }

  /**
   * NIPaymentDetails entity class.
   */
  export class NIPaymentDetails {
      public TransactionId: string;
	  public SourceId: string;
	  public Amount: number;
	  public TransactionDate: Date;
	  public LineNum: number;
	  public PaymentId: string;
	  public MID: string;
	  public TID: string;
	  public AID: string;
	  public AuthCode: string;
	  public Label: string;
	  public ReceiptNo: string;
	  public ExtensionProperties: ProxyEntities.CommerceProperty[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.TransactionId = odataObject.TransactionId;
              
            this.SourceId = odataObject.SourceId;
              
            this.Amount = (odataObject.Amount != null) ? parseFloat(odataObject.Amount) : undefined;
              
            this.TransactionDate = (odataObject.TransactionDate instanceof Date) ? odataObject.TransactionDate
                : (odataObject.TransactionDate != null) ? DateExtensions.convertStringToDateObject(odataObject.TransactionDate)  : undefined;
              
            this.LineNum = (odataObject.LineNum != null) ? parseFloat(odataObject.LineNum) : undefined;
              
            this.PaymentId = odataObject.PaymentId;
              
            this.MID = odataObject.MID;
              
            this.TID = odataObject.TID;
              
            this.AID = odataObject.AID;
              
            this.AuthCode = odataObject.AuthCode;
              
            this.Label = odataObject.Label;
              
            this.ReceiptNo = odataObject.ReceiptNo;
              
        this.ExtensionProperties = undefined;
        if (odataObject.ExtensionProperties) {
        this.ExtensionProperties = [];
        for (var i = 0; i < odataObject.ExtensionProperties.length; i++) {
        if (odataObject.ExtensionProperties[i] != null) {
        if (odataObject.ExtensionProperties[i]['@odata.type'] != null) {
        var className: string = odataObject.ExtensionProperties[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.ExtensionProperties[i] = new ProxyEntities[className](odataObject.ExtensionProperties[i])
        } else {
        this.ExtensionProperties[i] = new ProxyEntities.CommercePropertyClass(odataObject.ExtensionProperties[i]);
        }
                    } else {
        this.ExtensionProperties[i] = undefined;
        }
        }
        }
      
      }
  }

}
