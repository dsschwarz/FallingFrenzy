require.config({
    paths: {
        jquery      : 'lib/jquery',
        underscore      : 'lib/underscore',
        gamejs      : 'lib/gamejs/gamejs'
    }
});
require(['jquery', "underscore", 'gamejs', "scene", "modules"], function($, _, gamejs, _scene, _modules) {
    gamejs.preload(["images/french_fries.png"]);
    gamejs.ready(function() {

        var display = gamejs.display.setMode([_modules.stageWidth, _modules.stageHeight], gamejs.display.FULLSCREEN);
        var director = new _scene.Director()
        director.start(new _scene.GameScene());
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