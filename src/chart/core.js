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
	this.setSize(width, height);
	if (title) {
		this._title = title;
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
	this.fillTextAtCenter(title, 0, 0, this._max_x);
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

Canvas.prototype.clear = function () {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
};

Canvas.prototype.createMainFigure = function (x, y, width, height) {
	this._main_figure = new Figure(this._ctx);
};

Canvas.prototype.getContext = function () {
	return this._ctx;
};

Canvas.prototype.fillTextAtCenter = function (text, x, y, width) {
	let text_width = this._ctx.measureText(text).width;
	let y_adj = y + this._fontsize;
	if (width > text_width) {
		let x_adj = x + Math.floor((width - text_width) / 2);
		this._ctx.fillText(text, x_adj, y_adj);
	} else {
		this._ctx.fillText(text, x, y_adj);
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
	if (vertical) {
		let text_width = this._ctx.measureText(content).width;
		if (left) {
			this._ctx.fillText(content, x - text_width, y - gap);	
		} else {
			this._ctx.fillText(content, x, y - gap);
		}
	} else {
		let y_adj = y + this._fontsize;
		this._ctx.fillText(content, x + gap, y_adj);
	}
};

const Figure = function (canvas, data, width=600, height=600, x0=0, y0=0, axis=undefined) {
	this._ctx = canvas.getContext();
	this._canvas = canvas;
	this._x0 = x0;
	this._y0 = y0;
	this._gap = 30;
	this._width = width - 2 * this._gap;
	this._height = height - 2 * this._gap;
	// this._x_offset = x_offset;
	// this._y_offset = y_offset;
	this._data = data;
	this._axis = [
		{ 'max': this._width, 'min': 0, 'tick': { 'b': 100, 's': 10 } },
		{ 'max': this._height, 'min': 0, 'tick': { 'b': 100, 's': 10 } },
		{ 'max': this._height, 'min': 0, 'tick': { 'b': 100, 's': 10 } }
	];
	if (Array.isArray(axis)) {
		for (let i = 0; i < axis.length; i++) {
			this.setAxis(i, axis[i]);
		}
	}
	this.reloadAxis();
};

Figure.prototype.reloadAxis = function () {
	this._axis[0]['ratio'] = this._width / (this._axis[0]['max'] - this._axis[0]['min']);
	this._axis[1]['ratio'] = this._height / (this._axis[1]['max'] - this._axis[1]['min']);
	this._axis[2]['ratio'] = this._height / (this._axis[2]['max'] - this._axis[2]['min']);
};

Figure.prototype.pointToCoordinate = function (x, y, mapping=false, coordinate=0) {
	let x0 = this._x0 + this._gap + x, y0 = this._y0 + this._gap + this._height - y;
	if (mapping) {
		x0 = this._x0 + this._gap + this._axis[0]['ratio'] * x;
		if (coordinate == 0) {
			y0 = this._y0 + this._gap + this._height - this._axis[1]['ratio'] * y;
		} else {
			y0 = this._y0 + this._gap + this._height - this._axis[2]['ratio'] * y;
		}
	}
	return [x0, y0];
};

Figure.prototype.drawSpine = function (settings={'0': true, '1': true, '2': true, '3': true}) {
	let [x0, y0] = this.pointToCoordinate(0, 0);
	let [x1, y1] = this.pointToCoordinate(this._width, this._height);
	if ('0' in settings) {
		if (settings['0']) {
			this._canvas.line(x0, y0, x1, y0);
		}
	}
	if ('1' in settings) {
		if (settings['1']) {
			this._canvas.line(x0, y1, x0, y0);
		}
	}
	if ('2' in settings) {
		if (settings['2']) {
			this._canvas.line(x1, y0, x1, y1);
		}
	}
	if ('3' in settings) {
		if (settings['3']) {
			this._canvas.line(x1, y1, x0, y1);
		}
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
			let unit = Math.floor(this._height / interval);
			for (let i = 0; i <= interval; i++) {
				let [x0, y0] = this.pointToCoordinate(this._width, i * unit);
				let [x1, y1] = this.pointToCoordinate(this._width + 10 * direction, i * unit);
		    	this._canvas.line(x0, y0, x1, y1);
			}
			unit = Math.floor(this._height / interval_min);
			for (let i = 0; i <= interval_min; i++) {
				let [x0, y0] = this.pointToCoordinate(this._width, i * unit);
				let [x1, y1] = this.pointToCoordinate(this._width + 5 * direction, i * unit);
		    	this._canvas.line(x0, y0, x1, y1);
			}
		}
	}
};

Figure.prototype.drawTickMarkLabels = function (axis, bits=0) {
    if ((axis >= 0) && (axis <= 2)) {
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
