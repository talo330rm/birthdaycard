
//==================================
const rnd = Math.random;
const floor = Math.floor;
const sqrt = Math.sqrt;
const sgn = Math.sign;
const cos = Math.cos;
const sin = Math.sin;
const PI = Math.PI;
const TAU = Math.PI*2;

Array.prototype.random = function() {return this[floor(rnd()*this.length)];};

const clamp = (e0, e1, x) => x < e0 ? e0 : (x > e1 ? e1 : x);
const smthstp = (e0, e1, x) => {let t = clamp((x-e0)/(e1-e0), 0, 1); return t*t*(3-2*t);};
const pipe = (...f) => (a) => f.length <= 0 ? a : f.at(-1)(pipe(...f.slice(0,-1))(a));
const time = () => Date.now()*0.001;
const rndI = (min, max) => rnd()*(max-min)+min;
const range = (end, start=0, step=1) => ({
	[Symbol.iterator]() {
		let s = start;
		return {next() {let k = s; s+=step; return {value:k, done:k>=end};}};
	}
});

//==================================
var dv;
var ptime;
var ctime;
var delta;
var running;

const cvs = {
	w: 0, h: 0,
	v: [],
	clear: (c) => {
		cvs.v.fill(c); 
		for(let i = 1; i <= cvs.h; i++) cvs.v[i*(cvs.w+1) - 1] = '\n';
	},
	paint: (x, y, c) => {
		cvs.v[floor(x) + floor(cvs.h - y*3/5)*(cvs.w+1)] = c;
	},
	resize: (w, h) => {
		cvs.w = floor(w);
		cvs.h = floor(h);
		cvs.v = new Array((cvs.w+1)*cvs.h);
	}
};

//==================================
nv = [];
pv = [];

nop = (p) => {};
make = (p) => {nv.push(p);};
v = (p) => {p.x += p.vx*delta; p.y += p.vy*delta;}
drg = (p) => {let dr = 1 - delta*1.1; p.vx *= dr; p.vy *= dr;};
hdrg = (p) => {p.vx *= (1-delta*0.7);};
g = (p) => p.vy -= 40*delta;
mg = (c) => (p) => p.vy -= c*delta;
cv = (p) => p.vy <= 0;
cpos = (p) => p.x < 0 || p.x >= cvs.w || p.y < 0 || p.y >= cvs.h*5/3;
cav = (p) => p.vx*p.vx + p.vy*p.vy < 0.3;
mcl = (...cond) => (p) => cond.some((f) => f(p));
delout = (p) => p.l = p.l && !cpos(p);
monce = (u) => (p) => {p.l = false; u(p);};
mch = (h) => (p) => p.y > h;
mct = (t) => (p) => ctime - p.t >= t;
mdt = (t) => (p) => {p.l = p.l && (ctime - p.t) < t;};
dv = (p) => {p.l = p.vx*p.vx + p.vy*p.vy > 0.3;};
mbu = (cond, exp) => (p) => {if(cond(p)) {p.l = false; exp(p);}};
dp = (p) => {cvs.paint(p.x, p.y, p.c);};
chbv = (p) => {}
repl = (mp) => (p) => {nv.push(mp(p));};
mpkg = (...f) => (p) => {for(let fi of f) fi(p);};
mdpexp = (pc, tot) => (p) => {for(let i of range(tot)) nv.push(pc(p, i));};
np = ({x=0,y=0,c=' ',vx=0,vy=0,l=true,t=ctime,upd=[],drw=[dp]}) => ({
		'x':x, 'y':y,
		'vx':vx, 'vy':vy, 
		'c':c, 'l':l, 't':t, 
		'upd': upd, 'drw': drw, 
});

//== default
npupd = [v, drg, delout];
dexp = (p, i) => {
	let th = TAU*rnd();
	let pva = 25*rndI(0.2, 1.0);
	return np({
		x:p.x, y:p.y, 
		vx:pva*cos(th), vy:pva*sin(th), 
		c:'.', upd:[...npupd, mdt(rndI(1., 1.5))]
	});
};
dcexp = (r, tot) => (p, i) => {
	let th = TAU*i/tot;
	return np({
		x:p.x, y:p.y, 
		vx:r*cos(th), vy:r*sin(th), 
		c:'.', upd:[...npupd, mdt(rndI(1.,1.5))]
	});
};
rdupd = [v, g, mbu(cv, mdpexp(dexp, 40))];
rdcupd = [v, g, mbu(cv, mdpexp(dcexp(30, 30), 30))];

//== strobe
mpst = (p) => {return np({x:p.x, y:p.y, c:'*', upd:[delout, mdt(0.06)]});};
istexp = (p, i) => {
	let th = TAU*rnd();
	let r = 15*rnd(0.5, 1.0);
	return np({
		x:p.x+r*cos(th), y:p.y+r*sin(th), 
		upd:[delout, mbu(mct(rndI(0.2,1.5)), repl(mpst))], 
		drw:[]
	});
};
rstupd = [v, g, mbu(cv, mdpexp(istexp, 60))];

mrw = (px, pvy, up) => np({x:px, vy:pvy, c:'.', upd:up});
rkt = [rdupd, rstupd, rdcupd];
//== manager
uparty = (p) => {
	if(rnd()>1.8/(ctime - p.t + 1)) {
		p.t = ctime;
		let r = mrw(rndI(0.16, 0.83)*cvs.w, sqrt(80*cvs.h)*rndI(0.8, 1.2), rkt.random());
		nv.push(r);
	}
};

dparty = (p) => {cvs.clear(' ');};

//==================================
function update() {
	pv = pv.concat(nv); nv.length = 0;
	for(let e of pv) 
		for(let u of e.upd) u(e);
	pv = pv.filter((e) => e.l);
}

function draw() {
	for(let e of pv) 
		for(u of e.drw) u(e);
}

function astart() {
	let manager = np({upd:[uparty], drw:[dparty]});
	nv.push(manager);
}

//==================================
function render() {
	draw();
	dv.innerHTML = cvs.v.join("");
}

function start() {
	ctime = 0;
	resume();
	astart();
}

function pause() {
	running = false;
}

function resume() {
	if(running) return;
	ptime = time();
	running = true;
	requestAnimationFrame(loop);
}

function loop() {
	let t = time();
	delta = t - ptime;
	ptime = t;
	ctime += delta;

	update();
	render();

	if(running) requestAnimationFrame(loop);
}

function resizeCanvas() {
	let style = window.getComputedStyle(dv, null).getPropertyValue('font-size');
	let fontSize = parseFloat(style);

	cvs.resize(floor(dv.clientWidth*5/3/fontSize), floor(dv.clientHeight/fontSize));
}

const keydown = (e) => {(e.key === ' ' ? (running ? pause : resume) : () => {})()};

//==================================
function init() {
	dv = document.getElementById("c");

	window.addEventListener('keydown', keydown, false);
	window.addEventListener('resize', resizeCanvas, false);
	
	resizeCanvas();
	start();
}

window.onload = init;
