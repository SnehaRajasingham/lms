import * as yup from 'yup';

export const bookSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  author: yup.string().required('Author is required'),
  isbn: yup
    .string()
    .matches(/^\d{10,13}$/, 'ISBN must be 10 or 13 digits')
    .required('ISBN is required'),
  copiesAvailable: yup
    .number()
    .min(1, 'At least one copy required')
    .required('Copies Available is required'),
});
