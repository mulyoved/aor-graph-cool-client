import isNotGraphqlPrivateType from '../isNotGraphqlPrivateType';

const getFieldType = (fieldType, requierd) => {
  if (fieldType.kind === 'NON_NULL') {
    requierd = true;
  }

  if (fieldType.name) {
    return fieldType.name + (requierd ? '!' : '');
  } else if (fieldType.ofType.name) {
    return getFieldType(fieldType.ofType, requierd);
  } else {
    console.error("getFieldType, failed to get field type", fieldType);
    throw new Error("getFieldType, failed to get field type");
  }
};



const getFieldName = (field) => {
  if (relationship(field)) {
    return `${field.name} {id}`;
  } else {
    return field.name;
  }
};


const typeIsRelationship = (type) => (type.kind === 'LIST' || type.kind === 'OBJECT');

const relationship = (field) => (typeIsRelationship(field.type) || (
  field.type.kind === 'NON_NULL' && field.type.ofType && typeIsRelationship(field.type.ofType))
);

const scalar = (field) => !relationship(field);

const meta = ({name}) => name.indexOf('_') === 0 && name.indexOf('Meta') > 0;

export default (resource, type, { excludeFields }) => {
  const fields =
    resource.fields
      .filter(isNotGraphqlPrivateType)
      .filter((field) => {
        if (meta(field)) {
          return false;
        }

        if (excludeFields) {
          if (Array.isArray(excludeFields)) {
            return !excludeFields.includes(field.name);
          }

          if (typeof excludeFields === 'function') {
            return !excludeFields(field, resource, type);
          }
        }

        return true;
      })
      .map(f => getFieldName(f)).join(' ');

  let fieldsAsParam = type.args.filter(scalar).map(f => `\$${f.name}: ${getFieldType(f.type, false)}`).join(' ');
  let fieldsAsValues = type.args.filter(scalar).map(f => `${f.name}: \$${f.name}`).join(' ');
  console.log('AOR DBG - buildFieldList', fields, fieldsAsParam, fieldsAsValues);

  return {fields, fieldsAsParam, fieldsAsValues}
}
