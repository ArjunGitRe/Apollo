using Microsoft.Dynamics.Commerce.Runtime.ComponentModel.DataAnnotations;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran.Transactions
{
    public class ShukranPendingTransaction:CommerceEntity
    {
        private const string StoreColumn = "STORE";
        private const string TerminalColumn = "TERMINAL";
        private const string TransactionIdColumn = "TRANSACTIONID";
        private const string DataAreaIdColumn = "DATAAREAID";
        private const string IsSyncedColumn = "ISSYNCED";
        private const string StatusCodeColumn = "STATUSCODE";
        private const string PayloadColumn = "PAYLOAD";
        private const string ResponseMessageColumn = "RESPONSEMESSAGE";

        public ShukranPendingTransaction():base("ShukranPendingTransaction")
        { 
        }
        [Column(StoreColumn)]
        [DataMember]
        public string Store
        {
            get { return (string)this[StoreColumn]; }
            set { this[StoreColumn] = value; }
        }

        [Column(TerminalColumn)]
        [DataMember]
        public string Terminal
        {
            get { return (string)this[TerminalColumn]; }
            set { this[TerminalColumn] = value; }
        }

        [Column(TransactionIdColumn)]
        [DataMember]
        public string TransactionId
        {
            get { return (string)this[TransactionIdColumn]; }
            set { this[TransactionIdColumn] = value; }
        }

        [Column(DataAreaIdColumn)]
        [DataMember]
        public string DataAreaId
        {
            get { return (string)this[DataAreaIdColumn]; }
            set { this[DataAreaIdColumn] = value; }
        }

        [Column(IsSyncedColumn)]
        [DataMember]
        public int IsSynced
        {
            get { return (int)this[IsSyncedColumn]; }
            set { this[IsSyncedColumn] = value; }
        }

        [Column(StatusCodeColumn)]
        [DataMember]
        public int StatusCode
        {
            get { return (int)this[StatusCodeColumn]; }
            set { this[StatusCodeColumn] = value; }
        }

        [Column(PayloadColumn)]
        [DataMember]
        public string Payload
        {
            get { return (string)this[PayloadColumn]; }
            set { this[PayloadColumn] = value; }
        }

        [Column(ResponseMessageColumn)]
        [DataMember]
        public string ResponseMessage
        {
            get { return (string)this[ResponseMessageColumn]; }
            set { this[ResponseMessageColumn] = value; }
        }
    }
}
