(function(ob) {
	var module = ob;

	//==================================

	module.vec3 = function(x=0,y=0,z=0) {
		return {'x':x, 'y':y, 'z':z};
	}

	module.cvec3 = function(v) {
		return Object.assign({}, v);
	}

	module.add = function(a, b) {
		return vec3(a.x+b.x, a.y+b.y, a.z+b.z);
	}

	module.distance = function(a, b) {
		return len(sub(a, b));
	}

	module.sub = function(a, b) {
		return vec3(a.x-b.x, a.y-b.y, a.z-b.z);
	}

	module.dot = function(a, b) {
		return a.x*b.x + a.y*b.y + a.z*b.z;
	}

	module.cross = function(a, b) {
		return vec3(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x);
	}

	module.scale = function(a, b) {
		return vec3(a.x*b, a.y*b, a.z*b);
	}

	module.len = function(a) {
		return Math.sqrt(dot(a, a));
	}

	module.norm = function(a) {
		return scale(a, 1.0/len(a));
	}

	module.absv = function(a) {
		return vec3(Math.abs(a.x), Math.abs(a.y), Math.abs(a.z));
	}

	//==================================

	module.UP = vec3(0,1,0);
	module.FORWARD = vec3(1,0,0);
	module.RIGHT = vec3(0,0,1);
	module.INF = 1000000.0;

	module.max_iter = 25;
	module.max_dist = 10;
	module.thr = 0.01;

	//==================================

	module.lookAt = function(camera, p) {
		camera.f = norm(sub(p, camera.p));
		camera.u = norm(sub(UP, scale(camera.f, dot(UP, camera.f))));
		camera.r = cross(camera.f, camera.u);
	}

	module.newCamera = function() {
		return {
			'u': vec3(0,1,0),
			'f': vec3(1,0,0),
			'r': vec3(0,0,1),
			'p': vec3(-3,0,0),
			'n': 0.5
		};
	}

	module.getCameraRay = function(c, u) {
		return norm(sub(add(add(c.p, scale(c.f, c.n)), add(scale(c.r, u.x), scale(c.u, u.y))), c.p));
	}

	module.calcNormal = function(p, dst) {
		var ex = vec3(0.001, 0., 0.);
		var ey = vec3(0., 0.001, 0.);
		var ez = vec3(0., 0., 0.001);
		var ret = norm(vec3(dst(add(p, ex)) - dst(sub(p, ex)), dst(add(p, ey)) - dst(sub(p, ey)), dst(add(p, ez)) - dst(sub(p, ez))));
		return ret;
	}	

	module.raymarch = function(p, d, dst) {
		var rp = cvec3(p);
		for(var i = 0; i < max_iter; i++) {
			var ds = dst(rp);
			if(ds < thr) return {'p':rp, 'd':1};
			if(ds > max_dist) return {'p':rp, 'd':-1};
			rp = add(rp, scale(d, ds*0.99));
		}
		return {'p':rp, 'd':-1};
	}

	//==================================

	module.sph = function(rp, sp, r) {
		return distance(rp, sp) - r;
	}

})(this);
