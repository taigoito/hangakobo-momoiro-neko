// Generated by CoffeeScript 1.12.7

/*
	MyBook
	Last update: 2017/10/15

	Author:	Taigo Ito
	Site: http://web.tgco.jp
	Twitter: @taigoito
	Location: Tokyo
 */
var MyBook,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

MyBook = (function() {
  function MyBook(options) {
    var ref, ref1, ref2, ref3;
    if (options == null) {
      options = {};
    }
    this.resize = bind(this.resize, this);
    this.flipping = bind(this.flipping, this);
    this.myWheelHandler = bind(this.myWheelHandler, this);
    this.myEndHandler = bind(this.myEndHandler, this);
    this.myMoveHandler = bind(this.myMoveHandler, this);
    this.myStartHandler = bind(this.myStartHandler, this);
    this.hasWheelHandling = (ref = options.hasWheelHandling) != null ? ref : false;
    this.$el = (ref1 = options.$el) != null ? ref1 : $('#book');
    this.$prev = (ref2 = options.$prev) != null ? ref2 : $('#book-prev');
    this.$next = (ref3 = options.$next) != null ? ref3 : $('#book-next');
    this.setBook();
    this.setPages();
    this.setFlip();
    this.setHitArea();
    this.currentPage = 0;
    this.current = false;
    this.timmmerId = null;
    this.handleEvents();
    $(window).trigger('resize');
    return;
  }

  MyBook.prototype.setBook = function() {
    this.bookImage = document.createElement('canvas');
    this.bookImage.id = 'book-image';
    this.$el.prepend($(this.bookImage));
  };

  MyBook.prototype.setPages = function() {
    var i, j, len, ref;
    this.pages = this.$el[0].getElementsByTagName('section');
    this.flips = [];
    len = this.pages.length;
    for (i = j = 0, ref = len; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      this.pages[i].style.zIndex = len - i;
      this.flips.push({
        progress: 1,
        target: 1,
        page: this.pages[i],
        isDragging: false
      });
    }
    this.pageImage = document.createElement('canvas');
    this.pageImage.id = 'page-image';
    this.pageImage.style.zIndex = 90;
    this.$el.append($(this.pageImage));
  };

  MyBook.prototype.setFlip = function() {
    this.flipImage = document.createElement('canvas');
    this.flipImage.id = 'flip-image';
    this.flipImage.style.zIndex = 100;
    this.$el.append($(this.flipImage));
  };

  MyBook.prototype.setHitArea = function() {
    this.hitArea = document.createElement('div');
    this.hitArea.id = 'hit-area';
    this.hitArea.style.zIndex = 110;
    return this.$el.append($(this.hitArea));
  };

  MyBook.prototype.handleEvents = function() {
    MyEvent.points = {
      x: 0,
      y: 0
    };
    $(this.hitArea).on(MyEvent.start, (function(_this) {
      return function(event) {
        var ref, ref1;
        _this.client = {
          x: (ref = event.clientX) != null ? ref : event.originalEvent.touches[0].clientX,
          y: (ref1 = event.clientY) != null ? ref1 : event.originalEvent.touches[0].clientY
        };
        MyEvent.isDragging = true;
        _this.myStartHandler();
        if (!MyEvent.isSupportTouch) {
          event.preventDefault();
        }
      };
    })(this)).on(MyEvent.move, (function(_this) {
      return function(event) {
        var ref, ref1;
        _this.client = {
          x: (ref = event.clientX) != null ? ref : event.originalEvent.touches[0].clientX,
          y: (ref1 = event.clientY) != null ? ref1 : event.originalEvent.touches[0].clientY
        };
        _this.myMoveHandler();
        if (!MyEvent.isSupportTouch) {
          event.preventDefault();
        }
      };
    })(this)).on(MyEvent.end, (function(_this) {
      return function(event) {
        _this.myEndHandler();
        MyEvent.isDragging = false;
      };
    })(this)).on(MyEvent.wheel, (function(_this) {
      return function(event) {
        var delta;
        if (event.originalEvent.deltaY) {
          delta = -event.originalEvent.deltaY;
        } else if (event.originalEvent.wheelDelta) {
          delta = event.originalEvent.wheelDelta;
        } else {
          delta = -event.originalEvent.detail;
        }
        _this.myWheelHandler(delta);
        event.preventDefault();
      };
    })(this));
    $('[data-book="prev"]').on(MyEvent.touch, (function(_this) {
      return function() {
        _this.flipPrev();
        return false;
      };
    })(this));
    $('[data-book="next"]').on(MyEvent.touch, (function(_this) {
      return function() {
        _this.flipNext();
        return false;
      };
    })(this));
    $(window).on('resize', this.resize);
  };

  MyBook.prototype.myStartHandler = function() {
    var target;
    MyEvent.points = {
      x: this.client.x - this.$el[0].offsetLeft - this.$el.width() / 2,
      y: this.client.y - this.$el[0].offsetTop
    };
    this.flipping();
    target = Math.max(Math.min(MyEvent.points.x / this.pageWidth, 1), -1);
    if ((-1 < target && target < 0) && this.currentPage > 0) {
      this.current = false;
      this.flips[this.currentPage - 1].isDragging = true;
    } else if ((0.75 < target && target < 1) && this.currentPage < this.flips.length - 1) {
      this.current = true;
      this.flips[this.currentPage].isDragging = true;
    }
  };

  MyBook.prototype.myMoveHandler = function() {
    var target;
    MyEvent.points = {
      x: this.client.x - this.$el[0].offsetLeft - this.$el.width() / 2,
      y: this.client.y - this.$el[0].offsetTop
    };
    if (!MyEvent.isDragging) {
      target = Math.max(Math.min(MyEvent.points.x / this.pageWidth, 1), -1);
      if ((0.875 < target && target < 1) && this.currentPage < this.flips.length - 1) {
        this.myStartHandler();
      } else {
        this.myEndHandler();
      }
    }
  };

  MyBook.prototype.myEndHandler = function() {
    var flip, j, len1, ref;
    ref = this.flips;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      flip = ref[j];
      if (flip.isDragging) {
        if (this.current) {
          if (flip.target < 0.75) {
            flip.target = -1;
            this.currentPage = Math.min(this.currentPage + 1, this.flips.length);
          } else {
            flip.target = 1;
          }
        } else {
          if (flip.target < 0) {
            flip.target = -1;
          } else {
            flip.target = 1;
            this.currentPage = Math.max(this.currentPage - 1, 0);
          }
        }
      }
      flip.isDragging = false;
    }
  };

  MyBook.prototype.myWheelHandler = function(delta) {
    var scrollTop, sliderHeight, sliderTop, windowHeight;
    windowHeight = $(window).height();
    sliderTop = this.$el.offset().top;
    sliderHeight = this.$el.height();
    scrollTop = sliderTop + (sliderHeight - windowHeight) / 2;
    if (($(window).scrollTop() < scrollTop - 150 && delta < 0) || ($(window).scrollTop() > scrollTop + 150 && delta > 0)) {
      $('html, body').animate({
        scrollTop: scrollTop
      });
    } else if (this.hasWheelHandling) {
      if (delta > 0) {
        this.flipPrev();
      } else if (delta < 0) {
        this.flipNext();
      }
    }
  };

  MyBook.prototype.flipping = function(speed) {
    if (speed == null) {
      speed = 0.2;
    }
    clearInterval(this.timmmerId);
    this.timmmerId = setInterval((function(_this) {
      return function() {
        var flip, j, len1, ref;
        ref = _this.flips;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          flip = ref[j];
          if (flip.isDragging) {
            flip.target = Math.max(Math.min(MyEvent.points.x / _this.pageWidth, 1), -1);
          }
          flip.progress += (flip.target - flip.progress) * speed;
          if (flip.isDragging || Math.abs(flip.progress < 0.997)) {
            _this.drowFlip(flip);
          } else if (!flip.isDragging && Math.abs(flip.progress < 0.997)) {
            clearInterval(_this.timmmerId);
          }
        }
      };
    })(this), 1000 / 60);
  };

  MyBook.prototype.flipPrev = function() {
    if (this.currentPage > 0) {
      this.flips[this.currentPage - 1].target = 1;
      this.currentPage = Math.max(this.currentPage - 1, 0);
      this.flipping(0.1);
    }
  };

  MyBook.prototype.flipNext = function() {
    if (this.currentPage < this.flips.length - 1) {
      this.flips[this.currentPage].target = -1;
      this.currentPage = Math.min(this.currentPage + 1, this.flips.length);
      this.flipping(0.1);
    }
  };

  MyBook.prototype.resize = function() {
    this.bookWidth = this.$el.width() * 83.2 / 96;
    this.bookHeight = this.$el.width() * 26 / 96;
    this.bookX = this.$el.width() * 6.4 / 96;
    this.bookY = this.$el.width() * 5 / 96;
    this.pageWidth = this.$el.width() * 40 / 96;
    this.pageHeight = this.$el.width() * 25 / 96;
    this.pageX = this.$el.width() * 1.6 / 96;
    this.pageY = this.$el.width() * 0.5 / 96;
    this.resizeBook();
    this.resizePages();
    this.resizeFlip();
    this.resizeHitArea();
    this.drow();
  };

  MyBook.prototype.resizeBook = function() {
    this.$el.height(this.bookHeight);
    this.bookImage.width = this.bookWidth + this.bookX * 2;
    this.bookImage.height = this.bookHeight + this.bookY * 2;
    this.bookImage.style.top = -this.bookY + 'px';
    this.bookImage.style.left = 0;
  };

  MyBook.prototype.resizePages = function() {
    var j, len1, page, ref;
    ref = this.pages;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      page = ref[j];
      page.style.top = 0;
      page.style.left = this.bookX + this.pageWidth + this.pageX + 'px';
      page.style.width = this.pageWidth + this.pageX + 'px';
      page.style.height = this.pageHeight + this.pageY * 2 + 'px';
      $(page).find('div').css({
        width: this.pageWidth,
        height: this.pageHeight,
        marginTop: this.pageY + 'px',
        marginLeft: 0,
        marginRight: this.pageX + 'px',
        marginBottom: this.pageY + 'px',
        backgroundColor: '#ffffff'
      });
    }
    this.pageImage.width = this.bookWidth;
    this.pageImage.height = this.bookHeight;
    this.pageImage.style.top = 0;
    this.pageImage.style.left = this.bookX + 'px';
  };

  MyBook.prototype.resizeFlip = function() {
    this.flipImage.width = this.bookWidth;
    this.flipImage.height = this.bookHeight + this.bookY * 2;
    this.flipImage.style.top = -this.bookY + 'px';
    this.flipImage.style.left = this.bookX + 'px';
  };

  MyBook.prototype.resizeHitArea = function() {
    this.hitArea.style.top = 0;
    this.hitArea.style.left = this.bookX + 'px';
    this.hitArea.style.width = this.bookWidth + 'px';
    this.hitArea.style.height = this.bookHeight + 'px';
  };

  MyBook.prototype.drow = function() {
    this.drowBook();
    this.drowPages();
    this.drowFlip();
  };

  MyBook.prototype.drowBook = function() {
    var ctx;
    ctx = this.bookImage.getContext('2d');
    ctx.save();
    ctx.translate(this.bookX, this.bookY);
    ctx.fillStyle = '#bfb38c';
    ctx.shadowColor = 'rgba(0, 0, 0, .6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;
    ctx.fillRect(0, 0, this.bookWidth, this.bookHeight);
    ctx.fillStyle = 'rgba(0, 0, 0, .3)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillRect(this.bookWidth * 0.488, 0, this.bookWidth * 0.024, this.bookHeight);
    ctx.strokeStyle = 'rgba(255, 255, 255, .3)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.bookWidth * 0.488, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, this.bookHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.bookWidth, 0);
    ctx.lineTo(this.bookWidth * 0.512, 0);
    ctx.lineTo(this.bookWidth * 0.512, this.bookHeight);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0, 0, 0, .3)';
    ctx.beginPath();
    ctx.moveTo(this.bookWidth * 0.488, 0);
    ctx.lineTo(this.bookWidth * 0.488, this.bookHeight);
    ctx.lineTo(0, this.bookHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.bookWidth, 0);
    ctx.lineTo(this.bookWidth, this.bookHeight);
    ctx.lineTo(this.bookWidth * 0.512, this.bookHeight);
    ctx.stroke();
    ctx.translate(this.pageX, this.pageY);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.pageWidth * 2, this.pageHeight);
    ctx.restore();
  };

  MyBook.prototype.drowPages = function() {
    var ctx, foldGradient;
    ctx = this.pageImage.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, this.pageImage.width, this.pageImage.height);
    ctx.strokeStyle = 'rgba(0, 0, 0, .6)';
    ctx.lineWidth = 0.5;
    ctx.translate(this.pageX, this.pageY);
    foldGradient = ctx.createLinearGradient(this.pageWidth * 0.75, 0, this.pageWidth, 0);
    foldGradient.addColorStop(0.35, '#ffffff');
    foldGradient.addColorStop(0.73, '#eeeeee');
    foldGradient.addColorStop(0.9, '#ffffff');
    foldGradient.addColorStop(1.0, '#dddddd');
    ctx.fillStyle = foldGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.pageWidth, 0);
    ctx.lineTo(this.pageWidth, this.pageHeight);
    ctx.lineTo(0, this.pageHeight);
    ctx.stroke();
    ctx.fill();
    ctx.translate(this.pageWidth, 0);
    foldGradient = ctx.createLinearGradient(this.pageWidth * 0.25, 0, 0, 0);
    foldGradient.addColorStop(0.73, 'rgba(255, 255, 255, 0)');
    foldGradient.addColorStop(0.95, 'rgba(221, 221, 221, .5)');
    foldGradient.addColorStop(1.0, 'rgba(102, 102, 102, .5)');
    ctx.fillStyle = foldGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.pageWidth, 0);
    ctx.lineTo(this.pageWidth, this.pageHeight);
    ctx.lineTo(0, this.pageHeight);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  };

  MyBook.prototype.drowFlip = function(flip) {
    var ctx, foldGradient, foldWidth, foldX, i, j, k, l, leftPages, leftShadowGradient, leftShadowWidth, len1, page, paperShadowWidth, ref, ref1, ref2, rightPages, rightShadowGradient, rightShadowWidth, strength, verticalOutdent;
    if (!flip) {
      flip = {
        progress: 1,
        target: 1
      };
    }
    ctx = this.flipImage.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, this.flipImage.width, this.flipImage.height);
    strength = 1 - Math.abs(flip.progress);
    foldWidth = this.pageWidth * 0.5 * (1 - flip.progress);
    foldX = this.pageWidth * flip.progress + foldWidth;
    verticalOutdent = this.bookY / 2 * strength;
    rightShadowWidth = this.pageWidth * 0.5 * Math.max(Math.min(strength, 0.5), 0);
    leftShadowWidth = this.pageWidth * 0.5 * Math.max(Math.min(strength, 0.5), 0);
    paperShadowWidth = this.pageWidth * 0.5 * Math.max(Math.min(1 - flip.progress, 0.5), 0);
    if (flip.page) {
      flip.page.style.width = Math.max(foldX, 0) + 'px';
    }
    ctx.translate(this.pageWidth + this.pageX, this.bookY + this.pageY);
    ctx.strokeStyle = 'rgba(0, 0, 0, .6)';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#eeeeee';
    leftPages = 0;
    rightPages = -1;
    ref = this.flips;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      flip = ref[j];
      if (flip.progress < -0.997) {
        leftPages++;
      } else if (flip.progress > 0.997) {
        rightPages++;
      }
    }
    leftPages = Math.min(leftPages, 2);
    rightPages = Math.min(rightPages, 2);
    for (i = k = 0, ref1 = leftPages; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      ctx.beginPath();
      ctx.moveTo(-this.pageWidth - i * 2, i * 0.625);
      ctx.lineTo(-this.pageWidth - i * 2, this.pageHeight + i * 0.625);
      ctx.lineTo(-i * 2, this.pageHeight + i * 0.625);
      ctx.lineTo(-i * 2, this.pageHeight + (i + 1) * 0.625);
      ctx.lineTo(-this.pageWidth - (i + 1) * 2, this.pageHeight + (i + 1) * 0.625);
      ctx.lineTo(-this.pageWidth - (i + 1) * 2, i * 0.625);
      ctx.stroke();
      ctx.fill();
    }
    page = Math.min(this.maxPage - this.currentPage - 1, 2);
    for (i = l = 0, ref2 = rightPages; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
      ctx.beginPath();
      ctx.moveTo(this.pageWidth + i * 2, i * 0.625);
      ctx.lineTo(this.pageWidth + i * 2, this.pageHeight + i * 0.625);
      ctx.lineTo(i * 2, this.pageHeight + i * 0.625);
      ctx.lineTo(i * 2, this.pageHeight + (i + 1) * 0.625);
      ctx.lineTo(this.pageWidth + (i + 1) * 2, this.pageHeight + (i + 1) * 0.625);
      ctx.lineTo(this.pageWidth + (i + 1) * 2, i * 0.625);
      ctx.stroke();
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(0, 0, 0, " + (strength * 0.05) + ")";
    ctx.lineWidth = 30 * strength;
    ctx.beginPath();
    ctx.moveTo(foldX - foldWidth, -verticalOutdent * 0.5);
    ctx.lineTo(foldX - foldWidth, this.pageHeight + verticalOutdent * 0.5);
    ctx.stroke();
    rightShadowGradient = ctx.createLinearGradient(foldX, 0, foldX + rightShadowWidth, 0);
    rightShadowGradient.addColorStop(0, "rgba(0, 0, 0, " + ((strength * 0.2).toFixed(2)) + ")");
    rightShadowGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rightShadowGradient;
    ctx.fillRect(foldX, 0, foldX + rightShadowWidth, this.pageHeight);
    leftShadowGradient = ctx.createLinearGradient(foldX - foldWidth - leftShadowWidth, 0, foldX - foldWidth, 0);
    leftShadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    leftShadowGradient.addColorStop(1, "rgba(0, 0, 0, " + ((strength * 0.15).toFixed(2)) + ")");
    ctx.fillStyle = leftShadowGradient;
    ctx.fillRect(foldX - foldWidth - leftShadowWidth, 0, leftShadowWidth, this.pageHeight);
    ctx.strokeStyle = 'rgba(0, 0, 0, .6)';
    ctx.lineWidth = 0.5;
    foldGradient = ctx.createLinearGradient(foldX - paperShadowWidth, 0, foldX, 0);
    foldGradient.addColorStop(0.35, '#ffffff');
    foldGradient.addColorStop(0.73, '#eeeeee');
    foldGradient.addColorStop(0.9, '#ffffff');
    foldGradient.addColorStop(1.0, '#dddddd');
    ctx.fillStyle = foldGradient;
    ctx.beginPath();
    ctx.moveTo(foldX, this.pageHeight);
    ctx.quadraticCurveTo(foldX, this.pageHeight + verticalOutdent * 2, foldX - foldWidth, this.pageHeight + verticalOutdent);
    ctx.lineTo(foldX - foldWidth, -verticalOutdent);
    ctx.quadraticCurveTo(foldX, -verticalOutdent * 2, foldX, 0);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  };

  return MyBook;

})();
