Ext.define('Ext.ux.Calculator',{
    extend: 'Ext.Component',
    alias: 'widget.calculator',

    baseCls: Ext.baseCSSPrefix + 'calculator',
    cls: Ext.baseCSSPrefix + 'unselectable',
    width: 185,
    ui: 'default',
    
    renderTpl: [
        '<input type="text" id="{id}-display" class="{clsPrefix}-display" />',
        '<br/>',
        '<span class="{clsPrefix}-btn {clsPrefix}-clear">c</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-negative">+/-</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-divide">&#247;</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-multiply">&#215;</span>',
        '<br/>',
        '<span class="{clsPrefix}-btn {clsPrefix}-seven">7</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-eight">8</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-nine">9</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-minus">-</span>',
        '<br/>',
        '<span class="{clsPrefix}-btn {clsPrefix}-four">4</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-five">5</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-six">6</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-plus">+</span>',
        '<br/>',
        '<span class="{clsPrefix}-btn {clsPrefix}-one">1</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-two">2</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-three">3</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-equals">=</span>',
        '<br/>',
        '<span class="{clsPrefix}-btn {clsPrefix}-zero">0</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-decimal">.</span>'
    ],

    childEls: ['display'],


    clsPrefix: Ext.baseCSSPrefix + 'calc',
    value: '0',
    stashedValue: '',
    numberEdit: true,
    cmdPressed: false,

    commands: {
        'c': {
            action: 'Clear'
        },
        '+/-': {
            action: 'ToggleNegative'
        },
        '\u00F7': {
            action: 'Operation',
            operator: '/'
        },
        '\u00D7': {
            action: 'Operation',
            operator: '*'
        },
        '+': {
            action: 'Operation',
            operator: '+'
        },
        '-': {
            action: 'Operation',
            operator: '-'
        },
        '=': {
            action: 'Equals'
        }
    },

    initComponent: function() {
        var me             = this,
            buttonSelector = '.' + me.clsPrefix + '-btn';

        Ext.apply(me,{
            renderData: {
                clsPrefix: me.clsPrefix
            },
            listeners: {
                el: {
                    click: {
                        fn: me.onButtonClick,
                        scope: me,
                        delegate: buttonSelector
                    },
                    keydown: {
                        fn: function(e, t) {
                            var key = e.getKey();
                            if ((key < Ext.EventObject.NUM_ZERO || key > Ext.EventObject.NUM_NINE)
                                && (key < Ext.EventObject.ZERO || key > Ext.EventObject.NINE)
                                && key != Ext.EventObject.NUM_PERIOD
                                && key != 190 // Non num pad period
                                && key != Ext.EventObject.BACKSPACE
                                && key != Ext.EventObject.LEFT
                                && key != Ext.EventObject.RIGHT
                            ) {
                                e.stopEvent();
                                return false;
                            } else {
                                // Must delay since in keydown value hasn't actually been changed yet
                                Ext.Function.defer(function() {
                                    me.value = t.value;
                                }, 1);
                            }
                        },
                        scope: me,
                        delegate: 'input'
                    }
                }
            }
        });

        me.callParent();
    },

    afterRender: function() {
        var me = this;
        me.callParent(arguments);
        me.syncDisplay();
    },

    getButtonActiveMarker: function() {
        var me = this;
        if (!me.activeMarker) {
            me.activeMarker = me.getEl().createChild({
                cls: me.clsPrefix + '-btn ' + me.clsPrefix + '-btn-marker'
            });
        }
        return me.activeMarker;
    },

    _hackFirstMarkerDisplay: true,
    applyMarker: function(target) {
        var me      = this,
            marker  = me.getButtonActiveMarker(),
            yOffset = -1;

        if (me._hackFirstMarkerDisplay) {
            me._hackFirstMarkerDisplay = false;
            yOffset = -6;
        }
        marker.show();
        marker.alignTo(target, 'tl-tl', [-1, yOffset]);
    },

    onButtonClick: function(event, target) {
        var me      = this,
            value   = target.innerHTML,
            command = me.commands[value],
            action  = command && command.action || 'Number';

        if (command == me.cmdPressed || action == 'Equals') {
            if (me.cmdPressed && me.stashedValue && me.value) {
                me.executeCmd();
            }
        }

        me['do'+action](value, command, target);

        me.syncDisplay();
    },

    doNumber: function(number) {
        var me     = this,
            number = number + '';
        if (!me.numberEdit || me.value == '0') {
            me.value = number;
            me.numberEdit = true;
        } else {
            me.value += number;
        }
    },

    doOperation: function(value, command, target) {
        var me = this;
        me.stashedValue = me.value;
        me.cmdPressed = command;
        me.numberEdit = false;
        me.applyMarker(target);
    },

    doClear: function(clearStash) {
        var me = this;
        if (clearStash) {
            me.stashedValue = '';
        }
        me.value = '0';
        me.getButtonActiveMarker().hide();
    },

    doToggleNegative: function() {
        var me    = this;
            isNeg = me.value.charAt(0) == '-';
        if (me.value != '0') {
            me.value = isNeg ? me.value.substring(1) : '-' + me.value;
        }
    },

    doEquals: function() {
        var me = this;
        if (me.cmdPressed && me.stashedValue && me.value) {
            me.executeCmd();
        }
    },

    executeCmd: function() {
        var me     = this,
            action = me.cmdPressed,
            stash  = parseFloat(me.stashedValue),
            value  = parseFloat(me.value);

        me.value = eval(stash + action.operator + value) + '';

        me.stashedValue = '';
        me.cmdPressed = false;
        me.numberEdit = false;
        me.getButtonActiveMarker().hide();
    },

    syncDisplay: function() {
        var me = this;
        me.display.dom.value = me.value;
    }
});