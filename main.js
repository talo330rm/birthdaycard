
//==================================
const rnd = Math.random;
const floor = Math.floor;
const sqrt = Math.sqrt;
const sgn = Math.sign;
const cos = Math.cos;
const sin = Math.sin;
const PI = Math.PI;

Array.prototype.random = function() {return this[floor(rnd()*this.length)];};

const time = () => Date.now()*0.001;
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
	w: 0,
	h: 0,
	v: [],
	clear: (c) => {
		cvs.v.fill(c); 
		for(let i = 1; i <= cvs.h; i++) cvs.v[i*(cvs.w+1) - 1] = '\n';
	},
	paint: (x, y, c) => {
		cvs.v[floor(x) + floor(cvs.h - y/2)*(cvs.w+1)] = c;
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
drg = (p) => {let av = sqrt(p.vx*p.vx + p.vy*p.vy)*0.7*delta; p.vx -= sgn(p.vx)*av; p.vy -= sgn(p.vy)*av;};
hdrg = (p) => {p.vx -= sgn(p.vx)*p.vx*delta*0.7;};
g = (p) => p.vy -= 40*delta;
mg = (c) => (p) => p.vy -= c*delta;
cv = (p) => p.vy <= 0;
cpos = (p) => p.x < 0 || p.x >= cvs.w || p.y < 0 || p.y >= cvs.h*2;
cav = (p) => p.vx*p.vx + p.vy*p.vy < 0.3;
mcl = (...cond) => (p) => cond.some((f) => f(p));
delout = (p) => p.l = !cpos(p);
monce = (u) => (p) => {p.l = false; u(p);};
mch = (h) => (p) => p.y > h;
mct = (t) => (p) => ctime - p.t >= t;
mbu = (cond, exp) => (p) => {if(cond(p)) {p.l = false; exp(p);}};
dp = (p) => {cvs.paint(p.x, p.y, p.c);};
np = ({x=0,y=0,c=' ',vx=0,vy=0,l=true,t=ctime,upd=[],drw=[dp]}) => ({
		'x':x, 'y':y,
		'vx':vx, 'vy':vy, 
		'c':c, 'l':l, 't':t, 
		'upd': upd, 'drw': drw, 
});

mpkg = (...f) => (p) => {for(let fi of f) fi(p);};

mpexp = (pc) => {for(let i of range(tot)) nv.push(pc(i));};



//== normal
npupd = [v, delout, drg, mbu(cav, nop)];
pest = (px, py, pva, th, pc) => np({x:px, y:py, vx:pva*cos(th), vy:pva*sin(th), c:pc, upd:npupd});
mdexp = (tot) => (p) => {let vc = ['.','*'];for(let i of range(tot)) nv.push(pest(p.x, p.y, 30*(rnd()*0.8+0.2), PI*2/tot*2*i, vc.random()));};
mr = (px, pvy, pl) => np({x:px, y:0, vy:pvy, c:'.', upd:[v, g, dre]});

dre = mbu(cv, mdexp(60));
//== filament
fil = (u) => {let lpos = u.y; (p) => {if(floor(p.y) != floor(lpos)) {make(mfp1(p));lpos = p.y;};};};
mfp0 = (px, py, pvx, pvy) => np({c:'*',upd:[v,g,drg,fil,delout]});
mfp1 = (p) => np({x:p.x, y:p.y, vx:0, vy:0, c:'|', upd:[delout, mbu(mct(0.5, nop))]});

//chain



//== manager
uparty = (p) => {
	if(rnd()>3/(ctime - p.t + 1)) {
		p.t = ctime;
		let r = mr((rnd()*(0.66)+0.16)*cvs.w, 80*(rnd()*0.3 + 0.7));
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

	cvs.resize(floor(dv.clientWidth/fontSize), floor(dv.clientHeight/fontSize));
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
