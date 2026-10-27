using Microsoft.Dynamics.Commerce.Runtime.ComponentModel.DataAnnotations;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Shukran.Data
{
    public class DepartmentCodeEntity : CommerceEntity
    {
        private const string CategoryColumn = "CATEGORYNAME";
        //private const string CodeColumn = "CODE";
        private const string LevelColumn = "LEVEL";
        private const string ProductColumn = "PRODUCT";

        public DepartmentCodeEntity() : base("DepartmentCodeEntity")
        {
        }
       
        [Column(CategoryColumn)]
        [DataMember]
        public string CATEGORYNAME
        {
            get
            {
                return (string)this[CategoryColumn];
            }

            set
            {
                this[CategoryColumn] = value;
            }
        }

        //[Column(CodeColumn)]
        //[DataMember]
        //public string CODE
        //{
        //    get
        //    {
        //        return (string)this[CodeColumn];
        //    }

        //    set
        //    {
        //        this[CodeColumn] = value;
        //    }
        //}

        [Column(LevelColumn)]
        [DataMember]
        public int LEVEL
        {
            get
            {
                return (int)this[LevelColumn];
            }

            set
            {
                this[LevelColumn] = value;
            }
        }

        [Column(ProductColumn)]
        [DataMember]
        public long PRODUCT
        {
            get { 
                return (long)this[ProductColumn]; }
            set { this[ProductColumn] = value; }
        }
    }
}
