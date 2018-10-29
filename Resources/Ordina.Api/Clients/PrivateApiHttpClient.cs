using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

namespace Ordina.Client.MVC
{
    public class PrivateApiHttpClient : IPrivateApiHttpClient
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private HttpClient _httpClient = new HttpClient();

        public PrivateApiHttpClient(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<HttpClient> GetClient()
        {
            _httpClient.BaseAddress = new Uri("https://localhost:44387/api/");
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var accessToken = await GetDelegationAccessToken();

            if (!string.IsNullOrWhiteSpace(accessToken))
                _httpClient.SetBearerToken(accessToken);

            return _httpClient;
        }

        private async Task<string> GetDelegationAccessToken()
        {
            var discoveryClient = new DiscoveryClient("https://localhost:44385/");
            var metaDataReponse = await discoveryClient.GetAsync();

            var token = GetAccessToken();
            var payload = new
            {
                token = token
            };

            var client = new TokenClient(metaDataReponse.TokenEndpoint, "demo_api.client", "secret");

            var response = await client.RequestCustomGrantAsync("delegation", "private_api", payload);
            return response.AccessToken;
        }

        private string GetAccessToken()
        {
            var accessToken = _httpContextAccessor.HttpContext.Request.Headers["Authorization"];
            var token = accessToken.First().Remove(0, "Bearer ".Length);
            return token;
        }
    }

    public interface IPrivateApiHttpClient
    {
        Task<HttpClient> GetClient();
    }
}
