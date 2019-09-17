$package("js.tests.lang");

js.tests.lang.OppUnitTests = {
    testFlatObjectGetter : function () {
        var person = {
            id : 1,
            name : "John Doe",
            address : null
        };
        assertEquals(1, js.lang.OPP.get(person, "id"));
        assertEquals("John Doe", js.lang.OPP.get(person, "name"));
        assertNull(js.lang.OPP.get(person, "address"));
        assertUndefined(js.lang.OPP.get(person, "fake"));
    },

    testFlatObjectSetter : function () {
        var person = {};
        js.lang.OPP.set(person, "id", 1);
        js.lang.OPP.set(person, "name", "John Doe");
        js.lang.OPP.set(person, "address", null);
        assertEquals(1, person.id);
        assertEquals("John Doe", person.name);
        assertNull(person.address);
    },

    testArrayGetter : function () {
        var person = [ 1, "John Doe", null ];
        assertEquals(1, js.lang.OPP.get(person, "0"));
        assertEquals("John Doe", js.lang.OPP.get(person, "1"));
        assertNull(js.lang.OPP.get(person, "2"));
    },

    testArraySetter : function () {
        var person = [];
        js.lang.OPP.set(person, "0", 1);
        js.lang.OPP.set(person, "1", "John Doe");
        js.lang.OPP.set(person, "2", null);
        assertEquals(1, person[0]);
        assertEquals("John Doe", person[1]);
        assertNull(person[2]);
    },

    PATHS : {
        "model" : "Opel Corsa 1.2",
        "engine.model" : "ECO",
        "engine.date" : new Date(2001, 0, 1, 12, 0, 0, 0),
        "engine.euro" : true,
        "engine.specs.capacity" : 1200,
        "engine.specs.torque.0" : 495,
        "engine.specs.torque.1" : 0,
        "engine.specs.torque.2" : 1137,
        "engine.specs.torque.3" : null,
        "wheels.0.pressure" : 1.8,
        "wheels.0.checked.0.year" : 2002,
        "wheels.0.checked.0.month" : "July",
        "wheels.0.checked.1.year" : 2002,
        "wheels.0.checked.1.month" : "December",
        "wheels.0.checked.2.year" : 2003,
        "wheels.0.checked.2.month" : "August",
        "wheels.1.pressure" : 1.8,
        "wheels.1.checked.0.year" : 2004,
        "wheels.1.checked.0.month" : "January",
        "wheels.2.pressure" : 2.1,
        "wheels.2.checked.0.year" : 2006,
        "wheels.2.checked.0.month" : "September",
        "wheels.2.checked.1" : null,
        "wheels.3.pressure" : 2.1,
        "wheels.3.checked.0" : null,
        "wheels.3.checked.1.year" : 2007,
        "wheels.3.checked.1.month" : "November"
    },

    testComplexObjectGetter : function () {
        var car = {
            model : "Opel Corsa 1.2",
            engine : {
                model : "ECO",
                date : new Date(2001, 0, 1, 12, 0, 0, 0),
                euro : true,
                specs : {
                    capacity : 1200,
                    torque : [ 495, 0, 1137, null ]
                }
            },
            wheels : [ {
                pressure : 1.8,
                checked : [ {
                    year : 2002,
                    month : "July"
                }, {
                    year : 2002,
                    month : "December"
                }, {
                    year : 2003,
                    month : "August"
                } ]
            }, {
                pressure : 1.8,
                checked : [ {
                    year : 2004,
                    month : "January"
                } ]
            }, {
                pressure : 2.1,
                checked : [ {
                    year : 2006,
                    month : "September"
                }, null ]
            }, {
                pressure : 2.1,
                checked : [ null, {
                    year : 2007,
                    month : "November"
                } ]
            } ]
        };

        for ( var p in this.PATHS) {
            this.assert(this.PATHS[p], js.lang.OPP.get(car, p), p);
        }
    },

    assert : function (expected, concrete, opp) {
        if (expected instanceof Date) {
            expected = expected.getTime();
            concrete = concrete.getTime();
        }
        assertEquals(expected, concrete, "Error on OPP |%s|. Expected |%s| but got |%s|.", opp, expected, concrete);
    },

    testComplexObjectSetter : function () {
        var car = {
            engine : {
                specs : {
                    torque : []
                }
            },
            wheels : [ {
                checked : [ {}, {}, {} ]
            }, {
                checked : [ {}, {}, {} ]
            }, {
                checked : [ {} ]
            }, {
                checked : [ {}, {} ]
            } ]
        };
        for ( var p in this.PATHS) {
            js.lang.OPP.set(car, p, this.PATHS[p]);
        }

        assertEquals("Opel Corsa 1.2", car.model);
        assertEquals("ECO", car.engine.model);
        assertEquals(new Date(2001, 0, 1, 12, 0, 0, 0).toString(), car.engine.date.toString());
        assertTrue(car.engine.euro);
        assertEquals(1200, car.engine.specs.capacity);
        assertEquals(495, car.engine.specs.torque[0]);
        assertEquals(0, car.engine.specs.torque[1]);
        assertEquals(1137, car.engine.specs.torque[2]);
        assertNull(car.engine.specs.torque[3]);
        assertEquals(1.8, car.wheels[0].pressure);
        assertEquals(2002, car.wheels[0].checked[0].year);
        assertEquals("July", car.wheels[0].checked[0].month);
        assertEquals(2002, car.wheels[0].checked[1].year);
        assertEquals("December", car.wheels[0].checked[1].month);
        assertEquals(2003, car.wheels[0].checked[2].year);
        assertEquals("August", car.wheels[0].checked[2].month);
        assertEquals(1.8, car.wheels[1].pressure);
        assertEquals(2004, car.wheels[1].checked[0].year);
        assertEquals("January", car.wheels[1].checked[0].month);
        assertEquals(2.1, car.wheels[2].pressure);
        assertEquals(2006, car.wheels[2].checked[0].year);
        assertEquals("September", car.wheels[2].checked[0].month);
        assertNull(car.wheels[2].checked[1]);
        assertEquals(2.1, car.wheels[3].pressure);
        assertNull(car.wheels[3].checked[0]);
        assertEquals(2007, car.wheels[3].checked[1].year);
        assertEquals("November", car.wheels[3].checked[1].month);
    },

    testGetSubObject : function () {
        var person = {
            address : {
                country : "RO",
                locality : "Iasi"
            }
        };
        var address = js.lang.OPP.get(person, "address");
        assertDefined(address);
        assertEquals("RO", address.country);
        assertEquals("Iasi", address.locality);
    },

    testSetSubObject : function () {
        var person = {};
        js.lang.OPP.set(person, "address", {
            country : "RO",
            locality : "Iasi"
        });
        assertDefined(person.address);
        assertEquals("RO", person.address.country);
        assertEquals("Iasi", person.address.locality);
    },

    /**
     * Trying to set property of undefined sub-object will rise assertion. If assertion is disabled setter silently does
     * nothing. In any case target object is not changed.
     */
    testSetUndefinedSubObjectProperty : function () {
        var person = {};
        assertAssertion(js.lang.OPP, "set", person, "address.country", "RO");
        $assert.disable();
        js.lang.OPP.set(person, "address.country", "RO");
        assertUndefined(person.address);
        $assert.enable();
    }
};
TestCase.register("js.tests.lang.OppUnitTests");
