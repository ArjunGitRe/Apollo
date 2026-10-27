using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran
{
    public class ShukranTransactionRequest
    {
        [JsonProperty("ProfileId")]
        public string ProfileId { get; set; }

        [JsonProperty("TransactionTypeCode")]
        public string TransactionTypeCode { get; set; }

        [JsonProperty("GrossAmount")]
        public decimal? GrossAmount { get; set; }

        [JsonProperty("TransactionNetTotal")]
        public decimal? TransactionNetTotal { get; set; }

        [JsonProperty("TransactionTotalTax")]
        public decimal? TransactionTotalTax { get; set; }

        [JsonProperty("DiscountAmount")]
        public decimal? DiscountAmount { get; set; }

        [JsonProperty("CardNumber")]
        public string CardNumber { get; set; }

        [JsonProperty("CurrencyCode")]
        public string CurrencyCode { get; set; }

        [JsonProperty("TransactionDateTime")]
        public string TransactionDateTime { get; set; }

        [JsonProperty("StoreCode")]
        public string StoreCode { get; set; }

        [JsonProperty("TransactionNumber")]
        public string TransactionNumber { get; set; }

        [JsonProperty("ProgramCode")]
        public string ProgramCode { get; set; }

        [JsonProperty("DeviceId")]
        public string DeviceId { get; set; }

        [JsonProperty("DeviceUserid")]
        public string DeviceUserid { get; set; }

        [JsonProperty("OriginalTransactionNumber")]
        public string OriginalTransactionNumber { get; set; }

        [JsonProperty("OriginalTransactionDateTime")]
        public string OriginalTransactionDateTime { get; set; }

        [JsonProperty("OriginalStoreCode")]
        public string OriginalStoreCode { get; set; }

        [JsonProperty("ShippingAndHandling")]
        public decimal? ShippingAndHandling { get; set; }

        [JsonProperty("TransactionDetails")]
        public List<TransactionDetail> TransactionDetails { get; set; }

        [JsonProperty("Tenders")]
        public List<TransactionTender> Tenders { get; set; }

        [JsonProperty("JsonExternalData")]
        public TransactionExternalData JsonExternalData { get; set; }
    }
    public class TransactionDetail
    {
        [JsonProperty("DollarValueGross")]
        public decimal DollarValueGross { get; set; }

        [JsonProperty("DollarValueNet")]
        public decimal DollarValueNet { get; set; }

        [JsonProperty("TaxAmount")]
        public decimal TaxAmount { get; set; }

        [JsonProperty("DiscountAmount")]
        public decimal DiscountAmount { get; set; }

        [JsonProperty("ShippingAndHandlingAmount")]
        public decimal ShippingAndHandlingAmount { get; set; }

        [JsonProperty("ItemNumber")]
        public string ItemNumber { get; set; }

        [JsonProperty("ItemNumberTypeCode")]
        public string ItemNumberTypeCode { get; set; }

        [JsonProperty("ItemDescription")]
        public string ItemDescription { get; set; }

        [JsonProperty("Quantity")]
        public decimal Quantity { get; set; }

        [JsonProperty("LineNumber")]
        public int LineNumber { get; set; }

        [JsonProperty("FulfillStoreCode")]
        public string FulfillStoreCode { get; set; }

        [JsonProperty("TransactionDateTime")]
        public string TransactionDateTime { get; set; }

        [JsonProperty("TransactionNumber")]
        public string TransactionNumber { get; set; }

        [JsonProperty("OriginalStoreCode")]
        public string OriginalStoreCode { get; set; }

        [JsonProperty("OriginalTransactionDateTime")]
        public string OriginalTransactionDateTime { get; set; }

        [JsonProperty("OriginalTransactionNumber")]
        public string OriginalTransactionNumber { get; set; }

        [JsonProperty("Uom")]
        public string Uom { get; set; }

        [JsonProperty("JsonExternalData")]
        public TransactionDetailExternalData JsonExternalData { get; set; }
    }
    public class TransactionDetailExternalData
    {
        [JsonProperty("lmsmultiplier")]
        public string lmsmultiplier { get; set; }

        [JsonProperty("PromoCode")]
        public string PromoCode { get; set; }

        [JsonProperty("LMSMultiplier")]
        public string LMSMultiplier { get; set; }

        [JsonProperty("ItemDescription")]
        public string ItemDescription { get; set; }

        [JsonProperty("ItemDescription_AR")]
        public string ItemDescription_AR { get; set; }

        [JsonProperty("SaleFlag")]
        public string SaleFlag { get; set; }

        [JsonProperty("ConceptCode")]
        public string ConceptCode { get; set; }

        [JsonProperty("DepartmentCode")]
        public string DepartmentCode { get; set; }

        [JsonProperty("ProductName")]
        public string ProductName { get; set; }

        [JsonProperty("IsBeautyBay")]
        public string IsBeautyBay { get; set; }

        [JsonProperty("InvoiceTerritory")]
        public string InvoiceTerritory { get; set; }
    }
    public class TransactionTender
    {
        [JsonProperty("TenderCode")]
        public string TenderCode { get; set; }

        [JsonProperty("TenderAmount")]
        public decimal TenderAmount { get; set; }

        [JsonProperty("TransactionDateTime")]
        public string TransactionDateTime { get; set; }

        [JsonProperty("SurrogateNumber")]
        public string SurrogateNumber { get; set; }
    }
    public class TransactionExternalData
    {
        [JsonProperty("VirtualCardIdentifier")]
        public string VirtualCardIdentifier { get; set; }

        [JsonProperty("VendorInvoiceNumber")]
        public string VendorInvoiceNumber { get; set; }

        [JsonProperty("InvoiceTotalQty")]
        public int InvoiceTotalQty { get; set; }

        [JsonProperty("IsCoD")]
        public string IsCoD { get; set; }

        [JsonProperty("ProcessReturnFlag")]
        public string ProcessReturnFlag { get; set; }

        [JsonProperty("IsCancel")]
        public string IsCancel { get; set; }

        [JsonProperty("IsOfflineTransaction")]
        public string IsOfflineTransaction { get; set; }

        [JsonProperty("IsRetroTransaction")]
        public string IsRetroTransaction { get; set; }

        [JsonProperty("IsExternalPartnerTransaction")]
        public string IsExternalPartnerTransaction { get; set; }

        [JsonProperty("CrossBorderFlag")]
        public string CrossBorderFlag { get; set; }

        [JsonProperty("PhoneNumber")]
        public string PhoneNumber { get; set; }

        [JsonProperty("LMSCartId")]
        public string LMSCartId { get; set; }
    }
}
