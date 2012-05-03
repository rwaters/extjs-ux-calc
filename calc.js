Ext.define('Ext.ux.Calculator',{
    extend: 'Ext.Component',
    alias: 'widget.calculator',

    baseCls: Ext.baseCSSPrefix + 'calculator',
    cls: Ext.baseCSSPrefix + 'unselectable',
    width: 185,

    renderTpl: [
        '<input type="text" id="{id}-display" class="{clsPrefix}-display" />',
        '<br/>',
        '<span class="{clsPrefix}-btn {clsPrefix}-clear">c</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-negative">+/-</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-divide">÷</span>',
        '<span class="{clsPrefix}-btn {clsPrefix}-multiply">×</span>',
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
        '÷': {
            action: 'Operation',
            operator: '/'
        },
        '×': {
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
        var me = this;

        Ext.apply(me,{
            renderData: {
                clsPrefix: me.clsPrefix
            },
            listeners: {
                el: {
                    click: {
                        fn: me.onButtonClick,
                        scope: me,
                        delegate: '.' + me.clsPrefix + '-btn'
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

    onButtonClick: function(event, target) {
        var me      = this,
            value   = target.innerHTML,
            command = me.commands[value],
            action  = command && command.action || 'Number';

        if (action != 'Number' && action != 'Clear') {
            if (me.cmdPressed && me.stashedValue && me.value) {
                me.executeCmd();
            }
        }

        me['do'+action](value, command);

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

    doOperation: function(value, command) {
        var me = this;
        me.stashedValue = me.value;
        me.cmdPressed = command;
        me.numberEdit = false;
    },

    doClear: function(clearStash) {
        var me = this;
        if (clearStash) {
            me.stashedValue = '';
        }
        me.value = '';
    },

    doToggleNegative: function() {
        var me    = this;
            isNeg = me.value.charAt(0) == '-';

        me.value = isNeg ? me.value.substring(1) : '-' + me.value;
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
    },

    syncDisplay: function() {
        var me = this;
        me.display.dom.value = me.value;
    }
});