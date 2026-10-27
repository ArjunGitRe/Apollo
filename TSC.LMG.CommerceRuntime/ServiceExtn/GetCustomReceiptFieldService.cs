using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using Microsoft.Dynamics.Commerce.Runtime.RealtimeServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Services.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using TSC.LMG.Runtime.Messages.Arabic;
using TSC.LMG.Runtime.Messages.Customer;
using TSC.LMG.Runtime.Messages.Network.Receipts;
using TSC.LMG.Runtime.Messages.Network.Transaction;
using TSC.LMG.Runtime.Messages.Receipts;
using TSC.LMG.Runtime.Model.Network.Transactions;
using TSC.LMG.Runtime.Model.Receipts;

namespace TSC.LMG.CommerceRuntime.ServiceExtn
{
    public class GetCustomReceiptFieldService : IRequestHandlerAsync
    {
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {
                    typeof(GetSalesTransactionCustomReceiptFieldServiceRequest)
                };
            }
        }

        public async Task<Response> Execute(Request request)
        {
            Type requestedType = request.GetType();

            if (requestedType == typeof(GetSalesTransactionCustomReceiptFieldServiceRequest))
            {
                return await GetCustomReceiptFieldForSalesTransactionReceipts((GetSalesTransactionCustomReceiptFieldServiceRequest)request).ConfigureAwait(false);
            }
            throw new NotImplementedException();
        }

        private async Task<Response> GetCustomReceiptFieldForSalesTransactionReceipts(GetSalesTransactionCustomReceiptFieldServiceRequest request)
        {
            string receiptFieldName = request.CustomReceiptField;
            SalesOrder salesOrder = request.SalesOrder;
            string storeNumber = salesOrder.StoreId;
            SalesLine salesLine = request.SalesLine;
            string returnValue = string.Empty;
            try
            {
                switch (receiptFieldName.ToUpper())
                {
                    case "TSCARABICDESCRIPTION":
                        {
                            if (request.SalesLine != null)
                            {
                                returnValue = await GetItemNameArabicAsync(salesOrder, request.SalesLine, request.RequestContext).ConfigureAwait(false);
                            }
                            else
                            {
                                returnValue = "";
                            }
                        }
                        break;
                    case "TSCRECEIPTHEADERARABIC":
                        {
                            bool isCreditNote = IsTransactionCreditNote(salesOrder);
                            returnValue = isCreditNote ? "مذكرة الائتمان الضريبي": "الفاتورة الضريبية";

                        }
                        break;
                    case "TSCRECEIPTHEADER":
                        {
                            bool isCreditNote = IsTransactionCreditNote(salesOrder);
                            returnValue = isCreditNote ? "Tax Credit Note" : "Tax Invoice";

                        }
                        break;
                    case "TSCTRANSDATE":
                        {
                            if (salesOrder.CreatedDateTime != null)
                            {
                                returnValue = salesOrder.CreatedDateTime.DateTime.ToString("dd-MM-yyyy");
                            }
                        }
                        break;
                    case "TSCSHUKRANREDEEMED":
                        {
                            var shukranData = await GetShukranTransactionDataAsync(salesOrder, request.RequestContext).ConfigureAwait(false);

                            if (shukranData != null)
                            {
                                returnValue = shukranData.TOTALPOINTSREDEEMED.ToString();
                            }
                            else
                            {
                                returnValue = "0";
                            }
                        }
                        break;
                    case "TSCSHUKRANPOINTSEARNED":
                        {
                            var shukranData = await GetShukranTransactionDataAsync(salesOrder, request.RequestContext).ConfigureAwait(false);

                            if (shukranData != null)
                            {
                                returnValue = shukranData.TOTALPOINTSEARNED.ToString();
                            }
                            else
                            {
                                returnValue = "0";
                            }
                        }
                        break;

                    case "TSCSHUKRANPOINTSBALANCE":
                        {
                            var shukranData = await GetShukranTransactionDataAsync(salesOrder, request.RequestContext).ConfigureAwait(false);

                            if (shukranData != null)
                            {
                                returnValue = shukranData.TOTALPOINTSBALANCE.ToString();
                            }
                            else
                            {
                                returnValue = "0";
                            }
                        }
                        break;

                    case "TSCSHUKRANMEMBERID":
                        {
                            GetShukranCustomerByTransactionDataRequest transRequest = new GetShukranCustomerByTransactionDataRequest(salesOrder.Id);
                            GetShukranCustomerByTransactionDataResponse transResponse = await request.RequestContext.ExecuteAsync<GetShukranCustomerByTransactionDataResponse>(transRequest).ConfigureAwait(false);
                            
                            returnValue = transResponse?.ShukranCustomerDtls?.CARDNUMBER ?? string.Empty;
                        }
                        break;

                    case "TSCVATDETAILS":
                        {
                            returnValue = GetVatDetailsBlock(salesOrder);
                        }
                        break;

                    case "TSCNOOFITEMS":
                        {
                            int lineCount = salesOrder?.SalesLines?.Count(line => !line.IsVoided) ?? 0;
                            returnValue = lineCount.ToString();
                        }
                        break;
                    case "TSCRECEIPTID":
                        {
                            returnValue = salesOrder.ReceiptId ?? string.Empty;

                        }
                        break;
                    case "TSCTOTALAMOUNT":
                        {
                            var validLines = salesOrder.SalesLines?.Where(line => !line.IsVoided).ToList();

                            if (validLines != null && validLines.Any())
                            {
                                decimal totalDiscount = validLines.Sum(line => Math.Abs(line.DiscountAmount));
                                decimal netAmount = validLines.Sum(line => line.TotalAmount);
                                decimal totalAmount = netAmount + totalDiscount;

                                returnValue = totalAmount.ToString("F2");
                            }
                        }
                        break;
                //case "TSCCREDITMEMOBARCODE":
                //{
                //    if (salesOrder.TenderLines != null && salesOrder.TenderLines.Any())
                //    {
                //        var creditMemoTenderLine = salesOrder.TenderLines.FirstOrDefault(t => !string.IsNullOrEmpty(t.CreditMemoId));

                //        if (creditMemoTenderLine != null)
                //        {
                //            returnValue = $"<B: {creditMemoTenderLine.CreditMemoId}>";
                //        }
                //    }

                //}
                //break;
                case "TSCCREDITMEMOBARCODE":
                {
                    if(salesOrder.TenderLines != null && salesOrder.TenderLines.Any ())
                    {
                        var creditMemoTenderLine = salesOrder.TenderLines.LastOrDefault (t => !string.IsNullOrEmpty (t.CreditMemoId));

                        if(creditMemoTenderLine != null)
                        {
                            try
                            {
                                var getCreditMemoRequest = new GetCreditMemoServiceRequest (creditMemoTenderLine.CreditMemoId);
                                var getCreditMemoResponse = await request.RequestContext
                                    .ExecuteAsync<GetCreditMemoServiceResponse> (getCreditMemoRequest)
                                    .ConfigureAwait (false);

                                decimal balance = getCreditMemoResponse?.CreditMemo?.Balance ?? 0;

                                if(balance > 0)
                                {
                                    returnValue = $"<B: {creditMemoTenderLine.CreditMemoId}>";
                                }
                            }
                            catch(Exception ex)
                            {
                                returnValue= string.Empty;
                            }
                        }
                    }
                }
                break;
                case "TSCCREDITMEMOHEADER":
                {
                    if(salesOrder.TenderLines != null && salesOrder.TenderLines.Any ())
                    {
                        var creditMemoTenderLine = salesOrder.TenderLines.LastOrDefault (t => !string.IsNullOrEmpty (t.CreditMemoId));

                        if(creditMemoTenderLine != null)
                        {
                            try
                            {
                                var getCreditMemoRequest = new GetCreditMemoServiceRequest (creditMemoTenderLine.CreditMemoId);
                                var getCreditMemoResponse = await request.RequestContext
                                    .ExecuteAsync<GetCreditMemoServiceResponse> (getCreditMemoRequest)
                                    .ConfigureAwait (false);
                                
                                decimal balance = getCreditMemoResponse?.CreditMemo?.Balance ?? 0;
                                if(balance > 0)
                                {
                                    returnValue = "Credit Note Balance:"+balance;
                                }
                            }
                            catch(Exception ex)
                            {
                                returnValue= string.Empty;
                            }
                        }
                    }
                }
                break;

                case "TSCNIMID":
                {
                    var niDetails = await GetNiPaymentDetailsAsync (request.RequestContext,salesOrder.Id).ConfigureAwait (false);
                    returnValue = niDetails?.MID ?? string.Empty;
                }
                break;

                case "TSCNITID":
                {
                    var niDetails = await GetNiPaymentDetailsAsync (request.RequestContext,salesOrder.Id).ConfigureAwait (false);
                    returnValue = niDetails?.TID ?? string.Empty;
                }
                break;

                case "TSCNIAID":
                {
                    var niDetails = await GetNiPaymentDetailsAsync (request.RequestContext,salesOrder.Id).ConfigureAwait (false);
                    returnValue = niDetails?.AID ?? string.Empty;
                }
                break;

                case "TSCNIAPPROVALCODE":
                {
                    var niDetails = await GetNiPaymentDetailsAsync (request.RequestContext,salesOrder.Id).ConfigureAwait (false);
                    returnValue = niDetails?.AuthCode ?? string.Empty;
                }
                break;

                case "TSCNICARDLABEL":
                {
                    var niDetails = await GetNiPaymentDetailsAsync (request.RequestContext,salesOrder.Id).ConfigureAwait (false);
                    returnValue = niDetails?.Label ?? string.Empty;
                }
                break;

                case "TSCNIRECEIPTNUMBER":
                {
                    var niDetails = await GetNiPaymentDetailsAsync (request.RequestContext,salesOrder.Id).ConfigureAwait (false);
                    returnValue = niDetails?.ReceiptNo ?? string.Empty;
                }
                break;

                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.ToString());
            }
            return new GetCustomReceiptFieldServiceResponse(returnValue);
        }

        private async Task<NIPaymentDetails> GetNiPaymentDetailsAsync ( RequestContext requestContext,string transactionId )
        {
            try
            {
                var niRequest = new GetNiPayDetailsForReceiptRequest (transactionId);
                var niResponse = await requestContext.ExecuteAsync<GetNiPayDetailsForReceiptResponse> (niRequest).ConfigureAwait (false);

                return niResponse?.PaymentNi?.FirstOrDefault ();
            }
            catch(Exception ex)
            {
                return null;
            }
        }

        private async Task<string> GetItemNameArabicAsync(SalesOrder salesOrder, SalesLine salesLine, RequestContext requestContext)
        {
            object arabicNameFetchProp = salesOrder.GetProperty("TSCARABICNAMEFETCHED");
            if (arabicNameFetchProp == null)
            {
                List<long> productIds = new List<long>();
                foreach (SalesLine line in salesOrder.SalesLines)
                {
                    long productId = line.ProductId;
                    productIds.Add(productId);
                }

                GetArabicDescriptionListRequest getRequest = new GetArabicDescriptionListRequest(productIds);
                GetArabicDescriptionListResponse response = await requestContext.ExecuteAsync<GetArabicDescriptionListResponse>(getRequest).ConfigureAwait(false);
                foreach (SalesLine line in salesOrder.SalesLines)
                {
                    string arabicName = response.ProductName.Where(x => x.ProductId == line.ProductId).Select(x => x.Name).FirstOrDefault();
                    line.SetProperty("TSCITEMARABICNAME", arabicName);
                }
                salesOrder.SetProperty("TSCARABICNAMEFETCHED", 1);
            }

            if (salesLine != null)
            {
                object arabicNameProp = salesLine.GetProperty("TSCITEMARABICNAME");
                return arabicNameProp == null ? "" : Convert.ToString(arabicNameProp);
            }
            else
            {
                return "";
            }
        }

        private async Task<ShukranTransDetails> GetShukranTransactionDataAsync(SalesOrder salesOrder, RequestContext context)
        {
            object shukranDataProp = salesOrder.GetProperty("TSCSHUKRANDATA");

            if (shukranDataProp == null)
            {
                GetShukranTransactionDetailsRequest request = new GetShukranTransactionDetailsRequest(salesOrder.Id);
                GetShukranTransactionDetailsResponse response = await context.ExecuteAsync<GetShukranTransactionDetailsResponse>(request).ConfigureAwait(false);

                ShukranTransDetails data = response?.ShukranTransDetails;

                salesOrder.SetProperty("TSCSHUKRANDATA", data);

                return data;

            }

            return shukranDataProp as ShukranTransDetails;
        }

        private string GetVatDetailsBlock(SalesOrder salesOrder)
        {
            if (salesOrder?.SalesLines == null || !salesOrder.SalesLines.Any())
                return string.Empty;

            // Filter out voided lines and lines with no amount
            var validLines = salesOrder.SalesLines
                .Where(line => !line.IsVoided && line.NetAmount != 0)
                .ToList();

            if (!validLines.Any())
                return string.Empty;

            // Dictionary key = "ItemTaxGroupId|TaxRatePercent" to handle
            // same group but different tax rates as separate rows
            var taxGroupDict = new Dictionary<string, (string Code, decimal VatPercent, decimal Taxable, decimal VatAmt, decimal TotalAmt)>();

            foreach (SalesLine line in validLines)
            {
                string code = line.ItemTaxGroupId?.ToUpper() ?? string.Empty;
                decimal taxRate = line.TaxRatePercent;
                decimal netAmt = line.NetAmount;
                decimal taxAmt = line.TaxAmount;
                decimal totalAmt = line.TotalAmount;


                if (taxGroupDict.TryGetValue(code, out var existing))
                {
                    // Same VAT code exists — accumulate amounts into same row
                    taxGroupDict[code] = (
                        existing.Code,
                        existing.VatPercent,
                        existing.Taxable  + netAmt,
                        existing.VatAmt   + taxAmt,
                        existing.TotalAmt + totalAmt
                    );
                }
                else
                {
                    // New VAT code — add new row
                    taxGroupDict[code] = (code, taxRate, netAmt, taxAmt, totalAmt);
                }
            }

            if (!taxGroupDict.Any())
                return string.Empty;

            // Sort by Code then by VatPercent
            var sortedGroups = taxGroupDict.Values.OrderBy(x => x.Code).ToList();

            
            const int colCode = 6;
            const int colVatPct = 7;
            const int colTaxable = 9;
            const int colVatAmt = 9;
            const int colTtlAmt = 9;
            const int totalWidth = colCode + colVatPct + colTaxable + colVatAmt + colTtlAmt; // 40

            var sb = new StringBuilder();

            // Header
            //sb.AppendLine("TAX DETAILS");
            //sb.AppendLine($"TAX DETAILS");
            string header = "CODE".PadRight(colCode)  + "VAT%".PadRight(colVatPct)  + "TAXABLE".PadLeft(colTaxable) + "VAT AMT".PadLeft(colVatAmt) + "TTL AMT".PadLeft(colTtlAmt);
            sb.AppendLine($"{header}");
            //sb.AppendLine(new string('-', totalWidth));   //underLine after Header

            // One row per distinct Code + Tax Rate combination
            foreach (var group in sortedGroups)
            {
                string code = (group.Code.Length > 5 ? group.Code.Substring(0, 5) : group.Code).PadRight(colCode);
                string vatPct = (group.VatPercent.ToString("0.##") + "%").PadRight(colVatPct);
                string taxable = group.Taxable.ToString("F2").PadLeft(colTaxable);
                string vatAmt = group.VatAmt.ToString("F2").PadLeft(colVatAmt);
                string ttlAmt = group.TotalAmt.ToString("F2").PadLeft(colTtlAmt);

                sb.AppendLine($"{code}{vatPct}{taxable}{vatAmt}{ttlAmt}");
            }
            //sb.AppendLine(new string('-', totalWidth));  //UnderLine at end
            return sb.ToString().TrimEnd();
        }

        private bool IsTransactionCreditNote(SalesOrder salesOrder)
        {
            if (salesOrder.IsReturnByReceipt)
            {
                decimal netAmount = salesOrder.SalesLines?.Where(line => !line.IsVoided).Sum(line => line.TotalAmount) ?? 0m;

                return netAmount < 0;
            }
            return false;
        }
    }
}
