var dv;
var sizes;

var ptime;
var ctime;
var stime;
var delta;
var stop = false;

var screen;

//==================================

/*
prefixes
-----------
m -> make
c -> check
t -> time
h -> height
v -> velocity
g -> acceleration
p -> particle
n -> new
e -> explosion -> create a new array of particle to add to concat
nop -> no op

mbu -> make -> if condition are met, explode: life = 0, exp()

st -> stroboscopic
*/

nv = []
pv = []

nop = (p) => {};

v = (p) => {p.x += p.vx*delta; p.y += p.vy*delta;}

g = (p) => p.vy -= 2*delta;

cv = (p) => p.vy <= 0;

pest = (px, py, pc) => np(x=px, y=py, c=pc, upd=[v, mbu(mct(0.3), nop)]);

function est(p) {
	var ps = []
	for(i=0; i < 10; i++) {
		pi = pest(p.x, p.y, p.c);
		ps.push(pi);
	}
	return ps;
}

mch = (h) => (p) => p.y > h;

mct = (t) => (p) => ctime - p.t >= t;

me = (exp) => (p) => {nv.concat(exp(p));};

mbu = (cond, exp) => (p) => {
	if(cond(p)) {
		p.l = false;
		exp(p);
	}
};

dp = (p) => {paint(e.x, e.y, e.c);};

np = (x=0,y=0,c='x',vx=0,vy=0,l=true,t=ctime,upd=[],drw=[]) => {
		'x':x, 'y':y,
		'vx':vx, 'vy':vy, 
		'c':c, 'l':l, 't':t, 
		'upd': upd, 'drw': drw
};

mr = () => np(c='I',upd[]);

manager = np(c = '.', upd=[
	(p) => {
		p.l = false;
	}
]);

//==================================

function update() {
	pv = [...pv, ...nv];
	for(const e of pv) 
		for(u of e.upd) u(e);
	pv = pv.filter((e) => e.l);
}

function draw() {
	clear('.');
	for(const e of pv) 
		for(u of e.drw) u(e);
	paint(Math.cos(ctime*2*Math.PI*0.5)*10 + 15, 10, 'x');
}

//==================================

function paint(x, y, c) {
	x = Math.floor(x);
	y = Math.floor(y);
	screen[x + y*(sizes.w+1)] = c;
}

function clear(s) {
	screen.fill(s);
	for(i = 0; i < sizes.h; i++)
		paint(sizes.w, i, "\n");
}

function render() {
	draw();
	dv.innerHTML = screen.join("");
}

function loop() {
	ctime = time() - stime;
	delta = ctime - ptime;
	ptime = ctime;

	update();
	render();

	if(!stop) requestAnimationFrame(loop);
}

function resizeCanvas() {
	var style = window.getComputedStyle(dv, null).getPropertyValue('font-size');
	var fontSize = parseFloat(style);

	sizes = {
		'w':Math.floor(dv.clientWidth/fontSize), 
		'h':Math.floor(dv.clientHeight/fontSize)
	};

	screen = new Array((sizes.w+1)*sizes.h);

	if(stop) render();
}

function init() {
	dv = document.getElementById("c");
	stime = time();

	window.addEventListener('keydown', keydown, false);
	window.addEventListener('resize', resizeCanvas, false);
	
	resizeCanvas();

	nv.push(manager);

	requestAnimationFrame(loop);
}

function keydown(e) {
	if(e.key===' ') {
		stop = !stop;
		if(!stop) requestAnimationFrame(loop);
	}
}

function time() {
	return Date.now()*0.001;
}

window.onload = init;
