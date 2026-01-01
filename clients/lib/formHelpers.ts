// utils/formHelpers.ts
// recursively append object/array values into FormData
export function appendFormData(
  form: FormData,
  data: any,
  parentKey?: string
): void {
  if (data === undefined || data === null) return;

  // Primitives (string, number, boolean, File, Blob, Date)
  if (
    typeof data === "string" ||
    typeof data === "number" ||
    typeof data === "boolean" ||
    data instanceof File ||
    data instanceof Blob ||
    data instanceof Date
  ) {
    form.append(parentKey!, String(data));
    return;
  }

  // Arrays
  if (Array.isArray(data)) {
    data.forEach((value, index) => {
      // Use [] convention for arrays: keyName[] = value
      const key = parentKey ? `${parentKey}[]` : `${index}`;
      if (typeof value === "object" && value !== null) {
        // nested objects inside arrays -> use index in bracket style to preserve structure
        appendFormData(form, value, `${parentKey}[${index}]`);
      } else {
        form.append(key, String(value));
      }
    });
    return;
  }

  // Objects (plain)
  Object.keys(data).forEach((key) => {
    const value = data[key];
    const formKey = parentKey ? `${parentKey}[${key}]` : key;
    appendFormData(form, value, formKey);
  });
}
