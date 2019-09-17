$package("js.tests.template");

js.tests.template.ConditionalExpressionUnitTests = {
    testPositiveNotEmpty : function () {
        this.exercise("booleanValue", true);
        this.exercise("byteValue", true);
        this.exercise("shortValue", true);
        this.exercise("intValue", true);
        this.exercise("longValue", true);
        this.exercise("doubleValue", true);
        this.exercise("date", true);
        this.exercise("string", true);
        this.exercise("state", true);
        this.exercise("array.0", true);
    },

    testNegativeNotEmpty : function () {
        this.exercise("emptyString", false);
        this.exercise("emptyArray", false);
        this.exercise("nullArray", false);
    },

    testPositiveEmpty : function () {
        this.exercise("!emptyString", true);
        this.exercise("!emptyArray", true);
        this.exercise("!nullArray", true);
    },

    testNegativeEmpty : function () {
        this.exercise("!booleanValue", false);
        this.exercise("!byteValue", false);
        this.exercise("!shortValue", false);
        this.exercise("!intValue", false);
        this.exercise("!longValue", false);
        this.exercise("!doubleValue", false);
        this.exercise("!date", false);
    },

    testPositiveEqualsBoolean : function () {
        this.exercise("booleanValue=true", true);
    },

    testNegativeEqualsBoolean : function () {
        this.exercise("booleanValue=false", false);
    },

    testPositiveEqualsString : function () {
        this.exercise("string=String value.", true);
    },

    testNegativeEqualsString : function () {
        this.exercise("string=String value;", false);
    },

    testPositiveNotEqualsString : function () {
        this.exercise("!string=String value;", true);
    },

    testNegativeNotEqualsString : function () {
        this.exercise("!string=String value.", false);
    },

    testPositiveEqualsEnum : function () {
        this.exercise("state=ACTIVE", true);
    },

    testNegativeEqualsEnum : function () {
        this.exercise("state=DISABLED", false);
    },

    testPositiveNotEqualsEnum : function () {
        this.exercise("!state=DISABLED", true);
    },

    testNegativeNotEqualsEnum : function () {
        this.exercise("!state=ACTIVE", false);
    },

    testPositiveEqualsNumber : function () {
        this.exercise("byteValue=19", true);
        this.exercise("shortValue=1964", true);
        this.exercise("intValue=19640315", true);
        this.exercise("longValue=1964031514", true);
        this.exercise("doubleValue=3.14", true);
    },

    testNegativeEqualsNumber : function () {
        this.data.byteValue = 18;
        this.data.shortValue = 1963;
        this.data.intValue = 19640314;
        this.data.longValue = 1964031513;
        this.data.doubleValue = 3.13;

        this.exercise("byteValue=19", false);
        this.exercise("shortValue=1964", false);
        this.exercise("intValue=19640315", false);
        this.exercise("longValue=1964031514", false);
        this.exercise("doubleValue=3.14", false);
    },

    testPositiveNotEqualsNumber : function () {
        this.exercise("!byteValue=18", true);
        this.exercise("!shortValue=1963", true);
        this.exercise("!intValue=19640314", true);
        this.exercise("!longValue=1964031513", true);
        this.exercise("!doubleValue=3.13", true);
    },

    testPositiveLessThanNumber : function () {
        this.exercise("byteValue<20", true);
        this.exercise("shortValue<1965", true);
        this.exercise("intValue<19640316", true);
        this.exercise("longValue<1964031515", true);
        this.exercise("doubleValue<3.15", true);
    },

    testNegativeLessThanNumber : function () {
        this.exercise("byteValue<19", false);
        this.exercise("shortValue<1964", false);
        this.exercise("intValue<19640315", false);
        this.exercise("longValue<1964031514", false);
        this.exercise("doubleValue<3.14", false);
    },

    testPositiveGreaterThanNumber : function () {
        this.exercise("byteValue>18", true);
        this.exercise("shortValue>1963", true);
        this.exercise("intValue>19640314", true);
        this.exercise("longValue>1964031513", true);
        this.exercise("doubleValue>3.13", true);
    },

    testNegativeGreaterThanNumber : function () {
        this.exercise("byteValue>19", false);
        this.exercise("shortValue>1964", false);
        this.exercise("intValue>19640315", false);
        this.exercise("longValue>1964031514", false);
        this.exercise("doubleValue>3.14", false);
    },

    testPositiveEqualsDate : function () {
        this.exercise("date=1964-03-15T13:40:00Z", true);

        this.exercise("date=1964", true);
        this.exercise("date=1964-03", true);
        this.exercise("date=1964-03-15", true);
        this.exercise("date=1964-03-15T13", true);
        this.exercise("date=1964-03-15T13:40", true);
        this.exercise("date=1964-03-15T13:40:00", true);
    },

    testPositiveLessThanDate : function () {
        this.exercise("date<1964-03-15T13:40:01Z", true);

        this.exercise("date<1965", true);
        this.exercise("date<1964-04", true);
        this.exercise("date<1964-03-16", true);
        this.exercise("date<1964-03-15T14", true);
        this.exercise("date<1964-03-15T13:41", true);
        this.exercise("date<1964-03-15T13:40:01", true);
    },

    testPositiveGreaterThanDate : function () {
        this.exercise("date>1964-03-15T13:39:59Z", true);

        this.exercise("date>1963", true);
        this.exercise("date>1964-02", true);
        this.exercise("date>1964-03-14", true);
        this.exercise("date>1964-03-15T12", true);
        this.exercise("date>1964-03-15T13:39", true);
        this.exercise("date>1964-03-15T13:39:59", true);
    },

    testInvalidExpression : function (context) {
        context.push("$warn");

        var invocations = 0;
        $warn = function () {
            ++invocations;
        };

        this.exercise("string<some value", false);
        this.exercise("string>some value", false);
        this.exercise("intValue=", false);
        this.exercise("date=1964-03-15 14:30:00", false);
        this.exercise("booleanValue=yes", false);
        this.exercise("string;value", false);
        this.exercise("string=", false);

        assertEquals(7, invocations);
    },

    exercise : function (expression, expected) {
        var content = new js.dom.template.Content(this.data);
        var conditionalExpression = new js.dom.template.ConditionalExpression(content, this.data, expression);
        assertEquals(expected, conditionalExpression.value());
    },

    State : {
        NONE : "NONE",
        ACTIVE : "ACTIVE",
        DISABLED : "DISABLED"
    },

    before : function () {
        this.data = {
            booleanValue : true,
            byteValue : 19,
            shortValue : 1964,
            intValue : 19640315,
            longValue : 1964031514,
            doubleValue : 3.14,
            string : "String value.",
            state : this.State.ACTIVE,
            date : null,
            year : null,
            month : null,
            day : null,
            hour : null,
            minute : null,
            emptyString : null,
            nullArray : null,
            emptyArray : [],
            array : [ "zero", "one" ]
        };

        this.data.date = new Date(Date.UTC(1964, 2, 15, 13, 40, 0));
        this.data.minute = new Date(Date.UTC(1964, 2, 15, 13, 40, 0));
        this.data.hour = new Date(Date.UTC(1964, 2, 15, 13, 0, 0));
        this.data.day = new Date(Date.UTC(1964, 2, 15, 0, 0, 0));
        this.data.month = new Date(Date.UTC(1964, 2, 1, 0, 0, 0));
        this.data.year = new Date(Date.UTC(1964, 0, 1, 0, 0, 0));
    }
};
TestCase.register("js.tests.template.ConditionalExpressionUnitTests");
