/**
 * @Author: Edmund Lam <edl>
 * @Date:   16:59:19, 27-Mar-2018
 * @Filename: trees.js
 * @Last modified by:   edl
 * @Last modified time: 05:13:01, 28-Mar-2018
 */


//the canvas
var canv = document.getElementById('tree');
var context = canv.getContext("2d");

maxDepth = 4;

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
  this.l = this.parent.l*randFocus(this.attribs["l"]);
  this.w = this.parent.w*randFocus(this.attribs["w"]);
  this.deg = this.parent.deg+randVal([-1,1])*randFocus(this.attribs["d"]);
  this.depth = this.parent.depth+1;
  if (this.depth === maxDepth || this.l<0.5 || this.w<0.5){
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

init();

//initiation
function init(){
  canv.width = window.innerWidth;
  canv.height = Math.round(2 / 3 * window.innerHeight);
}

function startRender(){
  tr = randTree();
  console.log(tr);
  context.clearRect(0,0,canv.width, canv.height);
  renderTree(canv.width/2, 0, tr);
}

function renderTree(x, y, branch){
  var x1 = x+branch.l*Math.cos(branch.deg);
  var y1 = y+branch.l*Math.sin(branch.deg);
  context.beginPath();
  context.moveTo(x, canv.height-y);
  context.lineWidth = branch.w;
  if (branch.depth == maxDepth){
    context.strokeStyle = "#22b522";
  }else{
    context.strokeStyle = "#6F370F";
  }
  context.lineTo(x1, canv.height-y1);
  context.stroke();
  if (branch.children){
    for (var i = 0; i < branch.children.length; i++){
      renderTree(x1, y1, branch.children[i]);
    }
  }
}

function getEnergy(){

}

function randTree(){
  attrs = {};
  attrs["l"] = new Randobj(Math.random(), 0.75);
  attrs["w"] = new Randobj(Math.random(), 0.75);
  attrs["d"] = new Randobj(90*Math.PI*Math.random()/180, Math.PI*randInt(0, 89)/180);
  attrs["c"] = new Randobj(randInt(0,2), randInt(3, 5));
  return new Tree(attrs, randInt(25, 100), randInt(2, 10));
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
