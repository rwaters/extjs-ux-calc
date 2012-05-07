Ext.onReady(function() {

    var calc = Ext.create('Ext.ux.Calculator',{
        renderTo: document.body
    });

    Ext.create('Ext.Button',{
        renderTo: document.body,
        margin: '20 0 0 0',
        text: 'Toggle UI',
        handler: function() {
            calc.setUI(calc.ui == 'default' ? 'apple' : 'default');
        }
    })
});