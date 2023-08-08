mod canvas {
    use console_error_panic_hook;
    use serde::{Deserialize, Serialize};
    use serde_wasm_bindgen::from_value;
    use wasm_bindgen::prelude::*;
    use web_sys::{window, CanvasRenderingContext2d, HtmlCanvasElement};

    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(js_namespace = document)]
        fn getElementById(id: &str) -> HtmlCanvasElement;

        #[wasm_bindgen(js_namespace = console)]
        fn log(s: &str);

        #[wasm_bindgen(js_namespace = Math)]
        fn max(a: f64, b: f64) -> f64;

        #[wasm_bindgen(js_namespace = Math)]
        fn min(a: f64, b: f64) -> f64;
    }

    #[wasm_bindgen]
    pub fn get_canvas(id: &str) -> HtmlCanvasElement {
        console_error_panic_hook::set_once();
        getElementById(id)
    }

    #[wasm_bindgen]
    pub fn get_window() -> web_sys::Window {
        console_error_panic_hook::set_once();
        window().expect("no global `window` exists")
    }

    #[wasm_bindgen]
    pub fn get_context(canvas: &HtmlCanvasElement) -> Result<CanvasRenderingContext2d, JsValue> {
        console_error_panic_hook::set_once();
        let context = canvas
            .get_context("2d")?
            .ok_or(JsValue::from_str("Unable to get context"))?;
        let context: CanvasRenderingContext2d = context.dyn_into::<CanvasRenderingContext2d>()?;
        Ok(context)
    }

    #[wasm_bindgen]
    pub fn draw_test(id: &str) -> Result<(), JsValue> {
        let canvas = get_canvas(id);
        let context = get_context(&canvas)?;

        // 绘制矩形
        context.set_fill_style(&JsValue::from_str("rgb(200, 0, 0)"));
        context.fill_rect(10 as f64, 10 as f64, 55 as f64, 50 as f64);

        context.set_fill_style(&JsValue::from_str("rgb(0, 0, 200, 0.5)"));
        context.fill_rect(30 as f64, 30 as f64, 55 as f64, 50 as f64);

        Ok(())
    }

    #[derive(Serialize, Deserialize)]
    struct KlineItem {
        date: String,
        open: f64,
        close: f64,
        lowest: f64,
        highest: f64,
    }

    #[wasm_bindgen]
    pub fn draw_kline(id: &str, data: JsValue) -> Result<(), JsValue> {
        let canvas = get_canvas(id);
        let context = get_context(&canvas)?;

        let data: Result<Vec<KlineItem>, _> = from_value(data);
        let data: Vec<KlineItem> = match data {
            Ok(value) => value,
            Err(err) => {
                return Err(JsValue::from(err));
            }
        };

        // 获取Canvas元素的高度
        let canvas_height = canvas.height() as f64;
        let canvas_width = canvas.width() as f64;
        // 计算K线图的横向间隔
        let kline_width = canvas_width as f64 / data.len() as f64;
        let max_high = data
            .iter()
            .map(|item| item.highest)
            .max_by(|a, b| a.partial_cmp(b).unwrap())
            .unwrap();
        let min_low = data
            .iter()
            .map(|item| item.lowest)
            .min_by(|a, b| a.partial_cmp(b).unwrap())
            .unwrap();
        let scale = canvas_height / (max_high - min_low);
        println!("max:{:?},min:{:?}", max_high, min_low);

        // 根据数据绘制K线图
        for (
            index,
            KlineItem {
                date: _,
                open,
                close,
                lowest,
                highest,
            },
        ) in data.iter().enumerate()
        {
            // 计算 x 坐标
            let x = index as f64 * kline_width;
            // 计算 K 线的高度和 y 坐标，根据Canvas元素的高度进行缩放
            let height = (highest - lowest) * scale;
            let y = canvas_height - highest * scale;

            if close >= open {
                // 开盘价小于等于收盘价，绘制红色矩形
                let red: JsValue = JsValue::from_str("rgb(235, 83, 84,1)");
                // 绘制上下影线
                context.set_stroke_style(&red);
                context.begin_path();
                context.move_to(x + kline_width / 2.0, y);
                context.line_to(x + kline_width / 2.0, y + height);
                context.stroke();
                // 绘制矩形
                context.set_fill_style(&red);
                let rect_y = canvas_height - close * scale;
                let rect_height = (close - open) * scale;
                context.fill_rect(x, rect_y, kline_width, rect_height);
            } else {
                // 开盘价大于收盘价，绘制绿色矩形
                let green: JsValue = JsValue::from_str("rgb(71, 178, 98,1)");
                // 绘制上下影线
                context.set_stroke_style(&green);
                context.begin_path();
                context.move_to(x + kline_width / 2.0, y);
                context.line_to(x + kline_width / 2.0, y + height);
                context.stroke();
                // 绘制矩形
                context.set_fill_style(&green);
                let rect_y = canvas_height - open * scale;
                let rect_height = (open - close) * scale;
                context.fill_rect(x, rect_y, kline_width, rect_height);
            }
        }

        Ok(())
    }
}
