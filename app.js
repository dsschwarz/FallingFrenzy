require.config({
    paths: {
        jquery      : 'lib/jquery',
        underscore      : 'lib/underscore',
        gamejs      : 'lib/gamejs/gamejs'
    }
});
require(['jquery', "underscore", 'gamejs', "scene", "modules", "objects"], function($, _, gamejs, _scene, _modules, _objects) {
    gamejs.preload(["images/french_fries.png"]);
    gamejs.ready(function() {

        var display = gamejs.display.setMode([_modules.stageWidth, _modules.stageHeight], gamejs.display.FULLSCREEN);
        var director = new _scene.Director()

        var scene = new _scene.GameScene();
        scene.boundingRects.add(new _objects.BoundingRect([-100, _modules.stageHeight], [_modules.stageWidth + 200, 300], 0.5, 10, [0, -1]));
        scene.boundingRects.add(new _objects.BoundingRect([-300, 0], [300, _modules.stageHeight], 0.75, 10, [1, 0]));
        scene.boundingRects.add(new _objects.BoundingRect([_modules.stageWidth, 0], [300, _modules.stageHeight], 0.75, 10, [-1, 0]));
        var test = new _objects.BoundingRect([300, 300], [100, 10]);
        scene.boundingRects.add(test);
        test.color = "#933";

        var test2 = new _objects.BoundingRect([200, 500], [100, 100]);
        scene.boundingRects.add(test2);
        test2.color = "#539";
        scene.boundingRects.draw(display);
        director.start(scene);


        var tick = function(msDuration) {

            _.each(gamejs.event.get(), function(event) {
                //Handle Event
                director.handle(event);
                // console.warn(event);
            });
            
            director.update(msDuration);
            director.draw(display);
            // console.warn(msDuration);
        };


        gamejs.time.fpsCallback(tick, this, 20);
    })
})