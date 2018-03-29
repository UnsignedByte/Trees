/**
 * @Author: Edmund Lam <edl>
 * @Date:   16:59:19, 27-Mar-2018
 * @Filename: trees.js
 * @Last modified by:   edl
 * @Last modified time: 18:22:06, 28-Mar-2018
 */


//the canvas
var canv = document.getElementById('tree');
var context = canv.getContext("2d");

var maxDepth = 4;
var rayComplexity = 2;

//Tree class, houses all attributes
function Tree(attribs, l, w){
  this.attribs = attribs;
  this.l = l;
  this.w = w;
  this.deg = Math.PI/2;
  this.depth = 0;
  this.children = new Array();
  for (var i = 0; i < randFocus(this.attribs["c"]); i++){
    this.children.push(new Branch(this));
  }
}

//Branch class
function Branch(parent){
  this.attribs = parent.attribs;
  this.parent = parent;
  this.l = this.parent.l*Math.max(0.1,Math.min(1.25, randFocus(this.attribs["l"])));
  this.w = this.parent.w*Math.max(0.1,Math.min(0.75, randFocus(this.attribs["w"])));
  this.deg = this.parent.deg+randVal([-1,1])*randFocus(this.attribs["d"]);
  this.depth = this.parent.depth+1;
  if (this.depth >= randFocus(new Randobj(parent.attribs["b"], maxDepth)) || this.l<1 || this.w<1){
    this.children = null;
  }else{
    this.children = new Array();
    for (var i = 0; i < randFocus(this.attribs["c"]); i++){
      this.children.push(new Branch(this));
    }
  }
}

//class containing dev, sharpness, foci
function Randobj(dev, focus){
  this.dev = dev;
  this.focus = focus;
}

var trees = new Array();
var nTrees = 250;

init();

//initiation
function init(){
  canv.width = window.innerWidth;
  canv.height = Math.round(0.9 * window.innerHeight);
  for ( var i = 0; i < nTrees; i++){
    var t = randTree();
    trees.push([t, getEnergy(t)]);
  }
  window.requestAnimationFrame(gen)
}

//Renders one generation
function gen(){
  context.clearRect(0, 0, canv.width, canv.height);
  var Comparator = function(a, b){
    if (a[1] < b[1]){
      return 1;
    }else if (b[1] < a[1]){
      return -1;
    }
    return 0;
  }
  trees = trees.sort(Comparator);
  renderTree(canv.width/2, 0, trees[0][0]);
  console.log(trees[0][1]);

  trees = trees.slice(0, randInt(trees.length/3, 2*trees.length/3));
  treechoice = new Randobj(trees.length, 0);
  while (trees.length < nTrees){
    var r = Math.abs(Math.round(randFocus(treechoice)));
    var t = childTree(trees[r][0]);
    trees.push([t, getEnergy(t)]);
  }
  console.log("FDONE");
}

function startRender(){
  window.requestAnimationFrame(gen);
}

function renderTree(x, y, branch){
  var x1 = x+branch.l*Math.cos(branch.deg);
  var y1 = y+branch.l*Math.sin(branch.deg);
  context.beginPath();
  context.moveTo(x, canv.height-y);
  context.lineWidth = branch.w;
  if (branch.children){
    context.strokeStyle = "#6F370F";
  }else{
    context.strokeStyle = "#22b522";
  }
  context.lineTo(x1, canv.height-y1);
  context.stroke();
  if (branch.children){
    for (var i = 0; i < branch.children.length; i++){
      renderTree(x1, y1, branch.children[i]);
    }
  }
}

function getEnergy(tree){
  var pts = new Array();
  var energy = 0;
  var getPoints = function(x, y, branch){
    var x1 = x+branch.l*Math.cos(branch.deg);
    var y1 = y+branch.l*Math.sin(branch.deg);
    energy-= branch.l*branch.w;
    if (branch.children){
      for (var i = 0; i < branch.children.length; i++){
        getPoints(x1, y1, branch.children[i]);
      }
    }else{
      pts.push([[x,y], [x1,y1], branch.l, branch.w]);
    }
  };
  getPoints(canv.width/2, 0, tree);

  for ( var d = 30; d <= 150; d+=30 ){
    var project = {};
    var deg = d/180*Math.PI;
    var rC = Math.abs(rayComplexity*Math.cos(deg+Math.PI/2));
    for (var i = 0; i < pts.length; i++){
      var dx, dx1;
      if (d === 90){
        dx = pts[i][0][0];
        dx1 = pts[i][1][0];
      }else{
        dx = (Math.tan(deg)*pts[i][0][0]-pts[i][0][1])*Math.sin(deg)/2;
        dx1 = (Math.tan(deg)*pts[i][1][0]-pts[i][1][1])*Math.sin(deg)/2;
      }
      for (var j = Math.floor(Math.min(dx1, dx)*rC)/rC; j <= Math.ceil(Math.max(dx1, dx)*rC)/rC; j+=rC){
        if (!(j in project)){
          project[j] = pts[i][3];
        }else{
          project[j] = Math.max(project[j], pts[i][3]);
        }
      }
    }
    s = 2*rayComplexity*sum(project);
    energy+=s;
  }
  return energy;
}

//Creates a child tree
function childTree(tree){
  attrs = tree.attribs;
  if (randInt(1, 100) <= 5){
    attrs["l"] = new Randobj(randFocus(new Randobj(0.5, tree.attribs["l"].dev)), randFocus(new Randobj(0.25, tree.attribs["l"].focus)));
  }
  if (randInt(1, 100) <= 5){
    attrs["w"] = new Randobj(randFocus(new Randobj(0.5, tree.attribs["w"].dev)), randFocus(new Randobj(0.25, tree.attribs["w"].focus)));
  }
  if (randInt(1, 100) <= 5){
    attrs["d"] = new Randobj(randFocus(new Randobj(Math.PI/2, tree.attribs["d"].dev)), randFocus(new Randobj(Math.PI/4, tree.attribs["d"].focus)));
  }
  if (randInt(1, 100) <= 1){
    attrs["c"] = new Randobj(Math.round(randFocus(new Randobj(1, tree.attribs["c"].dev))), Math.round(randFocus(new Randobj(1, tree.attribs["c"].focus))));
  }
  if (randInt(1, 100) <= 3){
    attrs["b"] = Math.round(tree.attribs["b"]+randFocus(new Randobj(3, tree.attribs["b"])));
  }
  var l = Math.max(50,Math.min(175, Math.round(tree.l+randFocus(new Randobj(75, tree.l)))));
  var w = Math.max(20, Math.min(40, Math.round(tree.w+randFocus(new Randobj(5, tree.w)))));
  return new Tree(attrs, l, w);
}

//Creates a random tree
function randTree(){
  attrs = {};
  attrs["l"] = new Randobj(Math.random(), 0.75);
  attrs["w"] = new Randobj(Math.random(), 0.75);
  attrs["d"] = new Randobj(90*Math.PI*Math.random()/180, Math.PI*randInt(0, 89)/180);
  attrs["c"] = new Randobj(randInt(0,2), randInt(3, 5));
  attrs["b"] = randInt(0, 2)
  return new Tree(attrs, randInt(75, 150), randInt(20, 40));
}

//Returns a random number with a focus
function randFocus (obj) {
  return obj.dev*Math.pow(2*Math.random()-1, 2)+obj.focus;
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

//Credit to https://stackoverflow.com/questions/16449295/how-to-sum-the-values-of-a-javascript-object
function sum( obj ) {
  var sum = 0;
  for( var el in obj ) {
    if( obj.hasOwnProperty( el ) ) {
      sum += parseFloat( obj[el] );
    }
  }
  return sum;
}
