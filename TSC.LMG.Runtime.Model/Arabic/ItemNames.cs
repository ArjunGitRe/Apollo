using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Arabic
{
    public class ItemNames: CommerceEntity
    {
        public ItemNames() : base("ItemNames")
        {
        }

        [DataMember]
        public long ProductId { get; set; }

        [DataMember]
        public string Name { get; set; }
    }


}
