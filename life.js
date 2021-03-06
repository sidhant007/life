// Main code
var width = 1000, height = 680;
var max_power = 100;

var avg = [], best = [];

var mouse = {x:0, y:0, isMouseDown: false, id: -1}

var dangers = [], foods = [], indis = [];

function danger(x, y, radius, power) {
  this.x = x;
  this.y = y;
  this.radius = 10;
  this.power = 100;
}

function food(x, y, power) {
  this.x = x;
  this.y = y;
  this.radius = 10;
  this.power = power;
}

function sigmoid(t) {
  return 1/(1 + Math.exp(-t));
}

function matrix(row, col) {
  this.mat = [];
  this.row = row;
  this.col = col;

  for(var i = 0; i < this.row; i++) {
    this.mat[i] = [];
    for(var j = 0; j < this.col; j++) {
      this.mat[i][j] = 0;
    }
  }

  this.initialise = function(x){
    for(var i = 0; i < this.row; i++) {
      for(var j = 0; j < this.col; j++) {
        this.mat[i][j] = (Math.random() * x) - x/2;
      }
    }
  }

  this.mult = function(a){
    if(this.col != a.row)       console.log("Invalid matrix multiplication");
    var res = new matrix(this.row, a.col);
    for(var i = 0; i < this.row; i++) {
      res.mat[i] = [];
      for(var j = 0; j < a.col; j++) {
        res.mat[i][j] = 0;
        for(var k = 0; k < this.col; k++) {
          res.mat[i][j] = res.mat[i][j] + (this.mat[i][k] * a.mat[k][j]);
        }
        res.mat[i][j] = res.mat[i][j];
      }
    }
    return res;
  }

  this.add = function(a) {
    if(a.row != this.row || a.col != this.col)  console.log("Invalid matrix addition");
    var res = new matrix(this.row, this.col);
    for(var i = 0; i < this.row; i++) {
      for(var j = 0; j < this.col; j++) {
        res.mat[i][j] = this.mat[i][j] + a.mat[i][j];
      }
    }
    return res;
  }

  this.sigmoidMat = function() {
    var res = new matrix(this.row, this.col);
    for(var i = 0; i < this.row; i++)
      for(var j = 0; j < this.col; j++)
        res.mat[i][j] = sigmoid(this.mat[i][j]);
    return res;
  }
}

function neural_net() {
  this.Mat = [];
  this.Bias = [];
  this.Mat[0] = new matrix(6, 11);
  this.Bias[0] = new matrix(6, 1);
  this.Mat[1] = new matrix(2, 6);
  this.Bias[1] = new matrix(2, 1);

  this.Mat[0].initialise(10);
  this.Bias[0].initialise(0);
  this.Mat[1].initialise(10);
  this.Bias[1].initialise(0);

  this.process = function(a){
    var b = this.Mat[0].mult(a).add(this.Bias[0]).sigmoidMat();
    var c = this.Mat[1].mult(b).add(this.Bias[1]).sigmoidMat();
    return c;
  }

  this.crossover = function(a) {
    var newNet = new neural_net();
    for(var i = 0; i < this.Mat.length; i++) {
      for(var j = 0; j < this.Mat[i].row; j++) {
        for(var k = 0; k < this.Mat[i].col; k++) {
          var dice5 = Math.random();
          if(dice5 > 0.5) newNet.Mat[i].mat[j][k] = this.Mat[i].mat[j][k];
          else            newNet.Mat[i].mat[j][k] = a.Mat[i].mat[j][k];
        }
      }
    }

    for(var i = 0; i < this.Bias.length; i++) {
      for(var j = 0; j < this.Bias[i].row; j++) {
        for(var k = 0; k < this.Bias[i].col; k++) {
          var dice6 = Math.random();
          if(dice6 > 0.5) newNet.Bias[i].mat[j][k] = this.Bias[i].mat[j][k];
          else            newNet.Bias[i].mat[j][k] = a.Bias[i].mat[j][k];
        }
      }
    }

    return newNet;
  }

  this.mutate = function() {
    var newNet = new neural_net();
    for(var i = 0; i < this.Mat.length; i++) {
      for(var j = 0; j < this.Mat[i].row; j++) {
        for(var k = 0; k < this.Mat[i].col; k++) {
          newNet.Mat[i].mat[j][k] = this.Mat[i].mat[j][k];
          var dice3 = Math.random();
          if(dice3 < 0.1) {
            newNet.Mat[i].mat[j][k] += (Math.random() * 5) - 2.5;
          }
        }
      }
    }
    for(var i = 0; i < this.Bias.length; i++) {
      for(var j = 0; j < this.Bias[i].row; j++) {
        for(var k = 0; k < this.Bias[i].col; k++) {
          newNet.Bias[i].mat[j][k] = this.Bias[i].mat[j][k];
          var dice4 = Math.random();
          if(dice4 < 0.3) {
            //  newNet.Bias[i].mat[j][k] += (Math.random() * 2) - 1;
          }
        }
      }
    }
    return newNet;
  }
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

function quadrant(a, b) {
  var del_x = b.x - a.x;
  var del_y = b.y - a.y;
  if(del_y >= del_x && del_y >= -del_x)       return 0;
  else if(del_y <= del_x && -del_y <= del_x)  return 1;
  else if(del_y <= del_x && -del_x >= del_y)   return 2;
  else                                        return 3;
}

function individual(my_net) {
  this.x = Math.random() * width;
  this.y = Math.random() * height;
  this.prev = [];
  for(var i = 0; i < 3; i++)  this.prev[i] = {x:0, y:0};
  this.radius = 10;
  this.my_net = my_net;
  this.power = 100;
  this.fitness = 0;
  this.eaten = [];
  for(var i = 0; i < foods.length; i++) this.eaten[i] = false;

  this.coordx = [-1, -1, -1, -1, -1, -1, -1, -1];
  this.coordy = [-1, -1, -1, -1, -1, -1, -1, -1];

  this.nearby = function() {
    var my_input = new matrix(11, 1);
    for(var i = 0; i < 8; i++)  this.coordx[i] = this.coordy[i] = -1;
    for(var i = 0; i < 11; i++)  my_input.mat[i][0] = 0;
    for(var i = 0; i < foods.length; i++) {
      if(this.eaten[i] == true)  continue;
      var dist_bw = (1/dist(this, foods[i])) * 100;
      var quad_in = quadrant(this, foods[i]);
      if(my_input.mat[quad_in][0] < dist_bw) {
        my_input.mat[quad_in][0] = dist_bw;
        this.coordx[quad_in] = foods[i].x;
        this.coordy[quad_in] = foods[i].y;
      }
    }
    for(var i = 0; i < dangers.length; i++) {
      var dis_bw = (1/dist(this, dangers[i])) * 100;
      var quad_in = quadrant(this, dangers[i]);
      if(my_input.mat[quad_in + 4][0] < dist_bw) {
        my_input.mat[quad_in + 4][0] = dist_bw;
        this.coordx[quad_in + 4] = dangers[i].x;
        this.coordy[quad_in + 4] = dangers[i].y;
      }
    }
    my_input.mat[8][0] = this.x / width;
    my_input.mat[9][0] = this.y / height;
    my_input.mat[10][0] = (1 / dist(this, this.prev[2])) * 14;
    my_input.mat[10][0] = Math.min(my_input.mat[10][0], 100);
    if(this.fitness <= 3) my_input.mat[10][0] = 0;
    return my_input;
  }

  this.run = function(){
    var tmp = this.my_net.process(this.nearby());
    this.x = this.x + (tmp.mat[0][0] - 0.5) * 10;
    if(this.x < 0)  this.power = 0;
    if(this.x > width)  this.power = 0;
    this.y = this.y + (tmp.mat[1][0] - 0.5) * 10;
    if(this.y < 0)  this.power = 0;
    if(this.y > height) this.power = 0;
    this.power--;
    this.prev[2].x = this.prev[1].x;
    this.prev[2].y = this.prev[1].y;
    this.prev[1].x = this.prev[0].x;
    this.prev[1].y = this.prev[0].y;
    this.prev[0].x = this.x;
    this.prev[0].y = this.y;
    this.fitness++;
    /*
       this.x = this.x + (Math.random() * 5);
       this.y = this.y + (Math.random() * 5);
       */

    for(var i = 0; i < foods.length; i++) {
      if(dist(this, foods[i]) < 2*foods[i].radius && this.eaten[i] == false) {
        this.power += foods[i].power;
        this.eaten[i] = true;
      }
    }

    for(var i = 0; i < dangers.length; i++) {
      if(dist(this, dangers[i]) < dangers[i].radius) {
        this.power -= dangers[i].power;
      }
    }
  }

  this.crossover = function(a) {
    var newIndi = new individual(this.my_net.crossover(a.my_net));
    return newIndi;
  }

  this.mutate = function() {
    var newIndi = new individual(this.my_net.mutate());
    return newIndi;
  }
}

var fps = 20;

function slow() {
  fps = 100
}

function medium() {
  fps = 20
}

function fast() {
  fps = 1
}

function get_best() {
  // document.getElementById("best_net").innerHTML = JSON.stringify(best_net, null, 2);
  document.getElementById("best_score").innerHTML = "Best score = " + bestFitness;
  document.getElementById("no_of_gen").innerHTML = "Current Generation No. = " + genNo;
  avg.push(avgFitness);
  best.push(bestFitness);
  drawCurveTypes();
}

var setup = function(k, f, a, d) {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");

  canvas.onmousemove = function(e) {
    mouse.x = e.pageX - canvas.offsetLeft;
    mouse.y = e.pageY - canvas.offsetTop;
  }

  canvas.onmousedown = function(e) {
    if(mouse.isMouseDown == true) {
      mouse.isMouseDown = false;
      mouse.id = -1;
    }
    else {
      for(var i = 0; i < indis.length; i++) {
        if(Math.abs(indis[i].x - mouse.x) < 10 && Math.abs(indis[i].y - mouse.y) < 10) {
          mouse.isMouseDown = true;
          mouse.id = i;
        }
      }
    }
  }

  // Create d random dangers.
  for(var i = 0; i < d; i++) {
    dangers.push(new danger(Math.random() * width, Math.random() * height,
      50, 5));
  }

  // Create f random food points.
  for(var i = 0; i < f; i++) {
    foods.push(new food(Math.random() * width, Math.random() * height, a));
  }

  // Create k random individuals.
  for(var i = 0; i < k; i++) {
    indis.push(new individual(new neural_net()));
  }

  loop();
}

var genNo= 0;
var best_net, bestFitness, avgFitness;

function evolve() {
  genNo++;
  var nextGen = [];
  var prob = [];
  var prefix_prob = [];
  var totFitness = 0;
  avgFitness = 0;
  bestFitness = 0;
  for(var i = 0; i < foods.length; i++) {
    foods[i].x = Math.random() * width;
    foods[i].y = Math.random() * height;
  }
  for(var i = 0; i < indis.length; i++) {
    totFitness += (indis[i].fitness * indis[i].fitness);
    avgFitness += indis[i].fitness
    if(indis[i].fitness > bestFitness) {
      bestFitness = indis[i].fitness;
      best_net = indis[i].my_net;
    }
  }
  avgFitness /= indis.length
  for(var i = 0; i < indis.length; i++) {
    prob[i] = (indis[i].fitness * indis[i].fitness) / totFitness;
  }
  for(var i = 0; i < indis.length; i++) {
    prefix_prob[i] = prob[i] + (i == 0 ? 0 : prefix_prob[i - 1]);
  }
  for(var i = 0; i < indis.length; i++) {
    var dice1 = Math.random();
    var dice2 = Math.random();
    var p1, p2;
    for(var j = 0; j < indis.length; j++) {
      if(prefix_prob[j] >= dice1) {
        p1 = indis[j];
        break;
      }
    }
    for(var j = 0; j < indis.length; j++) {
      if(prefix_prob[j] >= dice2) {
        p2 = indis[j];
        break;
      }
    }
    nextGen.push(p1.crossover(p2).mutate());
  }
  get_best();
  return nextGen;
}

function printMap() {
  for(var i = 0; i < dangers.length; i++) {
    ctx.fillStyle = "red";
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(dangers[i].x, dangers[i].y, dangers[i].radius, 0, 2*Math.PI, true);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
  for(var i = 0; i < foods.length; i++) {
    ctx.fillStyle = "green";
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(foods[i].x, foods[i].y, foods[i].radius, 0, 2*Math.PI, true);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
  for(var i = 0; i < indis.length; i++) {
    ctx.fillStyle = "yellow";
    ctx.globalAlpha = Math.min(1, indis[i].power / max_power)
    ctx.beginPath();
    ctx.arc(indis[i].x, indis[i].y, indis[i].radius, 0, 2*Math.PI, true);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

function printIndi(me) {
  for(var i = 0; i < dangers.length; i++) {
    ctx.fillStyle = "red";
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(dangers[i].x, dangers[i].y, dangers[i].radius, 0, 2*Math.PI, true);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
  for(var i = 0; i < foods.length; i++) {
    if(indis[me].eaten[i] == true) continue;
    ctx.fillStyle = "green";
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(foods[i].x, foods[i].y, foods[i].radius, 0, 2*Math.PI, true);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
  ctx.fillStyle = "purple";
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(indis[me].x, indis[me].y, indis[me].radius, 0, 2*Math.PI, true);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  if(indis[me].y - 20 > 20) ctx.fillText(indis[me].power, indis[me].x, indis[me].y - 20);
  else                      ctx.fillText(indis[me].power, indis[me].x, indis[me].y + 40);
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  for(var j = 0; j < 8; j++) {
    ctx.moveTo(indis[me].x, indis[me].y);
    if(indis[me].coordx[j] == -1 || indis[me].coordy[j] == -1)  continue;
    ctx.lineTo(indis[me].coordx[j], indis[me].coordy[j]);
    ctx.stroke();
  }
  ctx.closePath();
  ctx.restore();
}

var loop = function() {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  if(mouse.isMouseDown == false)  printMap();
  else                            printIndi(mouse.id);

  var dead_count = 0;

  for(var i = 0; i < indis.length; i++) {
    if(indis[i].power > 0)  indis[i].run();
    else {
      dead_count++;
      ctx.globalAlpha = 1;
      ctx.fillStyle = "blue";
      ctx.beginPath();
      indis[i].coordx = [-1, -1, -1, -1, -1, -1, -1, -1];
      indis[i].coordy = [-1, -1, -1, -1, -1, -1, -1, -1];
      ctx.arc(indis[i].x, indis[i].y, indis[i].radius, 0, 2*Math.PI, true);
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    }
  }
  if(dead_count == indis.length)  indis = evolve();
  window.setTimeout(loop, fps);
}

function newLife() {
  var k = parseInt(document.getElementById('agent_no').value)
  var f = parseInt(document.getElementById('food_no').value)
  var a = parseInt(document.getElementById('food_energy').value)
  var d = parseInt(document.getElementById('danger_no').value)
  document.getElementById("submit_btn").disabled = true
  setup(k, f, a, d);
}

google.charts.load('current', {packages: ['corechart', 'line']});
// google.charts.setOnLoadCallback(drawCurveTypes);
function drawCurveTypes() {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'X');
  data.addColumn('number', 'Average Score');
  data.addColumn('number', 'Best Score');

  totData = []
  for(var i = 0; i < genNo; i++) {
    totData.push([i, avg[i], best[i]]);
  }
  data.addRows(totData);

  var options = {
    hAxis: {
      title: 'Generation'
    },
    vAxis: {
     title: 'Score'
    },
    series: {
      1: {curveType: 'function'}
    },
    legend: {
      position: 'bottom'
    },
  };

  var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
  chart.draw(data, options);
}
// test
