var dv;
var sizes;

var ptime;
var ctime;
var stime;
var delta;
var stop = false;

var screen;

Array.prototype.random = function() {return this[Math.floor(Math.random()*this.length)];};

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

nv = [];
pv = [];

nop = (p) => {};

v = (p) => {p.x += p.vx*delta; p.y += p.vy*delta;}

drg = (p) => {av = Math.sqrt(p.vx*p.vx + p.vy*p.vy)*0.7*delta; p.vx -= Math.sign(p.vx)*av; p.vy -= Math.sign(p.vy)*av;};

g = (p) => p.vy -= 15*delta;

cv = (p) => p.vy <= 0;

cpos = (p) => p.x < 0 || p.x >= sizes.w || p.y < 0 || p.y > sizes.h;

cav = (p) => p.vx*p.vx + p.vy*p.vy < 0.3;

pest = (px, py, pva, th, pc) => np({x:px, y:py, vx:pva*Math.cos(th), vy:pva*Math.sin(th), c:pc, upd:[v, delout, drg, mbu(cav, nop)]});

mcl = (...cond) => (p) => cond.some((f) => f(p));

delout = (p) => p.l = !cpos(p);

function est(p) {
	var ps = [];
	var th = 0;
	var tot = 40;
	for(i=0; i < tot; i++) {
		th += 2*Math.PI * 2 / tot;
		pi = pest(p.x, p.y, 20*(Math.random()*0.9+0.1), th, ['%','*','.'].random());
		ps.push(pi);
	}
	return ps;
}

monce = (u) => (p) => {p.l = false; u(p);};

mch = (h) => (p) => p.y > h;

mct = (t) => (p) => ctime - p.t >= t;

me = (exp) => (p) => {nv = nv.concat(exp(p));};

mbu = (cond, exp) => (p) => {if(cond(p)) {p.l = false; exp(p);}};

dp = (p) => {paint(p.x, sizes.h-p.y, p.c);};

dre = mbu(cv, me(est));

np = ({x=0,y=0,c=' ',vx=0,vy=0,l=true,t=ctime,upd=[],drw=[dp]}) => ({
		'x':x, 'y':y,
		'vx':vx, 'vy':vy, 
		'c':c, 'l':l, 't':t, 
		'upd': upd, 'drw': drw, 
});

//mr = (px, py, pvy) => np(x=px, y=py, vy=pvy, c='I',upd=[mbu(cv, est)]);
mr = (px, py, pvy) => np({x:px, y:py, vy:pvy, c:'I', upd:[v, g, dre]});

mr2 = (px, pvy, pl) => np({x:px, y:0, vy:pvy, c:'!', upd:[v, g, dre]});

party = (p) => {
	if(!p.t) p.t = ctime;
	if(Math.random()>3/(ctime - p.t + 1)) {
		p.t = ctime;
		nv.push(mr((Math.random()*(0.66)+0.16)*sizes.w, 0, 30*(Math.random()*0.3 + 0.7)));
	}
};
manager = np({upd:[party], drw:[]});

//==================================

function update() {
	pv = [...pv, ...nv];
	nv = [];
	for(const e of pv) 
		for(u of e.upd) u(e);
	pv = pv.filter((e) => e.l);
}

function draw() {
	clear(' ');
	for(const e of pv) 
		for(u of e.drw) u(e);
}

function start() {
	nv.push(manager);
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

	start();

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
