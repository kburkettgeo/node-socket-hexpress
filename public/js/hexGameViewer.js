var HexGameViewer = function(options){
    options = options || {};
    var self = this;
    self.init = function(){

        self.hexGridViewer = HexGridViewer({
            debug:                  options.debug || false,
            showGridInfo:           options.showGridInfo || false,
            canvasId:               options.canvasId || "HexCanvas",
            hexRadius:              options.hexRadius || 25,
            originOffset:           options.originOffset || {
                x:  10,
                y:  10
            },
            hexGrid:                self.hexGame.hexGrid,
            hexAttributesHandler:   function(options){
                self.defaultStrokeStyle = "#222222";
                self.colorMap = {
                    default:            "#aaa",
                    selected:           "#bbb444",
                    hover:              "#eeeeee",
                    blank:              "#333",
                    resource:           "#999111"
                };

                return {
                    fillStyle:      self.colorMap[options.hexState || options.defaultHexState],
                    strokeStyle:    options.strokeStyle || self.defaultStrokeStyle
                };
            },
            drawResourceHandler:    function(options){
                var resourceRadius = 5;
                var zeroPoint = options.zeroPoint;
                if (options.content.indexOf("resource") !== -1){
                    //console.log(options.content);
                    options.context.beginPath();
                    options.context.arc(zeroPoint.x + options.hexWidth / 2, zeroPoint.y + options.hexHeight / 2, resourceRadius, 0, 2 * Math.PI, false);
                    options.context.fillStyle = self.colorMap["resource"];
                    options.context.fill();
                    options.context.closePath();
                    options.context.stroke();
                }
            },
            hexClickedHandler:  function(options) {
                console.log('options', options);
                self.socket.emit('hexGame', self.hexGame);
            }
        });
        self.hasBeenInited = true;
    };

    self.socket = io();
    self.socket.on('hexGame', function(hexGame){
        self.hexGame = hexGame;
        if (!self.hasBeenInited){ self.init(); }
        else { self.hexGridViewer.updateHexGrid(self.hexGame.hexGrid); }
        self.hexGridViewer.render();
    });
};