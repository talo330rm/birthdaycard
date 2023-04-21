var dv;
var sizes;

var ptime;
var ctime;
var delta;
var stop;

var screen;

//==================================
Array.prototype.random = function() {return this[Math.floor(Math.random()*this.length)];};

time = () => Date.now()*0.001;
range = (i) => ({
	[Symbol.iterator]() {
		let s = 0;
		return {next() {return {value:s++, done:s>=i};}};
	}
});

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
make = (p) => {nv.push(p);};
v = (p) => {p.x += p.vx*delta; p.y += p.vy*delta;}
drg = (p) => {av = Math.sqrt(p.vx*p.vx + p.vy*p.vy)*0.7*delta; p.vx -= Math.sign(p.vx)*av; p.vy -= Math.sign(p.vy)*av;};
hdrg = (p) => {p.vx -= Math.sign(p.vx)*p.vx*delta*0.7;};
g = (p) => p.vy -= 40*delta;
cv = (p) => p.vy <= 0;
cpos = (p) => p.x < 0 || p.x >= sizes.w || p.y < 0 || p.y > sizes.h;
cav = (p) => p.vx*p.vx + p.vy*p.vy < 0.3;
mcl = (...cond) => (p) => cond.some((f) => f(p));
delout = (p) => p.l = !cpos(p);
monce = (u) => (p) => {p.l = false; u(p);};
mch = (h) => (p) => p.y > h;
mct = (t) => (p) => ctime - p.t >= t;
mbu = (cond, exp) => (p) => {if(cond(p)) {p.l = false; exp(p);}};
dp = (p) => {paint(p.x, sizes.h-p.y, p.c);};
np = ({x=0,y=0,c=' ',vx=0,vy=0,l=true,t=ctime,upd=[],drw=[dp]}) => ({
		'x':x, 'y':y,
		'vx':vx, 'vy':vy, 
		'c':c, 'l':l, 't':t, 
		'upd': upd, 'drw': drw, 
});

mpexp = (pc) => {for(let i of range(tot)) nv.push(pc(i));};

//== normal
npupd = [v, delout, drg, mbu(cav, nop)];
pest = (px, py, pva, th, pc) => np({x:px, y:py, vx:pva*Math.cos(th), vy:pva*Math.sin(th), c:pc, upd:npupd});
mdexp = (tot) => (p) => {for(let i of range(tot)) nv.push(pest(p.x, p.y, 20*(Math.random()*0.8+0.2), Math.PI*2/tot*2*i, ['*','.'].random()));};
mr = (px, pvy, pl) => np({x:px, y:0, vy:pvy, c:'!', upd:[v, g, dre]});

dre = mbu(cv, mdexp(40));
//== filament
fil = (u) => {lpos = u.y; (p) => {if(floor(p.y) != floor(lpos)) {make(mfp1(p));lpos = p.y;};};};
mfp0 = (px, py, pvx, pvy) => np({c:'*',upd:[v,g,drg,fil,delout]});
mfp1 = (p) => np({x:p.x, y:p.y, vx:0, vy:0, c:'|', upd:[delout, mbu(mct(0.5, nop))]});

//== manager
party = (p) => {
	if(Math.random()>3/(ctime - p.t + 1)) {
		p.t = ctime;
		r = mr((Math.random()*(0.66)+0.16)*sizes.w, 80*(Math.random()*0.3 + 0.7));
		nv.push(r);
	}
};

//==================================
function update() {
	pv = [...pv, ...nv]; nv = [];
	for(e of pv) 
		for(u of e.upd) u(e);
	pv = pv.filter((e) => e.l);
}

function draw() {
	clear(' ');
	for(e of pv) 
		for(u of e.drw) u(e);
}

function astart() {
	manager = np({upd:[party], drw:[]});
	nv.push(manager);
}

//==================================
function paint(x, y, c) {
	screen[Math.floor(x) + Math.floor(y/2)*(sizes.w+1)] = c;
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

function start() {
	ctime = 0;
	resume();
	astart();
}

function pause() {
	stop = true;
}

function resume() {
	ptime = time();
	stop = false;
	requestAnimationFrame(loop);
}

function loop() {
	var t = time();
	delta = t - ptime;
	ptime = t;
	ctime += delta;

	update();
	render();

	if(!stop) requestAnimationFrame(loop);
}

function resizeCanvas() {
	var style = window.getComputedStyle(dv, null).getPropertyValue('font-size');
	var fontSize = parseFloat(style);

	sizes = {
		'w':Math.floor(dv.clientWidth/fontSize), 
		'h':Math.floor(dv.clientHeight/fontSize*2)
	};

	screen = new Array((sizes.w+1)*sizes.h);
}

function init() {
	dv = document.getElementById("c");
	stime = time();

	window.addEventListener('keydown', keydown, false);
	window.addEventListener('resize', resizeCanvas, false);
	
	resizeCanvas();
	start();
}

function keydown(e) {
	if(e.key===' ') 
		if(stop) resume(); else pause();
}

window.onload = init;
