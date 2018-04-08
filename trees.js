/**
 * @Author: Edmund Lam <edl>
 * @Date:   16:59:19, 27-Mar-2018
 * @Filename: trees.js
 * @Last modified by:   edl
 * @Last modified time: 12:12:50, 08-Apr-2018
 */
//the canvas
var canv = document.getElementById('tree');
var context = canv.getContext("2d");
var sizeRatio = 0.5

var maxDepth = 5;
var rayComplexity = 1;
var precision = 1;

//Tree class, houses all attributes
function Tree(attribs, l, w) {
  this.attribs = attribs;
  this.l = l;
  this.w = w;
  this.deg = Math.PI / 2;
  this.depth = 0;
  this.children = new Array();
  for (var i = 0; i < randFocus(this.attribs["c"][0]); i++) {
    this.children.push(new Branch(this));
  }
}

//Branch class
function Branch(parent) {
  this.attribs = parent.attribs;
  this.parent = parent;
  this.depth = this.parent.depth + 1;
  this.l = this.parent.l * Math.max(0.1, Math.min(1.25, randFocus(this.attribs["l"][this.depth-1])));
  this.w = this.parent.w * Math.max(0.1, Math.min(0.75, randFocus(this.attribs["w"][this.depth-1])));
  this.deg = this.parent.deg + randVal([-1, 1]) * randFocus(this.attribs["d"][this.depth-1]);
  if (this.depth >= Math.min(maxDepth, randFocus(parent.attribs["b"])) || this.l < 1 || this.w < 1) {
    this.children = null;
  } else {
    this.children = new Array();
    for (var i = 0; i < randFocus(this.attribs["c"][this.depth]); i++) {
      this.children.push(new Branch(this));
    }
  }
}

//class containing dev, sharpness, foci
function Randobj(dev, focus) {
  this.dev = dev;
  this.focus = focus;
}

var trees = new Array();
var nTrees = 500;

init();

//initiation
function init() {
  canv.width = window.innerWidth;
  canv.height = Math.round(0.9 * window.innerHeight);
  for (var i = 0; i < nTrees; i++) {
    var t = randTree();
    trees.push([t, getEnergy(t)]);
  }
  window.requestAnimationFrame(gen)
}

//Renders one generation
function gen() {
  concTime = Date.now();
  context.clearRect(0, 0, canv.width, canv.height);
  var Comparator = function(a, b) {
    if (a[1] < b[1]) {
      return 1;
    } else if (b[1] < a[1]) {
      return -1;
    }
    return 0;
  }
  trees = trees.sort(Comparator);
  renderTree(0, 0, trees[0][0], canv.width / 4, 0);
  console.log("MAX:", trees[0][1]);
  renderTree(0, 0, trees[trees.length - 1][0], 3 * canv.width / 4, 0);
  console.log("MIN:", trees[trees.length - 1][1]);
  sum = 0;
  for (var i = 0; i < trees.length; i++) {
    sum += trees[i][1];
  }
  console.log("AVERAGE:", sum / trees.length);

  trees = trees.slice(0, randInt(trees.length / 3, 2 * trees.length / 3));
  treechoice = new Randobj(trees.length, 0);
  while (trees.length < nTrees) {
    var r = Math.abs(Math.round(randFocus(treechoice)));
    var t;
    if (randInt(1, 100) === 1) {
      t = randTree();
    } else {
      t = childTree(trees[r][0]);
    }
    trees.push([t, getEnergy(t)]);
  }
  console.log("Generation time:", (Date.now() - concTime) / 1000, "seconds")
  context.fillStyle = '#000000';
  context.font = '24px Courier';
  context.fillText("Render time: "+ (Date.now() - concTime) / 1000+ " seconds", 10, 34)
}

function startRender() {
  window.requestAnimationFrame(gen);
}

function renderIdentical() {
  context.clearRect(0, 0, canv.width, canv.height);
  var t = new Tree(trees[0][0].attribs, trees[0][0].l, trees[0][0].w);
  renderTree(0, 0, t, canv.width / 2, 0);
  console.log(getEnergy(t));
}

function rTree() {
  context.clearRect(0, 0, canv.width, canv.height);
  var rand = randInt(0, trees.length - 1);
  renderTree(0, 0, trees[rand][0], canv.width / 2, 0);
  console.log(trees[rand][1]);
}

function renderTree(x, y, branch, sX, sY) {
  var x1 = x + branch.l * Math.cos(branch.deg);
  var y1 = y + branch.l * Math.sin(branch.deg);
  context.beginPath();
  context.moveTo(x * sizeRatio + sX, canv.height - y * sizeRatio + sY);
  context.lineWidth = branch.w * sizeRatio;
  if (branch.children) {
    context.strokeStyle = "#6F370F";
  } else {
    context.strokeStyle = "#22b522";
  }
  context.lineTo(x1 * sizeRatio + sX, canv.height - y1 * sizeRatio + sY);
  context.stroke();
  if (branch.children) {
    for (var i = 0; i < branch.children.length; i++) {
      renderTree(x1, y1, branch.children[i], sX, sY);
    }
  }
}

function getEnergy(tree) {
  var pts = new Array();
  var energy = 0;
  var getPoints = function(x, y, branch) {
    var x1 = x + branch.l * Math.cos(branch.deg);
    var y1 = y + branch.l * Math.sin(branch.deg);
    energy -= branch.l * branch.w;
    if (branch.children) {
      for (var i = 0; i < branch.children.length; i++) {
        getPoints(x1, y1, branch.children[i]);
      }
    } else {
      pts.push([
        [x, y],
        [x1, y1], branch.l, branch.w
      ]);
    }
  };
  getPoints(canv.width / 2, 0, tree);


  var project = new Array();
  project.push(new Array());
  project.push(new Array())

  for (var d = 30; d <= 150; d += 30) {
    var s = 0;
    var deg = d / 180 * Math.PI;
    var sd = Math.sin(deg);
    var rC = Math.abs(rayComplexity * sd);
    for (var i = 0; i < pts.length; i++) {
      var dx, dx1;
      if (d === 90) {
        dx = pts[i][0][0];
        dx1 = pts[i][1][0];
      } else {
        var td = Math.tan(deg);
        dx = (td * pts[i][0][0] - pts[i][0][1]) * sd / 2;
        dx1 = (td * pts[i][1][0] - pts[i][1][1]) * sd / 2;
      }
      for (var j = Math.floor(Math.min(dx1, dx) * rC) / rC; j <= Math.ceil(Math.max(dx1, dx) * rC) / rC; j += rC) {
        jr = Math.round(j / precision);
        var n = 0;
        if (jr < 0) {
          n = 1;
          jr *= -1;
        }
        for (var v = project.length; v < jr; v++) {
          project.push(0);
        }
        if (project[jr] != d) {
          project.push(d);
          s++;
        }
      }
    }
    s *= 2;
    energy += s;
  }
  return energy;
}

//Creates a child tree
function childTree(tree) {
  var attrs = tree.attribs;
  var l = tree.l;
  var w = tree.w;
  if (randInt(1, 100) <= 1) {
    attrs["c"][0] = new Randobj(Math.round(randFocus(new Randobj(1, tree.attribs["c"][0].dev))), Math.round(randFocus(new Randobj(1, tree.attribs["c"][0].focus))));
  }
  for (var loooooog = 0; loooooog<maxDepth; loooooog++){
    if (randInt(1, 100) <= 1) {
      attrs["l"][loooooog] = new Randobj(randFocus(new Randobj(0.5, tree.attribs["l"][loooooog].dev)), randFocus(new Randobj(0.25, tree.attribs["l"][loooooog].focus)));
    }
    if (randInt(1, 100) <= 1) {
      attrs["w"][loooooog] = new Randobj(randFocus(new Randobj(0.5, tree.attribs["w"][loooooog].dev)), randFocus(new Randobj(0.25, tree.attribs["w"][loooooog].focus)));
    }
    if (randInt(1, 100) <= 1) {
      attrs["d"][loooooog] = new Randobj(randFocus(new Randobj(Math.PI / 2, tree.attribs["d"][loooooog].dev)), randFocus(new Randobj(Math.PI / 4, tree.attribs["d"][loooooog].focus)));
    }
    if (randInt(1, 100) <= 1) {
      attrs["c"][loooooog+1] = new Randobj(Math.round(randFocus(new Randobj(1, tree.attribs["c"][loooooog].dev))), Math.round(randFocus(new Randobj(1, tree.attribs["c"][loooooog].focus))));
    }
  }
  if (randInt(1, 100) <= 1) {
    attrs["b"] = new Randobj(Math.round(randFocus(new Randobj(1, tree.attribs["b"].dev))), randFocus(new Randobj(1, tree.attribs["b"].focus)));
  }
  if (randInt(1, 100) <= 1) {
    l = Math.max(50, Math.min(175, Math.round(tree.l + randFocus(new Randobj(75, tree.l)))));
  }
  if (randInt(1, 100) <= 1) {
    w = Math.max(20, Math.min(40, Math.round(tree.w + randFocus(new Randobj(5, tree.w)))));
  }
  return new Tree(attrs, l, w);
}

//Creates a random tree
function randTree() {
  attrs = {};
  attrs["l"] = new Array();
  attrs["w"] = new Array();
  attrs["d"] = new Array();
  attrs["c"] = new Array();
  attrs["c"].push(new Randobj(randInt(0, 2), randInt(3, 5)));
  for (var loooooog = 0; loooooog<maxDepth; loooooog++){
    attrs["l"].push(new Randobj(Math.random(), 0.75));
    attrs["w"].push(new Randobj(Math.random(), 0.75));
    attrs["d"].push(new Randobj(90 * Math.PI * Math.random() / 180, Math.PI * randInt(0, 89) / 180));
    attrs["c"].push(new Randobj(randInt(0, 2), randInt(3, 5)));
  }
  attrs["b"] = new Randobj(randInt(0, 2), maxDepth);
  return new Tree(attrs, randInt(75, 150), randInt(20, 40));
}

//Returns a random number with a focus
function randFocus(obj) {
  return obj.dev * Math.pow(2 * Math.random() - 1, 2) + obj.focus;
}

//Returns a random int between min and max, inclusive.
function randInt(min, max) {
  min = Math.round(min);
  max = Math.round(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Returns a random value in an array
function randVal(a) {
  return a[randInt(0, a.length - 1)];
}
