var app = {};
     
      //var bookmarks;

      require([
        "esri/map",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/dijit/Print",
        "esri/tasks/PrintTemplate",
        "esri/request",
        "esri/config",
        "esri/arcgis/utils",
        "esri/dijit/Legend",
        "dojo/_base/array",
        "esri/symbols/TextSymbol",
        "esri/renderers/SimpleRenderer",
        "dojo/_base/Color",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/parser",
        "dijit/layout/BorderContainer",
        "dijit/form/CheckBox",
        "dijit/layout/AccordionContainer",
        "dijit/layout/ContentPane",
        "dijit/form/DropDownButton",
        "esri/dijit/Bookmarks",
        "dojo/domReady!"
      ], function(
        Map, ArcGISDynamicMapServiceLayer,
        Print, PrintTemplate,
        esriRequest, esriConfig, utils, Legend,
        arrayUtils, TextSymbol, SimpleRenderer, Color, dom, domConstruct, parser, bookmarks, CheckBox
      ) {
        parser.parse();

        app.printUrl = "http://yourserver/arcgis/rest/services/yourfolder/YourPrintService/GPServer/Export%20Web%20Map";

        esriConfig.defaults.io.proxyUrl = "/proxy/";
        var legendLayers = [];


        app.map = new esri.Map("map", {
          basemap: "topo",
          center: [-119, 43],
          zoom: 10,
          slider:true,
	  logo : false
          //showLabels : true
        });

        var fieldLayer = new ArcGISDynamicMapServiceLayer("http://yourserver/arcgis/rest/services/fields/MapServer", {
          id: 'Fields'
        });

        legendLayers.push({ layer: fieldLayer, title: 'Fields' });

        var sweLayer = new ArcGISDynamicMapServiceLayer("http://yourserver/arcgis/rest/services/SWE/MapServer", {
            id: 'Sweet Corn'
        });
        legendLayers.push({ layer: sweLayer, title: 'Sweet Corn' });
        var wheLayer = new ArcGISDynamicMapServiceLayer("http://yourserver/arcgis/rest/services/WHE/MapServer", {
            id: 'Wheat'
        });
        legendLayers.push({ layer: wheLayer, title: 'Wheat' });
        var peaLayer = new ArcGISDynamicMapServiceLayer("http://ourserver/arcgis/rest/services/Peas/MapServer", {
            id: 'Peas'
        });
        legendLayers.push({ layer: peaLayer, title: 'Peas' });

        var carLayer = new ArcGISDynamicMapServiceLayer("http://ourserver/arcgis/rest/services/Carrots/MapServer", {
            id: 'Carrots'
        });
        legendLayers.push({ layer: carLayer, title: 'Carrots' });
        var oniLayer = new ArcGISDynamicMapServiceLayer("http://ourserver/arcgis/rest/services/Onion/MapServer", {
            id: 'Onion'
        });
        legendLayers.push({ layer: oniLayer, title: 'Onions' });
        var corLayer = new ArcGISDynamicMapServiceLayer("http://ourserver/arcgis/rest/services/Corn/MapServer", {
            id: 'Corn'
        });
        legendLayers.push({ layer: corLayer, title: 'Corn' });
        var potLayer = new ArcGISDynamicMapServiceLayer("http://ourserver/arcgis/rest/services/Potatoes/MapServer", {
            id: 'Potatoes'
        });

        app.map.on('layers-add-result', function () {
          var legend = new Legend({
            map: app.map,
            layerInfos: app.legendLayers
          }, "legendDiv");
          legend.startup();
        });
        legendLayers.push({ layer: potLayer, title: "Potatoes" });

        app.map.addLayers([ fieldLayer, sweLayer, wheLayer, peaLayer, carLayer, oniLayer, corLayer, potLayer ]);

        app.map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendLayers, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = app.map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggle"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });

        var printInfo = esriRequest({
          "url": app.printUrl,
          "content": { "f": "json" }
        });

        printInfo.then(handlePrintInfo, handleError);

        function handlePrintInfo(resp) {
          var layoutTemplate, templateNames, mapOnlyIndex, templates;

          layoutTemplate = arrayUtils.filter(resp.parameters, function(param, idx) {
            return param.name === "Layout_Template";
          });

          if ( layoutTemplate.length === 0 ) {
            console.log("print service parameters name for templates must be \"Layout_Template\"");
            return;
          }
          templateNames = layoutTemplate[0].choiceList;

          // remove the MAP_ONLY template then add it to the end of the list of templates
          mapOnlyIndex = arrayUtils.indexOf(templateNames, "MAP_ONLY");
          if ( mapOnlyIndex > -1 ) {
            var mapOnly = templateNames.splice(mapOnlyIndex, mapOnlyIndex + 1)[0];
            templateNames.push(mapOnly);
          }

          // create a print template for each choice
          templates = arrayUtils.map(templateNames, function(ch) {
            var plate = new PrintTemplate();
	    plate.exportOptions = {
		dpi: 200
		};
            plate.layout = plate.label = ch;
            plate.format = "PDF";
            plate.layoutOptions = {
              "titleText": "Crops",
              "scalebarUnit": "Miles"
            };
            return plate;
          });

          // create the print dijit
          app.printer = new Print({
            "map": app.map,
            "templates": templates,
            url: app.printUrl
          }, dom.byId("print_button"));
          app.printer.startup();
        }

        function handleError(err) {
          console.log("Something broke: ", err);
        }

        var bookmarks_list = [{
          "extent": {
            "spatialReference": {
                "wkid": 102100
            },
            "xmin": -13309864.61 ,
            "ymin":5770658.00,
            "xmax":-13288347.59 ,
            "ymax":5782123.55
          },
          "name": "West"
        }, {
          "extent": {
            "spatialReference": {
              "wkid":102100
            },
            "xmin":-13308282.83,
            "ymin":5769896.07,
            "xmax":-13267694.77 ,
            "ymax":5792827.18
          },
          "name": "East"
        },{
            "extent": {
              "spatialReference": {
                "wkid":102100
              },
              "xmin":-13296855.4,
              "ymin":5768940.61,
              "xmax":-13256267.43,
              "ymax":5791871.72
            },
            "name": "North"
          },{
              "extent": {
                "spatialReference": {
                  "wkid":102100
                },
                "xmin":-13229968.81 ,
                "ymin":5810882.99,
                "xmax":-13186934.76,
                "ymax":5833814.09
              },
              "name": "Area E"
            }, {
                "extent": {
                  "spatialReference": {
                    "wkid":102100
                  },
                  "xmin":-13317034.87  ,
                  "ymin":5738919.97 ,
                  "xmax":-13296740.84,
                  "ymax":5750385.52
                },
                "name": "Area B"
              },{
                  "extent": {
                    "spatialReference": {
                      "wkid":102100
                    },
                    "xmin": -13328572.57,
                    "ymin":5752141.13,
                    "xmax":-13242504.48 ,
                    "ymax":5798003.35
                  },
                  "name": "Area P"
        },{
            "extent": {
              "spatialReference": {
                "wkid":102100
              },
              "xmin": -13328572.57,
              "ymin":5752141.13,
              "xmax":-13242504.48 ,
              "ymax":5798003.35
            },
            "name": "Unit 11"
  },{
      "extent": {
        "spatialReference": {
          "wkid":102100
        },
        "xmin": -13328572.57,
        "ymin":5752141.13,
        "xmax":-13242504.48 ,
        "ymax":5798003.35
      },
      "name": "Unit 12"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 13"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 14"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 31"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 32"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 33"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 34"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 41"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 42"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 43"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 44"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 45"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 51"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 52"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 53"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 54"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 62"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 64"
},{
    "extent": {
      "spatialReference": {
        "wkid":102100
      },
      "xmin": -13328572.57,
      "ymin":5752141.13,
      "xmax":-13242504.48 ,
      "ymax":5798003.35
    },
    "name": "Unit 71"
}];


      // Create the bookmark widget
       bookmarks = new esri.dijit.Bookmarks({
        map: app.map,
        bookmarks: bookmarks_list
      }, dojo.byId('bookmarks'));


    });

    //show map on load
  //  dojo.ready(init);
  //  });