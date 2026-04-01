using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;

namespace Volo.Abp.DynamicFormSystem
{
    public class EntitySchemaScannerService : ITransientDependency
    {
        private readonly IRepository<FormSchema, Guid> _formSchemaRepository;
        private readonly IRepository<ColumnSchema, Guid> _columnSchemaRepository;
        private readonly IRepository<LookupSchema, Guid> _lookupSchemaRepository;

        public EntitySchemaScannerService(
            IRepository<FormSchema, Guid> formSchemaRepository,
            IRepository<ColumnSchema, Guid> columnSchemaRepository,
            IRepository<LookupSchema, Guid> lookupSchemaRepository)
        {
            _formSchemaRepository = formSchemaRepository;
            _columnSchemaRepository = columnSchemaRepository;
            _lookupSchemaRepository = lookupSchemaRepository;
        }

        public async Task<ScanResult> ScanAllEntities(EntityScanOptions options)
        {
            var results = new ScanResult
            {
                Scanned = new List<string>(),
                Created = new List<string>(),
                Updated = new List<string>(),
                Errors = new List<ScanError>()
            };

            // Get all entity types from the specified assemblies
            var entities = GetEntityTypes(options);

            // Scan each entity
            foreach (var entityType in entities)
            {
                try
                {
                    // Scan entity properties
                    var schema = await ScanEntity(entityType);

                    // Save to configuration tables
                    await SaveSchema(entityType.Name, schema);

                    results.Scanned.Add(entityType.Name);
                    results.Created.Add(entityType.Name);
                }
                catch (Exception ex)
                {
                    results.Errors.Add(new ScanError
                    {
                        Entity = entityType.Name,
                        Error = ex.Message
                    });
                }
            }

            return results;
        }

        public async Task<GeneratedSchema> ScanEntity(Type entityType)
        {
            var properties = GetProperties(entityType);

            // Generate form schema
            var formFields = properties
                .Where(p => !IsNavigationProperty(p) || IsForeignKey(p))
                .Select(p => InferFormField(p))
                .OrderBy(f => f.DisplayOrder)
                .ToList();

            // Generate column schema
            var columns = properties
                .Where(p => ShouldDisplayInList(p))
                .Select(p => InferColumn(p))
                .OrderBy(c => c.DisplayOrder)
                .ToList();

            // Generate lookup schema
            var lookups = properties
                .Where(p => IsNavigationProperty(p))
                .Select(p => InferLookup(p))
                .Where(l => l != null)
                .Select(l => l!)
                .ToList();

            return new GeneratedSchema
            {
                EntityName = entityType.Name,
                FormFields = formFields,
                Columns = columns,
                Lookups = lookups,
                GeneratedAt = DateTime.UtcNow
            };
        }

        private List<Type> GetEntityTypes(EntityScanOptions options)
        {
            var entityTypes = new List<Type>();

            foreach (var assembly in options.Assemblies)
            {
                try
                {
                    var types = assembly.GetTypes()
                        .Where(t => t.IsClass && !t.IsAbstract && !t.IsGenericType)
                        .Where(t => {
                            // Check if the type is an entity (simplified check)
                            return t.GetProperties().Any(p => p.Name == "Id");
                        });

                    entityTypes.AddRange(types);
                }
                catch { /* Ignore assembly errors */ }
            }

            return entityTypes;
        }

        private List<PropertyInfo> GetProperties(Type entityType)
        {
            return entityType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.CanRead && p.CanWrite)
                .ToList();
        }

        private FormSchema InferFormField(PropertyInfo property)
        {
            var field = new FormSchema
            {
                EntityName = property.DeclaringType!.Name,
                FieldName = property.Name,
                FieldLabel = GetDisplayName(property),
                FieldType = MapToFormType(property),
                IsRequired = InferRequired(property),
                MaxLength = InferMaxLength(property),
                DisplayOrder = InferOrder(property),
                ColSpan = InferColSpan(property),
                IsVisible = true,
                IsReadOnly = false,
                Options = InferOptions(property)
            };

            return field;
        }

        private ColumnSchema InferColumn(PropertyInfo property)
        {
            var column = new ColumnSchema
            {
                EntityName = property.DeclaringType!.Name,
                FieldName = property.Name,
                HeaderName = GetDisplayName(property),
                Width = InferColumnWidth(property),
                IsSortable = true,
                IsVisible = true,
                Frozen = null,
                Align = InferAlignment(property),
                Formatter = InferFormatter(property),
                DisplayOrder = InferOrder(property)
            };

            return column;
        }

        private LookupSchema? InferLookup(PropertyInfo property)
        {
            // Check if it's a navigation property
            if (!IsNavigationProperty(property))
                return null;

            var lookup = new LookupSchema
            {
                EntityName = property.DeclaringType!.Name,
                PropertyName = property.Name,
                TargetEntity = property.PropertyType.Name,
                DisplayField = InferDisplayField(property.PropertyType),
                ValueField = "Id",
                ApiUrl = $"/api/{property.PropertyType.Name.ToLower()}",
                IsTree = false,
                DefaultFilters = "{}"
            };

            return lookup;
        }

        private string GetDisplayName(PropertyInfo property)
        {
            // Try to get display name from attributes
            var displayAttribute = property.GetCustomAttribute<System.ComponentModel.DisplayNameAttribute>();
            if (displayAttribute != null)
                return displayAttribute.DisplayName;

            // Fallback to property name
            return property.Name;
        }

        private string MapToFormType(PropertyInfo property)
        {
            var type = property.PropertyType;

            // Handle nullable types
            if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>))
                type = type.GetGenericArguments()[0];

            if (type == typeof(string))
                return "text";
            if (type == typeof(int) || type == typeof(long) || type == typeof(short) || type == typeof(byte))
                return "number";
            if (type == typeof(decimal) || type == typeof(float) || type == typeof(double))
                return "number";
            if (type == typeof(bool))
                return "switch";
            if (type == typeof(DateTime))
                return "datetime";
            if (type.IsEnum)
                return "select";
            if (type == typeof(Guid))
                return "text";

            return "text";
        }

        private bool InferRequired(PropertyInfo property)
        {
            // Check for Required attribute
            if (property.GetCustomAttribute<System.ComponentModel.DataAnnotations.RequiredAttribute>() != null)
                return true;

            // Check if it's a value type and not nullable
            if (property.PropertyType.IsValueType && !IsNullable(property))
                return true;

            return false;
        }

        private int? InferMaxLength(PropertyInfo property)
        {
            // Check for StringLength or MaxLength attribute
            var stringLength = property.GetCustomAttribute<System.ComponentModel.DataAnnotations.StringLengthAttribute>();
            if (stringLength != null)
                return stringLength.MaximumLength;

            var maxLength = property.GetCustomAttribute<System.ComponentModel.DataAnnotations.MaxLengthAttribute>();
            if (maxLength != null)
                return maxLength.Length;

            // Default for string
            if (property.PropertyType == typeof(string))
                return 256;

            return null;
        }

        private int InferOrder(PropertyInfo property)
        {
            // Simple order based on property position
            var properties = property.DeclaringType!.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            return Array.IndexOf(properties, property) + 1;
        }

        private int InferColSpan(PropertyInfo property)
        {
            // Default to 1 column
            return 1;
        }

        private string? InferOptions(PropertyInfo property)
        {
            // Handle enums
            if (property.PropertyType.IsEnum)
            {
                var options = new List<object>();
                foreach (var value in Enum.GetValues(property.PropertyType))
                {
                    options.Add(new
                    {
                        label = Enum.GetName(property.PropertyType, value),
                        value = (int)value
                    });
                }
                return System.Text.Json.JsonSerializer.Serialize(options);
            }

            return null;
        }

        private int? InferColumnWidth(PropertyInfo property)
        {
            var type = property.PropertyType;

            if (type == typeof(string))
                return 200;
            if (type == typeof(int) || type == typeof(long))
                return 100;
            if (type == typeof(bool))
                return 80;
            if (type == typeof(DateTime))
                return 150;

            return 120;
        }

        private string InferAlignment(PropertyInfo property)
        {
            var type = property.PropertyType;

            if (type == typeof(int) || type == typeof(long) || type == typeof(decimal) || type == typeof(float) || type == typeof(double))
                return "right";

            return "left";
        }

        private string? InferFormatter(PropertyInfo property)
        {
            var type = property.PropertyType;

            if (type == typeof(DateTime))
                return "date";
            if (type == typeof(bool))
                return "boolean";

            return null;
        }

        private string InferDisplayField(Type entityType)
        {
            // Try to find a Name property
            var nameProperty = entityType.GetProperty("Name");
            if (nameProperty != null)
                return "Name";

            // Try to find a DisplayName property
            var displayNameProperty = entityType.GetProperty("DisplayName");
            if (displayNameProperty != null)
                return "DisplayName";

            // Default to Id
            return "Id";
        }

        private bool IsNavigationProperty(PropertyInfo property)
        {
            // Simplified check - assume reference types (excluding string) are navigation properties
            return property.PropertyType.IsClass && property.PropertyType != typeof(string);
        }

        private bool IsForeignKey(PropertyInfo property)
        {
            // Check if property name ends with Id
            return property.Name.EndsWith("Id", StringComparison.OrdinalIgnoreCase);
        }

        private bool IsNullable(PropertyInfo property)
        {
            return property.PropertyType.IsGenericType && 
                   property.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>);
        }

        private bool ShouldDisplayInList(PropertyInfo property)
        {
            // Exclude navigation properties (except foreign keys)
            if (IsNavigationProperty(property) && !IsForeignKey(property))
                return false;

            // Exclude certain property names
            var excludedNames = new[] { "Id", "CreationTime", "LastModificationTime", "IsDeleted" };
            return !excludedNames.Contains(property.Name);
        }

        private async Task SaveSchema(string entityName, GeneratedSchema schema)
        {
            // Save form schemas
            foreach (var field in schema.FormFields)
            {
                await _formSchemaRepository.InsertAsync(field);
            }

            // Save column schemas
            foreach (var column in schema.Columns)
            {
                await _columnSchemaRepository.InsertAsync(column);
            }

            // Save lookup schemas
            foreach (var lookup in schema.Lookups)
            {
                if (lookup != null)
                {
                    await _lookupSchemaRepository.InsertAsync(lookup);
                }
            }
        }
    }

    public class EntityScanOptions
    {
        public Assembly[] Assemblies { get; set; }
        public Type[]? ExcludeTypes { get; set; }
        public string[]? NamespacePatterns { get; set; }
        public string[]? ExcludeNamespacePatterns { get; set; }
        public bool ScanInheritedProperties { get; set; } = true;
        public bool ScanNavigationProperties { get; set; } = true;
    }

    public class ScanResult
    {
        public List<string> Scanned { get; set; }
        public List<string> Created { get; set; }
        public List<string> Updated { get; set; }
        public List<ScanError> Errors { get; set; }
    }

    public class ScanError
    {
        public string Entity { get; set; }
        public string Error { get; set; }
    }

    public class GeneratedSchema
    {
        public string EntityName { get; set; }
        public List<FormSchema> FormFields { get; set; }
        public List<ColumnSchema> Columns { get; set; }
        public List<LookupSchema> Lookups { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
}