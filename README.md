## Nayuki Canvas

[![Travis build status](http://img.shields.io/travis/matt-jensen/nayuki-canvas.svg?style=flat)](https://travis-ci.org/matt-jensen/nayuki-canvas)
[![Dependency Status](https://david-dm.org/matt-jensen/nayuki-canvas.svg)](https://david-dm.org/matt-jensen/nayuki-canvas)
[![codecov](https://codecov.io/gh/Matt-Jensen/nayuki-canvas/branch/master/graph/badge.svg)](https://codecov.io/gh/Matt-Jensen/nayuki-canvas)

**Nayuki Canvas** a floating node HTML5 canvas with zero dependencies and lovably simple setup.

![Screenshot software](https://raw.githubusercontent.com/Matt-Jensen/nayuki-canvas/master/public/screenshot.gif "screenshot of Nayuki Canvas")

## Install
```
$ npm install nayuki-canvas --save-dev
```

#### Setup (as global)
```
<script src="./path/to/node_modules/nayuki-canvas.min.js">
```
**Also consumable as Javascript Module and AMD***

## Usage
```js
var canvas = document.getElementById('canvas');
var config = {};
var myCanvas = nayukiCanvas(canvas, config).start();
```

### API
#### Configuration Options
| Name | Type | Default | Description |
|---|---|---|---|
| extraEdges | Number | 20 | Recommendation on how many edges should appear |
| nodeCount |  Number | 70 | Amount of nodes to render |
| network | String | 'balanced' | Other network styles: `mesh` & `wheel` |
| repulsion | Number | 1 | Speed at which nodes move from one another |
| borderFade | Number | -0.02 | Place where nodes fade on canvas edge |
| fadeInRate | Number | 0.06 | Rate of nodes fade on create |
| fadeOutRate | Number | 0.03 | Rate of nodes fade on destroy |
| frameInterval | Number | 20 | Speed of canvas |
| background | Array/String | ['#0275d8', '#055396'] | String and array HEX values |
| gradient | String | 'radial' | Gradient styles: `linear`, `radial` |
| nodeColor | String | '#f1f1f1' | HEX value of node color |
| edgeColor | String | '#b4b4b4' | HEX value of edge color |
| edgeSize | Number | 0.7 | Thickness of edge |
| nodeSize | Number | 900 | Size of node |

#### Stopping & Starting
```js
myCanvasInstance.start(); // Start Canvas
myCanvasInstance.stop(); // Freeze Frame™
```

#### Removing
```js
myCanvasInstance.destroy();
```

#### Checking Browser Support
```js
if (nayukiCanvas.isSupported) {
  // canvas time
}
```

## Created by
[![Matt Jensen](https://avatars1.githubusercontent.com/u/1538209?v=3&amp;s=100)](https://github.com/Matt-Jensen) | [![Nayuki](https://avatars3.githubusercontent.com/u/672172?v=3&amp;s=100)](https://www.nayuki.io)
---|---
[Matt Jensen](https://github.com/Matt-Jensen) | [Nayuki](https://www.nayuki.io)

## Version
* Version 0.0.1

## License
* [MIT LICENSE](https://github.com/Matt-Jensen/nayuki-canvas/blob/master/LICENSE)
