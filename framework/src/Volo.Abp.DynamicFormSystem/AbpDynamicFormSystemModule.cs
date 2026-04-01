using System;
using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Application.Services;
using Volo.Abp.AutoMapper;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace Volo.Abp.DynamicFormSystem
{
    [DependsOn(
        typeof(AbpModule),
        typeof(AbpEntityFrameworkCoreModule)
    )]
    public class DynamicFormSystemModule : AbpModule
    {
        public override void ConfigureServices(ServiceConfigurationContext context)
        {
            // 配置动态表单系统
            context.Services.AddDynamicFormSystem();

            // 注册应用服务
            context.Services.AddScoped<ISchemeAppService, SchemeAppService>();

            // 注册启动任务
            context.Services.AddTransient<IStartupTask, DynamicFormStartupTask>();
            context.Services.AddTransient<StartupTaskExecutor>();

            // 配置对象映射
            Configure<AbpAutoMapperOptions>(options =>
            {
                options.AddMaps<DynamicFormSystemModule>();
            });
        }

        public override async Task OnApplicationInitializationAsync(ApplicationInitializationContext context)
        {
            // 执行启动任务
            var executor = context.ServiceProvider.GetRequiredService<StartupTaskExecutor>();
            await executor.ExecuteAsync();
        }
    }

    public static class DynamicFormSystemServiceExtensions
    {
        public static IServiceCollection AddDynamicFormSystem(this IServiceCollection services, Action<DynamicFormSystemOptions>? optionsAction = null)
        {
            var options = new DynamicFormSystemOptions();
            optionsAction?.Invoke(options);
            services.AddSingleton(options);

            return services;
        }
    }

    public class DynamicFormSystemOptions
    {
        public bool AutoScanOnStartup { get; set; } = true;
        public int DefaultPageSize { get; set; } = 10;
        public bool EnableFilterScheme { get; set; } = true;
        public bool EnableColumnScheme { get; set; } = true;
        public bool EnableLookupConfig { get; set; } = true;
    }

    // 核心实体
    public class FormSchema : Entity<Guid>
    {
        public string? EntityName { get; set; }
        public string? FieldName { get; set; }
        public string? FieldLabel { get; set; }
        public string? FieldType { get; set; }
        public bool IsRequired { get; set; }
        public int? MaxLength { get; set; }
        public int DisplayOrder { get; set; }
        public int ColSpan { get; set; }
        public bool IsVisible { get; set; }
        public bool IsReadOnly { get; set; }
        public string? Options { get; set; }
    }

    public class ColumnSchema : Entity<Guid>
    {
        public string? EntityName { get; set; }
        public string? FieldName { get; set; }
        public string? HeaderName { get; set; }
        public int? Width { get; set; }
        public bool IsSortable { get; set; }
        public bool IsVisible { get; set; }
        public string? Frozen { get; set; }
        public string? Align { get; set; }
        public string? Formatter { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class LookupSchema : Entity<Guid>
    {
        public string? EntityName { get; set; }
        public string? PropertyName { get; set; }
        public string? TargetEntity { get; set; }
        public string? DisplayField { get; set; }
        public string? ValueField { get; set; }
        public string? ApiUrl { get; set; }
        public bool IsTree { get; set; }
        public string? DefaultFilters { get; set; }
    }

    // DTOs
    public class FormSchemaDto
    {
        public Guid Id { get; set; }
        public string? EntityName { get; set; }
        public string? FieldName { get; set; }
        public string? FieldLabel { get; set; }
        public string? FieldType { get; set; }
        public bool IsRequired { get; set; }
        public int? MaxLength { get; set; }
        public int DisplayOrder { get; set; }
        public int ColSpan { get; set; }
        public bool IsVisible { get; set; }
        public bool IsReadOnly { get; set; }
    }

    public class ColumnSchemaDto
    {
        public Guid Id { get; set; }
        public string? EntityName { get; set; }
        public string? FieldName { get; set; }
        public string? HeaderName { get; set; }
        public int? Width { get; set; }
        public bool IsSortable { get; set; }
        public bool IsVisible { get; set; }
    }

    public class LookupSchemaDto
    {
        public Guid Id { get; set; }
        public string? EntityName { get; set; }
        public string? PropertyName { get; set; }
        public string? TargetEntity { get; set; }
        public string? DisplayField { get; set; }
        public string? ValueField { get; set; }
        public string? ApiUrl { get; set; }
        public bool IsTree { get; set; }
    }
}
