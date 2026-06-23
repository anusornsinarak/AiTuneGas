export interface TuneAdvice {
  status: string;
  message?: string;
  rpm_analysis?: string;
  load_analysis?: string;
  recommendation?: string;
  danger_warnings?: string;
  is_finished?: boolean;
  raw?: string;
  [key: string]: any;
}
