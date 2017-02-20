/**
 * Created by c on 20/02/17.
 */

solEx = {
    robotLocations: [
        [
            {
                x: 3.2,
                y: 2.1
            },
            {
                x: 6.6,
                y: 10.2
            }
        ]
    ],
    obstacles: [
        [
            {
                x: 2.1,
                y: 5.5
            },
            {
                x: 5.5,
                y: 4.4
            },
            {
                x: 10.0,
                y: 10.1
            }
        ]
    ]
};

const MAX_DRAWING_SIZE = 1000.0;
const REAL_DRAWING_SIZE = 900.0;

var Canvas = require('canvas'),
    Image = Canvas.Image;

var fs = require('fs');

function getScaledPoint(point, scale) {
    return {
        x: ((point.x - scale.x_offset) * scale.factor) + scale.post_offset,
        y: ((point.y - scale.y_offset) * scale.factor) + scale.post_offset
    }
}

function enterPointsButDontDraw(points, ctx, scale) {
    ctx.beginPath();
    var fp = getScaledPoint(points[0], scale);
    ctx.moveTo(fp.x, fp.y);
    for(var i = 0; i < points.length; i++) {
        var sp = getScaledPoint(points[i], scale);
        ctx.lineTo(sp.x, sp.y);
    }
}

function drawRobotPath(points, ctx, scale) {
    ctx.strokeStyle = "#"+((1<<24)*Math.random()|0).toString(16);
    enterPointsButDontDraw(points, ctx, scale);
    ctx.stroke();
}

function drawObstacle(points, ctx, scale) {
    ctx.fillStyle = "#"+((1<<24)*Math.random()|0).toString(16);
    enterPointsButDontDraw(points, ctx, scale);
    ctx.closePath();
    ctx.fill();
}

function getScale(solutionObj) {
    var raw_max_x = 0.0,
        raw_max_y = 0.0,
        raw_min_x = 0.0,
        raw_min_y = 0.0;
    for(var i = 0; i < solutionObj.robotLocations.length; i++) {
        var pts = solutionObj.robotLocations[i];
        for(var j = 0; j < pts.length; j++) {
            var pt = pts[j];
            if (pt.x > raw_max_x) {
                raw_max_x = pt.x;
            }
            if (pt.y > raw_max_y) {
                raw_max_y = pt.y;
            }
            if (pt.x < raw_min_x) {
                raw_min_x = pt.x;
            }
            if (pt.y < raw_min_y) {
                raw_min_y = pt.y;
            }
        }
    }
    for(var i = 0; i < solutionObj.obstacles.length; i++) {
        var pts = solutionObj.obstacles[i];
        for(var j = 0; j < pts.length; j++) {
            if (pts.x > raw_max_x) {
                raw_max_x = pts.x;
            }
            if (pts.y > raw_max_y) {
                raw_max_y = pts.y;
            }
            if (pts.x < raw_min_x) {
                raw_min_x = pts.x;
            }
            if (pts.y < raw_min_y) {
                raw_min_y = pts.y;
            }
        }
    }
    var x_diff = raw_max_x - raw_min_x;
    if(Math.abs(x_diff) == 0.0)
        x_diff = 600;
    var y_diff = raw_max_y - raw_min_y;
    if(Math.abs(y_diff) == 0.0)
        y_diff = 600;
    var larger_diff = 1.0;
    if (x_diff > y_diff) {
        larger_diff = x_diff;
    } else {
        larger_diff = y_diff;
    }

    return {
        x_offset: raw_min_x,
        y_offset: raw_min_y,
        factor: REAL_DRAWING_SIZE/larger_diff,
        post_offset: (MAX_DRAWING_SIZE - REAL_DRAWING_SIZE)/2.0
    };
}

function visualizeSolution(solutionObj) {
    var scale = getScale(solutionObj);
    canvas = new Canvas(MAX_DRAWING_SIZE, MAX_DRAWING_SIZE);
    ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.rect(0, 0, MAX_DRAWING_SIZE, MAX_DRAWING_SIZE);
    ctx.fillStyle = 'white';
    ctx.fill();
    for(var i = 0; i < solutionObj.obstacles.length; i++) {
        drawObstacle(solutionObj.obstacles[i], ctx, scale);
    }
    for(var i = 0; i < solutionObj.robotLocations.length; i++) {
        drawRobotPath(solutionObj.robotLocations[i], ctx, scale);
    }
    var out = fs.createWriteStream(__dirname + '/problem.png');
    var stream = canvas.pngStream();
    stream.on('data', function(c) {
        out.write(c);
    });
    stream.on('end', function() {
       console.log('saved png');
    });
}

visualizeSolution(solEx);
