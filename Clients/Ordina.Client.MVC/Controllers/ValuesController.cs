using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Ordina.Client.MVC.Controllers
{
    [Authorize]
    public class ValuesController : Controller
    {
        private readonly IDemoApiHttpClient _demoApiHttpClient;

        public ValuesController(IDemoApiHttpClient demoApiHttpClient)
        {
            _demoApiHttpClient = demoApiHttpClient;
        }

        [Authorize("CanReadValues")]
        public async Task<IActionResult> Index()
        {
            var client = await _demoApiHttpClient.GetClient();
            var response = await client.GetAsync("values");

            var values = new List<string>();
            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("Request Message Information:- \n\n" + response.RequestMessage + "\n");
                Console.WriteLine("Response Message Header \n\n" + response.Content.Headers + "\n");
                // Get the response
                var customerJsonString = await response.Content.ReadAsStringAsync();
                Console.WriteLine("Your response data is: " + customerJsonString);

                // Deserialise the data (include the Newtonsoft JSON Nuget package if you don't already have it)
                var deserialized = JsonConvert.DeserializeObject<IEnumerable<string>>(customerJsonString);
                // Do something with it
                values.AddRange(deserialized);
            }
            return View(values);
        }
    }
}