using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Threading;

namespace Volo.Abp.DynamicFormSystem
{
    public class DynamicFormStartupTask : IStartupTask, ITransientDependency
    {
        private readonly EntitySchemaScannerService _scanner;
        private readonly IOptions<DynamicFormSystemOptions> _options;

        public DynamicFormStartupTask(
            EntitySchemaScannerService scanner,
            IOptions<DynamicFormSystemOptions> options)
        {
            _scanner = scanner;
            _options = options;
        }

        public async Task ExecuteAsync()
        {
            if (!_options.Value.AutoScanOnStartup)
                return;

            // Check if we need to initialize (simplified check)
            if (await HasAnySchemaAsync())
                return;

            // Execute scan
            await _scanner.ScanAllEntities(new EntityScanOptions
            {
                Assemblies = GetApplicationAssemblies()
            });
        }

        private async Task<bool> HasAnySchemaAsync()
        {
            // Simplified check - in a real implementation, we would check the repositories
            return false;
        }

        private Assembly[] GetApplicationAssemblies()
        {
            // Get the entry assembly and its referenced assemblies
            var entryAssembly = Assembly.GetEntryAssembly();
            if (entryAssembly == null)
                return new Assembly[0];

            var assemblies = new List<Assembly> { entryAssembly };

            // Add referenced assemblies that are not system assemblies
            foreach (var assemblyName in entryAssembly.GetReferencedAssemblies())
            {
                if (!assemblyName.FullName.StartsWith("System.") &&
                    !assemblyName.FullName.StartsWith("Microsoft.") &&
                    !assemblyName.FullName.StartsWith("Volo.Abp."))
                {
                    try
                    {
                        var assembly = Assembly.Load(assemblyName);
                        assemblies.Add(assembly);
                    }
                    catch { /* Ignore assembly loading errors */ }
                }
            }

            return assemblies.ToArray();
        }
    }

    public interface IStartupTask
    {
        Task ExecuteAsync();
    }

    public class StartupTaskExecutor : ITransientDependency
    {
        private readonly IEnumerable<IStartupTask> _startupTasks;

        public StartupTaskExecutor(IEnumerable<IStartupTask> startupTasks)
        {
            _startupTasks = startupTasks;
        }

        public async Task ExecuteAsync()
        {
            foreach (var task in _startupTasks)
            {
                await task.ExecuteAsync();
            }
        }
    }
}