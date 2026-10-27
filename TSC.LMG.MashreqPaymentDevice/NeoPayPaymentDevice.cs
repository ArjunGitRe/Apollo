using Microsoft.Dynamics.Commerce.HardwareStation;
using Microsoft.Dynamics.Commerce.HardwareStation.CardPayment;
using Microsoft.Dynamics.Commerce.HardwareStation.PeripheralRequests;
using Microsoft.Dynamics.Commerce.HardwareStation.Peripherals;
using Microsoft.Dynamics.Commerce.HardwareStation.Peripherals.Entities;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.Handlers;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using Microsoft.Dynamics.Retail.PaymentSDK.Portable;
using Microsoft.Dynamics.Retail.PaymentSDK.Portable.Constants;
using sgEftInterface;
using sgEftInterface.Configuration;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Common;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;
using System.Xml;
using System.Xml.Linq;
using PaySdk = Microsoft.Dynamics.Retail.PaymentSDK.Portable;

namespace Contoso.HardwareStation.Peripherals.PaymentDevice
{
#pragma warning disable CS0618 // Type or member is obsolete. JUSTIFICATION: TODO: transform to asynchronous handler
    public class NeoPayPaymentDevice : INamedRequestHandler, IDisposable
#pragma warning restore CS0618 // Type or member is obsolete
    {

        private PaySdk.PaymentProperty[] merchantProperties;
        private string paymentConnectorName;
        private SettingsInfo terminalSettings;
        private CancellationTokenSource timeoutTask;
        private string eftComPort;
        //private string currentMessage;
        sgEftInterfaceSyncWrapper.sgEftInterfaceSyncWrapper _eftInterface;

        /// <summary>
        /// Gets the collection of supported request types by this handler.
        /// </summary>
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {
                    typeof(LockPaymentTerminalDeviceRequest),
                    typeof(ReleasePaymentTerminalDeviceRequest),
                    typeof(OpenPaymentTerminalDeviceRequest),
                    typeof(ClosePaymentTerminalDeviceRequest),
                    typeof(BeginTransactionPaymentTerminalDeviceRequest),
                    typeof(EndTransactionPaymentTerminalDeviceRequest),
                    typeof(CancelOperationPaymentTerminalDeviceRequest),
                    typeof(UpdateLineItemsPaymentTerminalDeviceRequest),
                    typeof(AuthorizePaymentTerminalDeviceRequest),
                    typeof(CapturePaymentTerminalDeviceRequest),
                    typeof(VoidPaymentTerminalDeviceRequest),
                    typeof(RefundPaymentTerminalDeviceRequest),
                    typeof(GetPrivateTenderPaymentTerminalDeviceRequest),
                    typeof(ExecuteTaskPaymentTerminalDeviceRequest),
                    typeof(FetchTokenPaymentTerminalDeviceRequest),
                    typeof(ActivateGiftCardPaymentTerminalRequest),
                    typeof(AddBalanceToGiftCardPaymentTerminalRequest),
                    typeof(GetGiftCardBalancePaymentTerminalRequest),
                    typeof(GetTransactionReferencePaymentTerminalDeviceRequest),
                    typeof(GetTransactionByTransactionReferencePaymentTerminalDeviceRequest)
                };
            }
        }

        /// <summary>
        /// Gets the unique name for this request handler.
        /// </summary>
        public string HandlerName => "MASHREQNEOPAY";

        /// <summary>
        /// Represents the entry point of the request handler.
        /// </summary>
        /// <param name="request">The incoming request message.</param>
        /// <returns>The outgoing response message.</returns>
        public Microsoft.Dynamics.Commerce.Runtime.Messages.Response Execute(Microsoft.Dynamics.Commerce.Runtime.Messages.Request request)
        {
            ThrowIf.Null(request, nameof(request));

            switch (request)
            {
                case OpenPaymentTerminalDeviceRequest openPaymentTerminalDeviceRequest:
                    return this.Open(openPaymentTerminalDeviceRequest);

                case ClosePaymentTerminalDeviceRequest closePaymentTerminalDeviceRequest:
                    return this.Close();

                case BeginTransactionPaymentTerminalDeviceRequest beginTransactionPaymentTerminalDeviceRequest:
                    return this.BeginTransaction(beginTransactionPaymentTerminalDeviceRequest);

                case EndTransactionPaymentTerminalDeviceRequest endTransactionPaymentTerminalDeviceRequest:
                    return this.EndTransaction();

                case CancelOperationPaymentTerminalDeviceRequest cancelOperationPaymentTerminalDeviceRequest:
                    return this.CancelOperation();

                case UpdateLineItemsPaymentTerminalDeviceRequest updateLineItemsPaymentTerminalDeviceRequest:
                    return this.UpdateLineItems(updateLineItemsPaymentTerminalDeviceRequest);

                case AuthorizePaymentTerminalDeviceRequest authorizePaymentTerminalDeviceRequest:
                    return this.AuthorizePayment(authorizePaymentTerminalDeviceRequest);

                case CapturePaymentTerminalDeviceRequest capturePaymentTerminalDeviceRequest:
                    return this.CapturePayment(capturePaymentTerminalDeviceRequest);

                case VoidPaymentTerminalDeviceRequest voidPaymentTerminalDeviceRequest:
                    return this.VoidPayment(voidPaymentTerminalDeviceRequest);

                case RefundPaymentTerminalDeviceRequest refundPaymentTerminalDeviceRequest:
                    return this.RefundPayment(refundPaymentTerminalDeviceRequest);

                case GetPrivateTenderPaymentTerminalDeviceRequest getPrivateTenderPaymentTerminalDeviceRequest:
                    return this.GetPrivateTender(getPrivateTenderPaymentTerminalDeviceRequest);

                case ExecuteTaskPaymentTerminalDeviceRequest executeTaskPaymentTerminalDeviceRequest:
                    return this.ExecuteTask(executeTaskPaymentTerminalDeviceRequest);

                case FetchTokenPaymentTerminalDeviceRequest fetchTokenPaymentTerminalDeviceRequest:
                    return this.FetchToken(fetchTokenPaymentTerminalDeviceRequest);

                case ActivateGiftCardPaymentTerminalRequest activateGiftCardPaymentTerminalRequest:
                    return this.ActivateGiftCard(activateGiftCardPaymentTerminalRequest);

                case AddBalanceToGiftCardPaymentTerminalRequest addBalanceToGiftCardPaymentTerminalRequest:
                    return this.AddBalanceToGiftCard(addBalanceToGiftCardPaymentTerminalRequest);

                case GetGiftCardBalancePaymentTerminalRequest getGiftCardBalancePaymentTerminalRequest:
                    return this.GetGiftCardBalance(getGiftCardBalancePaymentTerminalRequest);

                case GetTransactionReferencePaymentTerminalDeviceRequest getTransactionReferencePaymentTerminalDeviceRequest:
                    return this.GetTransactionReferenceId(getTransactionReferencePaymentTerminalDeviceRequest);

                case GetTransactionByTransactionReferencePaymentTerminalDeviceRequest getTransactionByTransactionReferencePaymentTerminalDeviceRequest:
                    return this.GetTransactionByTransactionReference(getTransactionByTransactionReferencePaymentTerminalDeviceRequest);

                default:
                    throw new NotSupportedException($"Request '{request.GetType().FullName}' is not supported.");
            }
        }

        /// <summary>
        /// The dispose implementation.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Dispose the Native and Managed resources.
        /// </summary>
        /// <param name="disposeAll">Whether to dispose both Native and Managed resources.</param>
        protected virtual void Dispose(bool disposeAll)
        {
        }

        /// <summary>
        /// Initialize settings.
        /// </summary>
        /// <param name="paymentConnectorName">The payment connector name.</param>
        /// <param name="merchantPaymentPropertiesXml">The merchant properties.</param>
        /// <param name="terminalSettings">The terminal settings.</param>
        private void InitializeSettings(string paymentConnectorName, string merchantPaymentPropertiesXml, SettingsInfo terminalSettings)
        {
            this.terminalSettings = terminalSettings;
            this.paymentConnectorName = paymentConnectorName;

            // Convert the connector properties to local
            this.merchantProperties = !string.IsNullOrWhiteSpace(merchantPaymentPropertiesXml)
                ? PaySdk.PaymentProperty.ConvertXMLToPropertyArray(merchantPaymentPropertiesXml)
                : null;
        }

        /// <summary>
        /// Resets the card payment info.
        /// </summary>
        private void ResetCardPaymentInfo()
        {
            this.merchantProperties = null;
            this.paymentConnectorName = null;
            this.terminalSettings = null;
            this.timeoutTask = null;
            
        }

        /// <summary>
        /// Gets an array of payment properties using an initial list.
        /// </summary>
        /// <param name="paymentConnectorName">The payment connector name to use.</param>
        /// <param name="initialPropertyList">The initial list of properties to add to the array.</param>
        /// <returns></returns>
        private static PaySdk.PaymentProperty[] GetPaymentPropertiesWithInitialList(string paymentConnectorName, PaySdk.PaymentProperty[] initialPropertyList)
        {
            // Several below values are hardcoded, real implementations should take this data from real device.
            List<PaySdk.PaymentProperty> properties = new List<PaySdk.PaymentProperty>(initialPropertyList);
            properties.AddRange(GetPaymentProperties(paymentConnectorName));

            return properties.ToArray();
        }

        private static PaySdk.PaymentProperty[] GetPaymentPropertiesWithInitialList(string paymentConnectorName, PaySdk.PaymentProperty[] initialPropertyList, PaySdk.PaymentProperty[] originalPaymentPropertyList)
        {
            // Several below values are hardcoded, real implementations should take this data from real device.
            List<PaySdk.PaymentProperty> properties = new List<PaySdk.PaymentProperty>(initialPropertyList);
            if(originalPaymentPropertyList != null)
            {
                properties.AddRange(originalPaymentPropertyList);
            }
            properties.AddRange(GetPaymentProperties(paymentConnectorName));

            return properties.ToArray();
        }

        /// <summary>
        /// Gets an array of payment properties.
        /// </summary>
        /// <param name="paymentConnectorName">The payment connector name to use.</param>
        /// <returns></returns>
        private static PaySdk.PaymentProperty[] GetPaymentProperties(string paymentConnectorName)
        {
            // Several below values are hardcoded, real implementations should take this data from real device.
            PaySdk.PaymentProperty assemblyNameProperty = new PaySdk.PaymentProperty();
            assemblyNameProperty.Namespace = PaySdk.Constants.GenericNamespace.MerchantAccount;
            assemblyNameProperty.Name = PaySdk.Constants.MerchantAccountProperties.AssemblyName;
            assemblyNameProperty.ValueType = PaySdk.DataType.String;
            assemblyNameProperty.StoredStringValue = typeof(NeoPayPaymentDevice).Assembly.GetName().Name;

            PaySdk.PaymentProperty connectorNameProperty = new PaySdk.PaymentProperty();
            connectorNameProperty.Namespace = PaySdk.Constants.GenericNamespace.Connector;
            connectorNameProperty.Name = PaySdk.Constants.ConnectorProperties.ConnectorName;
            connectorNameProperty.StoredStringValue = paymentConnectorName;

            PaySdk.PaymentProperty[] properties = new PaySdk.PaymentProperty[] { assemblyNameProperty, connectorNameProperty };

            return properties;
        }


        private static PaySdk.PaymentProperty[] CreateSuccessPaymentProperties(string paymentConnectorName, string cardNo, string authCode, string sequence, string mrefValue)
        {
            // Several below values are hardcoded, real implementations should take this data from real device.
            PaymentProperty paymentProperty = null;
            List<PaymentProperty> authorizationProperties = new List<PaymentProperty>();
            paymentProperty = new PaymentProperty(GenericNamespace.AuthorizationResponse, AuthorizationResponseProperties.ApprovalCode, authCode);
            authorizationProperties.Add(paymentProperty);
            paymentProperty = new PaymentProperty(GenericNamespace.AuthorizationResponse, AuthorizationResponseProperties.CardNumber, cardNo);
            authorizationProperties.Add(paymentProperty);
            paymentProperty = new PaymentProperty(GenericNamespace.AuthorizationResponse, AuthorizationResponseProperties.ProviderTransactionId, mrefValue);
            authorizationProperties.Add(paymentProperty);
            paymentProperty = new PaymentProperty(GenericNamespace.AuthorizationResponse, AuthorizationResponseProperties.BankTransactionId, sequence);
            authorizationProperties.Add(paymentProperty);

            PaySdk.PaymentProperty assemblyNameProperty = new PaySdk.PaymentProperty();
            assemblyNameProperty.Namespace = PaySdk.Constants.GenericNamespace.MerchantAccount;
            assemblyNameProperty.Name = PaySdk.Constants.MerchantAccountProperties.AssemblyName;
            assemblyNameProperty.ValueType = PaySdk.DataType.String;
            assemblyNameProperty.StoredStringValue = typeof(NeoPayPaymentDevice).Assembly.GetName().Name;

            PaySdk.PaymentProperty connectorNameProperty = new PaySdk.PaymentProperty();
            connectorNameProperty.Namespace = PaySdk.Constants.GenericNamespace.Connector;
            connectorNameProperty.Name = PaySdk.Constants.ConnectorProperties.ConnectorName;
            connectorNameProperty.StoredStringValue = paymentConnectorName;


            var authPaymentProperty = new PaymentProperty(GenericNamespace.AuthorizationResponse, AuthorizationResponseProperties.Properties, authorizationProperties.ToArray());
            
            PaySdk.PaymentProperty[] properties = new PaySdk.PaymentProperty[] { assemblyNameProperty, connectorNameProperty, authPaymentProperty };

            return properties;
        }

        /// <summary>
        /// Creates a mocked success authorization payment info with the approved amount.
        /// </summary>
        /// <param name="amount">The approved amount to add to the authorization.</param>
        /// <returns>The mocked payment info.</returns>
        private PaymentInfo CreateAuthorizationSuccessPaymentInfo(decimal amount, string maskedcardNo, string authCode, string sequenceNo, string mrefValue)
        {
            PaySdk.PaymentProperty[] properties = CreateSuccessPaymentProperties(this.paymentConnectorName, maskedcardNo, authCode, sequenceNo, mrefValue);
            
            var paymentInfo = new PaymentInfo()
            {
                CardNumberMasked = maskedcardNo,
                CardType = Microsoft.Dynamics.Commerce.HardwareStation.CardPayment.CardType.InternationalCreditCard,
                SignatureData = maskedcardNo,  //TSc.Arjun
                PaymentSdkData = PaySdk.PaymentProperty.ConvertPropertyArrayToXML(properties),
                CashbackAmount = 0.0m,
                ApprovedAmount = amount,
                IsApproved = true,
                Errors = null
            };
            return paymentInfo;
        }

        private PaymentInfo CreateVoidSuccessPaymentInfo(decimal amount)
        {
            PaySdk.PaymentProperty[] properties = CreateSuccessPaymentProperties(this.paymentConnectorName, "", "", "", "");

            var paymentInfo = new PaymentInfo()
            {
                CardNumberMasked = "",
                CardType = Microsoft.Dynamics.Commerce.HardwareStation.CardPayment.CardType.InternationalCreditCard,
                SignatureData = "",
                PaymentSdkData = PaySdk.PaymentProperty.ConvertPropertyArrayToXML(properties),
                CashbackAmount = 0.0m,
                ApprovedAmount = amount,
                IsApproved = true,
                Errors = null
            };
            return paymentInfo;
        }


        private PaymentInfo CreateAuthorizationFailedPaymentInfo(string message="")
        {
            // Several below values are hardcoded, real implementations should take this data from real device.
            PaySdk.PaymentProperty[] properties = GetPaymentProperties(this.paymentConnectorName);
            var paymentInfo = new PaymentInfo()
            {
                CardNumberMasked = "",
                CardType = Microsoft.Dynamics.Commerce.HardwareStation.CardPayment.CardType.InternationalCreditCard,
                SignatureData = "",
                PaymentSdkData = PaySdk.PaymentProperty.ConvertPropertyArrayToXML(properties),
                CashbackAmount = 0.0m,
                ApprovedAmount = 0,
                IsApproved = false,               
            };
            if(!string.IsNullOrEmpty(message))
            {
                paymentInfo.Errors = new PaySdk.PaymentError[]
               {
                    new PaySdk.PaymentError(PaySdk.ErrorCode.AuthorizationFailure, message)
               };
            }           
            return paymentInfo;
        }

        //private PaymentInfo CreateVoidFailedPaymentInfo(decimal amount)
        //{
        //    // Several below values are hardcoded, real implementations should take this data from real device.
        //    PaySdk.PaymentProperty[] properties = GetPaymentProperties(this.paymentConnectorName);
        //    var paymentInfo = new PaymentInfo()
        //    {
        //        CardNumberMasked = "",
        //        CardType = Microsoft.Dynamics.Commerce.HardwareStation.CardPayment.CardType.InternationalCreditCard,
        //        SignatureData = "",
        //        PaymentSdkData = PaySdk.PaymentProperty.ConvertPropertyArrayToXML(properties),
        //        CashbackAmount = 0.0m,
        //        ApprovedAmount = amount,
        //        IsApproved = false,
        //    };
        //    return paymentInfo;
        //}

        /// <summary>
        /// Construct the Payment Device class and open the connection from it.
        /// </summary>
        /// <returns>The response.</returns>
        /// <param name="request">Open payment terminal device request.</param>
        private NullResponse Open(OpenPaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            // Open the device for payments
            Utilities.WaitAsyncTask(() => Task.Run(async () =>
            {
                await this.OpenAsync(request.DeviceName, request.TerminalSettings, request.DeviceConfig).ConfigureAwait(false);
            }));

            return NullResponse.Instance;
        }

        /// <summary>
        /// Close the connection to the payment terminal.
        /// </summary>
        /// <returns>The response.</returns>
        private NullResponse Close()
        {
            // Close the device for payments
            Utilities.WaitAsyncTask(() => Task.Run(async () =>
            {
                await this.CloseAsync().ConfigureAwait(false);
            }));

            return NullResponse.Instance;
        }

        /// <summary>
        ///  Begins the transaction.
        /// </summary>
        /// <param name="request">The begin transaction request.</param>
        /// <returns>The response.</returns>
        private NullResponse BeginTransaction(BeginTransactionPaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));
            Utilities.WaitAsyncTask(() => Task.Run(async () =>
            {
                await this.BeginTransactionAsync(request.PaymentConnectorName, request.MerchantInformation).ConfigureAwait(false);
            }));

            return NullResponse.Instance;
        }

        /// <summary>
        /// Ends the transaction.
        /// </summary>
        /// <returns>The response.</returns>
        private NullResponse EndTransaction()
        {
            Utilities.WaitAsyncTask(() => this.EndTransactionAsync());

            if (this.timeoutTask != null)
            {
                this.timeoutTask.Cancel();
            }

            this.ResetCardPaymentInfo();

            return NullResponse.Instance;
        }

        /// <summary>
        /// Cancel current operation on payment terminal.
        /// </summary>
        /// <returns>The response.</returns>
        private NullResponse CancelOperation()
        {
            // Cancel current operation on payment terminal
            Utilities.WaitAsyncTask(() => Task.Run(async () =>
            {
                await this.CancelOperationAsync().ConfigureAwait(false);
            }));

            return NullResponse.Instance;
        }

        /// <summary>
        /// Update the line items.
        /// </summary>
        /// <param name="request">The update line items request.</param>
        /// <returns>The response.</returns>
        private NullResponse UpdateLineItems(UpdateLineItemsPaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            Utilities.WaitAsyncTask(() => this.UpdateLineItemsAsync(request));

            return NullResponse.Instance;
        }

        /// <summary>
        /// Authorize payment.
        /// </summary>
        /// <param name="request">The authorize payment request.</param>
        /// <returns>The authorize payment response.</returns>
        private AuthorizePaymentTerminalDeviceResponse AuthorizePayment(AuthorizePaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            PaymentInfo paymentInfo = Utilities.WaitAsyncTask(() => this.AuthorizePaymentAsync(request.PaymentConnectorName, request.Amount, request.Currency, request.TenderInfo, request.ExtensionTransactionProperties));

            return new AuthorizePaymentTerminalDeviceResponse(paymentInfo);
        }

        /// <summary>
        /// Capture payment.
        /// </summary>
        /// <param name="request">The capture payment request.</param>
        /// <returns>The capture payment response.</returns>
        private CapturePaymentTerminalDeviceResponse CapturePayment(CapturePaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));
            PaymentInfo paymentInfo = Utilities.WaitAsyncTask(() => this.CapturePaymentAsync(request.Amount, request.Currency, request.PaymentPropertiesXml, request.ExtensionTransactionProperties));

            return new CapturePaymentTerminalDeviceResponse(paymentInfo);
        }

        /// <summary>
        /// Void payment.
        /// </summary>
        /// <param name="request">The void payment request.</param>
        /// <returns>The void payment response.</returns>
        private VoidPaymentTerminalDeviceResponse VoidPayment(VoidPaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));
            PaymentInfo paymentInfo = Utilities.WaitAsyncTask(() => this.VoidPaymentAsync(request.PaymentConnectorName, request.Amount, request.Currency, request.TenderInfo, request.PaymentPropertiesXml, request.ExtensionTransactionProperties));

            return new VoidPaymentTerminalDeviceResponse(paymentInfo);
        }

        /// <summary>
        /// Make refund payment.
        /// </summary>
        /// <param name="request">Request for refund.</param>
        /// <returns>A task that can await until the refund has completed.</returns>
        private RefundPaymentTerminalDeviceResponse RefundPayment(RefundPaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            PaymentInfo paymentInfo = Utilities.WaitAsyncTask(() => this.RefundPaymentAsync(request.Amount, request.Currency, request.IsManualEntry, request.ExtensionTransactionProperties));

            return new RefundPaymentTerminalDeviceResponse(paymentInfo);
        }

        /// <summary>
        /// Executes Task.
        /// </summary>
        /// <param name="request">The request.</param>
        /// <returns>The response.</returns>
        private ExecuteTaskPaymentTerminalDeviceResponse ExecuteTask(ExecuteTaskPaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            List<CommerceProperty> commerceProperties = new List<CommerceProperty>();

            ExtensionTransaction transaction;

            // Add/substitute 'case' matching your task and put there the business logic you need for your specific task.
            switch (request.Task)
            {
                case NeoPayTasks.GetLastTransactionTask:
                    InitialiseEftInterface(this.eftComPort);
                    GetLastTransactionStatus("");

                    transaction = new ExtensionTransaction
                    {
                        EntityName = request.ExtensionTransactionProperties.EntityName,
                        ExtensionProperties = commerceProperties
                    };
                    break;
                case NeoPayTasks.DateTimeSyncTask:
                    InitialiseEftInterface(this.eftComPort);
                    var result = DateTimeSynch(request);
                    return new ExecuteTaskPaymentTerminalDeviceResponse(result);
                case NeoPayTasks.GetTotalsTask:
                    InitialiseEftInterface(this.eftComPort);
                    var getTotalsResult = GetTotals(request);
                    return new ExecuteTaskPaymentTerminalDeviceResponse(getTotalsResult);
                case NeoPayTasks.ReconciliationTask:
                    InitialiseEftInterface(this.eftComPort);
                    var reconcilaitionResult = Reconciliation(request);
                    return new ExecuteTaskPaymentTerminalDeviceResponse(reconcilaitionResult);
                case NeoPayTasks.DuplicateTask:
                    InitialiseEftInterface(this.eftComPort);
                    var duplicateResult = Duplicate(request);
                    return new ExecuteTaskPaymentTerminalDeviceResponse(duplicateResult);
                case NeoPayTasks.StandAloneTask:
                    InitialiseEftInterface(this.eftComPort);
                    var standAloneResult = StandAlone(request);
                    return new ExecuteTaskPaymentTerminalDeviceResponse(standAloneResult);
                default:
                    throw new NotSupportedException($"The task{request.Task} is not supported");
            }

            return new ExecuteTaskPaymentTerminalDeviceResponse(transaction);
        }

        /// <summary>
        /// Gets the private tender.
        /// </summary>
        /// <param name="request">The get private tender request.</param>
        /// <returns>Returns the private tender response.</returns>
        private GetPrivateTenderPaymentTerminalDeviceResponse GetPrivateTender(GetPrivateTenderPaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            TenderInfo tenderInfo = Utilities.WaitAsyncTask(() => this.GetPrivateTenderAsync(request.Amount, request.Declined, request.IsSwipe));

            return new GetPrivateTenderPaymentTerminalDeviceResponse(tenderInfo);
        }

        /// <summary>
        /// Fetch token.
        /// </summary>
        /// <param name="request">The fetch token request.</param>
        /// <returns>The fetch token response.</returns>
        private FetchTokenPaymentTerminalDeviceResponse FetchToken(FetchTokenPaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            PaymentInfo paymentInfo = Utilities.WaitAsyncTask(() => this.FetchTokenAsync(request.IsManualEntry, request.ExtensionTransactionProperties));

            return new FetchTokenPaymentTerminalDeviceResponse(paymentInfo);
        }

        /// <summary>
        /// Activate gift card.
        /// </summary>
        /// <param name="request">The activate gift card payment request.</param>
        /// <returns>The gift card payment response.</returns>
        private GiftCardPaymentResponse ActivateGiftCard(ActivateGiftCardPaymentTerminalRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            PaymentInfo paymentInfo = Utilities.WaitAsyncTask(() => this.ActivateGiftCardAsync(request.PaymentConnectorName, request.Amount, request.Currency, request.TenderInfo, request.ExtensionTransactionProperties));

            return new GiftCardPaymentResponse(paymentInfo);
        }

        /// <summary>
        /// Add balance to gift card.
        /// </summary>
        /// <param name="request">The add balance to gift card payment request.</param>
        /// <returns>The add balance to gift card payment response.</returns>
        private GiftCardPaymentResponse AddBalanceToGiftCard(AddBalanceToGiftCardPaymentTerminalRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            PaymentInfo paymentInfo = Utilities.WaitAsyncTask(() => this.AddBalanceToGiftCardAsync(request.PaymentConnectorName, request.Amount, request.Currency, request.TenderInfo, request.ExtensionTransactionProperties));

            return new GiftCardPaymentResponse(paymentInfo);
        }

        /// <summary>
        /// Get gift card balance.
        /// </summary>
        /// <param name="request">The get gift card balance payment request.</param>
        /// <returns>The get gift card balance payment response.</returns>
        private GiftCardPaymentResponse GetGiftCardBalance(GetGiftCardBalancePaymentTerminalRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            PaymentInfo paymentInfo = Utilities.WaitAsyncTask(() => this.GetGiftCardBalanceAsync(request.PaymentConnectorName, request.Currency, request.TenderInfo, request.ExtensionTransactionProperties));

            return new GiftCardPaymentResponse(paymentInfo);
        }

        /// <summary>
        /// Gets Transaction Reference ID.
        /// </summary>
        /// <param name="request">The request.</param>
        /// <returns>The response.</returns>
        private GetTransactionReferencePaymentTerminalDeviceResponse GetTransactionReferenceId(GetTransactionReferencePaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            string id = DateTime.Now.ToString("yyyyMMddHHmmss");
            return new GetTransactionReferencePaymentTerminalDeviceResponse(id);
        }

        /// <summary>
        /// Gets payment transaction by the Transaction Reference ID.
        /// </summary>
        /// <param name="request">The request.</param>
        /// <returns>The response.</returns>
        private GetTransactionByTransactionReferencePaymentTerminalDeviceResponse GetTransactionByTransactionReference(GetTransactionByTransactionReferencePaymentTerminalDeviceRequest request)
        {
            ThrowIf.Null(request, nameof(request));
            //GetTransactionByTransactionReferencePaymentTerminalDeviceRequest is executed if pos finds a reference which has not concluded. 
            //So it will not be emptty.
            string mref = request.TransactionReferenceData.IdFromConnector;
            InitialiseEftInterface(this.eftComPort);
            string xml = GetLastTransactionStatus(mref);
            PaymentInfo paymentInfo;
            if (request.TransactionReferenceData.Command == "refund")
            {
                paymentInfo = HandleEftXmlResponse(NeoPayCommandCodesType.Refund, xml);
            }
            else if (request.TransactionReferenceData.Command == "sale")
            {
                paymentInfo = HandleEftXmlResponse(NeoPayCommandCodesType.Purchase, xml);
            }
            else if (request.TransactionReferenceData.Command == "void")
            {
                paymentInfo = HandleEftXmlResponse(NeoPayCommandCodesType.Void, xml);
            }
            else
            {
                throw new PaymentException("", "Command not supported");
            }

            return new GetTransactionByTransactionReferencePaymentTerminalDeviceResponse(paymentInfo);
        }

        /// <summary>
        /// Construct the Payment Device class and open the connection from it.
        /// </summary>
        /// <param name="peripheralName">Name of peripheral device.</param>
        /// <param name="terminalSettings">The terminal settings for the peripheral device.</param>
        /// <param name="deviceConfig">Device Configuration parameters.</param>
        /// <returns>A task that can be awaited until the connection is opened.</returns>
        [SuppressMessage("Microsoft.Usage", "CA1801", Justification = "Suppressed on adding CA for backward compatibility")]
        private async Task OpenAsync(string peripheralName, SettingsInfo terminalSettings, PeripheralConfiguration deviceConfig)
        {
            // Open the device for payments
            
        }

        /// <summary>
        /// Close the connection to the payment terminal.
        /// </summary>
        /// <returns>A task that can be awaited until the connection is closed.</returns>
        private async Task CloseAsync()
        {
            // Close the device for payments
        }

        /// <summary>
        ///  Begins the transaction.
        /// </summary>
        /// <param name="paymentConnectorName">The payment connector name for payment.</param>
        /// <param name="merchantPaymentPropertiesXml">The merchant provider payment properties.</param>
        /// <returns>A task that can be awaited until the operation is completed.</returns>
        private async Task BeginTransactionAsync(string paymentConnectorName, string merchantPaymentPropertiesXml)
        {
            await Task.Run(() => this.InitializeSettings(paymentConnectorName, merchantPaymentPropertiesXml, this.terminalSettings)).ConfigureAwait(false);
        }

        /// <summary>
        ///  Ends the transaction.
        /// </summary>
        /// <returns>A task that can be awaited until the operation has completed.</returns>
        private async Task EndTransactionAsync()
        {
            // Close the device for payments
        }

        /// <summary>
        /// Cancel current operation on payment terminal.
        /// </summary>
        /// <returns>A task that can be awaited until the cancel operation has completed.</returns>
        private async Task CancelOperationAsync()
        {
            // Cancel current operation on the payment device
        }

        /// <summary>
        /// Update the line items on the current open session.  This method will compare against previous lines specified and make the appropriate device calls.
        /// </summary>
        /// <param name="request">The update line items request.</param>
        /// <returns>A task that can be awaited until the text is displayed on the screen.</returns>
        [SuppressMessage("Microsoft.Usage", "CA1801", Justification = "Suppressed on adding CA for backward compatibility")]
        private async Task UpdateLineItemsAsync(UpdateLineItemsPaymentTerminalDeviceRequest request)
        {
            // Display item to the payment terminal
        }

        /// <summary>
        /// Authorize payment.
        /// </summary>
        /// <param name="paymentConnectorName">The payment connector name.</param>
        /// <param name="amount">The amount.</param>
        /// <param name="currency">The currency.</param>
        /// <param name="tenderInfo">Tender information.</param>
        /// <param name="extensionTransactionProperties">Optional extension transaction properties.</param>
        /// <returns>A task that can await until the authorization has completed.</returns>
        [SuppressMessage("Microsoft.Usage", "CA1801", Justification = "Suppressed on adding CA for backward compatibility")]
        private async Task<PaymentInfo> AuthorizePaymentAsync(string paymentConnectorName, decimal amount, string currency, TenderInfo tenderInfo, ExtensionTransaction extensionTransactionProperties)
        {
            string comPort = extensionTransactionProperties?.ExtensionProperties?.FirstOrDefault(p => p.Key.Equals("TSCEFTCOMPORT", StringComparison.OrdinalIgnoreCase))?.Value?.StringValue;
            if (!string.IsNullOrWhiteSpace(comPort))
                this.eftComPort = comPort;
            if (string.IsNullOrWhiteSpace(comPort))
            {
                return CreateAuthorizationFailedPaymentInfo("COM Port not configured.");
            }
            InitialiseEftInterface(this.eftComPort);
            string mref = DateTime.Now.ToString("yyyyMMddHHmmss");
            string convertedAmount = ConvertAmountToDeviceFormat(amount);
            int num = _eftInterface.Purchase(convertedAmount, mref);
            if (num != 1)
            {
                return CreateAuthorizationFailedPaymentInfo("Command Failed");
            }
            string response = _eftInterface.EftXmlData;
            return HandleEftXmlResponse(NeoPayCommandCodesType.Purchase, response);
        }

        PaymentInfo HandleEftXmlResponse(NeoPayCommandCodesType command, string xmlData)
        {
            XDocument xmlDocument = XDocument.Parse(xmlData);
            string errorCode = xmlDocument.Descendants("ErrorCode")?.FirstOrDefault()?.Value;
            if (string.IsNullOrEmpty(errorCode))
            {
                return CreateAuthorizationFailedPaymentInfo("Error code not received on response");
            }
            string responseCode = xmlDocument.Descendants("ResponseCode")?.FirstOrDefault()?.Value;
            string amountStr = "";
            decimal amount = 0;
            string cardNumber = "";
            string authCode = "";
            string seqNumber = "";
            string mrefValue = "";
            switch (errorCode)
            {
                case NeoPayResponseCodes.CallLastTransactionStatusCode:
                    string oldMrefLabel = xmlDocument.Descendants("MREFValue")?.FirstOrDefault()?.Value;
                    string lastTransXml = GetLastTransactionStatus(oldMrefLabel);
                    return HandleEftXmlResponse(command, lastTransXml);
                case NeoPayResponseCodes.SuccessCode:
                    if (responseCode == NeoPayStatusCodes.ApprovedStatusCode)
                    {
                        amountStr = xmlDocument.Descendants("Amount").First().Value;
                        amount = GetAmountFromDeviceFormat(amountStr);
                        string txnDescription = xmlDocument.Descendants("TxnDescription")?.FirstOrDefault()?.Value;
                        if ((command == NeoPayCommandCodesType.Purchase && txnDescription == "SALE") ||
                            (command == NeoPayCommandCodesType.Refund && txnDescription == "REFUND"))
                        {
                            cardNumber = xmlDocument.Descendants("MaskCardNumber").First().Value;
                            authCode = xmlDocument.Descendants("AuthCode").First().Value;
                            seqNumber = xmlDocument.Descendants("SequenceNo").First().Value;
                            mrefValue = xmlDocument.Descendants("MREFValue").First().Value;
                            return CreateAuthorizationSuccessPaymentInfo(amount, cardNumber, authCode, seqNumber, mrefValue);
                        }
                        else if (command == NeoPayCommandCodesType.Void && txnDescription == "VOID")
                        {
                            return CreateVoidSuccessPaymentInfo(amount);
                        }
                    }
                    return CreateAuthorizationFailedPaymentInfo("Response code " + responseCode);
                case NeoPayResponseCodes.TransactionAlreadyVoidedCode:
                    amountStr = xmlDocument.Descendants("Amount").First().Value;
                    amount = GetAmountFromDeviceFormat(amountStr);
                    cardNumber = xmlDocument.Descendants("MaskCardNumber").First().Value;
                    authCode = xmlDocument.Descendants("AuthCode").First().Value;
                    seqNumber = xmlDocument.Descendants("SequenceNo").First().Value;
                    mrefValue = xmlDocument.Descendants("MREFValue").First().Value;
                    return CreateAuthorizationSuccessPaymentInfo(amount, cardNumber, authCode, seqNumber, mrefValue);
                    //return CreateVoidSuccessPaymentInfo(amount);
                case NeoPayResponseCodes.ErrorCode:
                    throw new PaymentException("", "Could not connect to the device");
                default:
                    string message = command == NeoPayCommandCodesType.Void ? "" : "Error code " + errorCode;
                    //command == NeoPayCommandCodesType.Void ? CreateVoidFailedPaymentInfo(amount) :
                    PaymentInfo paymentInfo =  CreateAuthorizationFailedPaymentInfo(message);
                    return paymentInfo;
            }
        }

        void InitialiseEftInterface(string comPort = "")
        {

            if (_eftInterface == null )
            {
                this.eftComPort = comPort;
                //string
                string comPort1 = "COM6";
                //string xmlPath = "C:\\Program Files\\Microsoft Dynamics 365\\10.0\\Store Commerce\\Extensions\\TSC.LMG.Extension\\HardwareStation\\InterMediateXML.xml";
                //string logPath = "F:\\Logs\\Mashreq\\Sync";

                string baseDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

                // Go up one level (like your sample)
                string parentDirectory = Directory.GetParent(baseDirectory).FullName;

                // Build your XML path
                string xmlPath = Path.Combine(parentDirectory, "HardwareStation", "InterMediateXML.xml");
                string logPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "Mashreq", "Sync");
                Directory.CreateDirectory(logPath);

                _eftInterface = new sgEftInterfaceSyncWrapper.sgEftInterfaceSyncWrapper();
                _eftInterface = _eftInterface.CreateInstance(comPort1, xmlPath, 180000, 9500, logPath, "1");
            }
        }

        string GetLastTransactionStatus(string mrefLabel)
        {
            //InitialiseEftInterface();
            if(_eftInterface.LastTransactionStatus(mrefLabel) != 1)
            {
                throw new PaymentException("", "Could not initiate last transaction status");   
            }
            string response = _eftInterface.EftXmlData;
            //XDocument xmlDocument = XDocument.Parse(response);
            //string errorCode = xmlDocument.Descendants("ErrorCode")?.FirstOrDefault()?.Value;
            //if (!string.IsNullOrEmpty(errorCode) && errorCode == NeoPayResponseCodes.TransactionNotFoundCode)
            //{

            //}
            return response;
        }

        ExtensionTransaction DateTimeSynch(ExecuteTaskPaymentTerminalDeviceRequest request)
        {
            ExtensionTransaction transaction = new ExtensionTransaction();
            //InitialiseEftInterface();
            if (_eftInterface.DateTimeSync() != 1)
            {
                transaction.EntityName = request.ExtensionTransactionProperties.EntityName;
                return transaction;
            }

            transaction.EntityName = request.ExtensionTransactionProperties.EntityName;
            return transaction;
        }

        ExtensionTransaction GetTotals(ExecuteTaskPaymentTerminalDeviceRequest request)
        {
            ExtensionTransaction transaction = new ExtensionTransaction();
            //InitialiseEftInterface();
            if (_eftInterface.GetTotals() != 1)
            {
                transaction.EntityName = request.ExtensionTransactionProperties.EntityName;
                return transaction;
            }

            transaction.EntityName = request.ExtensionTransactionProperties.EntityName;
            return transaction;
        }

        ExtensionTransaction Reconciliation(ExecuteTaskPaymentTerminalDeviceRequest request)
        {
            ExtensionTransaction transaction = new ExtensionTransaction();
            
            if (_eftInterface.Reconciliation() != 1)
            {
                transaction.EntityName = request.ExtensionTransactionProperties.EntityName;
                return transaction;
            }

            transaction.EntityName = request.ExtensionTransactionProperties.EntityName;
            return transaction;
        }

        ExtensionTransaction Duplicate(ExecuteTaskPaymentTerminalDeviceRequest request)
        {
            ExtensionTransaction transaction = new ExtensionTransaction();
            string sequenceNo = request.ExtensionTransactionProperties.GetProperty("TSCSEQUENCENO")?.ToString();
            string mRef = request.ExtensionTransactionProperties.GetProperty("TSCMREF")?.ToString();
            if (_eftInterface.Duplicate(sequenceNo, mRef) != 1)
            {
                transaction.EntityName = request.ExtensionTransactionProperties.EntityName;
                return transaction;
            }

            transaction.EntityName = request.ExtensionTransactionProperties.EntityName;
            return transaction;
        }

        ExtensionTransaction StandAlone(ExecuteTaskPaymentTerminalDeviceRequest request)
        {
            ExtensionTransaction transaction = new ExtensionTransaction();
            string sequenceNo = "";
            string mRef = "";
            if (_eftInterface.StandAloneMode() != 1)
            {
                transaction.EntityName = request.ExtensionTransactionProperties.EntityName;
                return transaction;
            }

            transaction.EntityName = request.ExtensionTransactionProperties.EntityName;
            return transaction;
        }


        private string ConvertAmountToDeviceFormat(decimal amount)
        {
            return (amount * 100).ToString("000");
        }

        private decimal GetAmountFromDeviceFormat(string amount)
        {
            decimal convertedAmount = decimal.Parse(amount);
            return convertedAmount / 100;
        }



        /// <summary>
        /// Make settlement of a payment.
        /// </summary>
        /// <param name="amount">The amount.</param>
        /// <param name="currency">The currency.</param>
        /// <param name="paymentPropertiesXml">The payment properties of the authorization response.</param>
        /// <param name="extensionTransactionProperties">Optional extension transaction properties.</param>
        /// <returns>A task that can await until the settlement has completed.</returns>
        [SuppressMessage("Microsoft.Usage", "CA1801", Justification = "Suppressed on adding CA for backward compatibility")]
        private async Task<PaymentInfo> CapturePaymentAsync(decimal amount, string currency, string paymentPropertiesXml, ExtensionTransaction extensionTransactionProperties)
        {
            ThrowIf.Null(this.merchantProperties, nameof(this.merchantProperties));

            PaySdk.PaymentProperty[] properties = GetPaymentPropertiesWithInitialList(this.paymentConnectorName, this.merchantProperties);

            // Several below values are hardcoded, real implementations should take this data from real device.
            return await Task.FromResult(new PaymentInfo()
            {
                CardNumberMasked = string.Empty,
                CardType = Microsoft.Dynamics.Commerce.HardwareStation.CardPayment.CardType.Unknown,
                SignatureData = string.Empty,
                //PaymentSdkData = PaySdk.PaymentProperty.ConvertPropertyArrayToXML(properties),
                CashbackAmount = 0.0m,
                ApprovedAmount = amount,
                IsApproved = true,
                Errors = null
            }).ConfigureAwait(false);
        }

        /// <summary>
        /// Make reversal/void a payment.
        /// </summary>
        /// <param name="paymentConnectorName">The payment connector name.</param>
        /// <param name="amount">The amount.</param>
        /// <param name="currency">The currency.</param>
        /// <param name="tenderInfo">The tender information.</param>
        /// <param name="paymentPropertiesXml">The payment properties of the authorization response.</param>
        /// <param name="extensionTransactionProperties">Optional extension transaction properties.</param>
        /// <returns>A task that can await until the void has completed.</returns>
        [SuppressMessage("Microsoft.Usage", "CA1801", Justification = "Suppressed on adding CA for backward compatibility")]
        private async Task<PaymentInfo> VoidPaymentAsync(string paymentConnectorName, decimal amount, string currency, TenderInfo tenderInfo, string paymentPropertiesXml, ExtensionTransaction extensionTransactionProperties)
        {
            ThrowIf.Null(this.merchantProperties, nameof(this.merchantProperties));
            PaySdk.PaymentProperty[] origPaymentProperties = null;
            if (!string.IsNullOrEmpty(paymentPropertiesXml))
            {
                origPaymentProperties = PaySdk.PaymentProperty.ConvertXMLToPropertyArray(paymentPropertiesXml);
            }
            PaySdk.PaymentProperty[] properties = GetPaymentPropertiesWithInitialList(paymentConnectorName, this.merchantProperties, origPaymentProperties);
            var authProperties = properties.Where(x => x.Namespace == GenericNamespace.AuthorizationResponse && x.Name == AuthorizationResponseProperties.Properties).Select(x => x.PropertyList)?.FirstOrDefault();
            if(authProperties == null)
            {
                return CreateAuthorizationFailedPaymentInfo("Original authorization properties are missing.");
            }
            InitialiseEftInterface(this.eftComPort);
            decimal convertableAmount = amount;
            if (convertableAmount <= 0)
            {
                convertableAmount = amount * -1;
            }
            string amountString = ConvertAmountToDeviceFormat(convertableAmount);
            string sequenceNo = authProperties.Where(x => x.Name == AuthorizationResponseProperties.BankTransactionId).Select(x => x.StoredStringValue).First();
            string mRefLabel = authProperties.Where(x => x.Name == AuthorizationResponseProperties.ProviderTransactionId).Select(x => x.StoredStringValue).First();
            int status = _eftInterface.VoidPurchase(amountString, sequenceNo, mRefLabel);
           
            if(status != 1)
            {
                return CreateAuthorizationFailedPaymentInfo("Command not executed.");
            }
            string response = _eftInterface.EftXmlData;
            return HandleEftXmlResponse( NeoPayCommandCodesType.Void, response);
        }

        /// <summary>
        /// Make refund payment.
        /// </summary>
        /// <param name="amount">The amount.</param>
        /// <param name="currency">The currency.</param>
        /// <param name="isManualEntry">If manual credit card entry is required.</param>
        /// <param name="extensionTransactionProperties">Optional extension transaction properties.</param>
        /// <returns>A task that can await until the refund has completed.</returns>
        [SuppressMessage("Microsoft.Usage", "CA1801", Justification = "Suppressed on adding CA for backward compatibility")]
        private async Task<PaymentInfo> RefundPaymentAsync(decimal amount, string currency, bool isManualEntry, ExtensionTransaction extensionTransactionProperties)
        {
            InitialiseEftInterface(this.eftComPort);
            string convertedAmount = ConvertAmountToDeviceFormat(amount);
            string mref = DateTime.Now.ToString("yyyyMMddHHmmss");
            int status = _eftInterface.Refund(convertedAmount, mref, "");
            if(status != 1)
            {
               return CreateAuthorizationFailedPaymentInfo("Command not executed.");
            }
            string response = _eftInterface.EftXmlData;
            return HandleEftXmlResponse(NeoPayCommandCodesType.Refund, response);
            //XDocument xDocument = XDocument.Parse(response);
            //string errorCode = xDocument.Descendants("ErrorCode").First().Value;
            //if(errorCode == NeoPayResponseCodes.SuccessCode)
            //{
            //    string responseCode = xDocument.Descendants("ResponseCode").First().Value;
            //    if(responseCode == NeoPayStatusCodes.ApprovedStatusCode)
            //    {
            //        string cardNumber = xDocument.Descendants("MaskCardNumber").First().Value;
            //        string authCode = xDocument.Descendants("AuthCode").First().Value;
            //        string seqNumber = xDocument.Descendants("SequenceNo").First().Value;
            //        string mrefValue = xDocument.Descendants("MREFValue").First().Value;
            //        return CreateAuthorizationSuccessPaymentInfo(amount, cardNumber, authCode, seqNumber, mrefValue);
            //    }
            //    else
            //    {
            //        return await Task.FromResult(new PaymentInfo()
            //        {
            //            CardNumberMasked = string.Empty,
            //            CardType = Microsoft.Dynamics.Commerce.HardwareStation.CardPayment.CardType.Unknown,
            //            SignatureData = string.Empty,
            //            //PaymentSdkData = PaySdk.PaymentProperty.ConvertPropertyArrayToXML(properties),
            //            CashbackAmount = 0.0m,
            //            ApprovedAmount = amount,
            //            IsApproved = false,
            //            Errors = new PaySdk.PaymentError[]
            //        {
            //            new PaySdk.PaymentError(PaySdk.ErrorCode.AuthorizationFailure, "Refund failed with error code " + errorCode)
            //        }
            //        }).ConfigureAwait(false);
            //    }
            //}
            //else
            //{
            //    return await Task.FromResult(new PaymentInfo()
            //    {
            //        CardNumberMasked = string.Empty,
            //        CardType = Microsoft.Dynamics.Commerce.HardwareStation.CardPayment.CardType.Unknown,
            //        SignatureData = string.Empty,
            //        //PaymentSdkData = PaySdk.PaymentProperty.ConvertPropertyArrayToXML(properties),
            //        CashbackAmount = 0.0m,
            //        ApprovedAmount = amount,
            //        IsApproved = false,
            //        Errors = new PaySdk.PaymentError[]
            //        {
            //            new PaySdk.PaymentError(PaySdk.ErrorCode.AuthorizationFailure, "Refund failed with error code " + errorCode)
            //        }
            //    }).ConfigureAwait(false);
            //}
        }

        /// <summary>
        /// Get private tender async.
        /// </summary>
        /// <param name="amount">The amount field.</param>
        /// <param name="declined">Specify the boolean flag whether previous card is declined.</param>
        /// <param name="isSwipe">Specify the boolean flag whether it is swipe / manual.</param>
        /// <returns>Returns the tender information.</returns>
        [SuppressMessage("Microsoft.Usage", "CA1801", Justification = "Suppressed on adding CA for backward compatibility")]
        private async Task<TenderInfo> GetPrivateTenderAsync(decimal amount, bool declined, bool isSwipe)
        {
            // Several below values are hardcoded, real implementations should take this data from real device.
            //return await Task.FromResult(new TenderInfo()
            //{
            //    CardNumber = "9123456",
            //    Track2 = "%B9123456^FDCSGift/Gift^10110001111A123456789012?;9123456=1011000001234567?",
            //    CardTypeId = (int)Microsoft.Dynamics.Commerce.HardwareStation.CardPayment.CardType.GiftCard,
            //    IsSwipe = false
            //}).ConfigureAwait(false);
            throw new PeripheralException(PeripheralException.PaymentTerminalError, "Operation is not supported by payment terminal.", inner: null);
        }

        /// <summary>
        /// Fetch token for credit card.
        /// </summary>
        /// <param name="isManualEntry">The value indicating whether credit card should be entered manually.</param>
        /// <param name="extensionTransactionProperties">Optional extension transaction properties.</param>
        /// <returns>A task that can await until the token generation has completed.</returns>
        [SuppressMessage("Microsoft.Usage", "CA1801", Justification = "Suppressed on adding CA for backward compatibility")]
        private async Task<PaymentInfo> FetchTokenAsync(bool isManualEntry, ExtensionTransaction extensionTransactionProperties)
        {
            //await Task.Delay(10).ConfigureAwait(false);
            throw new PeripheralException(PeripheralException.PaymentTerminalError, "Operation is not supported by payment terminal.", inner: null);
        }

        /// <summary>
        /// Activate gift card.
        /// </summary>
        /// <param name="paymentConnectorName">The payment connector name.</param>
        /// <param name="amount">The amount.</param>
        /// <param name="currencyCode">The currency.</param>
        /// <param name="tenderInfo">The tender information.</param>
        /// <param name="extensionTransactionProperties">Optional extension transaction properties.</param>
        /// <returns>A task that can await until the void has completed.</returns>
        [SuppressMessage("Microsoft.Usage", "CA1801", Justification = "Suppressed on adding CA for backward compatibility")]
        private async Task<PaymentInfo> ActivateGiftCardAsync(string paymentConnectorName, decimal? amount, string currencyCode, TenderInfo tenderInfo, ExtensionTransaction extensionTransactionProperties)
        {
            //await Task.Delay(10).ConfigureAwait(false);
            throw new PeripheralException(PeripheralException.PaymentTerminalError, "Operation is not supported by payment terminal.", inner: null);
        }

        /// <summary>
        /// Add balance to gift card.
        /// </summary>
        /// <param name="paymentConnectorName">The payment connector name.</param>
        /// <param name="amount">The amount.</param>
        /// <param name="currencyCode">The currency.</param>
        /// <param name="tenderInfo">The tender information.</param>
        /// <param name="extensionTransactionProperties">Optional extension transaction properties.</param>
        /// <returns>A task that can await until the void has completed.</returns>
        [SuppressMessage("Microsoft.Usage", "CA1801", Justification = "Suppressed on adding CA for backward compatibility")]
        private async Task<PaymentInfo> AddBalanceToGiftCardAsync(string paymentConnectorName, decimal? amount, string currencyCode, TenderInfo tenderInfo, ExtensionTransaction extensionTransactionProperties)
        {
            //await Task.Delay(10).ConfigureAwait(false);
            throw new PeripheralException(PeripheralException.PaymentTerminalError, "Operation is not supported by payment terminal.", inner: null);
        }

        /// <summary>
        /// Get gift card balance.
        /// </summary>
        /// <param name="paymentConnectorName">The payment connector name.</param>
        /// <param name="currencyCode">The currency.</param>
        /// <param name="tenderInfo">The tender information.</param>
        /// <param name="extensionTransactionProperties">Optional extension transaction properties.</param>
        /// <returns>A task that can await until the void has completed.</returns>
        [SuppressMessage("Microsoft.Using", "CA1801", Justification = "Suppressed on adding CA for backward compatibility")]
        private async Task<PaymentInfo> GetGiftCardBalanceAsync(string paymentConnectorName, string currencyCode, TenderInfo tenderInfo, ExtensionTransaction extensionTransactionProperties)
        {
            //await Task.Delay(10).ConfigureAwait(false);
            throw new PeripheralException(PeripheralException.PaymentTerminalError, "Operation is not supported by payment terminal.", inner: null);
        }
    }
}
