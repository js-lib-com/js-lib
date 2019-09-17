$package('js.tests.html');

js.tests.html.HtmlIntegrationTests =
{
    testInnerHtml: function() {
        var div = Doc.getById('test-id');

        div.setHTML('<span>span text</span>');
        assertEquals('span text', div.getByTag('span').get());
        if (js.ua.Engine.TRIDENT) {
            assertEquals('<SPAN>span text</SPAN>', div.getHTML());
        }
        else {
            assertEquals('<span>span text</span>', div.getHTML());
        }

        div.setHTML('<SPAN>span text</SPAN>');
        assertEquals('span text', div.getByTag('span').get());
        if (js.ua.Engine.TRIDENT) {
            assertEquals('<SPAN>span text</SPAN>', div.getHTML());
        }
        else {
            assertEquals('<span>span text</span>', div.getHTML());
        }
        div.removeChildren();
    },

    testCloning: function() {
        var userData = $id();

        var tbody = Doc.body.getByCss('form/table/tbody');
        var td = tbody.getByTag('td');
        td.setUserData('value', userData);
        assertEquals(userData, td.getUserData('value'));

        var clone = tbody.clone(true);
        assertEquals(userData, td.getUserData('value'));
        var clonedTd = clone.getByTag('td');
        assertNull(clonedTd.getUserData('value'));
    },

    testGetElementsByTagNameCommnets: function() {
        var node = document.getElementById('test-div2');
        var nodeList = node.getElementsByTagName('*');
        if (js.ua.Engine.TRIDENT) {
            assertEquals(4, nodeList.length);
        }
        else {
            assertEquals(3, nodeList.length);
        }
    },

    testElementMethods: function() {
        var div = Doc.getById('test-id');
        assertEquals('test-id', div.getId());
        assertEquals('div', div.getTag());
        assertEquals('test-name', div.getAttr('name'));
        assertEquals('test-title', div.getAttr('title'));
        assertTrue(div.hasCssClass('test-class'));

        var span = Doc.createElement('span');
        span.removeChildren().addText('test-text');
        div.addChild(span);
        assertEquals('span', div.getFirstChild().getTag());
        assertEquals('test-text', div.getByTag('span').getText());
        assertEquals('test-text', div.findByTag('span').first().getText());
        assertEquals('test-text', div.findByTag('span').item(0).getText());
        assertEquals('test-text', div.findByTag('span').last().getText());

        var span = Doc.createElement('span').setId('removable-span').removeChildren().addText('test-text-2');
        div.addChild(span);
        assertEquals('test-text', div.findByTag('span').first().getText());
        assertEquals('test-text-2', div.findByTag('span').last().getText());
        div.removeChild(span);
        assertNull(Doc.getById('removable-span'));
    },

    testSimpleForm: function() {
        var form = Doc.createElement('form');
        //        form = $('#person');
        assertEquals('form', form.getTag());
    },

    _testFindByCss: function() {
        var legend = Doc.body.getByCss('#person/fieldset/legend');
        assertEquals('Person', legend.getText());
        legend = Doc.body.getByCss('form#person/fieldset/legend');
        assertEquals('Person', legend.getText());
        legend = $L('form#person/fieldset/legend').item();
        assertEquals('Person', legend.getText());
        var p = $L('div#test-div2/p.test-p').item();
        assertEquals('paragraph #2', p.getText());
        var input = $E('form#column-selector/table/thead/tr/td/input[name=column#1]');
        assertEquals('text', input.getAttr('type'));
        input = $E('form#column-selector/table/thead/tr/td/input[name]');
        assertEquals('text', input.getAttr('type'));
        input = $E('input.streetNumber');
        assertEquals('streetNumber', input.getAttr('name'));
        assertEquals('streetNumber', input.getAttr('class'));
    },

    _testByClass: function() {
        var p = Doc.getById('test-div2').findByCssClass('test-p').item();
        assertEquals('paragraph #2', p.getText());
        p = Doc.getById('test-div2').getByCssClass('test-p');
        assertEquals('paragraph #2', p.getText());
    },

    _testMixedLookup: function() {
        var form = $E('form#column-selector');
        var width = form.getWidth();
        var table = form.getByTag('table');
        table.setStyle('left', '0px');
        var inputs = table.findByCss('thead/tr/td/input');
        assertEquals(2, inputs.size());
        assertEquals('column#1', inputs.item(0).getAttr('name'));
        assertEquals('column#2', inputs.item(1).getAttr('name'));
        inputs = table.findByCss('>thead/>tr/>td/>input');
        assertEquals(2, inputs.size());
        assertEquals('column#1', inputs.item(0).getAttr('name'));
        assertEquals('column#2', inputs.item(1).getAttr('name'));
        inputs = table.findByCss('input');
        assertEquals(2, inputs.size());
        assertEquals('column#1', inputs.item(0).getAttr('name'));
        assertEquals('column#2', inputs.item(1).getAttr('name'));
        inputs = table.findByCss('input[name]');
        assertEquals(2, inputs.size());
        assertEquals('column#1', inputs.item(0).getAttr('name'));
        assertEquals('column#2', inputs.item(1).getAttr('name'));
        inputs = table.findByCss('thead/>input');
        assertTrue(inputs.isEmpty());
    },

    testParent: function() {
        var a = $E('form#column-selector/table/thead/tr/td/a');
        assertTrue(a.$E('../').is('td'));
        assertTrue(a.$E('..').is('td'));
        assertTrue(a.$E('../../').is('tr'));
        assertTrue(a.$E('../..').is('tr'));
        assertTrue(a.$E('../../../').is('thead'));
        assertTrue(a.$E('../../..').is('thead'));
        assertTrue(a.$E('/../../..').is('thead'));
        assertTrue(a.$E('/../../../').is('thead'));
    },

    testRemove: function() {
        var form = Doc.getById('person');
        form.findByTag('input').on('click', function(ev) {
            alert(ev);
        });
        Doc.getById('person').remove();
    },

    testResetHiddenInput: function() {
        var form = $id('customer');
        var input = $id('customer-id');
        input.set(5678);
        assertEquals('5678', input.get());
        form.reset();
        assertEquals('5678', input.get());
    },

    _testLoadSelect: function() {
        js.net.loop =
        {
            'get-genre.xsp': [
            {
                value: 'MALE',
                text: 'Male'
            },
            {
                value: 'FEMALE',
                text: 'Female'
            }]
        };

        var select = $id('select3-id');
        assertEquals(0, select.getChildren().size());
        select.load('get-genre.xsp');
        assertEquals(2, select.getChildren().size());

        // NOTE: testor should observe browser interface to see if option is actually displayed
    }
};
TestCase.register('js.tests.html.HtmlIntegrationTests');
