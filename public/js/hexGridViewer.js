// Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html

function HexGridViewer(options) {
    var self = this;
    self.debug = options.debug;

    self.originOffset = options.originOffset;

    self.hexRadius = options.hexRadius;
    self.hexHeight = Math.sqrt(3) * self.hexRadius;
    self.hexWidth = 2 * self.hexRadius;
    self.hexSide = (3 / 2) * self.hexRadius;

    self.canvas = document.getElementById(options.canvasId);
    self.context = self.canvas.getContext('2d');
    self.mouseDisplay = document.getElementById("lblMouse");
    self.tileDisplay = document.getElementById("lblTile");
    self.hexDisplay = document.getElementById("lblHex");
    self.rowsDisplay = document.getElementById("txtRows");
    self.columnsDisplay = document.getElementById("txtColumns");
    self.hexRadiusDisplay = document.getElementById("txtHexRadius");
    self.hexHeightDisplay = document.getElementById("lblHexHeight");
    self.hexWidthDisplay = document.getElementById("lblHexWidth");
    self.hexSideDisplay = document.getElementById("lblHexSide");
    self.divGridInfo = document.getElementById("divGridInfo");
    self.btnRedraw = document.getElementById("btnRedraw");

    self.defaultStrokeStyle = "#000000";
    self.colorMap = {
        default:            "#aaa",
        selected:           "#bbb444",
        hover:              "#eeeeee",
        blank:              "#000000",
    };

    self.hexGrid = options.hexGrid;

    self.hexAttributesHandler = options.hexAttributesHandler;
    self.drawResourceHandler = options.drawResourceHandler;
    self.hexClickedHandler = options.hexClickedHandler;

    self.populateInfoControls = function(){
        if (!options.showGridInfo){ self.divGridInfo.style.display = "none"; }

        self.hexHeightDisplay.innerHTML = self.hexHeight;
        self.hexWidthDisplay.innerHTML = self.hexWidth;
        self.hexSideDisplay.innerHTML = self.hexSide;

        self.columnsDisplay.setAttribute("value", self.hexGrid.columnCount);
        self.rowsDisplay.setAttribute("value", self.hexGrid.rowCount);
        self.hexRadiusDisplay.setAttribute("value", self.hexRadius);
    };

    self.drawHexGrid = function () {
        self.doHexGridMath();
        self.context.clearRect ( 0 , 0 , self.canvas.width, self.canvas.height );
        for (var col = 0; col < self.hexGrid.columnCount; col++) {
            for (var row = 0; row < self.hexGrid.columnCount; row++) {
                self.drawHex(self.hexGrid.Hexes[col][row]);
            }
        }
    };

    self.drawPolygon = function(options){
        //console.log('options', options);
        self.context.strokeStyle = options.attributes.strokeStyle || self.defaultStrokeStyle;
        self.context.fillStyle = options.attributes.fillStyle;

        self.context.beginPath();
        self.context.moveTo(options.vertices[0].x, options.vertices[0].y);
        for (var i=1; i<options.vertices.length; i++){
            self.context.lineTo(options.vertices[i].x, options.vertices[i].y);
        }
        self.context.fill();
        self.context.closePath();
        self.context.stroke();
    };

    self.drawCircle = function(options){
        options.attributes = options.attributes || {};
        self.context.strokeStyle = options.attributes.strokeStyle || "#888888";
        self.context.fillStyle = options.attributes.fillStyle || "#456789";

        self.context.beginPath();
        self.context.arc(options.x, options.y, options.hexRadius, 0, 2 * Math.PI, false);
        self.context.fill();
        self.context.closePath();
        self.context.stroke();

0    };

    self.doHexGridMath = function() {
        var getZeroPoint = function (options) {
            return {
                x: options.column % 2 === 1 ?
                (options.column * self.hexSide) + self.originOffset.x :
                (options.column * self.hexSide) + self.originOffset.x,
                y: options.column % 2 === 1 ?
                (options.row * self.hexHeight) + self.originOffset.y :
                (options.row * self.hexHeight) + self.originOffset.y + (self.hexHeight * 0.5)
            }
        };

        self.hexGeometry = [];

        for (var i = 0; i < self.hexGrid.columnCount; i++) {
            self.hexGeometry[i] = [];
            for (var j = 0; j < self.hexGrid.rowCount; j++) {
                var theHex = self.hexGrid.Hexes[i][j];
                var theHexGeometry = self.hexGeometry[i][j] = {

                };
                theHex.hexState = theHex.hexState || theHex.defaultHexState || "default";
                theHex.column = i;
                theHex.row = j;

                var zeroPoint = getZeroPoint(theHex);
                var theHexGeometry = self.hexGeometry[i][j] = {
                    column: theHex.column,
                    row:    theHex.row,
                    zeroPoint: zeroPoint,
                    vertices: [
                        {x: zeroPoint.x + self.hexWidth - self.hexSide, y: zeroPoint.y},
                        {x: zeroPoint.x + self.hexSide, y: zeroPoint.y},
                        {x: zeroPoint.x + self.hexWidth, y: zeroPoint.y + (self.hexHeight / 2)},
                        {x: zeroPoint.x + self.hexSide, y: zeroPoint.y + self.hexHeight},
                        {x: zeroPoint.x + self.hexWidth - self.hexSide, y: zeroPoint.y + self.hexHeight},
                        {x: zeroPoint.x, y: zeroPoint.y + (self.hexHeight / 2)}
                    ],
                    innerSquare: [
                        {x: zeroPoint.x + self.hexWidth - self.hexSide, y: zeroPoint.y},
                        {x: zeroPoint.x + self.hexSide, y: zeroPoint.y},
                        {x: zeroPoint.x + self.hexSide, y: zeroPoint.y + self.hexHeight},
                        {x: zeroPoint.x + self.hexWidth - self.hexSide, y: zeroPoint.y + self.hexHeight},
                    ],
                    rightEdgeTriangle: [
                        {x: zeroPoint.x + self.hexSide, y: zeroPoint.y},
                        {x: zeroPoint.x + self.hexWidth, y: zeroPoint.y + (self.hexHeight / 2)},
                        {x: zeroPoint.x + self.hexSide, y: zeroPoint.y + self.hexHeight},
                    ],
                    upperLeftTileBlankTriangle: [
                        {x: zeroPoint.x, y: zeroPoint.y},
                        {x: zeroPoint.x + self.hexWidth - self.hexSide, y: zeroPoint.y},
                        {x: zeroPoint.x, y: zeroPoint.y + (self.hexHeight / 2)},

                    ],
                    lowerLeftTileBlankTriangle: [
                        {x: zeroPoint.x, y: zeroPoint.y + (self.hexHeight / 2)},
                        {x: zeroPoint.x, y: zeroPoint.y + self.hexHeight},
                        {x: zeroPoint.x + self.hexWidth - self.hexSide, y: zeroPoint.y + self.hexHeight},

                    ],
                };
            }
        }
    };

    self.drawHex = function(options) {
        var doDrawHex = function(options){
            if (options.column === 0 && options.row === 0){ console.log('OPTIONS', options.hexState);}
            var attributes = self.hexAttributesHandler(options);
            if (options.column === 0 && options.row === 0){ console.log('ATTRIBUTES', attributes);}
            self.drawPolygon({
                attributes: attributes,
                vertices:   self.hexGeometry[options.column][options.row].vertices
            });

            if (self.debug){
                self.drawCircle({
                    attributes: { fillStyle: "#000066" },
                    x:  self.hexGeometry[options.column][options.row].zeroPoint.x,
                    y:  self.hexGeometry[options.column][options.row].zeroPoint.y,
                    radius: 3
                });
                self.drawPolygon({
                    attributes: { fillStyle:    "#444444" },
                    vertices:   self.hexGeometry[options.column][options.row].innerSquare
                });
                self.drawPolygon({
                    attributes: { fillStyle:    "#990000" },
                    vertices:   self.hexGeometry[options.column][options.row].rightEdgeTriangle
                });
                self.drawPolygon({
                    attributes: { fillStyle:    "#0ffff0" },
                    vertices:   self.hexGeometry[options.column][options.row].upperLeftTileBlankTriangle
                });
                self.drawPolygon({
                    attributes: { fillStyle:    "#0f00f0" },
                    vertices:   self.hexGeometry[options.column][options.row].lowerLeftTileBlankTriangle
                });
            }
        };

        if (options) {
            doDrawHex(options);
            self.drawResourceHandler({
                zeroPoint:  self.hexGeometry[options.column][options.row].zeroPoint,
                content:    options.content,
                context:    self.context,
                hexWidth:   self.hexWidth,
                hexHeight:  self.hexHeight
            });
        }
    };

    self.drawDebugGrid = function(){
        self.context.beginPath();
        self.context.moveTo(0, 0);
        self.context.lineTo(0, 1000);
        self.context.strokeStyle = "black";
        self.context.stroke();

        self.context.beginPath();
        self.context.moveTo(0, 0);
        self.context.lineTo(1000, 0);
        self.context.strokeStyle = "black";
        self.context.stroke();

        for (var i=0; i<self.hexGrid.columnCount+2; i++){
            self.context.beginPath();
            self.context.moveTo(self.originOffset.x+(i*self.hexSide), 0);
            self.context.lineTo(self.originOffset.x+(i*self.hexSide), 1000);
            self.context.strokeStyle = "green";
            self.context.stroke();
        }

        for (var j=0; j<self.hexGrid.rowCount+3; j++){
            self.context.beginPath();
            self.context.moveTo(0, self.originOffset.y+j*self.hexHeight);
            self.context.lineTo(1000, self.originOffset.y+j*self.hexHeight);
            self.context.strokeStyle = "blue";
            self.context.stroke();

            self.context.beginPath();
            self.context.moveTo(0, self.originOffset.y+j*self.hexHeight + self.hexHeight/2);
            self.context.lineTo(1000, self.originOffset.y+j*self.hexHeight + self.hexHeight/2);
            self.context.strokeStyle = "purple";
            self.context.stroke();
        }

    }

    self.getCurrentHex = function(options) {
        self.getRelativeCanvasOffset = function() {
            var x = 0, y = 0;
            var layoutElement = self.canvas;
            if (layoutElement.offsetParent) {
                do {
                    x += layoutElement.offsetLeft;
                    y += layoutElement.offsetTop;
                } while (layoutElement = layoutElement.offsetParent);

                return { x: x, y: y };
            }
        };

        self.isPointInTriangle = function isPointInTriangle(options) {
            var pt = options.point;
            var v1 = options.vertices[0];
            var v2 = options.vertices[1];
            var v3 = options.vertices[2];

            var sign = function(p1, p2, p3) {
                return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
            };

            var b1 = sign(pt, v1, v2) < 0.0;
            var b2 = sign(pt, v2, v3) < 0.0;
            var b3 = sign(pt, v3, v1) < 0.0;

            return ((b1 == b2) && (b2 == b3));
        };


        var offset =self.getRelativeCanvasOffset();
        var clickPoint = {
            x:  options.pageX - offset.x,
            y:  options.pageY - offset.y
        };

        if (self.debug) {
            self.drawCircle({
                x: clickPoint.x,
                y: clickPoint.y,
                radius: 5,
                attributes: {
                    fillStyle: "#0000ff"
                }
            });
        }

        self.mouseDisplay.innerHTML = "x: "+clickPoint.x+"  y: "+clickPoint.y;

        var column = Math.floor(((clickPoint.x-self.originOffset.x)/self.hexSide));

        var row, mostLikelyHex, upperLeftHex, lowerLeftHex;
        if (column %2 !== 0){
            row = Math.floor((clickPoint.y-self.originOffset.y) / self.hexHeight);
            mostLikelyHex = self.hexGeometry[column] ? self.hexGeometry[column][row] : null;
            upperLeftHex = self.hexGeometry[column-1] ? self.hexGeometry[column-1][row-1] : null;
            lowerLeftHex = self.hexGeometry[column-1] ? self.hexGeometry[column-1][row] : null;
        } else {
            row = Math.floor((clickPoint.y-self.originOffset.y + (self.hexHeight * 0.5)) / self.hexHeight)-1;
            mostLikelyHex = self.hexGeometry[column] ? self.hexGeometry[column][row] : null;
            upperLeftHex = self.hexGeometry[column-1] ? self.hexGeometry[column-1][row] : null;
            lowerLeftHex = self.hexGeometry[column-1] ? self.hexGeometry[column-1][row+1] : null;
        }

        self.tileDisplay.innerHTML = "c: "+column+"  r:"+row;

        var retval = mostLikelyHex;
        if (upperLeftHex) {
            retval = self.isPointInTriangle({ point: clickPoint, vertices: upperLeftHex.rightEdgeTriangle}) ? upperLeftHex : retval;
        }

        if (lowerLeftHex) {
            retval = self.isPointInTriangle({ point: clickPoint, vertices: lowerLeftHex.rightEdgeTriangle}) ? lowerLeftHex : retval;
        }

        if (mostLikelyHex && !upperLeftHex && !lowerLeftHex){
            retval = !self.isPointInTriangle({ point: clickPoint, vertices: mostLikelyHex.upperLeftTileBlankTriangle})
            && !self.isPointInTriangle({ point: clickPoint, vertices: mostLikelyHex.lowerLeftTileBlankTriangle}) ? retval : null;
        }

        if (mostLikelyHex && !upperLeftHex && lowerLeftHex){
            retval = !self.isPointInTriangle({ point: clickPoint, vertices: mostLikelyHex.upperLeftTileBlankTriangle}) ? retval : null;
            retval = !self.isPointInTriangle({ point: clickPoint, vertices: lowerLeftHex.rightEdgeTriangle}) ? retval : lowerLeftHex;
        }

        if (mostLikelyHex && !lowerLeftHex && upperLeftHex){
            retval = !self.isPointInTriangle({ point: clickPoint, vertices: mostLikelyHex.lowerLeftTileBlankTriangle}) ? retval : null;
            retval = !self.isPointInTriangle({ point: clickPoint, vertices: upperLeftHex.rightEdgeTriangle}) ? retval : upperLeftHex;
        }

        self.hexDisplay.innerHTML = retval ? "c: "+retval.column+"  r: "+retval.row : "no hex";
        return retval ? self.hexGrid.Hexes[retval.column][retval.row] : null;
    };

    self.mouseClickEvent = function (e) {
        var clickedHex = self.getCurrentHex(e);

        if (clickedHex){
            clickedHex.hexState = clickedHex.hexState === clickedHex.defaultHexState ? "selected" : clickedHex.defaultHexState;
            self.drawHex(clickedHex);

            if (self.hexClickedHandler){
                self.hexClickedHandler({
                    clickedHex: {
                        row:    clickedHex.row,
                        column:    clickedHex.column,
                        defaultHexState:    clickedHex.defaultHexState,
                        hexState:    clickedHex.hexState,
                        content:    clickedHex.content
                    }
                });
            }
        }
    };

    self.mouseMoveEvent = function (e) {
        var hoverHex = self.getCurrentHex(e);
        var oldHoverHex = self.hoverHex;
        var hexesAreSame = hoverHex && oldHoverHex ? hoverHex.column === oldHoverHex.column && hoverHex.row === oldHoverHex.row : false;

        if (hoverHex && !hexesAreSame) {
            //console.log("new hoverHex", hoverHex);
            self.hoverHex = hoverHex;
        } else if (!hoverHex && oldHoverHex) {
            //console.log("no hoverHex", hoverHex);
            self.hoverHex = null;
        }

        if (oldHoverHex && !hexesAreSame) {
            delete oldHoverHex.strokeStyle;
            self.drawHex(oldHoverHex);
        }

        if (self.hoverHex) {
            self.hoverHex.strokeStyle = self.colorMap["hover"];
            self.drawHex(self.hoverHex);
        }
    };

    self.getHexgridInfo = function() {
        //console.log('self.hexGrid', self.hexGrid);
        var hexGrid = {
            columnCount: self.hexGrid.columnCount,
            rowCount: self.hexGrid.rowCount,
            blankHexPercentage: self.hexGrid.blankHexPercentage,
            resourceHexPercentage: self.hexGrid.resourceHexPercentage,
            Hexes: [],
        };

        for (var col = 0; col < hexGrid.columnCount; col++) {
            hexGrid.Hexes.push([]);
            for (var row = 0; row < hexGrid.rowCount; row++) {
                hexGrid.Hexes[col][row] = {
                    row: row,
                    column: col,
                    hexState:   self.hexGrid.Hexes[col][row].hexState,
                    defaultHexState: self.hexGrid.Hexes[col][row].defaultHexState,
                    content: self.hexGrid.Hexes[col][row].content
                };
            }
        }

        return hexGrid;
    };

    self.updateHexGrid = function(hexGrid){
        self.hexGrid = hexGrid;
    };

    self.canvas.addEventListener("mousedown", self.mouseClickEvent.bind(self), false);
    self.canvas.addEventListener("mousemove", self.mouseMoveEvent.bind(self), false);

    self.render = function(){
        self.drawHexGrid();
        self.populateInfoControls();
    };

    if (self.debug){
        self.drawDebugGrid();
    }

    return {
        render:             self.render,
        updateHexGrid:      self.updateHexGrid
    };
};



var HexInfo = function(options){
    var thisHex = this;
    thisHex.row = options.row;
    thisHex.column = options.column;
    thisHex.defaultHexState = options.defaultHexState || "default";
    thisHex.hexState = options.hexState;
    thisHex.content = options.content || [];

    return thisHex;
};
