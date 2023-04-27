
//==================================
const rnd = Math.random;
const floor = Math.floor;
const sqrt = Math.sqrt;
const sgn = Math.sign;
const cos = Math.cos;
const sin = Math.sin;
const PI = Math.PI;
const TAU = Math.PI*2;
const INF = 1000000000;
const abc = 'abcdefghijklmnopqrstuvwxyz';

Array.prototype.random = function() {return this[floor(rnd()*this.length)];};

const clamp = (e0, e1, x) => x < e0 ? e0 : (x > e1 ? e1 : x);
const smthstp = (e0, e1, x) => {let t = clamp((x-e0)/(e1-e0), 0, 1); return t*t*(3-2*t);};
const pipe = (...f) => (a) => {for(let fi of f) a = fi(a); return a;};
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
	paints:(x, y, s) => {
		let x0 = x;
		for(let c of s) {
			if(c === '\n') 
				{y -= 5/3; x = x0;}
			else 
				cvs.v[floor(x++) + floor(cvs.h - y*3/5+0.5)*(cvs.w+1)] = c;
		}
	},
	resize: (w, h) => {
		cvs.w = floor(w);
		cvs.h = floor(h);
		cvs.v = new Array((cvs.w+1)*cvs.h);
	}
};

//==================================
const message = "     _    _                                       \n    \| \|  \| \|                                      \n    \| \|__\| \|  __ _  _ __   _ __   _   _           \n    \|  __  \| / _\` \|\| \'_ \\ \| \'_ \\ \| \| \| \|          \n    \| \|  \| \|\| (_\| \|\| \|_) \|\| \|_) \|\| \|_\| \|          \n    \|_\|  \|_\| \\__,_\|\| .__/ \| .__/  \\__, \|          \n                   \| \|    \| \|      __/ \|          \n                   \|_\|    \|_\|     \|___/           \n  ____   _        _    _          _               \n \|  _ \\ (_)      \| \|  \| \|        \| \|              \n \| \|_) \| _  _ __ \| \|_ \| \|__    __\| \|  __ _  _   _ \n \|  _ < \| \|\| \'__\|\| __\|\| \'_ \\  / _\` \| / _\` \|\| \| \| \|\n \| \|_) \|\| \|\| \|   \| \|_ \| \| \| \|\| (_\| \|\| (_\| \|\| \|_\| \|\n \|____/ \|_\|\|_\|    \\__\|\|_\| \|_\| \\__,_\| \\__,_\| \\__, \|\n                                             __/ \|\n                                            \|___/\n";
const miniRocket = " .\n/ \\\n|_|\n *";
const sparks = ['*','.','x'];

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
monce = (f) => (p) => {p.l = false; f(p);};
donce = (f) => {let did=false; return (p) => {if(did) return; did=true; f(p);}};
waitfor = (t, f) => (p) => {if(ctime - p.t < t) return; t = INF; f(p);};
freq = (f, g=()=>0, t=0) => (p) => {if(ctime - p.t < t) return; t += g(); f(p);};
doif = (cond, f) => (p) => {if(cond(p)) f(p);};
mch = (h) => (p) => p.y > h;
mct = (t) => (p) => ctime - p.t >= t;
mdt = (t) => (p) => {p.l = p.l && (ctime - p.t) < t;};
dv = (p) => {p.l = p.l && p.vx*p.vx + p.vy*p.vy > 0.3;};
mbu = (cond, exp) => (p) => {if(cond(p)) {p.l = false; exp(p);}};
dp = (p) => {if(p.l) cvs.paint(p.x, p.y, p.c);};
mds = (s) => (p) => {cvs.paints(p.x, p.y, s);};
repl = (mp) => (p) => {nv.push(mp(p));};
mpkg = (...f) => (p) => {for(let fi of f) fi(p);};
mdpexp = (pc, tot) => (p) => {for(let i of range(tot)) nv.push(pc(p, i));};
np = ({x=0,y=0,c=' ',vx=0,vy=0,l=true,t=ctime,upd=[]}) => ({
		'x':x, 'y':y,
		'vx':vx, 'vy':vy, 
		'c':c, 'l':l, 't':t, 
		'upd': upd
});

createParticles = (c, n) => (p) => {let k = n; while(k-- > 0) nv.push(c(p, k));};

//== default
/*spark = (p) => np({
	x:p.x, y:p.y, vy:
});
sparkgen = (p) => np({
	x:p.x, y:p.y, 
	upd:[mdt(5), repl()]
});*/
dexp = (p, i) => {
	let th = TAU*rnd();
	let pva = 25*rndI(0.2, 1.0);
	return np({
		x:p.x, y:p.y, 
		vx:pva*cos(th), vy:pva*sin(th), 
		c:'.', upd:[v, drg, delout, mdt(rndI(1., 1.5)), dp]
	});
};
dcexp = (r, tot) => (p, i) => {
	let th = TAU*i/tot;
	return np({
		x:p.x, y:p.y, 
		vx:r*cos(th), vy:r*sin(th), 
		c:'.', upd:[v, drg, delout, mdt(rndI(1.,1.5)), dp]
	});
};
rdupd = [v, g, mbu(cv, createParticles(dexp, 40)), dp];
rdcupd = [v, g, mbu(cv, createParticles(dcexp(30, 30), 30)), dp];

//== strobe
mpst = (p) => {return np({x:p.x, y:p.y, c:'*', upd:[mdt(0.06), dp]});};
istexp = (p, i) => {
	let th = TAU*rnd();
	let r = 15*rnd(0.5, 1.0);
	return np({
		x:p.x+r*cos(th), y:p.y+r*sin(th), 
		upd:[delout, mbu(mct(rndI(0.2,1.5)), repl(mpst))]
	});
};
rstupd = [v, g, mbu(cv, createParticles(istexp, 60)), dp];

mrw = (px, pvy, up) => np({x:px, vy:pvy, c:'.', upd:up});
rkt = [rdupd, rstupd, rdcupd];
stndr = (pl) => [g, v, mbu(cav, pl), dp]; 

myrck = () => mrw(
	rndI(0.16, 0.83)*cvs.w, 
	sqrt(80*cvs.h)*rndI(0.8, 1.2), 
	stndr(
		createParticles(
			(p, i) => {
				let th = TAU*rnd();
				let r = 15*rnd(0.5, 1.0);
				return np({x:p.x+r*cos(th), y:p.y+r*sin(th), upd:[delout, mbu(mct(rndI(0.2,1.5)), repl(mpst))]});
			},
			10
		)
	)
);

brck = () => mrw(
	cvs.w*0.5,
	sqrt(80*cvs.h),
	[
		v, g,
		mbu(cav, mpkg(
			repl((p) => np({x:p.x-25, y:p.y+10, upd:[mdt(5.), (p)=>{cvs.paints(p.x, p.y, message);}]})),
			createParticles(
				(p, i) => {
					let th = TAU*rnd();
					let pva = 60*rndI(0.2, 1.0);
					return np({
						x:p.x, y:p.y, 
						vx:pva*cos(th), vy:pva*sin(th), 
						c:sparks[i % sparks.length], upd:[v, drg, delout, mdt(rndI(2., 2.5)), dp]
					});
				},
				100
			)
		)),
		mds(miniRocket)
	]
);

//== manager
uparty = (p) => {
	if(rnd()>1.8/(ctime - p.t + 1)) {
		p.t = ctime;
		let r = mrw(rndI(0.16, 0.83)*cvs.w, sqrt(80*cvs.h)*rndI(0.8, 1.2), rkt.random());
		nv.push(r);
	}
};

uparty = (() => {
	let t = 0; 
	return (p) => {
		if(rnd()>1.8/(ctime-t+1)) {
			t = ctime;
			let r = mrw(rndI(0.16, 0.83)*cvs.w, sqrt(80*cvs.h)*rndI(0.8, 1.2), rkt.random());
			nv.push(r);	 
		}
	}
})();

dparty = (p) => {cvs.clear(' ');};

//==================================
function update() {
	pv = pv.concat(nv); nv.length = 0;
	for(let e of pv) 
		for(let u of e.upd) u(e);
	pv = pv.filter((e) => e.l);
}

function astart() {
	let manager = np({upd:[uparty, waitfor(10, repl(brck)), dparty]});
	nv.push(manager);
}

//==================================
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
	delta = 0.016;//t - ptime;
	ptime = t;
	ctime += delta;

	update();
	dv.innerHTML = cvs.v.join("");

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
