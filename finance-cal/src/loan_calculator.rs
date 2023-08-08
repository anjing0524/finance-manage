mod loan_calculator {
    use log::info;
    use serde::{Deserialize, Serialize};
    use serde_json;
    use time::{Date, OffsetDateTime, Time};
    use wasm_bindgen::prelude::*;
    use wasm_bindgen::JsValue;

    #[wasm_bindgen]
    #[derive(Debug, Serialize, Deserialize, Default)]
    pub struct Loan {
        total_loan: f64,
        repayment_period: usize,
        annual_interest_rate: f64,
        loan_duration: u64,
    }

    #[wasm_bindgen]
    impl Loan {
        #[wasm_bindgen(constructor)]
        pub fn new(
            total_loan: f64,
            repayment_period: usize,
            annual_interest_rate: f64,
            loan_duration: u64,
        ) -> Loan {
            Loan {
                total_loan,
                repayment_period,
                annual_interest_rate,
                loan_duration,
            }
        }
    }

    #[wasm_bindgen]
    #[derive(Debug, Serialize, Deserialize)]
    struct RepaymentDetail {
        amount: f64,
        date: u64,
    }

    /**
     *  给时间增加月份
     */
    fn add_months(
        date_time: OffsetDateTime,
        months: u8,
    ) -> Result<u64, time::error::ComponentRange> {
        info!("{}", date_time);
        println!("{:?}", date_time);
        let mut year = date_time.year();
        let month = date_time.month().nth_next(months);

        let mut month_num = date_time.month() as u8 + months;
        while month_num > 12 {
            year += 1;
            month_num -= 12
        }

        let date = Date::from_calendar_date(year, month, date_time.day())?;
        let time = Time::from_hms_nano(
            date_time.hour(),
            date_time.minute(),
            date_time.second(),
            date_time.nanosecond(),
        )?;
        let new_date_time: OffsetDateTime = date.with_time(time).assume_offset(date_time.offset());
        println!("{:?}", new_date_time);
        Ok(new_date_time.unix_timestamp() as u64 * 1000)
    }

    // 等额本金
    #[wasm_bindgen]
    pub fn calculate_repayment_equal_principal(loan: &Loan) -> Result<JsValue, JsValue> {
        let mut principal = loan.total_loan;
        let interest_rate = loan.annual_interest_rate / 100.0;
        let repayment_period = loan.repayment_period;
        let monthly_interest_rate = interest_rate / 12.0;
        let monthly_principal_repayment = principal / repayment_period as f64;

        let mut repayment_details = Vec::with_capacity(repayment_period);

        let start_date: OffsetDateTime =
            OffsetDateTime::from_unix_timestamp(loan.loan_duration as i64 / 1000).unwrap();

        for i in 0..repayment_period {
            let interest = principal * monthly_interest_rate;
            let amount = monthly_principal_repayment + interest;
            let date: u64 = add_months(start_date, (i + 1) as u8).unwrap();
            principal -= monthly_principal_repayment;
            repayment_details.push(RepaymentDetail { amount, date });
        }

        let json_string = serde_json::to_string(&repayment_details)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))?;
        let js_value = JsValue::from_str(&json_string);

        Ok(js_value)
    }

    // 等额本息
    #[wasm_bindgen]
    pub fn calculate_repayment_equal_installment(loan: &Loan) -> Result<JsValue, JsValue> {
        let mut principal = loan.total_loan;
        let interest_rate = loan.annual_interest_rate / 100.0;
        let repayment_period = loan.repayment_period;
        let monthly_interest_rate = interest_rate / 12.0;
        let monthly_repayment = (principal * monthly_interest_rate)
            / (1.0 - (1.0 + monthly_interest_rate).powi(-(repayment_period as i32)));

        let mut repayment_details = Vec::with_capacity(repayment_period);

        let start_date = OffsetDateTime::from_unix_timestamp(loan.loan_duration as i64)
            .unwrap_or(OffsetDateTime::now_utc());

        for i in 0..repayment_period {
            let interest = principal * monthly_interest_rate;
            let principal_repayment = monthly_repayment - interest;
            let amount = monthly_repayment;
            let date = add_months(start_date, (i + 1) as u8).ok().unwrap();
            principal -= principal_repayment;
            repayment_details.push(RepaymentDetail { amount, date });
        }

        let json_string = serde_json::to_string(&repayment_details)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))?;
        let js_value = JsValue::from_str(&json_string);

        Ok(js_value)
    }

    // 先息后本
    #[wasm_bindgen]
    pub fn calculate_repayment_interest_first(loan: &Loan) -> Result<JsValue, JsValue> {
        let principal = loan.total_loan;
        let interest_rate = loan.annual_interest_rate / 100.0;
        let repayment_period = loan.repayment_period;
        let monthly_interest_rate = interest_rate / 12.0;
        let interest = principal * monthly_interest_rate;

        let mut repayment_details = Vec::with_capacity(repayment_period);
        let start_date = OffsetDateTime::from_unix_timestamp(loan.loan_duration as i64)
            .unwrap_or(OffsetDateTime::now_utc());

        for i in 0..repayment_period {
            let amount = if i == repayment_period - 1 {
                principal + interest
            } else {
                interest
            };
            let date = add_months(start_date, (i + 1) as u8).ok().unwrap();
            repayment_details.push(RepaymentDetail { amount, date });
        }

        let json_string = serde_json::to_string(&repayment_details)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))?;
        let js_value = JsValue::from_str(&json_string);

        Ok(js_value)
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use wasm_bindgen_test::*;

        #[wasm_bindgen_test]
        fn test_loan_new() {
            let loan = Loan::new(1000.0, 12, 5.0, 365);
            assert_eq!(loan.total_loan, 1000.0);
            assert_eq!(loan.repayment_period, 12);
            assert_eq!(loan.annual_interest_rate, 5.0);
            assert_eq!(loan.loan_duration, 365);
        }

        #[wasm_bindgen_test]
        fn test_calculate_repayment_equal_principal() {
            let loan = Loan::new(10000.0, 12, 5.0, 365);
            let result = calculate_repayment_equal_principal(&loan).unwrap();
            let repayment_details: Vec<RepaymentDetail> =
                serde_json::from_str(&result.as_string().unwrap()).unwrap();
            // Add specific assertions based on your expected output
            // For example, if you expect the first repayment amount to be 879.17
            assert_eq!(repayment_details[0].amount, 879.17);
            // Continue with the rest of the months
            for i in 1..12 {
                assert!(repayment_details[i].amount < repayment_details[i - 1].amount);
            }
            // Check the last repayment date
            assert_eq!(repayment_details[11].date, 365 + 11 * 30 * 24 * 60 * 60);
        }

        #[wasm_bindgen_test]
        fn test_calculate_repayment_equal_installment() {
            let loan = Loan::new(10000.0, 12, 5.0, 365);
            let result = calculate_repayment_equal_installment(&loan).unwrap();
            let repayment_details: Vec<RepaymentDetail> =
                serde_json::from_str(&result.as_string().unwrap()).unwrap();
            // Add specific assertions based on your expected output
            // For example, if you expect the first repayment amount to be 860.66
            assert_eq!(repayment_details[0].amount, 860.66);
            // Continue with the rest of the months
            for i in 1..12 {
                assert_eq!(repayment_details[i].amount, 860.66);
            }
            // Check the last repayment date
            assert_eq!(repayment_details[11].date, 365 + 11 * 30 * 24 * 60 * 60);
        }

        #[wasm_bindgen_test]
        fn test_calculate_repayment_interest_first() {
            let loan = Loan::new(10000.0, 12, 5.0, 365);
            let result = calculate_repayment_interest_first(&loan).unwrap();
            let repayment_details: Vec<RepaymentDetail> =
                serde_json::from_str(&result.as_string().unwrap()).unwrap();
            // Add specific assertions based on your expected output
            // For example, if you expect the first repayment amount to be 41.67
            assert_eq!(repayment_details[0].amount, 41.67);
            // Continue with the rest of the months
            for i in 1..11 {
                assert_eq!(repayment_details[i].amount, 41.67);
            }
            // The last repayment should include the principal
            assert_eq!(repayment_details[11].amount, 10041.67);
            // Check the last repayment date
            assert_eq!(repayment_details[11].date, 365 + 11 * 30 * 24 * 60 * 60);
        }
    }
}
