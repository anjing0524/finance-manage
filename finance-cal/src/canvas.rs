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
        getElementById(id)
    }

    #[wasm_bindgen]
    pub fn get_window() -> web_sys::Window {
        window().expect("no global `window` exists")
    }

    #[wasm_bindgen]
    pub fn get_context(canvas: &HtmlCanvasElement) -> Result<CanvasRenderingContext2d, JsValue> {
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
        console_error_panic_hook::set_once();
        let canvas = get_canvas(id);
        let context = get_context(&canvas)?;
        let data: Result<Vec<KlineItem>, _> = from_value(data);
        let data: Vec<KlineItem> = match data {
            Ok(value) => value,
            Err(err) => {
                return Err(JsValue::from(err));
            }
        };

        // 获取Canvas元素的高度，上下留白20px，还需考虑标题区域、滚动区域高度
        let offset_y = 20.0;
        let legend_h = 40.0;
        let scroll_bar_h = 40.0;
        let canvas_height = canvas.height() as f64 - offset_y - legend_h - scroll_bar_h;
        // 获取Canvas元素宽度，左侧留白40px
        let offset_x = 40.0;
        let canvas_width = canvas.width() as f64 - offset_x;
        let padding = 5;
        // 计算K线图的横向间隔 左右各留5px空白区域
        let kline_width = (canvas_width - (padding * 2) as f64) / data.len() as f64;
        // 计算最大的最高价和最小的最低价
        let (max_high, min_low) =
            data.iter()
                .fold((f64::NEG_INFINITY, f64::INFINITY), |(max, min), item| {
                    let max_high = max.max(item.highest);
                    let min_low = min.min(item.lowest);
                    (max_high, min_low)
                });
        // 计算差值
        let difference = max_high - min_low;
        // 计算高度分布系数,单位数字所占像素点
        let scale = canvas_height / difference;
        // height 是差值 需要加上最低值的预设值
        let canvas_height_with_min = canvas_height + legend_h + min_low * scale;

        // 绘制标题
        context.set_font("14px Arial");
        context.set_fill_style(&JsValue::from_str("black"));
        let _ = context.fill_text("K线数据展示", 0.0, legend_h / 3.0);

        // 绘制坐标系
        context.begin_path();
        context.move_to(offset_x, legend_h);
        context.line_to(offset_x, canvas_height + legend_h);
        context.line_to(offset_x + canvas_width, canvas_height + legend_h);
        context.set_stroke_style(&JsValue::from_str("rgb(0, 0, 0,1)"));
        context.stroke();
        context.close_path();

        // 绘制坐标系间隔
        let x_axis_tick_count = 10; // 假设间隔为10
        let x_axis_tick_interval = canvas_width / x_axis_tick_count as f64;
        let y_axis_tick_count = 10;
        let y_axis_tick_interval = canvas_height / y_axis_tick_count as f64;
        // 绘制X坐标间隔
        for i in 0..x_axis_tick_count {
            let x = i as f64 * x_axis_tick_interval + offset_x;
            context.begin_path();
            context.move_to(x, canvas_height + legend_h);
            context.line_to(x, canvas_height + legend_h + 4.0);
            context.set_stroke_style(&JsValue::from_str("rgb(0, 0, 0,1)"));
            context.stroke();
            context.close_path();
            // 绘制文本
            context.set_font("10px Arial");
            context.set_fill_style(&JsValue::from_str("black"));
            let mut idx = data.len() / x_axis_tick_count * i;
            if idx != 0 {
                idx -= 1;
            }

            // 一个默认值
            let default = &KlineItem {
                date: "日期".to_string(),
                open: 0.0,
                close: 0.0,
                lowest: 0.0,
                highest: 0.0,
            };
            // 取对应tick的值
            let item = match data.get(idx) {
                Some(v) => v,
                None => default,
            };
            let _ = context.fill_text(
                &item.date,
                x - 20.0,
                canvas_height + legend_h + offset_y / 2.0,
            );
        }

        // 绘制Y坐标间隔
        for i in 0..=y_axis_tick_count {
            let y = i as f64 * y_axis_tick_interval;
            context.begin_path();
            context.move_to(offset_x, canvas_height + legend_h - y);
            context.line_to(offset_x - 4.0, canvas_height + legend_h - y);
            context.set_stroke_style(&JsValue::from_str("rgb(0, 0, 0,1)"));
            context.stroke();
            context.close_path();
            // 绘制文字
            context.set_font("10px Arial");
            context.set_fill_style(&JsValue::from_str("black"));
            let text =
                difference / y_axis_tick_count as f64 * (y_axis_tick_count - i) as f64 + min_low;
            let text = format!("{:.2}", text);
            let _ = context.fill_text(&text, 0.0, y + legend_h + 4.0);
        }

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
            let x = index as f64 * kline_width + offset_x + padding as f64;
            // 计算 K 线的高度和 y 坐标，根据Canvas元素的高度进行缩放
            let height = (highest - lowest) * scale;
            let y = canvas_height_with_min - highest * scale;

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
                let rect_y: f64 = canvas_height_with_min - close * scale;
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
                let rect_y = canvas_height_with_min - open * scale;
                let rect_height = (open - close) * scale;
                context.fill_rect(x, rect_y, kline_width, rect_height);
            }
        }

        Ok(())
    }
}
