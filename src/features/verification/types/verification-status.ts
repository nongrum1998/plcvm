export interface VerificationStatusT {
  app_date: string | null;
  app_exp: string | null;
  certificate_datetime: string | null;
  certificate_id: string | null;
  device_id: string | null;
  device_name: string | null;
  facial_regn_date: string | null;
  facial_regn_no: string | null;
  facial_status: 'Approved' | 'Rejected';
  nec: string | null;
  nmc: string | null;
}
