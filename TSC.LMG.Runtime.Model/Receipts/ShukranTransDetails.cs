using Microsoft.Dynamics.Commerce.Runtime.ComponentModel.DataAnnotations;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Receipts
{
    public class ShukranTransDetails: CommerceEntity
    {
        public const string ShukranProfileId = "PROFILEID";
        public const string ShukranPointsRedeemed = "TOTALPOINTSREDEEMED";
        public const string ShukranPointsEarned = "TOTALPOINTSEARNED";
        public const string ShukranPointBalance = "TOTALPOINTSBALANCE";
        public ShukranTransDetails() : base("ShukranTransDetails")
        {
        }

        [Column(ShukranProfileId)]
        [DataMember]
        public string PROFILEID
        {
            get
            {
                return (string)this[ShukranProfileId];
            }

            set
            {
                this[ShukranProfileId] = value;
            }
        }

        [Column(ShukranPointsRedeemed)]
        [DataMember]
        public int TOTALPOINTSREDEEMED
        {
            get
            {
                return (int)this[ShukranPointsRedeemed];
            }

            set
            {
                this[ShukranPointsRedeemed] = value;
            }
        }

        [Column(ShukranPointsEarned)]
        [DataMember]
        public int TOTALPOINTSEARNED
        {
            get
            {
                return (int)this[ShukranPointsEarned];
            }

            set
            {
                this[ShukranPointsEarned] = value;
            }
        }

        [Column(ShukranPointBalance)]
        [DataMember]
        public int TOTALPOINTSBALANCE
        {
            get
            {
                return (int)this[ShukranPointBalance];
            }

            set
            {
                this[ShukranPointBalance] = value;
            }
        }
    }
}
