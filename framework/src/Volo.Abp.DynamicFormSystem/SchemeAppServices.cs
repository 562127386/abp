using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Volo.Abp.DynamicFormSystem
{
    public class SchemeAppService : ApplicationService, ISchemeAppService
    {
        private readonly IRepository<FormSchema, Guid> _formSchemaRepository;
        private readonly IRepository<ColumnSchema, Guid> _columnSchemaRepository;
        private readonly IRepository<LookupSchema, Guid> _lookupSchemaRepository;

        public SchemeAppService(
            IRepository<FormSchema, Guid> formSchemaRepository,
            IRepository<ColumnSchema, Guid> columnSchemaRepository,
            IRepository<LookupSchema, Guid> lookupSchemaRepository)
        {
            _formSchemaRepository = formSchemaRepository;
            _columnSchemaRepository = columnSchemaRepository;
            _lookupSchemaRepository = lookupSchemaRepository;
        }

        // Form Schema methods
        public async Task<List<FormSchemaDto>> GetFormSchemasAsync(string entityName)
        {
            var schemas = await _formSchemaRepository.GetListAsync(
                x => x.EntityName == entityName
            );
            return ObjectMapper.Map<List<FormSchema>, List<FormSchemaDto>>(schemas);
        }

        public async Task<FormSchemaDto> GetFormSchemaAsync(Guid id)
        {
            var schema = await _formSchemaRepository.GetAsync(id);
            return ObjectMapper.Map<FormSchema, FormSchemaDto>(schema);
        }

        public async Task<FormSchemaDto> CreateFormSchemaAsync(CreateFormSchemaDto input)
        {
            var schema = ObjectMapper.Map<CreateFormSchemaDto, FormSchema>(input);
            await _formSchemaRepository.InsertAsync(schema);
            return ObjectMapper.Map<FormSchema, FormSchemaDto>(schema);
        }

        public async Task<FormSchemaDto> UpdateFormSchemaAsync(Guid id, UpdateFormSchemaDto input)
        {
            var schema = await _formSchemaRepository.GetAsync(id);
            ObjectMapper.Map(input, schema);
            await _formSchemaRepository.UpdateAsync(schema);
            return ObjectMapper.Map<FormSchema, FormSchemaDto>(schema);
        }

        public async Task DeleteFormSchemaAsync(Guid id)
        {
            await _formSchemaRepository.DeleteAsync(id);
        }

        // Column Schema methods
        public async Task<List<ColumnSchemaDto>> GetColumnSchemasAsync(string entityName)
        {
            var schemas = await _columnSchemaRepository.GetListAsync(
                x => x.EntityName == entityName
            );
            return ObjectMapper.Map<List<ColumnSchema>, List<ColumnSchemaDto>>(schemas);
        }

        public async Task<ColumnSchemaDto> GetColumnSchemaAsync(Guid id)
        {
            var schema = await _columnSchemaRepository.GetAsync(id);
            return ObjectMapper.Map<ColumnSchema, ColumnSchemaDto>(schema);
        }

        public async Task<ColumnSchemaDto> CreateColumnSchemaAsync(CreateColumnSchemaDto input)
        {
            var schema = ObjectMapper.Map<CreateColumnSchemaDto, ColumnSchema>(input);
            await _columnSchemaRepository.InsertAsync(schema);
            return ObjectMapper.Map<ColumnSchema, ColumnSchemaDto>(schema);
        }

        public async Task<ColumnSchemaDto> UpdateColumnSchemaAsync(Guid id, UpdateColumnSchemaDto input)
        {
            var schema = await _columnSchemaRepository.GetAsync(id);
            ObjectMapper.Map(input, schema);
            await _columnSchemaRepository.UpdateAsync(schema);
            return ObjectMapper.Map<ColumnSchema, ColumnSchemaDto>(schema);
        }

        public async Task DeleteColumnSchemaAsync(Guid id)
        {
            await _columnSchemaRepository.DeleteAsync(id);
        }

        // Lookup Schema methods
        public async Task<List<LookupSchemaDto>> GetLookupSchemasAsync(string entityName)
        {
            var schemas = await _lookupSchemaRepository.GetListAsync(
                x => x.EntityName == entityName
            );
            return ObjectMapper.Map<List<LookupSchema>, List<LookupSchemaDto>>(schemas);
        }

        public async Task<LookupSchemaDto> GetLookupSchemaAsync(Guid id)
        {
            var schema = await _lookupSchemaRepository.GetAsync(id);
            return ObjectMapper.Map<LookupSchema, LookupSchemaDto>(schema);
        }

        public async Task<LookupSchemaDto> CreateLookupSchemaAsync(CreateLookupSchemaDto input)
        {
            var schema = ObjectMapper.Map<CreateLookupSchemaDto, LookupSchema>(input);
            await _lookupSchemaRepository.InsertAsync(schema);
            return ObjectMapper.Map<LookupSchema, LookupSchemaDto>(schema);
        }

        public async Task<LookupSchemaDto> UpdateLookupSchemaAsync(Guid id, UpdateLookupSchemaDto input)
        {
            var schema = await _lookupSchemaRepository.GetAsync(id);
            ObjectMapper.Map(input, schema);
            await _lookupSchemaRepository.UpdateAsync(schema);
            return ObjectMapper.Map<LookupSchema, LookupSchemaDto>(schema);
        }

        public async Task DeleteLookupSchemaAsync(Guid id)
        {
            await _lookupSchemaRepository.DeleteAsync(id);
        }
    }

    public interface ISchemeAppService : IApplicationService
    {
        // Form Schema methods
        Task<List<FormSchemaDto>> GetFormSchemasAsync(string entityName);
        Task<FormSchemaDto> GetFormSchemaAsync(Guid id);
        Task<FormSchemaDto> CreateFormSchemaAsync(CreateFormSchemaDto input);
        Task<FormSchemaDto> UpdateFormSchemaAsync(Guid id, UpdateFormSchemaDto input);
        Task DeleteFormSchemaAsync(Guid id);

        // Column Schema methods
        Task<List<ColumnSchemaDto>> GetColumnSchemasAsync(string entityName);
        Task<ColumnSchemaDto> GetColumnSchemaAsync(Guid id);
        Task<ColumnSchemaDto> CreateColumnSchemaAsync(CreateColumnSchemaDto input);
        Task<ColumnSchemaDto> UpdateColumnSchemaAsync(Guid id, UpdateColumnSchemaDto input);
        Task DeleteColumnSchemaAsync(Guid id);

        // Lookup Schema methods
        Task<List<LookupSchemaDto>> GetLookupSchemasAsync(string entityName);
        Task<LookupSchemaDto> GetLookupSchemaAsync(Guid id);
        Task<LookupSchemaDto> CreateLookupSchemaAsync(CreateLookupSchemaDto input);
        Task<LookupSchemaDto> UpdateLookupSchemaAsync(Guid id, UpdateLookupSchemaDto input);
        Task DeleteLookupSchemaAsync(Guid id);
    }

    // DTOs
    public class CreateFormSchemaDto
    {
        public string EntityName { get; set; }
        public string FieldName { get; set; }
        public string FieldLabel { get; set; }
        public string FieldType { get; set; }
        public bool IsRequired { get; set; }
        public int? MaxLength { get; set; }
        public int DisplayOrder { get; set; }
        public int ColSpan { get; set; }
        public bool IsVisible { get; set; }
        public bool IsReadOnly { get; set; }
        public string Options { get; set; }
    }

    public class UpdateFormSchemaDto
    {
        public string EntityName { get; set; }
        public string FieldName { get; set; }
        public string FieldLabel { get; set; }
        public string FieldType { get; set; }
        public bool IsRequired { get; set; }
        public int? MaxLength { get; set; }
        public int DisplayOrder { get; set; }
        public int ColSpan { get; set; }
        public bool IsVisible { get; set; }
        public bool IsReadOnly { get; set; }
        public string Options { get; set; }
    }

    public class CreateColumnSchemaDto
    {
        public string EntityName { get; set; }
        public string FieldName { get; set; }
        public string HeaderName { get; set; }
        public int? Width { get; set; }
        public bool IsSortable { get; set; }
        public bool IsVisible { get; set; }
        public string Frozen { get; set; }
        public string Align { get; set; }
        public string Formatter { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class UpdateColumnSchemaDto
    {
        public string EntityName { get; set; }
        public string FieldName { get; set; }
        public string HeaderName { get; set; }
        public int? Width { get; set; }
        public bool IsSortable { get; set; }
        public bool IsVisible { get; set; }
        public string Frozen { get; set; }
        public string Align { get; set; }
        public string Formatter { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class CreateLookupSchemaDto
    {
        public string EntityName { get; set; }
        public string PropertyName { get; set; }
        public string TargetEntity { get; set; }
        public string DisplayField { get; set; }
        public string ValueField { get; set; }
        public string ApiUrl { get; set; }
        public bool IsTree { get; set; }
        public string DefaultFilters { get; set; }
    }

    public class UpdateLookupSchemaDto
    {
        public string EntityName { get; set; }
        public string PropertyName { get; set; }
        public string TargetEntity { get; set; }
        public string DisplayField { get; set; }
        public string ValueField { get; set; }
        public string ApiUrl { get; set; }
        public bool IsTree { get; set; }
        public string DefaultFilters { get; set; }
    }
}