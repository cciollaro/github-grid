//number of different states the squares can be in
var states = 5;
//rows and columns
var cols = parseInt($('input[name="cols"]').val());
var rows = parseInt($('input[name="rows"]').val());
//square size
var ss = parseInt($('input[name="ss"]').val());
//grid width and height
var bw = ss*cols;
var bh = ss*rows;

//size of canvas
var cw = bw + 1;
var ch = bh + 1;

var canvas = $('#canvas').attr({width: cw, height: ch});
var ta = $('textarea[name="result"]').prop({rows: rows, cols: cols-1});

var context = canvas.get(0).getContext("2d");

var grid = [];

for(var i = 0; i < rows; i++){
    grid[i] = [];
    for(var j = 0; j < cols; j++){
        grid[i][j] = 0;
    }
}


function doItAll(){
    updateVariables();
    drawBoard();
    writeGridToTextarea();
    fillBoardFromGrid();
}

function updateVariables(){
    //rows and columns
    cols = parseInt($('input[name="cols"]').val());
    rows = parseInt($('input[name="rows"]').val());
    //square size
    ss = parseInt($('input[name="ss"]').val());
    //grid width and height
    bw = ss*cols;
    bh = ss*rows;
    
    //size of canvas
    cw = bw + 1;
    ch = bh + 1;
    
    canvas.attr({width: cw, height: ch});
    ta.prop({rows: rows, cols: cols-1});
    
    grid = [];
    
    for(var i = 0; i < rows; i++){
        grid[i] = [];
        for(var j = 0; j < cols; j++){
            grid[i][j] = 0;
        }
    }
}

function drawBoard(){
    for (var x = 0; x <= bw; x += ss) {
        context.moveTo(0.5 + x, 0);
        context.lineTo(0.5 + x, bh);
    }
    
    
    for (var x = 0; x <= bh; x += ss) {
        context.moveTo(0, 0.5 + x);
        context.lineTo(bw, 0.5 + x);
    }
    
    context.strokeStyle = "white";
    context.stroke();
    
    for(var i = 0; i < rows; i++){
        for(var j = 0; j < cols; j++){
            context.fillStyle = calculateFillStyle(grid[i][j]);
            context.fillRect(j*ss+1, i*ss+1, ss - 1, ss - 1);
        }
    }
}

function updateGrid(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;
    
    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)
        
        canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;
    
    var clickedRow = parseInt(canvasY/ss);
    var clickedCol = parseInt(canvasX/ss);
    
    grid[clickedRow][clickedCol] = (grid[clickedRow][clickedCol] + 1) % states;
    writeGridToTextarea();
    drawBoard();
    return false;
}

function writeGridToTextarea(){
    var result = "";
    for(var i = 0; i < rows; i++){
        for(var j = 0; j < cols; j++){
            result = result + grid[i][j];
        }
    }
    ta.val(result);
}

//presumably this should be something dynamic
function calculateFillStyle(x){
    if(x == 0)
        return "#eee";
    else if(x == 1)
        return "#d6e685";
    else if(x == 2)
        return "#8cc665";
    else if(x == 3)
        return "#44a340";
    else if(x == 4)
        return "#1e6823";
}
canvas.on("click", updateGrid);
canvas.on("mousedown", function(){return false;});
$('input').on("change input", doItAll);
doItAll();
