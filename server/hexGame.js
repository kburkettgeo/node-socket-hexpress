var when = require('when');
var _ = require('lodash');

var HexInfo = function(options){
    var thisHex = this;
    thisHex.row = options.row;
    thisHex.column = options.column;
    thisHex.defaultHexState = options.defaultHexState || "default";
    thisHex.hexState = options.hexState;
    thisHex.content = options.content || [];

    return thisHex;
};



var HexGame = function(options){
    console.log('options', options);
    var self = this;
    self.options = options || {};
    self.name = self.options.name || 'New Hex Game',

    self.initHexGrid = function(){
        self.hexGrid = {
            columnCount:            self.options.columnCount || 20,
            rowCount:               self.options.rowCount || 14,
            blankHexPercentage:     self.options.blankHexPercentage || 44,
            resourceHexPercentage:  self.options.resourceHexPercentage || 12,
            Hexes:                  [],
        };

        for (var col = 0; col < self.hexGrid.columnCount; col++) {
            self.hexGrid.Hexes.push([]);
            for (var row = 0; row < self.hexGrid.rowCount; row++) {
                var isBlank = Math.floor(Math.random()*100) < self.hexGrid.blankHexPercentage;
                var isResource = !isBlank && (Math.floor(Math.random()*100) < self.hexGrid.resourceHexPercentage);

                var newHex = new HexInfo({
                    row:                row,
                    column:             col,
                    defaultHexState:    isBlank ? "blank" : "default",
                    content:            []
                });

                if (isResource) {
                    newHex.content.push("resource");

                }
                self.hexGrid.Hexes[col][row] = newHex;

            }
        }

        return self.hexGrid;
    };

    self.initHexGrid();

    return {
        name:       self.name,
        hexGrid:    self.hexGrid
    };
};


exports.HexGame = HexGame;