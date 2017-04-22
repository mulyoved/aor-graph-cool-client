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
    throw new Error("getFieldType, failed to get field type");
  }
};

export default (resource, type, { excludeFields }) => {
  const fields =
    resource.fields
      .filter(isNotGraphqlPrivateType)
      .filter((field) => {
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
      .map(f => f.name).join(' ');

  let fieldsAsParam = type.args.map(f => `\$${f.name}: ${getFieldType(f.type, false)}`).join(' ');
  let fieldsAsValues = type.args.map(f => `${f.name}: \$${f.name}`).join(' ');

  return {fields, fieldsAsParam, fieldsAsValues}
}
