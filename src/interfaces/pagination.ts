export enum PaginationFormKey {
  limit = "limit",
  page = "page",
}
export type IPaginationForm = {
  [key in PaginationFormKey]?: any;
};
