"use strict";
var core_1 = require('@angular/core');
var SlideComponent = (function () {
    function SlideComponent() {
        this.cssClass = this.cssClass ? this.cssClass : '';
    }
    Object.defineProperty(SlideComponent.prototype, "slideWidth", {
        set: function (width) {
            this.layout.width = width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideComponent.prototype, "slideHeight", {
        set: function (height) {
            this.layout.height = height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideComponent.prototype, "layout", {
        get: function () {
            return this.slideLayout.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    SlideComponent.prototype.ngOnInit = function () {
    };
    __decorate([
        core_1.ViewChild('slideLayout'), 
        __metadata('design:type', core_1.ElementRef)
    ], SlideComponent.prototype, "slideLayout", void 0);
    __decorate([
        core_1.Input('class'), 
        __metadata('design:type', String)
    ], SlideComponent.prototype, "cssClass", void 0);
    SlideComponent = __decorate([
        core_1.Component({
            selector: 'slide',
            template: "\n\t<StackLayout #slideLayout [class]=\"cssClass\">\n\t\t<ng-content></ng-content>\n\t</StackLayout>\n\t",
        }), 
        __metadata('design:paramtypes', [])
    ], SlideComponent);
    return SlideComponent;
}());
exports.SlideComponent = SlideComponent;
