export type BlogPostValidationRule = (value: string) => true | string;

export interface BlogPostFormValue {
  title: string;
  summary: string;
  content: string;
}

export interface BlogPostFormLabels {
  title: string;
  summary: string;
  content: string;
}

export interface BlogPostFormProps {
  modelValue: BlogPostFormValue;
  labels: BlogPostFormLabels;
  disabled?: boolean;
  titleRules?: BlogPostValidationRule[];
  summaryRules?: BlogPostValidationRule[];
  contentRules?: BlogPostValidationRule[];
}
