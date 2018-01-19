var twhl = function(){
	var c2dTemplate = JSON.stringify({
    "CIRCLE_OBJECTS": [
    ],
    "CURVE_OBJECTS": [
    ],
    "DOCUMENT_VALUES": {
        "BACKGROUND_IMAGE": "AAAAAA==",
        "BACKGROUND_OPACITY": 0.5,
        "BACKGROUND_POSITION_X": 0,
        "BACKGROUND_POSITION_Y": 0,
        "BACKGROUND_ROTATION": 0,
        "BACKGROUND_SCALE": 1,
        "BACKGROUND_VISIBLE": false,
        "DISPLAYMM": true,
        "HEIGHT": 75,
        "MACHINE": "Shapeoko 3",
        "MATERIAL": "Soft",
        "RETRACT": 12,
        "THICKNESS": 5,
        "WIDTH": 150,
        "ZERO_X": 0,
        "ZERO_Y": 0,
        "ZERO_Z": 0,
        "grid_enabled": true,
        "grid_spacing": 5,
        "version": 1
    },
    "RECT_OBJECTS": [
    ],
    "REGULAR_POLYGON_OBJECTS": [
    ],
    "TEXT_OBJECTS": [
    ],
    "TOOLPATH_OBJECTS": [
    ],
    "toolpath_links": [
    ]
	});

	var toolpathTemplate = JSON.stringify({
		"automatic_parameters": true,
		"contours": [
		],
		"enabled": true,
		"end_depth": -2.5,
		"name": "toolpath",
		"ofset_dir": 2,
		"speeds": {
				"feedrate": 586.74000000000103,
				"plungerate": 293.37000000000052,
				"rpm": 9375
		},
		"start_depth": 0,
		"stepdown": 0.8825,
		"stepover": 1.42875,
		"tolerance": 0.01,
		"tool": {
				"angle": 0,
				"corner_radius": 0,
				"diameter": 3.1749999999999998,
				"display_mm": false,
				"flutes": 2,
				"length": 19.049999999999997,
				"name": "",
				"number": 102,
				"overall_length": 0,
				"uuid": "{00000000-0000-0000-0000-000000000102}"
		},
		"uuid": "{00000000-0000-4000-b000-000000000}",
		"vcarve": false
	});

	var toolpathIds = [
		{"name": "top1-rabbet", "uuid": "{00000000-0000-4000-b000-000000000001}"},
		{"name": "top2-rabbet", "uuid": "{00000000-0000-4000-b000-000000000002}"},
		{"name": "front-rabbets", "uuid": "{00000000-0000-4000-b000-000000000003}"},
		{"name": "outlines", "uuid": "{00000000-0000-4000-b000-000000000004}", "ofset_dir": 1}
	];

	var toolpathLinkIds = [
		{"path": "{00000000-0000-4000-b000-000000000001}", "rect": "{00000000-0000-4000-a000-000000000101}"},
		{"path": "{00000000-0000-4000-b000-000000000001}", "rect": "{00000000-0000-4000-a000-000000000102}"},

		{"path": "{00000000-0000-4000-b000-000000000002}", "rect": "{00000000-0000-4000-a000-000000000151}"},
		{"path": "{00000000-0000-4000-b000-000000000002}", "rect": "{00000000-0000-4000-a000-000000000152}"},

		{"path": "{00000000-0000-4000-b000-000000000003}", "rect": "{00000000-0000-4000-a000-000000000201}"},
		{"path": "{00000000-0000-4000-b000-000000000003}", "rect": "{00000000-0000-4000-a000-000000000202}"},
		{"path": "{00000000-0000-4000-b000-000000000003}", "rect": "{00000000-0000-4000-a000-000000000251}"},
		{"path": "{00000000-0000-4000-b000-000000000003}", "rect": "{00000000-0000-4000-a000-000000000252}"},

		{"path": "{00000000-0000-4000-b000-000000000004}", "rect": "{00000000-0000-4000-a000-000000000100}"},
		{"path": "{00000000-0000-4000-b000-000000000004}", "rect": "{00000000-0000-4000-a000-000000000150}"},
		{"path": "{00000000-0000-4000-b000-000000000004}", "rect": "{00000000-0000-4000-a000-000000000200}"},
		{"path": "{00000000-0000-4000-b000-000000000004}", "rect": "{00000000-0000-4000-a000-000000000250}"},
		{"path": "{00000000-0000-4000-b000-000000000004}", "rect": "{00000000-0000-4000-a000-000000000300}"},
		{"path": "{00000000-0000-4000-b000-000000000004}", "rect": "{00000000-0000-4000-a000-000000000350}"}
	]

	function mmx(measure){
		return parseInt(measure.toString().replace('mm'));
	}

	function c2dRect(item){
		return {
			"height": mmx(item.h),
			"id": '00000000-0000-4000-a000-000000000' + item.i,
			"position": [
					(mmx(item.w) / 2.0) + mmx(item.x),
					(mmx(item.h) / 2.0) + mmx(item.y)
			],
			"rotation": 0,
			"width": mmx(item.w)
		}
	}

	function generateC2D(plan, thickness){
		var c2d = JSON.parse(c2dTemplate);

		var rects = plan.map(c2dRect);
		c2d.RECT_OBJECTS = rects;

		var size = planSize(plan);
		c2d.DOCUMENT_VALUES.HEIGHT = size.h + 5;
		c2d.DOCUMENT_VALUES.WIDTH = size.w + 5;
		c2d.DOCUMENT_VALUES.THICKNESS = thickness;

		var toolpaths = toolpathIds.map(function(toolpath){
			var tp = JSON.parse(toolpathTemplate);
			for (key in toolpath){
				tp[key] = toolpath[key];
			}
			if(tp.name != 'outlines'){
				tp.end_depth = -(thickness / 2.0);
			} else {
				tp.end_depth = -thickness;				
			}
			return tp;
		});
		c2d.TOOLPATH_OBJECTS = toolpaths;
		
		var toolpathLinks = toolpathLinkIds.map(function(link){
			return {
				"links": [link.path],
				"uuid": link.rect
			};
		});
		c2d.toolpath_links = toolpathLinks;

		return c2d;
	}

	function planSize(plan){
		var h = plan.reduce(function(prev, curr){
			var y = mmx(curr.y) + mmx(curr.h);
			if(y > prev){
				return y;
			} else {
				return prev
			}
		}, 0);

		var w = plan.reduce(function(prev, curr){
			var x = mmx(curr.x) + mmx(curr.w);
			if(x > prev){
				return x;
			} else {
				return prev
			}
		}, 0)
		return {h: h, w: w};
	}

	return {
		generateC2D: generateC2D
	}
}();