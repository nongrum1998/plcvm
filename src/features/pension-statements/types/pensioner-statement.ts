export type PensionerStatement = {
  date_frm: string;
  date_to: string;
  no_of_months: string;
  bp: string;
  dp: string;
  da: string;
  ma: string;
  age_bonus: string;
  wa: string;
  dra: string;
  oth: string;
  arr_gross: string;
  gra_gross: string;
  comm_gross: string;
  deduction: string;
  net_amt: string;
  ddo_bill_date: string;
};

export interface PensionStatementResponseI {
  pdf: string;
  pension: PensionerStatement[];
}
