/*
  The MIT License (MIT)

  Copyright (c) 2013 Morgan Herlocker

  Permission is hereby granted, free of charge, to any person obtaining a copy of
  this software and associated documentation files (the "Software"), to deal in
  the Software without restriction, including without limitation the rights to
  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
  the Software, and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.turf = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function toRad(a){return a*Math.PI/180}var invariant=require("turf-invariant");module.exports=function(a,t,e){invariant.featureOf(a,"Point","distance"),invariant.featureOf(t,"Point","distance");var r,n=a.geometry.coordinates,i=t.geometry.coordinates,o=toRad(i[1]-n[1]),s=toRad(i[0]-n[0]),c=toRad(n[1]),d=toRad(i[1]),h=Math.sin(o/2)*Math.sin(o/2)+Math.sin(s/2)*Math.sin(s/2)*Math.cos(c)*Math.cos(d),u=2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));switch(e){case"miles":r=3960;break;case"kilometers":r=6373;break;case"degrees":r=57.2957795;break;case"radians":r=1;break;case void 0:r=6373;break;default:throw new Error('unknown option given to "units"')}var M=r*u;return M};

},{"turf-invariant":2}],2:[function(require,module,exports){
function geojsonType(e,r,t){if(!r||!t)throw new Error("type and name required");if(!e||e.type!==r)throw new Error("Invalid input to "+t+": must be a "+r+", given "+e.type)}function featureOf(e,r,t){if(!t)throw new Error(".featureOf() requires a name");if(!e||"Feature"!==e.type||!e.geometry)throw new Error("Invalid input to "+t+", Feature with geometry required");if(!e.geometry||e.geometry.type!==r)throw new Error("Invalid input to "+t+": must be a "+r+", given "+e.geometry.type)}function collectionOf(e,r,t){if(!t)throw new Error(".collectionOf() requires a name");if(!e||"FeatureCollection"!==e.type)throw new Error("Invalid input to "+t+", FeatureCollection required");for(var o=0;o<e.features.length;o++){var n=e.features[o];if(!n||"Feature"!==n.type||!n.geometry)throw new Error("Invalid input to "+t+", Feature with geometry required");if(!n.geometry||n.geometry.type!==r)throw new Error("Invalid input to "+t+": must be a "+r+", given "+n.geometry.type)}}module.exports.geojsonType=geojsonType,module.exports.collectionOf=collectionOf,module.exports.featureOf=featureOf;

},{}],3:[function(require,module,exports){
module.exports=function(e){return{type:"FeatureCollection",features:e}};

},{}],4:[function(require,module,exports){
function inRing(e,n){for(var r=!1,o=0,t=n.length-1;o<n.length;t=o++){var g=n[o][0],i=n[o][1],a=n[t][0],f=n[t][1],l=i>e[1]!=f>e[1]&&e[0]<(a-g)*(e[1]-i)/(f-i)+g;l&&(r=!r)}return r}module.exports=function(e,n){var r=n.geometry.coordinates,o=[e.geometry.coordinates[0],e.geometry.coordinates[1]];"Polygon"===n.geometry.type&&(r=[r]);for(var t=!1,g=0;g<r.length&&!t;){if(inRing(o,r[g][0])){for(var i=!1,a=1;a<r[g].length&&!i;)inRing(o,r[g][a])&&(i=!0),a++;i||(t=!0)}g++}return t};

},{}],5:[function(require,module,exports){
var distance=require("turf-distance");module.exports=function(e,r){var t;return r.features.forEach(function(r){if(t){var i=distance(e,r,"miles");i<t.properties.distance&&(t=r,t.properties.distance=i)}else{t=r;var i=distance(e,r,"miles");t.properties.distance=i}}),delete t.properties.distance,t};

},{"turf-distance":1}],6:[function(require,module,exports){
var isArray=Array.isArray||function(r){return"[object Array]"===Object.prototype.toString.call(r)};module.exports=function(r,t){if(!isArray(r))throw new Error("Coordinates must be an array");if(r.length<2)throw new Error("Coordinates must be at least 2 numbers long");return{type:"Feature",geometry:{type:"Point",coordinates:r},properties:t||{}}};

},{}],7:[function(require,module,exports){
var inside=require("turf-inside");module.exports=function(r,e,i,s){return r=JSON.parse(JSON.stringify(r)),e=JSON.parse(JSON.stringify(e)),r.features.forEach(function(r){r.properties||(r.properties={}),e.features.forEach(function(e){if(void 0===r.properties[s]){var t=inside(r,e);t&&(r.properties[s]=e.properties[i])}})}),r};

},{"turf-inside":4}],8:[function(require,module,exports){
var inside=require("turf-inside"),featureCollection=require("turf-featurecollection");module.exports=function(e,r){for(var t=featureCollection([]),u=0;u<r.features.length;u++)for(var f=0;f<e.features.length;f++){var a=inside(e.features[f],r.features[u]);a&&t.features.push(e.features[f])}return t};

},{"turf-featurecollection":3,"turf-inside":4}],9:[function(require,module,exports){
module.exports={distance:require("turf-distance"),featurecollection:require("turf-featurecollection"),nearest:require("turf-nearest"),point:require("turf-point"),tag:require("turf-tag"),within:require("turf-within")};
},{"turf-distance":1,"turf-featurecollection":3,"turf-nearest":5,"turf-point":6,"turf-tag":7,"turf-within":8}]},{},[9])(9)
});
