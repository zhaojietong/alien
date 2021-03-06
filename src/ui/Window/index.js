/*!
 * window
 * @author ydr.me
 * @create 2015-01-11 14:49
 */


define(function (require, exports, module) {
    /**
     * @module ui/Window/
     * @requires util/dato
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires ui/base
     */
    'use strict';

    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var ui = require('../base.js');
    var alienIndex = 0;
    var alienClass = 'alien-ui-window';
    var defaults = {
        parentNode: document.body,
        width: 500,
        height: 'auto',
        left: 'center',
        top: 'center',
        duration: 456,
        easing: 'ease-in-out-back',
        addClass: '',
        zIndex: null
    };
    var Window = ui.create({
        constructor: function ($content, options) {
            var the = this;

            the._$content = selector.query($content)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the.visible = false;
            the._init();
        },

        _init: function () {
            var the = this;
            var options = the._options;
            var $pos = modification.create('div');

            the.id = alienIndex;
            the._$window = modification.create('div', {
                id: alienClass + '-' + alienIndex++,
                class: alienClass,
                style: {
                    display: 'none',
                    position: 'absolute'
                }
            });
            attribute.addClass(the._$window, options.addClass);
            modification.insert(the._$window, options.parentNode);
            modification.insert($pos, the._$content, 'afterend');
            the._$contentPos = $pos;
            modification.insert(the._$content, the._$window);

            return the;
        },


        /**
         * 获取对话框要显示的位置
         * @returns {{}}
         * @private
         */
        _getPos: function () {
            var the = this;
            var options = the._options;
            var winW = attribute.width(window);
            var winH = attribute.height(window);
            var pos = {};
            var pre = attribute.css(the._$window, ['width', 'height']);

            attribute.css(the._$window, {
                width: options.width,
                height: options.height
            });
            pos.width = attribute.outerWidth(the._$window);
            pos.height = attribute.outerHeight(the._$window);
            attribute.css(the._$window, pre);

            if (options.left === 'center') {
                pos.left = (winW - pos.width) / 2;
                pos.left = pos.left < 0 ? 0 : pos.left;
            } else {
                pos.left = options.left;
            }

            if (options.top === 'center') {
                pos.top = (winH - pos.height) * 2 / 5;
                pos.top = pos.top < 0 ? 0 : pos.top;
            } else {
                pos.top = options.top;
            }

            return pos;
        },


        /**
         * 打开窗口
         * @param [callback] {Function} 打开之后回调
         */
        open: function (callback) {
            var the = this;

            if (the.visible) {
                return the;
            }

            var to = the._getPos();
            var options = the._options;

            attribute.css(the._$window, {
                opacity: 0,
                visibility: 'visible',
                left: to.left,
                top: to.top,
                scale: 0,
                zIndex: options.zIndex || ui.getZindex()
            });

            to.opacity = '';
            to.transform = '';
            the.visible = true;
            animation.animate(the._$window, to, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                the.emit('open');

                if (typeis.function(callback)) {
                    callback.call(the);
                }
            });

            return the;
        },


        /**
         * 改变 window 尺寸
         * @param [size] {Object} 尺寸
         * @param [callback] {Function} 回调
         */
        resize: function (size, callback) {
            var the = this;

            if (!the.visible) {
                return the;
            }

            var args = arguments;

            if (typeis.function(args[0])) {
                callback = args[0];
                size = null;
            }

            var options = the._options;

            dato.extend(true, options, size);

            var to = the._getPos();

            animation.animate(the._$window, to, {
                durtaion: options.duration,
                easing: options.easing
            }, function () {
                the.emit('open');

                if (typeis.function(callback)) {
                    callback.call(the);
                }
            });

            return the;
        },


        /**
         * 关闭窗口
         * @param [callback] {Function} 打开之后回调
         */
        close: function (callback) {
            var the = this;

            if (!the.visible) {
                return the;
            }

            var options = the._options;
            var to = {
                opacity: 0,
                scale: 0
            };

            the.visible = false;
            animation.animate(the._$window, to, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                the.emit('close');

                attribute.css(the._$window, {
                    transform: '',
                    display: 'none'
                });

                if (typeis.function(callback)) {
                    callback.call(the);
                }
            });

            return the;
        },


        /**
         * 获取当前 mask 节点
         * @returns {HTMLElementNode}
         */
        getNode: function () {
            return this._$window;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;
            var destroy = function () {
                modification.insert(the._$content, the._$contentPos, 'afterend');
                modification.remove(the._$contentPos);
                modification.remove(the._$window);
            };

            if (the.visible) {
                the.close(destroy);
            } else {
                destroy();
            }
        }
    });


    /**
     * 创建一个窗口实例
     * @param $content {Object} 内容节点
     * @param [options] {Object} 配置
     * @param [options.width="auto"] {Number|String} 窗口宽度
     * @param [options.height="auto"] {Number|String} 窗口高度
     * @param [options.left="center"] {Number|String} 窗口左位移
     * @param [options.top="center"] {Number|String} 窗口上位移
     * @param [options.duration=456] {Number} 窗口打开动画时间
     * @param [options.easing="ease-in-out-back"] {Number} 窗口打开动画缓冲
     * @param [options.addClass=""] {String} 窗口添加的 className
     * @param [options.zIndex=null] {null|Number} 窗口层级，默认自动分配
     */
    module.exports = Window;
});