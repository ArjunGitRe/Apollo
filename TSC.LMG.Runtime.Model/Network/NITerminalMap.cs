using Microsoft.Dynamics.Commerce.Runtime.ComponentModel.DataAnnotations;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Network
{
    public class NITerminalMap:CommerceEntity
    {
        private const string storeIdColumn = "STOREID";
        private const string TerminalIdColumn = "TERMINALID";
        private const string tIdColumn = "TID";
        private const string MidColumn = "MID";
        public NITerminalMap ( ) : base ("NITerminalMap")
        {
        }

        [Column (storeIdColumn)]
        [DataMember]
        public string STOREID
        {
            get
            {
                return (string) this[storeIdColumn];
            }

            set
            {
                this[storeIdColumn] = value;
            }
        }
        [Column (TerminalIdColumn)]
        [DataMember]
        public string TERMINALID
        {
            get
            {
                return (string) this[TerminalIdColumn];
            }

            set
            {
                this[TerminalIdColumn] = value;
            }
        }
        [Column (tIdColumn)]
        [DataMember]
        public string TID
        {
            get
            {
                return (string) this[tIdColumn];
            }

            set
            {
                this[tIdColumn] = value;
            }
        }
        [Column (MidColumn)]
        [DataMember]
        public string MID
        {
            get
            {
                return (string) this[MidColumn];
            }

            set
            {
                this[MidColumn] = value;
            }
        }


    }
}
