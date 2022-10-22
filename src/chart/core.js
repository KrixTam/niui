'use strict';


if (typeof Array.isArray === 'undefined') {
	Array.isArray = function(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}
};

function gradient(x0, y0, x1, y1) {
    return (y1 - y0) / (x1 - x0);
};

const Canvas = function (container_id, width=640, height=640, title=undefined) {
	this._pixelRatio = window.devicePixelRatio;
	this._container = document.getElementById(container_id);
	this._canvas = document.createElement('canvas');
	this._container.appendChild(this._canvas);
	this._ctx = this._canvas.getContext('2d');
	this._fontsize = 10;
	this._fonttype = 'Arial';
	this._ctx.font = this._fontsize + 'px ' + this._fonttype;
	this._figures = {};
	this.setSize(width, height);
	this._title = undefined;
	if (title) {
		this.setTitle(title);
	}
	this._x_zero = 0;
	this._y_zero = 0;
	let self = this;
	this._canvas.onmousemove = function (e) {
        let rect = self._canvas.getBoundingClientRect();
        let x = e.clientX - rect.left, y = e.clientY - rect.top;
        let x_pos = x - self._x_zero, y_pos = y - self._y_zero;
        for (let figure_id in self._figures) {
        	self._figures[figure_id].draw(x_pos, y_pos);
        }
    };
};

Canvas.prototype.getTextWidth = function (content, fontsize=10, fonttype='Arial') {
	this._ctx.font = fontsize + 'px ' + fonttype;
	let result = this._ctx.measureText(content).width;
	this._ctx.font = this._fontsize + 'px ' + this._fonttype;
	return result;
};

Canvas.prototype.update = function (settings) {
	let new_width = 'width' in settings ? settings['width'] : this._max_x;
	let new_height = 'height' in settings ? settings['height'] : this._max_y;
	this.setSize(new_width, new_height);
	if ('title' in settings) {
		this.setTitle(settings['title']);
	}
};

Canvas.prototype.setTitle = function (title, options={}) {
	if ('font' in options) {
		if ('size' in options['font']) {
			;
		} else {
			options['font']['size'] = 1;
		}
	} else {
		options['font'] = {
			'size': 15
		};
	}
	this._title = title;
	this.setBrush(options);
	this.fillTextAtCenter(title, 0, 0, this._max_x, false, true, options);
};

Canvas.prototype.setSize = function (width, height) {
    this._canvas.width = width * this._pixelRatio;
    this._canvas.height = height * this._pixelRatio;
    this._ctx.scale(this._pixelRatio, this._pixelRatio);
    this._container.style.width = width + "px";
    this._container.style.height = height + "px";
    this._canvas.style.width = width + "px";
    this._canvas.style.height = height + "px";
    this._max_x = width;
    this._max_y = height;
};

Canvas.prototype.setBrush = function (options) {
	if ('color' in options) {
		this._stroke_color = this._ctx.strokeStyle;
		this._fill_color = this._ctx.fillStyle;
		this._ctx.strokeStyle = options['color'];
    	this._ctx.fillStyle = options['color'];
	}
	if ('font' in options) {
		this._ctx.font = options['font'];
	}
	if ('font' in options) {
		if ('size' in options['font']) {
			this._fontsize = options['font']['size'];
		}
		if ('type' in options['font']) {
			this._fonttype = options['font']['type'];
		}
		this._ctx.font = this._fontsize + 'px ' + this._fonttype;
	}
	if ('weight' in options) {
		this._ctx.lineWidth = options['weight'];
	}
};

Canvas.prototype.clear = function (bound=undefined) {
	if (bound) {
		this._ctx.clearRect(bound['left'] - 1, bound['top'] - 1, bound['right'] + 1, bound['bottom'] + 1);
	} else {
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
	}
};

Canvas.prototype.createMainFigure = function (x, y, width, height) {
	this._main_figure = new Figure(this._ctx);
};

Canvas.prototype.getContext = function () {
	return this._ctx;
};

Canvas.prototype.fillTextAtCenter = function (text, x, y, width, vertical=false, left=true, opt={}) {
	let options = JSON.parse(JSON.stringify(opt));
	if ('weight' in options) {
		;
	} else {
		options['weight'] = 1;
	}
	if ('font' in options) {
		if ('size' in options['font']) {
			;
		} else {
			options['font']['size'] = 10;
		}
	} else {
		options['font'] = { 'size': 10 };
	}
	this.setBrush(options);
	let text_width = this.getTextWidth(text);
	if (vertical) {
		let y_adj = y + Math.floor((width + options['font']['size']) / 2);
		if (left) {
			this._ctx.fillText(text, x - text_width, y_adj);	
		} else {
			this._ctx.fillText(text, x, y_adj);
		}
	} else {
		let y_adj = y + options['font']['size'];
		if (width > text_width) {
			let x_adj = x + Math.floor((width - text_width) / 2);
			this._ctx.fillText(text, x_adj, y_adj);
		} else {
			this._ctx.fillText(text, x, y_adj);
		}
	}
};

Canvas.prototype.line = function (x0, y0, x1, y1, opt={}) {
	let options = JSON.parse(JSON.stringify(opt));
	if ('weight' in options) {
		;
	} else {
		options['weight'] = 1;
	}
	this.setBrush(options);
	this._ctx.beginPath();
    this._ctx.moveTo(x0, y0);
    this._ctx.lineTo(x1, y1);
    this._ctx.closePath();
    this._ctx.stroke();
};

Canvas.prototype.text = function (content, x, y, vertical=false, left=true, opt={}) {
	let options = JSON.parse(JSON.stringify(opt));
	let gap = 2;
	if ('weight' in options) {
		;
	} else {
		options['weight'] = 1;
	}
	if ('font' in options) {
		if ('size' in options['font']) {
			;
		} else {
			options['font']['size'] = 10;
		}
	} else {
		options['font'] = { 'size': 10 };
	}
	this.setBrush(options);
	let text_width = this.getTextWidth(content);
	if (vertical) {
		if (left) {
			this._ctx.fillText(content, x - text_width, y - gap);	
		} else {
			this._ctx.fillText(content, x, y - gap);
		}
	} else {
		let y_adj = y + options['font']['size'];
		this._ctx.fillText(content, x + gap, y_adj);
	}
	return text_width;
};

Canvas.prototype.regist = function (figure_id, figure) {
	if (figure_id in this._figures) {
		;
	} else {
		this._figures[figure_id] = figure;
	}
};

Canvas.prototype.hide = function () {
	this._container.style.display = 'none';
	this._container.style.visibility = 'hidden';
};

Canvas.prototype.show = function () {
	this._container.style.display = 'block';
	this._container.style.visibility = 'visible';
};

const Figure = function (canvas, figure_id, data, width=600, height=600, x0=0, y0=0, legend=false, axis=undefined, drawSomething=undefined) {
	let self = this;
	this._legend_settings = {
		'visible': legend,
		'gap': 5,
		'span': 10,
		'bits': 2,
		'font': {
			'size': 10,
			'type': 'Arial',
		},
	};
	this._elements = [];
	this._id = figure_id;
	canvas.regist(figure_id, self);
	this._ctx = canvas.getContext();
	this._canvas = canvas;
	this.setOrigin(x0, y0);
	this._gap = 30;
	this.setSize(width, height);
	this._data = data;
	this._labels = {'0': [], '1': [], '2': []};
	this._axis = [
		{ 'max': this._width, 'min': 0, 'tick': { 'b': 100, 's': 10 } },
		{ 'max': this._height, 'min': 0, 'tick': { 'b': 100, 's': 10 } },
		{ 'max': this._height, 'min': 0, 'tick': { 'b': 100, 's': 10 } }
	];
	this.drawChart = drawSomething;
	if (Array.isArray(axis)) {
		for (let i = 0; i < axis.length; i++) {
			this.setAxis(i, axis[i]);
		}
	}
	this.reloadAxis();
	this._spine_settins = {
		'visible': false,
		'color': 'black',
		'weight': 1,
		'settings': {'0': false, '1': false, '2': false, '3': false},
	};
	this._tickmark_settings = [
		{'visible': false, 'outward': true, 'label': false, },
		{'visible': false, 'outward': true, 'label': false, },
		{'visible': false, 'outward': true, 'label': false, },
	];
	this._cursor_settings = {
		'axis': [false, false, false],
		'color': 'gray',
		'bits': 2,
		'visible': true,
	};
	this._grid_settings = {
		'axis': [false, false, false],
		'color': 'gray',
	};
	this._label_settings = {
		'axis': [false, false, false],
		'color': 'black',
	};
};

Figure.prototype.setOrigin = function (x0, y0) {
	this._x0 = x0;
	this._y0 = y0;
};

Figure.prototype.getVisibleOrigin = function () {
	let point = JSON.parse(JSON.stringify(this._center));
	if (this._width >= this.height) {
		return point;
	} else {
		point.y = point.x;
		return point;
	}
};

Figure.prototype.setSize = function (width, height) {
	this._width = width - 2 * this._gap;
	this._height = height - 2 * this._gap;
	this._bound = {
		left: this._x0,
		top: this._y0,
		right: this._x0 + width,
		bottom: this._y0 + height,
	};
	this._bound_visible = {
		left: this._x0 + this._gap,
		top: this._y0 + this._gap,
		right: this._x0 + width - this._gap,
		bottom: this._y0 + height - this._gap,
	};
	this._center = {
		x: (this._bound_visible.left + this._bound_visible.right) / 2,
		y: (this._bound_visible.top + this._bound_visible.bottom) / 2,
	};
};

Figure.prototype.update = function (settings) {
	let x0 = 'x' in settings ? settings['x'] : this._x0;
	let y0 = 'y' in settings ? settings['y'] : this._y0;
	this.setOrigin(x0, y0);
	let new_width = 'width' in settings ? settings['width'] : this._width + 2 * this._gap;
	let new_height = 'height' in settings ? settings['height'] : this._height + 2 * this._gap;
	this.setSize(new_width, new_height);
	if ('data' in settings) {
		this._data = settings['data'];
		this._elements = [];
	}
};

Figure.prototype.addElement = function (e) {
	this._elements.push(e);
};

Figure.prototype.setDrawChart = function (drawSomething) {
	this.drawChart = drawSomething;
};

Figure.prototype.setLegend = function (opt) {
	let options = JSON.parse(JSON.stringify(opt));
	if ('font' in options) {
		if ('size' in options['font']) {
			this._legend_settings['font']['size'] = options['font']['size'];
		}
		if ('type' in options['font']) {
			this._legend_settings['font']['type'] = options['font']['type'];
		}
	}
	if ('bits' in options) {
		this._legend_settings['bits'] = options['bits'];
	}
	if ('gap' in options) {
		this._legend_settings['gap'] = options['gap'];
	}
	if ('span' in options) {
		this._legend_settings['span'] = options['span'];
	}
	if ('visible' in options) {
		this._legend_settings['visible'] = options['visible'];
	}
};

Figure.prototype.setCursor = function (opt) {
	let options = JSON.parse(JSON.stringify(opt));
	if ('axis' in options) {
		if ('0' in options['axis']) {
			this._cursor_settings['axis'][0] = options['axis']['0'];
		}
		if ('1' in options['axis']) {
			this._cursor_settings['axis'][1] = options['axis']['1'];
		}
		if ('2' in options['axis']) {
			this._cursor_settings['axis'][2] = options['axis']['2'];
		}
	}
	if ('bits' in options) {
		this._cursor_settings['bits'] = options['bits'];
	}
	if ('color' in options) {
		this._cursor_settings['color'] = options['color'];
	}
	if ('visible' in options) {
		this._cursor_settings['visible'] = options['visible'];
	}
};

Figure.prototype.setGrid = function (opt, draw_flag=false) {
	let options = JSON.parse(JSON.stringify(opt));
	if ('axis' in options) {
		if ('0' in options['axis']) {
			this._grid_settings['axis'][0] = options['axis']['0'];
		}
		if ('1' in options['axis']) {
			this._grid_settings['axis'][1] = options['axis']['1'];
		}
		if ('2' in options['axis']) {
			this._grid_settings['axis'][2] = options['axis']['2'];
		}
	}
	if ('color' in options) {
		this._grid_settings['color'] = options['color'];
	}
	if (draw_flag) {
		this.draw();
	}
};

Figure.prototype.reloadAxis = function () {
	this._axis[0]['ratio'] = this._width / (this._axis[0]['max'] - this._axis[0]['min']);
	this._axis[1]['ratio'] = this._height / (this._axis[1]['max'] - this._axis[1]['min']);
	this._axis[2]['ratio'] = this._height / (this._axis[2]['max'] - this._axis[2]['min']);
};

Figure.prototype.coordinateToPoint = function (x, y, coordinate=0) {
	let x0 = (x - this._bound_visible.left) / this._axis[0]['ratio'], y0 = 0;
	if (coordinate == 0) {
		y0 = (this._bound_visible.top + this._height - y) / this._axis[1]['ratio'];
	} else {
		y0 = (this._bound_visible.top + this._height - y) / this._axis[2]['ratio'];
	}
	return [x0, y0];
};

Figure.prototype.pointToCoordinate = function (x, y, mapping=false, coordinate=0) {
	let x0 = this._bound_visible.left + x, y0 = this._bound_visible.top + this._height - y;
	if (mapping) {
		x0 = this._bound_visible.left + this._axis[0]['ratio'] * x;
		if (coordinate == 0) {
			y0 = this._bound_visible.top + this._height - this._axis[1]['ratio'] * y;
		} else {
			y0 = this._bound_visible.top + this._height - this._axis[2]['ratio'] * y;
		}
	}
	return [x0, y0];
};

Figure.prototype.setSpineBrush = function (opt) {
	let options = JSON.parse(JSON.stringify(opt));
	if ('visible' in options) {
		this._spine_settins['visible'] = options['visible'];
	}
	if ('color' in options) {
		this._spine_settins['color'] = options['color'];
	}
	if ('weight' in options) {
		this._spine_settins['weight'] = options['weight'];
	}
};

Figure.prototype.drawSpine = function (settings={'0': true, '1': true, '2': true, '3': true}) {
	let [x0, y0] = this.pointToCoordinate(0, 0);
	let [x1, y1] = this.pointToCoordinate(this._width, this._height);
	if ((settings['0'] == true) || (settings['1'] == true) || (settings['2'] == true) || (settings['3'] == true)) {
		this._canvas.setBrush(this._spine_settins)
	}
	if ('0' in settings) {
		if (settings['0']) {
			this._canvas.line(x0, y0, x1, y0);
		}
		this._spine_settins['settings']['0'] = settings['0'];
	}
	if ('1' in settings) {
		if (settings['1']) {
			this._canvas.line(x0, y1, x0, y0);
		}
		this._spine_settins['settings']['1'] = settings['1'];
	}
	if ('2' in settings) {
		if (settings['2']) {
			this._canvas.line(x1, y0, x1, y1);
		}
		this._spine_settins['settings']['2'] = settings['2'];
	}
	if ('3' in settings) {
		if (settings['3']) {
			this._canvas.line(x1, y1, x0, y1);
		}
		this._spine_settins['settings']['3'] = settings['3'];
	}
};

Figure.prototype.setAxis = function (axis, options, reload_axis=false) {
	if ((axis >= 0) && (axis <= 2)) {
		if ('max' in options) {
			this._axis[axis]['max'] = options['max'];
		}
		if ('min' in options) {
			this._axis[axis]['min'] = options['min'];
		}
		if ('tick' in options) {
			if ('b' in options['tick']) {
				this._axis[axis]['tick']['b'] = options['tick']['b'];
			}
			if ('s' in options['tick']) {
				this._axis[axis]['tick']['s'] = options['tick']['s'];
			}
		}
		if (reload_axis) {
			this.reloadAxis();
		}
	}
};

Figure.prototype.drawTickMarks = function (axis, outward=true) {
	if ((axis >= 0) && (axis <= 2)) {
		this._tickmark_settings[axis]['visible'] = true;
		this._tickmark_settings[axis]['outward'] = outward;
		let interval = (this._axis[axis]['max'] - this._axis[axis]['min']) / this._axis[axis]['tick']['b'];
		let interval_min = (this._axis[axis]['max'] - this._axis[axis]['min']) / this._axis[axis]['tick']['s'];
		let direction = outward ? 1 : -1;
		if (axis == 0) {
			let unit = this._width / interval;
			for (let i = 0; i <= interval; i++) {
				let [x0, y0] = this.pointToCoordinate(i * unit, 0);
				let [x1, y1] = this.pointToCoordinate(i * unit, -10 * direction);
		    	this._canvas.line(x0, y0, x1, y1);
			}
			unit = this._width / interval_min;
			for (let i = 0; i <= interval_min; i++) {
				let [x0, y0] = this.pointToCoordinate(i * unit, 0);
				let [x1, y1] = this.pointToCoordinate(i * unit, -5 * direction);
		    	this._canvas.line(x0, y0, x1, y1);
			}
		}
		if (axis == 1) {
			let unit = this._height / interval;
			for (let i = 0; i <= interval; i++) {
				let [x0, y0] = this.pointToCoordinate(0, i * unit);
				let [x1, y1] = this.pointToCoordinate(-10 * direction, i * unit);
		    	this._canvas.line(x0, y0, x1, y1);
			}
			unit = this._height / interval_min;
			for (let i = 0; i <= interval_min; i++) {
				let [x0, y0] = this.pointToCoordinate(0, i * unit);
				let [x1, y1] = this.pointToCoordinate(-5 * direction, i * unit);
		    	this._canvas.line(x0, y0, x1, y1);
			}
		}
		if (axis == 2) {
			let unit = this._height / interval;
			for (let i = 0; i <= interval; i++) {
				let [x0, y0] = this.pointToCoordinate(this._width, i * unit);
				let [x1, y1] = this.pointToCoordinate(this._width + 10 * direction, i * unit);
		    	this._canvas.line(x0, y0, x1, y1);
			}
			unit = this._height / interval_min;
			for (let i = 0; i <= interval_min; i++) {
				let [x0, y0] = this.pointToCoordinate(this._width, i * unit);
				let [x1, y1] = this.pointToCoordinate(this._width + 5 * direction, i * unit);
		    	this._canvas.line(x0, y0, x1, y1);
			}
		}
	}
};

Figure.prototype.setLabels = function (axis, labels) {
	let index = axis.toString();
	if (index in this._labels) {
		this._labels[index] = labels.map(e => e);
	}
};

Figure.prototype.drawLabels = function (axis, labels_update=undefined) {
    if ((axis >= 0) && (axis <= 2)) {
    	this._label_settings['axis'][axis] = true;
    	let index = axis.toString();
    	if (labels_update) {
    		this.setLabels(axis, labels_update);
    	}
		let interval = (this._axis[axis]['max'] - this._axis[axis]['min']) / this._axis[axis]['tick']['b'];
		let begin_pos = 0, end_pos = 0;
		let labels = this._labels[index];
		if ((axis == 0) && (labels.length > 0)) {
			let unit = this._width / interval;
			for (let i = 0; i < interval; i++) {
				begin_pos = i * unit;
				end_pos = (i + 1) * unit;
				let [x_cur, y_cur] = this.pointToCoordinate(begin_pos, -8);
				let [x_nex, y_nex] = this.pointToCoordinate(end_pos, -8);
				let uint_width = x_nex - x_cur;
		    	this._canvas.fillTextAtCenter(labels[i], x_cur, y_cur, uint_width);
			}
		}
		if ((axis == 1) && (labels.length > 0)) {
			let unit = this._height / interval;
			for (let i = 0; i < interval; i++) {
				begin_pos = i * unit;
				end_pos = (i + 1) * unit;
				let [x_cur, y_cur] = this.pointToCoordinate(-8, begin_pos);
				let [x_nex, y_nex] = this.pointToCoordinate(-8, end_pos);
				let uint_width = y_nex - y_cur;
		    	this._canvas.fillTextAtCenter(labels[i], x_cur, y_cur, uint_width, true);
			}
		}
		if ((axis == 2) && (labels.length > 0)) {
			let unit = this._height / interval;
			for (let i = 0; i < interval; i++) {
				begin_pos = i * unit;
				end_pos = (i + 1) * unit;
				let [x_cur, y_cur] = this.pointToCoordinate(this._width + 8, begin_pos);
				let [x_nex, y_nex] = this.pointToCoordinate(this._width + 8, end_pos);
				let uint_width = y_nex - y_cur;
		    	this._canvas.fillTextAtCenter(labels[i], x_cur, y_cur, uint_width, true, false);
			}
		}
	}
};

Figure.prototype.drawTickMarkLabels = function (axis, bits=0) {
    if ((axis >= 0) && (axis <= 2)) {
    	this._tickmark_settings[axis]['label'] = true;
		let interval = (this._axis[axis]['max'] - this._axis[axis]['min']) / this._axis[axis]['tick']['b'];
		if (axis == 0) {
			let unit = this._width / interval;
			for (let i = 0; i <= interval; i++) {
				let [x, y] = this.pointToCoordinate(i * unit, -8);
				let label = (this._axis[axis]['min'] + i * this._axis[axis]['tick']['b']).toFixed(bits).toString();
		    	this._canvas.text(label, x, y);
			}
		}
		if (axis == 1) {
			let unit = this._height / interval;
			for (let i = 0; i <= interval; i++) {
				let [x, y] = this.pointToCoordinate(-8, i * unit);
		    	let label = (this._axis[axis]['min'] + i * this._axis[axis]['tick']['b']).toFixed(bits).toString();
		    	this._canvas.text(label, x, y, true);
			}
		}
		if (axis == 2) {
			let unit = this._height / interval;
			for (let i = 0; i <= interval; i++) {
				let [x, y] = this.pointToCoordinate(this._width + 8, i * unit);
		    	let label = (this._axis[axis]['min'] + i * this._axis[axis]['tick']['b']).toFixed(bits).toString();
		    	this._canvas.text(label, x, y, true, false);
			}
		}
	}
};

Figure.prototype.isInside = function (x, y, coordinate=0) {
	let flag = true;
	if ((x > this._axis[0]['max']) || (x < this._axis[0]['min'])) {
		flag = false;
	}
	if (coordinate == 0) {
		if ((y > this._axis[1]['max']) || (y < this._axis[1]['min'])) {
			flag = false;
		}
	} else {
		if ((y > this._axis[2]['max']) || (y < this._axis[2]['min'])) {
			flag = false;
		}
	}
	return flag;
};

Figure.prototype.line = function (x, y, coordinate=0) {
	let [x0, y0] = this.pointToCoordinate(x[0], y[0], true, coordinate);
	let x1 = 0, y1 = 0;
	this._ctx.moveTo(x0, y0);
	for (i = 1; i < x.length; i ++) {
		[x1, y1] = this.pointToCoordinate(x[i], y[i], true, coordinate);
		this._canvas.line(x0, y0, x1, y1);
		x0 = x1;
		y0 = y1;
	}
};

Figure.prototype.plot = function (x, y, weight=1, coordinate=0) {
	let x0 = 0, y0 = 0;
	for (i = 0; i < x.length; i ++) {
		[x0, y0] = this.pointToCoordinate(x[i], y[i], true, coordinate);
		this._ctx.fillRect(x0, y0, weight, weight);
	}
};

Figure.prototype.curve = function (x, y, coordinate=0) {
	let [x0, y0] = this.pointToCoordinate(x[0], y[0], true, coordinate);
	let x1 = 0, y1 = 0, x2 = 0, y2 = 0, i = 0;
	this._ctx.moveTo(x0, y0);
	for (i = 1; i < x.length - 2; i ++) {
		[x1, y1] = this.pointToCoordinate(x[i], y[i], true, coordinate);
		[x2, y2] = this.pointToCoordinate(x[i + 1], y[i + 1], true, coordinate);
		let xc = (x1 + x2) / 2;
		let yc = (y1 + y2) / 2;
		this._ctx.quadraticCurveTo(x1, y1, xc, yc);
	}
	[x1, y1] = this.pointToCoordinate(x[i], y[i], true, coordinate);
	[x2, y2] = this.pointToCoordinate(x[i + 1], y[i + 1], true, coordinate);
	this._ctx.quadraticCurveTo(x1, y1, x2, y2);
 	this._ctx.stroke();
};

Figure.prototype.bezierCurve = function (x, y, f=0.3, t=0.6, coordinate=0) {
    this._ctx.beginPath();
    let [x_pre, y_pre] = this.pointToCoordinate(x[0], y[0], true, coordinate);
    this._ctx.moveTo(x_pre, y_pre);
  
    let m = 0, dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0;
    let x_cur = 0, y_cur = 0, x_nex = 0, y_nex = 0;

    for (let i = 1; i < x.length; i++) {
        [x_cur, y_cur] = this.pointToCoordinate(x[i], y[i], true, coordinate);
        [x_nex, y_nex] = this.pointToCoordinate(x[i + 1], y[i + 1], true, coordinate);
    	if (i == x.length - 1) {
            dx2 = 0;
            dy2 = 0;
        } else {
            m = gradient(x_pre, y_pre, x_nex, y_nex);
            dx2 = (x_nex - x_cur) * -f;
            dy2 = dx2 * m * t;
        }
        this._ctx.bezierCurveTo(
            x_pre - dx1, y_pre - dy1,
            x_cur + dx2, y_cur + dy2,
            x_cur, y_cur
        );
        dx1 = dx2;
        dy1 = dy2;
        x_pre = x_cur;
        y_pre = y_cur;
    }
    this._ctx.stroke();
};

Figure.prototype.draw = function (x=undefined, y=undefined) {
	this._canvas.clear(this._bound);
	this.drawSpine(this._spine_settins['settings']);
	for (let axis = 0; axis < 3; axis++) {
		if (this._tickmark_settings[axis]['visible']) {
			this.drawTickMarks(axis, this._tickmark_settings[axis]['outward']);
		}
		if (this._tickmark_settings[axis]['label']) {
			this.drawTickMarkLabels(axis);
		}
		this.drawLabels(axis);
	}
	let [axis_0, axis_1, axis_2] = this._grid_settings['axis'];
	this.drawGrid(axis_0, axis_1, axis_2);
	if (this.drawChart) {
		let self = this;
		this.drawChart(self);
	}
	// console.log(x + ' , ' + y);
	if ((x != undefined) && (y != undefined)) {
		this.drawCursor(x, y);
		for (let i = 0; i < this._elements.length; i++) {
			this._elements[i].updateLegend(x, y);
		}
	}
};

Figure.prototype.isVisible = function (x, y) {
	let x_flag = true, y_flag = true;
	if ((x > this._bound_visible.right) || (x < this._bound_visible.left)) {
		x_flag = false;
	}
	if ((y > this._bound_visible.bottom) || (y < this._bound_visible.top)) {
		y_flag = false;
	}
	return [x_flag, y_flag];
};

Figure.prototype.drawCursor = function (x, y) {
	if (this._cursor_settings['visible']) {
		this._canvas.setBrush({'color': this._cursor_settings['color'], 'weight': 1});
		let bits = this._cursor_settings['bits'];
		let [x_flag, y_flag] = this.isVisible(x, y), span = 15, label_span = -20;
		if (x_flag) {
			this._canvas.line(x, this._bound.top + span, x, this._bound.bottom - span);
			if (this._cursor_settings['axis'][0]) {
				let [x_label, y_label] = this.coordinateToPoint(x, y);
				let [x_c, y_c] = this.pointToCoordinate(0, label_span);
				this._canvas.text(x_label.toFixed(bits), x, y_c);
			}
		}
		if (y_flag) {
			this._canvas.line(this._bound.left + span, y, this._bound.right - span, y);
			if (this._cursor_settings['axis'][1]) {
				let [x_label, y_label] = this.coordinateToPoint(x, y);
				let [x_c, y_c] = this.pointToCoordinate(1.5 * label_span, 0);
				this._canvas.text(y_label.toFixed(bits), x_c, y);
			}
			if (this._cursor_settings['axis'][2]) {
				let [x_label, y_label] = this.coordinateToPoint(x, y, 1);
				let [x_c, y_c] = this.pointToCoordinate(this._width - label_span, 0);
				this._canvas.text(y_label.toFixed(bits), x_c, y);
			}
		}
	}
};

Figure.prototype.drawGrid = function (axis_0=true, axis_1=false, axis_2=false) {
	this._canvas.setBrush({'color': this._grid_settings['color'], 'weight': 1});
	this._ctx.save();
	this._ctx.globalAlpha = 0.1;
	this._grid_settings['axis'] = [axis_0, axis_1, axis_2];
	if (axis_0) {
		let interval = (this._axis[0]['max'] - this._axis[0]['min']) / this._axis[0]['tick']['b'];
		let unit = this._width / interval;
		for (let i = 0; i <= interval; i++) {
			let [x, y] = this.pointToCoordinate(i * unit, 0);
	    	this._canvas.line(x, y, x, this._bound_visible.top);
		}
	}
	if (axis_1) {
		let interval = (this._axis[1]['max'] - this._axis[1]['min']) / this._axis[1]['tick']['b'];
		let unit = this._height / interval;
		for (let i = 0; i <= interval; i++) {
			let [x, y] = this.pointToCoordinate(0, i * unit);
	    	this._canvas.line(x, y, this._bound_visible.right, y);
		}
	}
	if (axis_2) {
		let interval = (this._axis[2]['max'] - this._axis[2]['min']) / this._axis[2]['tick']['b'];
		let unit = Math.floor(this._height / interval);
		for (let i = 0; i <= interval; i++) {
			let [x, y] = this.pointToCoordinate(0, i * unit);
			this._canvas.line(x, y, this._bound_visible.right, y);
		}
	}
	this._ctx.restore();
};

function generatePieData (dataset) {
	let data = [], sum = 0;
	for (let label in dataset) {
		data.push({'label': label , 'data': dataset[label].d, 'color': dataset[label].c});
		sum = sum + dataset[label].d;
	}
	data.sort((a, b) => {
		if (a['data'] > b['data']) {
			return -1;
		}
		if (a['data'] < b['data']) {
			return 1;
		}
		return 0;
	});
	let percentages = data.map(e => e['data']/sum);
	return {
		'data': data,
		'percentages': percentages,
	};
};

function changeLuminance (color, luminance=0.2) {
	let rgb = String(color).replace(/[^0-9a-f]/gi, '');
	if (rgb.length < 6) {
		rgb = rgb[0] + rgb[0] + rgb[1] + rgb[1] + rgb[2] + rgb[2];
	}
	let rgb_update = '#';
	for (let i = 0; i < 3; i++) {
		let c = parseInt(rgb.substr(i * 2, 2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * luminance)), 255)).toString(16).padStart(2, '0');;
		rgb_update = rgb_update + c;
	}
	return rgb_update;
};

function changeAlpha(color, alpha=0.8) {
	let rgb = String(color).replace(/[^0-9a-f]/gi, '');
	if (rgb.length < 6) {
		rgb = rgb[0] + rgb[0] + rgb[1] + rgb[1] + rgb[2] + rgb[2];
	}
	let rgb_update = [];
	for (let i = 0; i < 3; i++) {
		rgb_update.push(parseInt(rgb.substr(i * 2, 2), 16));
	}
	rgb_update.push(alpha);
	rgb_update = 'rgba(' + rgb_update.join(', ') + ')';
	return rgb_update;
}

const PieChartFragment = function (x, y, r, start_angel, end_angel, label, data, bits) {
	this._x = x;
	this._y = y;
	this._r = r;
	this._start_angel = start_angel;
	this._end_angel = end_angel;
	this.legend = label;
	this._label = label;
	this._data = data;
	this._bits = bits;
};

PieChartFragment.prototype.isInside = function (x, y) {
	let x0 = x - this._x, y0 = y - this._y;
	let r = Math.sqrt(Math.pow(x0, 2) + Math.pow(y0, 2));
	if (r > this._r) {
		return false;
	}
	let angel = x0 >= 0 ? Math.atan(y0 / x0) * 180 / Math.PI : Math.atan(y0 / x0) * 180 / Math.PI + 180;
	if ((angel < this._start_angel) || (angel > this._end_angel)) {
		return false;
	}
	return true;
};

PieChartFragment.prototype.updateLegend = function (x, y) {
	if (this.isInside(x, y)) {
		this.legend = this._label + ': ' + this._data.toFixed(this._bits);
	} else {
		this.legend = this._label;
	}
};

function getR(width, height, span, ratio=0.8) {
	let r = width >= height ? width / 2 : height / 2;
	r = (r - span) * ratio;
	return r;
};

function createChart (chart_type, container_id, dataset, width, height, title, opt, update_fn, init_fn) {
	let options = JSON.parse(JSON.stringify(opt)), title_gap = title ? 30 : 0;
	let c = {
		_canvas: new Canvas(container_id, width, height, title),
		_figure: null,
		show: () => {c._canvas.show();},
		hide: () => {c._canvas.hide();},
		update: update_fn,
	};
	let figure_id = Chart.id(chart_type);
	c._figure = new Figure(c._canvas, figure_id, dataset, width, height - title_gap, 0, title_gap, true);
	init_fn(c);
	c._figure.draw();
	return c;
};

const Chart = {
	id: function (chart_type) {
		return chart_type + '_' + new Date().getTime();
	},
	basic: {
		bar: function (container_id, dataset, width=300, height=300, title=undefined, opt={'bits': 2}) {
			let c = createChart('pie', container_id, generatePieData(dataset), width, height, title, opt, (settings) => {}, (chart) => {});
			return c;
		},
	},
	stat: {
		pie: function (container_id, dataset, width=300, height=300, title=undefined, opt={'bits': 2}) {
			let c = createChart('pie', container_id, generatePieData(dataset), width, height, title, opt, (settings) => {
					let options = JSON.parse(JSON.stringify(settings));
					c._canvas.update(options);
					if ('data' in options) {
						options['data'] = generatePieData(options['data']);
					}
					options['x'] = 0;
					options['y'] = (('title' in options) && (options['title'] != undefined)) ? 30 : 0;
					c._figure.update(options);
					c._figure._r = getR(c._figure._width, c._figure._height, c._canvas.getTextWidth('111.11%') - c._figure._gap / 2);
					c._figure.draw();
				}, (chart) => {
					chart._figure.setCursor({'visible': false});
					chart._figure._r = getR(chart._figure._width, chart._figure._height, chart._canvas.getTextWidth('111.11%') - chart._figure._gap / 2);
					chart._figure.setDrawChart((figure) => {
						let current_angle = 0 - Math.PI / 2, portion_angle = 0, next_angle = 0;
						let init_element_flag = figure._elements.length > 0 ? false : true;
						let origin = figure.getVisibleOrigin();
						let x = origin.x, y = origin.y;
						let legend_x = figure._gap, legend_y = figure._y0 + figure._legend_settings['gap'];
						figure._canvas.setBrush({'font': figure._legend_settings['font']});
						let legend_bits = figure._legend_settings['bits'];
						for (let i = 0; i < figure._data['percentages'].length; i++) {
							figure._ctx.beginPath();
							if (init_element_flag) {
						        portion_angle = figure._data['percentages'][i] * 2 * Math.PI;
						        next_angle = current_angle + portion_angle;
						        figure.addElement(new PieChartFragment(x, y, figure._r, current_angle * 180 / Math.PI, next_angle * 180 / Math.PI, figure._data['data'][i]['label'], figure._data['data'][i]['data'], legend_bits));
						    } else {
						    	next_angle = figure._elements[i]._end_angel * Math.PI / 180;
						    }
						    let label_x = Math.round(Math.cos((next_angle + current_angle) / 2) * (figure._r + 5));
					        let label_y = Math.round(Math.sin((next_angle + current_angle) / 2) * (figure._r + 5));
					        let percent = (figure._data['percentages'][i]*100).toFixed(legend_bits) + '%';
					        label_x = label_x > 0 ? label_x + x : label_x + x - figure._canvas.getTextWidth(percent) ;
					        label_y = label_x > 0 ? label_y + y - figure._canvas._fontsize: label_y + y;
						    figure._ctx.arc(x, y, figure._r, current_angle, next_angle);
					        figure._ctx.lineTo(x, y);
					        figure._ctx.closePath();
					        current_angle = next_angle;
					        let legend_color = figure._data['data'][i]['color'];
					        figure._ctx.fillStyle = changeLuminance(legend_color);
					        figure._ctx.fill();
					        figure._canvas.text(percent, label_x, label_y, false, true, {'color': 'black'});
					        figure._canvas.setBrush({'color': '#fff', 'weight': 2});
					        figure._ctx.stroke();
					        let text_width = figure._canvas.text(figure._elements[i].legend, legend_x, legend_y, false, true, {'color': legend_color});
					        legend_x = legend_x + text_width + figure._legend_settings['span'];
					    }
					});
				});
			return c;
		},
	}
};