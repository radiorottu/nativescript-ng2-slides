"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var slide_component_1 = require('../slide/slide.component');
var gestures = require('ui/gestures');
var platform = require('platform');
var AnimationModule = require('ui/animation');
var enums_1 = require('ui/enums');
var app = require('application');
var absolute_layout_1 = require('ui/layouts/absolute-layout');
var direction;
(function (direction) {
    direction[direction["none"] = 0] = "none";
    direction[direction["left"] = 1] = "left";
    direction[direction["right"] = 2] = "right";
})(direction || (direction = {}));
var cancellationReason;
(function (cancellationReason) {
    cancellationReason[cancellationReason["user"] = 0] = "user";
    cancellationReason[cancellationReason["noPrevSlides"] = 1] = "noPrevSlides";
    cancellationReason[cancellationReason["noMoreSlides"] = 2] = "noMoreSlides";
})(cancellationReason || (cancellationReason = {}));
var SlidesComponent = (function () {
    function SlidesComponent(ref) {
        this.ref = ref;
        this.direction = direction.none;
        this.indicators = [];
    }
    Object.defineProperty(SlidesComponent.prototype, "hasNext", {
        get: function () {
            return !!this.currentSlide && !!this.currentSlide.right;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlidesComponent.prototype, "hasPrevious", {
        get: function () {
            return !!this.currentSlide && !!this.currentSlide.left;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlidesComponent.prototype, "currentIndex", {
        get: function () {
            return (this.currentSlide) ? this.currentSlide.index : 0;
        },
        enumerable: true,
        configurable: true
    });
    SlidesComponent.prototype.ngOnInit = function () {
        this.loop = this.loop ? this.loop : false;
        this.pageIndicators = this.pageIndicators ? this.pageIndicators : false;
        this.pageWidth = this.pageWidth ? this.pageWidth : platform.screen.mainScreen.widthDIPs;
        this.pageHeight = this.pageHeight ? this.pageHeight : platform.screen.mainScreen.heightDIPs;
    };
    SlidesComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.slides.length > 0)
            this.initSlides();
        this.slides.changes.subscribe(function (d) {
            _this.initSlides();
        });
    };
    SlidesComponent.prototype.ngOnDestroy = function () {
    };
    SlidesComponent.prototype.initSlides = function () {
        var _this = this;
        if (this.slides.length > 0) {
            // loop through slides and setup height and width
            this.slides.forEach(function (slide) {
                absolute_layout_1.AbsoluteLayout.setLeft(slide.layout, _this.pageWidth);
                slide.slideWidth = _this.pageWidth;
                slide.slideHeight = _this.pageHeight;
            });
            this.currentSlide = this.buildSlideMap(this.slides.toArray());
            if (this.pageIndicators) {
                this.buildFooter(this.slides.length);
                this.setActivePageIndicator(0);
            }
            if (this.currentSlide) {
                this.positionSlides(this.currentSlide);
                this.applySwipe(this.pageWidth);
            }
        }
    };
    //footer stuff
    SlidesComponent.prototype.buildFooter = function (pageCount) {
        if (pageCount === void 0) { pageCount = 5; }
        var sections = (this.pageHeight / 6);
        var footerSection = this.footer.nativeElement;
        footerSection.marginTop = (sections * 5);
        footerSection.height = sections;
        footerSection.horizontalAlignment = 'center';
        if (app.ios) {
            footerSection.clipToBounds = false;
        }
        else if (app.android) {
            footerSection.android.getParent().setClipChildren(false);
        }
        footerSection.orientation = 'horizontal';
        var index = 0;
        while (index < pageCount) {
            this.indicators.push({ active: false });
            index++;
        }
    };
    SlidesComponent.prototype.setActivePageIndicator = function (activeIndex) {
        this.indicators.map(function (indicator, index) {
            if (index == activeIndex) {
                indicator.active = true;
            }
            else {
                indicator.active = false;
            }
        });
        this.indicators = this.indicators.slice();
        this.ref.detectChanges();
    };
    // private  functions
    SlidesComponent.prototype.setupPanel = function (slide) {
        this.direction = direction.none;
        this.transitioning = false;
        this.currentSlide.slide.layout.off('pan');
        this.currentSlide = slide;
        // sets up each slide so that they are positioned to transition either way.
        this.positionSlides(this.currentSlide);
        //if (this.disablePan === false) {
        this.applySwipe(this.pageWidth);
        //}
        if (this.pageIndicators) {
            this.setActivePageIndicator(this.currentSlide.index);
        }
    };
    SlidesComponent.prototype.positionSlides = function (slide) {
        // sets up each slide so that they are positioned to transition either way.
        if (slide.left != null && slide.left.slide != null) {
            slide.left.slide.layout.translateX = -this.pageWidth * 2;
        }
        slide.slide.layout.translateX = -this.pageWidth;
        if (slide.right != null && slide.right.slide != null) {
            slide.right.slide.layout.translateX = 0;
        }
    };
    SlidesComponent.prototype.showRightSlide = function (slideMap, offset, endingVelocity) {
        if (offset === void 0) { offset = this.pageWidth; }
        if (endingVelocity === void 0) { endingVelocity = 32; }
        var animationDuration;
        animationDuration = 300; // default value
        var transition = new Array();
        transition.push({
            target: slideMap.right.slide.layout,
            translate: { x: -this.pageWidth, y: 0 },
            duration: animationDuration,
            curve: enums_1.AnimationCurve.easeOut
        });
        transition.push({
            target: slideMap.slide.layout,
            translate: { x: -this.pageWidth * 2, y: 0 },
            duration: animationDuration,
            curve: enums_1.AnimationCurve.easeOut
        });
        var animationSet = new AnimationModule.Animation(transition, false);
        return animationSet.play();
    };
    SlidesComponent.prototype.showLeftSlide = function (slideMap, offset, endingVelocity) {
        if (offset === void 0) { offset = this.pageWidth; }
        if (endingVelocity === void 0) { endingVelocity = 32; }
        var animationDuration;
        animationDuration = 300; // default value
        var transition = new Array();
        transition.push({
            target: slideMap.left.slide.layout,
            translate: { x: -this.pageWidth, y: 0 },
            duration: animationDuration,
            curve: enums_1.AnimationCurve.easeOut
        });
        transition.push({
            target: slideMap.slide.layout,
            translate: { x: 0, y: 0 },
            duration: animationDuration,
            curve: enums_1.AnimationCurve.easeOut
        });
        var animationSet = new AnimationModule.Animation(transition, false);
        return animationSet.play();
    };
    SlidesComponent.prototype.handlePan = function (args) {
        var _this = this;
        var pageWidth = this.pageWidth;
        var previousDelta = -1; //hack to get around ios firing pan event after release
        var endingVelocity = 0;
        var startTime, deltaTime;
        if (args.state === gestures.GestureStateTypes.began) {
            startTime = Date.now();
            previousDelta = 0;
            endingVelocity = 250;
        }
        else if (args.state === gestures.GestureStateTypes.ended) {
            deltaTime = Date.now() - startTime;
            // if velocityScrolling is enabled then calculate the velocitty
            // swiping left to right.
            if (args.deltaX > (pageWidth / 3)) {
                if (this.hasPrevious) {
                    this.transitioning = true;
                    this.showLeftSlide(this.currentSlide, args.deltaX, endingVelocity).then(function () {
                        _this.setupPanel(_this.currentSlide.left);
                        //this.triggerChangeEventLeftToRight();
                    });
                }
                else {
                }
                return;
            }
            else if (args.deltaX < (-pageWidth / 3)) {
                if (this.hasNext) {
                    this.transitioning = true;
                    this.showRightSlide(this.currentSlide, args.deltaX, endingVelocity).then(function () {
                        _this.setupPanel(_this.currentSlide.right);
                        // Notify changed
                        //this.triggerChangeEventRightToLeft();
                        if (!_this.hasNext) {
                        }
                    });
                }
                else {
                }
                return;
            }
            if (this.transitioning === false) {
                //Notify cancelled
                //this.triggerCancelEvent(cancellationReason.user);
                this.transitioning = true;
                this.currentSlide.slide.layout.animate({
                    translate: { x: -this.pageWidth, y: 0 },
                    duration: 200,
                    curve: enums_1.AnimationCurve.easeOut
                });
                if (this.hasNext) {
                    this.currentSlide.right.slide.layout.animate({
                        translate: { x: 0, y: 0 },
                        duration: 200,
                        curve: enums_1.AnimationCurve.easeOut
                    });
                    if (app.ios)
                        this.currentSlide.right.slide.layout.translateX = 0;
                }
                if (this.hasPrevious) {
                    this.currentSlide.left.slide.layout.animate({
                        translate: { x: -this.pageWidth * 2, y: 0 },
                        duration: 200,
                        curve: enums_1.AnimationCurve.easeOut
                    });
                    if (app.ios)
                        this.currentSlide.left.slide.layout.translateX = -this.pageWidth;
                }
                if (app.ios)
                    this.currentSlide.slide.layout.translateX = -this.pageWidth;
                this.transitioning = false;
            }
        }
        else {
            if (!this.transitioning
                && previousDelta !== args.deltaX
                && args.deltaX != null
                && args.deltaX < 0) {
                if (this.hasNext) {
                    this.direction = direction.left;
                    this.currentSlide.slide.layout.translateX = args.deltaX - this.pageWidth;
                    this.currentSlide.right.slide.layout.translateX = args.deltaX;
                }
            }
            else if (!this.transitioning
                && previousDelta !== args.deltaX
                && args.deltaX != null
                && args.deltaX > 0) {
                if (this.hasPrevious) {
                    this.direction = direction.right;
                    this.currentSlide.slide.layout.translateX = args.deltaX - this.pageWidth;
                    this.currentSlide.left.slide.layout.translateX = -(this.pageWidth * 2) + args.deltaX;
                }
            }
            if (args.deltaX !== 0) {
                previousDelta = args.deltaX;
            }
        }
    };
    SlidesComponent.prototype.applySwipe = function (pageWidth) {
        var _this = this;
        var previousDelta = -1; //hack to get around ios firing pan event after release
        var endingVelocity = 0;
        var startTime, deltaTime;
        this.currentSlide.slide.layout.on('pan', function (args) { return _this.handlePan(args); });
    };
    SlidesComponent.prototype.buildSlideMap = function (slides) {
        var _this = this;
        this._slideMap = [];
        slides.forEach(function (slide, index) {
            _this._slideMap.push({
                slide: slide,
                index: index,
            });
        });
        this._slideMap.forEach(function (mapping, index) {
            if (_this._slideMap[index - 1] != null)
                mapping.left = _this._slideMap[index - 1];
            if (_this._slideMap[index + 1] != null)
                mapping.right = _this._slideMap[index + 1];
        });
        if (this.loop) {
            this._slideMap[0].left = this._slideMap[this._slideMap.length - 1];
            this._slideMap[this._slideMap.length - 1].right = this._slideMap[0];
        }
        return this._slideMap[0];
    };
    SlidesComponent.prototype.nextSlide = function () {
        var _this = this;
        if (!this.hasNext) {
            //this.triggerCancelEvent(cancellationReason.noMoreSlides);
            return;
        }
        this.direction = direction.left;
        this.transitioning = true;
        //	this.triggerStartEvent();
        this.showRightSlide(this.currentSlide).then(function () {
            _this.setupPanel(_this.currentSlide.right);
            //this.triggerChangeEventRightToLeft();
        });
    };
    SlidesComponent.prototype.previousSlide = function () {
        var _this = this;
        if (!this.hasPrevious) {
            //this.triggerCancelEvent(cancellationReason.noPrevSlides);
            return;
        }
        this.direction = direction.right;
        this.transitioning = true;
        //this.triggerStartEvent();
        this.showLeftSlide(this.currentSlide).then(function () {
            _this.setupPanel(_this.currentSlide.left);
            //this.triggerChangeEventLeftToRight();
        });
    };
    SlidesComponent.prototype.goToSlide = function (index) {
        if (this._slideMap && this._slideMap.length > 0 && index < this._slideMap.length) {
            this._slideMap[this.currentSlide.index].slide.layout.translateX = -this.pageWidth * 2;
            this.setupPanel(this._slideMap[index]);
            if (index > 0)
                this._slideMap[0].slide.layout.translateX = -this.pageWidth * 2;
        }
    };
    __decorate([
        core_1.ContentChildren(core_1.forwardRef(function () { return slide_component_1.SlideComponent; })), 
        __metadata('design:type', core_1.QueryList)
    ], SlidesComponent.prototype, "slides", void 0);
    __decorate([
        core_1.ViewChild('footer'), 
        __metadata('design:type', core_1.ElementRef)
    ], SlidesComponent.prototype, "footer", void 0);
    __decorate([
        core_1.Input('pageWidth'), 
        __metadata('design:type', Number)
    ], SlidesComponent.prototype, "pageWidth", void 0);
    __decorate([
        core_1.Input('pageHeight'), 
        __metadata('design:type', Number)
    ], SlidesComponent.prototype, "pageHeight", void 0);
    __decorate([
        core_1.Input('loop'), 
        __metadata('design:type', Boolean)
    ], SlidesComponent.prototype, "loop", void 0);
    __decorate([
        core_1.Input('pageIndicators'), 
        __metadata('design:type', Boolean)
    ], SlidesComponent.prototype, "pageIndicators", void 0);
    SlidesComponent = __decorate([
        core_1.Component({
            selector: 'slides',
            template: "\n\t<AbsoluteLayout>\n\t\t<ng-content></ng-content>\n\t\t<StackLayout *ngIf=\"pageIndicators\" #footer orientation=\"horizontal\" class=\"footer\">\n\t\t\t<Label *ngFor=\"let indicator of indicators\"\n\t\t\t\t[class.slide-indicator-active]=\"indicator.active == true\"\n\t\t\t\t[class.slide-indicator-inactive]=\"indicator.active == false\t\"\n\t\t\t></Label>\n\n\t\t</StackLayout>\n\t</AbsoluteLayout>\n\t",
            styles: ["\n\t\t.footer{\n\t\t\twidth:100%;\n\t\t\theight:20%\n\t\t\thorizontal-align:center;\n\t\t}\n\t"],
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [core_1.ChangeDetectorRef])
    ], SlidesComponent);
    return SlidesComponent;
}());
exports.SlidesComponent = SlidesComponent;
//# sourceMappingURL=slides.component.js.map