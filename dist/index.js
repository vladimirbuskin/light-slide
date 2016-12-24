(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.lightSlide = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function slide({
  panel,
  toggleButton,
  padding,
  tolerance = 10
})
{
  // touch start, end
  var touchStart = [];
  var touchEnd = [];

  // panel touch start position
  var panStart = [];

  // dragging flags
  var draggingX = false;
  var draggingY = false;


  function tStart(ev) {
    touchEnd = touchStart = getTouchCoords(ev);

    panStart = getTransformMatrix(panel).slice(4,6).map(x=>x||0);

    // stop animation
    panel.style.transition = '';
    // set current initial position after animation
    panel.style.transform = 'translate('+panStart[0]+'px,0)';
  }

  function tMove(ev) {

    touchEnd = getTouchCoords(ev)
    var diff = coordsDiff(touchStart, touchEnd)

    // if we draggingY skip
    if (draggingY) return;

    // check are we draggingY
    if (Math.abs(diff[1]) > Math.abs(diff[0])) {
      draggingY = true;
      return;
    }

    if (!draggingX) {
      // when we already drag, we prevent scroll-Y
      ev.preventDefault()
    }
    else {
      // filter with tolerance distance
      diff = filterDiff(diff, tolerance)
      draggingX = diff.some(x => x != 0)
    }
    var curr = makePositive(coordsDiffSum(diff, panStart));

    panel.style.transform = 'translate('+curr[0]+'px,0)';
  }

  function tEnd(ev) {
    animate(panel)
    draggingX = false;
    draggingY = false;
  }

  panel.addEventListener('touchstart', tStart);
  panel.addEventListener('touchmove', tMove);
  panel.addEventListener('touchend', tEnd);

  toggleButton.addEventListener('click', ev => animate(panel, true))
}


var getTouchCoords = ev => [ev.touches[0].screenX, ev.touches[0].screenY]
var coordsDiff = (s, c) => [c[0] - s[0], c[1] - s[1]]
var coordsDiffSum = (s, c) => [c[0] + s[0], c[1] + c[1]]
var makePositive = s => s.map(x => x < 0 ? 0 : x)
var filterDiff = (d, filterDiffValue) => d.map(x => Math.abs(x) < filterDiffValue ? 0:x)

// returns slide size in pixels
function defaultSlideSize() {
  return Math.trunc(document.body.clientWidth / 3)
}

// receives element to animate
function animate(el, toggle) {

  var size = defaultSlideSize()
  var c = getTransformMatrix(el)
  
  // animate to [0,0] if lower than Slide size half
  let toStart = c[4] < Math.trunc(size / 2) 

  if (toggle) toStart = !toStart;

  el.style.transform = toStart ? 'translate(0,0)' : 'translate(' + size + 'px,0)' 
  el.style.transition = 'transform 400ms'
}

// input string, or element:
// transform: matrix(a, c, b, d, tx, ty)
// transform: translate(tx, ty)
// output:
// [a, c, b, d, tx, ty]
function getTransformMatrix(s) {

  // take computed style
  if (typeof s != 'string') 
    s = getComputedStyle(s).transform

  // is empty
  if (s==null || s.length == 0) return [1,0,1,0,0,0]

  p1 = s.indexOf("(")
  // transform name
  var trName = s.substring(0, p1)
  // transform values
  var res = s
    .substring(p1+1, s.indexOf(")")-1)
    .split(',')
    .map( x=> parseInt(x.replace('px','')));

  return trName == 'matrix' ?  res : [1,0,1,0].concat(res);
}

module.exports = slide
},{}]},{},[1])(1)
});