"use strict";
var core_1 = require('@angular/core');
var common_1 = require('@angular/common');
var slides_component_1 = require('./slides/slides.component');
var slide_component_1 = require('./slide/slide.component');
var SlidesModule = (function () {
    function SlidesModule() {
    }
    SlidesModule = __decorate([
        core_1.NgModule({
            imports: [common_1.CommonModule],
            exports: [slide_component_1.SlideComponent, slides_component_1.SlidesComponent],
            declarations: [slides_component_1.SlidesComponent, slide_component_1.SlideComponent],
            providers: [],
        }), 
        __metadata('design:paramtypes', [])
    ], SlidesModule);
    return SlidesModule;
}());
exports.SlidesModule = SlidesModule;
