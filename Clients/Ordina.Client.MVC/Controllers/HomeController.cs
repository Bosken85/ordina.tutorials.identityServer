using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Ordina.Client.MVC.Models;

namespace Ordina.Client.MVC.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [Authorize]
        public IActionResult Login()
        {
            return View();
        }

        [Authorize]
        public async  Task Logout()
        {
            await HttpContext.SignOutAsync("Cookies");
            //await HttpContext.SignOutAsync("oidc");
        }


        [Authorize]
        public async Task<IActionResult> Address()
        {
            var discoveryClient = new DiscoveryClient("https://localhost:44385/");
            var metaDataReponse = await discoveryClient.GetAsync();

            var userInfoClient = new UserInfoClient(metaDataReponse.UserInfoEndpoint);
            var accessToken = await HttpContext.GetTokenAsync(OpenIdConnectParameterNames.AccessToken);

            var response = await userInfoClient.GetAsync(accessToken);
            var address = response.Claims.FirstOrDefault(x => x.Type == "address")?.Value;

            return View(new Address(address));
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
