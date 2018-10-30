using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Ordina.Client.MVC.Authorization;

namespace Ordina.Client.MVC
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.TryAddScoped<IDemoApiHttpClient, DemoApiHttpClient>();
            services.AddScoped<IAuthorizationHandler, RequiresLevelAuthorizationHandler>();

            services.AddAuthorization(options =>
            {
                options.AddPolicy("CanReadValues", x =>
                {
                    x.RequireAuthenticatedUser();
                    x.RequireClaim("unit", "NCore");
                    x.RequireClaim("role", "Employee");
                    x.AddRequirements(new RequiresLevel("Senior"));
                });
            });

            var cookieName = "Cookies";
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = cookieName;
                options.DefaultChallengeScheme = "oidc";
            }).AddCookie(cookieName)
              .AddOpenIdConnect("oidc", options =>
               {
                   options.SignInScheme = cookieName;
                   options.Authority = "https://localhost:44385/";
                   options.ClientId = "mvc";
                   options.ClientSecret = "secret";
                   options.ResponseType = "code id_token";
                   
                   //Required to get tokens from HttpContext
                   options.SaveTokens = true; 

                   //Required to fetch additional claims because we kept the initial id_token as small as possible
                   options.GetClaimsFromUserInfoEndpoint = true; 

                   #region Manage Scopes

                   options.Scope.Add("openid");
                   options.Scope.Add("profile");
                   options.Scope.Add("address");
                   options.Scope.Add("roles");
                   options.Scope.Add("ordina");
                   options.Scope.Add("demo_api");

                   #endregion

                   #region Manage claims

                   options.ClaimActions.DeleteClaim("sid");
                   options.ClaimActions.DeleteClaim("idp");

                   //Add additional claims when fetching from userinfo endpoint
                   options.ClaimActions.MapUniqueJsonKey("role", "role");
                   options.ClaimActions.MapUniqueJsonKey("unit", "unit");
                   options.ClaimActions.MapUniqueJsonKey("function", "function");
                   options.ClaimActions.MapUniqueJsonKey("level", "level");
                   options.ClaimActions.MapUniqueJsonKey("years_service", "years_service");

                   #endregion
               });

            

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
            app.UseAuthentication();
            app.UseMvcWithDefaultRoute();
        }
    }
}
