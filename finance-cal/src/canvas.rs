mod canvas {
    use std::rc::Rc;

    use console_error_panic_hook;
    use serde::{Deserialize, Serialize};
    use serde_wasm_bindgen::from_value;
    use wasm_bindgen::prelude::*;
    use web_sys::{window, CanvasRenderingContext2d, HtmlCanvasElement, MouseEvent};

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
    /// 获取指定 id 的 canvas 元素
    #[wasm_bindgen]
    pub fn get_canvas(id: &str) -> HtmlCanvasElement {
        getElementById(id)
    }

    /// 获取全局 window 对象
    #[wasm_bindgen]
    pub fn get_window() -> Result<web_sys::Window, JsValue> {
        window().ok_or(JsValue::from_str("no global `window` exists"))
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
        let rc_context = Rc::new(get_context(&canvas)?);
        let data: Result<Vec<KlineItem>, _> = from_value(data);
        let data = data.map_err(|err| JsValue::from(err))?;

        // 获取Canvas元素的高度，上下留白20px，还需考虑标题区域、滚动区域高度
        let offset_y_bottom = 40.0;
        let legend_h = 40.0;
        let scroll_bar_h = 40.0;
        let canvas_height = canvas.height() as f64 - offset_y_bottom - legend_h - scroll_bar_h;
        // 获取Canvas元素宽度，左侧留白40px
        let offset_x_left = 40.0;
        let canvas_width = canvas.width() as f64 - offset_x_left;
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
        // 向上或向下取值（可选择开启）
        // let max_high = (max_high / 100.0).ceil() * 100.0;
        // let min_low = (min_low / 100.0).floor() * 100.0;
        // 计算差值
        let difference = max_high - min_low;
        // 计算高度分布系数,单位数字所占像素点
        let scale = canvas_height / difference;
        // height 是差值 需要加上最低值的预设值
        let canvas_height_with_min = canvas_height + legend_h + min_low * scale;

        let context = rc_context.clone();
        // 绘制标题
        context.set_font("14px Arial");
        context.set_fill_style(&JsValue::from_str("black"));
        let _ = context.fill_text("K线数据展示", 0.0, legend_h / 3.0);

        // 绘制坐标系
        context.begin_path();
        context.move_to(offset_x_left, legend_h);
        context.line_to(offset_x_left, canvas_height + legend_h);
        context.line_to(offset_x_left + canvas_width, canvas_height + legend_h);
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
            let x = i as f64 * x_axis_tick_interval + offset_x_left;
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
                x - 25.0,
                canvas_height + legend_h + offset_y_bottom / 2.0,
            );
        }

        // 绘制Y坐标间隔
        for i in 0..=y_axis_tick_count {
            let y = i as f64 * y_axis_tick_interval;
            context.begin_path();
            context.move_to(offset_x_left, canvas_height + legend_h - y);
            context.line_to(offset_x_left - 4.0, canvas_height + legend_h - y);
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
            let x = index as f64 * kline_width + offset_x_left + padding as f64;
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
        // K线绘制完成 保存当前栈
        context.save();

        // 增加鼠标over事件
        let move_context = rc_context.clone();
        let mousemove_closure = Closure::wrap(Box::new(move |event: MouseEvent| {
            // 获取鼠标光标的x和y坐标
            let x = event.client_x();
            let y = event.client_y();
            // 为了调试，记录坐标
            log(&format!("鼠标在: ({}, {})", x, y));
            move_context.restore();
            // TODO 根据 x y 计算下标位置
            // TODO 根据下标获取数据
            // TODO 重新绘制K线数据
            // 使用contex绘制悬浮效果展示K线数据
        }) as Box<dyn FnMut(_)>);

        canvas.add_event_listener_with_callback(
            "mousemove",
            mousemove_closure.as_ref().unchecked_ref(),
        )?;
        // 忘记闭包
        mousemove_closure.forget();

        // 增加鼠标out事件
        let out_context = rc_context.clone();
        let mouseout_closure = Closure::wrap(Box::new(move |event: MouseEvent| {
            // 获取鼠标光标的x和y坐标
            let x = event.client_x();
            let y = event.client_y();
            // 为了调试，记录坐标
            log(&format!("鼠标在: ({}, {})", x, y));
            // 根据xy 清除对应区域的内容
            out_context.restore();
        }) as Box<dyn FnMut(_)>);
        canvas.add_event_listener_with_callback(
            "mouseout",
            mouseout_closure.as_ref().unchecked_ref(),
        )?;
        mouseout_closure.forget();
        Ok(())
    }
}
