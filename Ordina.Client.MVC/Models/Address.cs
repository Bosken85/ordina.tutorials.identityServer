using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Ordina.Client.MVC.Models
{
    public class Address
    {
        private readonly string _value;

        public Address(string value)
        {
            _value = value;
        }

        public override string ToString()
        {
            return _value;
        }
    }
}
