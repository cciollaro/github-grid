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

var dragging = false;
var lastRow = lastCol = -1;

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

function loadHistory()
{
    // prompt for the user's github username
    var username = prompt("What is your Github username?");
    
    // fetch it with yql
    $.getJSON("http://query.yahooapis.com/v1/public/yql",
      {
        q:      "select * from xml where url=\"https://github.com/users/"+username+"/contributions\"",
        format: "json"
      },
      function(data){
        var contribs = data.query.results.svg.g.g;
        
        // to keep track of the darkest spot
        var max_commits = 0;
        
        // these colors correspond to the 0 - 4 values
        var colors = ["#eeeeee", "#d6e685", "#8cc665", "#44a340", "#1e6823"];
        
        for (var x in contribs)
        {
            var week = contribs[x].rect;
            
            for (var y in week)
            {
                var day = week[y];
                
                // update max if necessary
                if (parseInt(day["data-count"]) > max_commits)
                    max_commits = parseInt(day["data-count"]);
                            
                // draw it on our grid
                grid[y][x] = colors.indexOf(day["fill"]);
            }
        }
        
        console.log(max_commits);
        drawBoard();
        
      }
    );
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
    
    if (!dragging)
        return;
    
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = document.getElementById("canvas");
    
    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)
        
        canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;
    
    var clickedRow = parseInt(canvasY/ss);
    var clickedCol = parseInt(canvasX/ss);
    
    if (clickedRow == lastRow && clickedCol == lastCol)
        return;
    
    lastCol = clickedCol;
    lastRow = clickedRow;
    
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
    else
        return "#1e6823";
}

// there is probably a neater way to do this... makes sure that
// when the drag event click event fires after a drag the cell doesn't
// fill in twice
function clickGrid(event){
    if (lastRow != -1 && lastCol != -1)
    {
        lastRow = lastCol = -1;
        return;
    }
    lastRow = lastCol = -1;
    dragging = true;
    updateGrid(event);
    dragging = false;
    lastRow = lastCol = -1;
}

function loadBoardFromImageCanvas(c)
{
    var imgd = c.getImageData(0, 0, cols, rows);
    var pix = imgd.data;
//    console.log(imgd);
    
    for (var x=0; x<rows; x++)
        for (var y=0; y<cols; y++)
        {
            var cur = 4*(x*cols+y);
//            console.log(cur);
            var r = pix[cur];
            var g = pix[cur+1];
            var b = pix[cur+2];
            var alpha = pix[cur+3];
            
            var grayscale = (r+g+b)/3;
            
            // apply the transparency to the grayscale
//            grayscale = ((255-alpha)/255)*grayscale;
            
            var value = parseInt((grayscale/255)*5);
//            console.log(value);
            grid[x][y] = (value==0)? 4 : 5-value;
        }
    
    writeGridToTextarea();
    drawBoard();
    
}

function readURL(input) {
    
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function (e) {
            $('#blah').attr('src', e.target.result);
            
            var canvas2 = document.getElementById('imageprev');
            canvas2.width = cols;
            canvas2.height = rows;
            
            var context = canvas2.getContext('2d');
            var image = document.getElementById('blah');
            context.drawImage(image, 0, 0, cols, rows);
            
            loadBoardFromImageCanvas(context);
        }
        
        reader.readAsDataURL(input.files[0]);
        
    }
}

function exportScript()
{
    var cur = new Date(); // set date to today
    var day = cur.getDay();
    
    // go to sunday
    cur.setHours((day != 0)? -24*(day-1) : 0);
    
    // go back 51 weeks (places you at second cell in the top row)
    cur.setHours(-24 * 51 * 7);
    
    var foldername = "vanity" + parseInt(Math.random()*100000);
    var sh = "#!/bin/bash\n#\n# Name this file vanitygen.sh\n# Run these commands:\n#\tchmod +x vanitygen.sh\n#\t./vanitygen.sh\n#\n# The result will be in the "+foldername+" folder in the current directory.\n\n"
    sh += "mkdir " + foldername + "\ncd " + foldername + "\ngit init\n";
    sh += "echo 'This project was generated using [github-grid](https://github.com/cciollaro/github-grid/).' > README.md\ngit add README.md\n";
    
    for (var x=0; x<grid[0].length; x++)
        for (var y=0; y<grid.length; y++)
        {
            var value = grid[y][x];
            var thisdate = cur.toISOString();
            for (var z=0; z<value; z++)
            {
                sh += "echo '" + Math.random()*1000000 + "' > vanity\ngit add vanity\n";
                sh += "GIT_COMMITTER_DATE=\""+ cur.toString() +"\" git commit -m \""+Math.random()*1000000+"\" --date \""+ cur.toString() + "\"\n"
            }
            
            cur.setHours(24);
        }
    
    sh = btoa(sh);
    
    $("#downloaddiv").html("<a id='downlink' download='vanitygen.sh' href='data:text/x-bsh;base64,"+sh+"'>download</a>");
    
    actuateLink(document.getElementById("downlink"));
    
}

function actuateLink(link)
{
    var allowDefaultAction = true;
    
    if (link.click)
    {
        link.click();
        return;
    }
    else if (document.createEvent)
    {
        var e = document.createEvent('MouseEvents');
        e.initEvent(
                    'click'     // event type
                    ,true      // can bubble?
                    ,true      // cancelable?
                    );
        allowDefaultAction = link.dispatchEvent(e);
    }
    
    if (allowDefaultAction)
    {
        var f = document.createElement('form');
        f.action = link.href;
        document.body.appendChild(f);
        f.submit();
    }
}

$("#imgInp").change(function(){
                    readURL(this);
                    });

canvas.on("click", clickGrid);
canvas.on("mousedown", function(){dragging = true;});
canvas.on("mouseup", function(){dragging = false;});
canvas.on("mousemove", updateGrid);

//canvas.on("mousedown", function(){return false;});
$('input').on("change input", doItAll);
doItAll();
