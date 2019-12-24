$package("js.dom.template");

/**
 * Conditional expression evaluator. A conditional expression has a mandatory property path, an operator opcode and an
 * operand. Property path is used to get content value and opcode to enact specific evaluation logic. Evaluation process
 * usually uses two parameters: content value determined by property path and operand from expression.
 * <p>
 * Usage pattern is as follow: create instance, parse expression and use returned property path to get content value
 * then evaluate it.
 * 
 * <pre>
 * ConditionalExpression conditionalExpression = new ConditionalExpression(content, scope, expression);
 * if(conditionalExpression.value()) {
 *   // logic executed if conditional expression is true
 * }
 * </pre>
 * 
 * <h4>Conditional Expression Syntax</h4>
 * 
 * <pre>
 *  conditional-expression = [ not ] property-path [ opcode operand ]
 *  not = '!' ; ! prefix at expression start negate boolean result
 *  property-path = java-name
 *  opcode = '=' / '<' / '>' ; note that opcode cannot be any valid java-name character
 *  java-name = ( 'a'...'z' / '$' / '_' ) *( 'a'...'z' / 'A'...'Z' / '0'...'9' / '$' / '_' )
 * </pre>
 * 
 * Here are couple example of working conditional expressions and parsed components. Although only one negated
 * expression is presented please note that exclamation market prefix can be used with any operator.
 * <p>
 * <table border="1" style="border-collapse:collapse;">
 * <tr>
 * <td><b>Expression
 * <td><b>True Condition
 * <td><b>Opcode
 * <td><b>Property Path
 * <td><b>Operand
 * <tr>
 * <td>flag
 * <td><code>flag</code> is a boolean value and is <code>true</code>
 * <td>NOT_EMPTY
 * <td>flag
 * <td>null
 * <tr>
 * <td>!description
 * <td><code>description</code> is a string and is null
 * <td>NOT_EMPTY
 * <td>description
 * <td>null
 * <tr>
 * <td>type=DIRECTORY
 * <td><code>type</code> is an enumeration and its values is <code>DIRECTORY</code>
 * <td>EQUALS
 * <td>type
 * <td>DIRECTORY
 * <tr>
 * <td>loadedPercent<0.9
 * <td><code>loadedPercent</code> is a double value [0, 1) and its values is less than 0.9
 * <td>LESS_THAN
 * <td>loadedPercent
 * <td>0.9
 * <tr>
 * <td>birthDay>1980-01-01T00:00:00Z
 * <td><code>birthDay</code> is a date and its value is after 1980, January 1-st
 * <td>GREATER_THAN
 * <td>birthDay
 * <td>1980-01-01T00:00:00Z </table>
 * <p>
 * See {@link js.dom.template.ConditionalExpression.Opcode} for supported operators.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 * @constructor Construct conditional expression instance and initialize internal state from given expression.
 * @param js.dom.template.Content content content bound to templates engine instance,
 * @param Object scope current content scope,
 * @param String expression expression source string.
 * @assert arguments are not undefined or null.
 */
js.dom.template.ConditionalExpression = function (content, scope, expression) {
    $assert(content, "js.dom.template.ConditionalExpression#ConditionalExpression", "Content argument is undefined or null.");
    $assert(scope, "js.dom.template.ConditionalExpression#ConditionalExpression", "Scope argument is undefined or null.");
    $assert(expression, "js.dom.template.ConditionalExpression#ConditionalExpression", "Expression argument is undefined, null or empty.");

    /**
	 * Source string for this conditional expression, mainly for debugging.
	 * 
	 * @type String
	 */
    this._expression = expression;

    /**
	 * Expression evaluation value.
	 * 
	 * @type Boolean
	 */
    this._value = false;

    this._statements = [];
    // parse expression and store statements
    this._parse(expression);

    for (var i = 0, statement, value; i < this._statements.length; ++i) {
        statement = this._statements[i];
        if (statement.opcode === js.dom.template.ConditionalExpression.Opcode.NONE) {
            continue;
        }
        $assert(statement.propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.ConditionalExpression#_exec", "Scope is not an object.");
        
        // HACK: bugfix
        // content.getValue() return null if object property is null but throws exception if object property is undefined
        // this logic need to handle both null and undefined conditions the same way 
        try {
        	value = content.getValue(scope, statement.propertyPath);
        }
        catch(exception) {
        	value = null;
        }

        this._value = this._evaluate(statement, value);
        if (!this._value) {
            break;
        }
    }
};

js.dom.template.ConditionalExpression.prototype = {
    /**
	 * Return this conditional expression boolean value.
	 * 
	 * @return this conditional expression value.
	 */
    value: function () {
        return this._value;
    },

    /**
	 * Parse stored expression string and initialize instance state. This method is in fact a morphological parser, i.e.
	 * a lexer. It just identifies expression components and initialize internal state. Does not check validity; all
	 * <em>insanity</em> tests are performed by {@link #_evaluate(Object)} counterpart.
	 * 
	 * @param String expression conditional expression.
	 */
    _parse: function (expression) {
        var State = js.dom.template.ConditionalExpression.State;
        var Opcode = js.dom.template.ConditionalExpression.Opcode;

        var builder; // leave builder undefined since it is prepared on every new statement
        var statement; // reference to current statement from this._statements[statementsIndex]
        var statementsIndex = -1; // on every new statement index is incremented so -1 prepares for first increment
        var state = State.STATEMENT;

        for (var i = 0, c; i < expression.length; ++i) {
            c = expression.charAt(i);

            switch (state) {
                case State.STATEMENT:
                    builder = "";
                    ++statementsIndex;

                    this._statements[statementsIndex] = new js.dom.template.ConditionalExpression.Statement();
                    statement = this._statements[statementsIndex];

                    state = State.PROPERTY_PATH;
                    if (c === '!') {
                        statement.not = true;
                        break;
                    }
                // if not negation character fall through next case

                case State.PROPERTY_PATH:
                    if (this._isPropertyPathChar(c)) {
                        builder += c;
                        break;
                    }
                    statement.propertyPath = builder;

                    if (c === ';') {
                        statement.opcode = Opcode.NOT_EMPTY;
                        state = State.STATEMENT;
                        break;
                    }

                    builder = "";
                    statement.opcode = Opcode.forChar(c);
                    state = State.OPERAND;
                    break;

                case State.OPERAND:
                    if (c === ';') {
                        statement.operand = builder;
                        state = State.STATEMENT;
                        break;
                    }
                    builder += c;
                    break;

                default:
                    $assert(false, "js.dom.template.ConditionalExpression#parse", "Illegal state.");
            }
        }

        // completes current statement properties when all characters from expression was read
        if (state == State.PROPERTY_PATH) {
            statement.propertyPath = builder;
            statement.opcode = Opcode.NOT_EMPTY;
        }
        else {
            if (builder) {
                // operand string builder may be empty if operand is missing, e.g. 'value='
                statement.operand = builder;
            }
        }
    },

    /**
	 * Pattern for Java identifiers.
	 * 
	 * @type RegExp
	 */
    JAVA_IDENTIFIER: /[a-zA-Z0-9._$-]/,

    /**
	 * Test if character is a valid property path character. Returns true if <code>char</code> is letter, digit, dot,
	 * underscore or dollar sign.
	 * 
	 * @param String char character to test.
	 * @return Boolean true if <code>char</code> is a valid Java identifier part.
	 */
    _isPropertyPathChar: function (char) {
        return this.JAVA_IDENTIFIER.test(char);
    },

    /**
	 * Evaluate this conditional expression against given object value. Execute this conditional expression operator on
	 * given <code>object</code> value and {@link #_operand} defined by expression. Evaluation is executed after
	 * {@link #_parse(String)} counter part that already initialized this conditional expression internal state. This
	 * method takes care to test internal state consistency and returns false if bad; so an invalid expression evaluates
	 * to false.
	 * 
	 * @param js.dom.template.ConditionalExpression.Statement statement parsed statement to evaluate,
	 * @param Object object value to evaluate, possible null.
	 * @return Boolean true if this conditional expression is positively evaluated.
	 * @assert <code>object</code> argument is not undefined or null.
	 */
    _evaluate: function (statement, object) {
        $assert(typeof object !== "undefined", "js.dom.template.ConditionalExpression#evaluate", "Object argument is undefined or null.");

        if (statement.opcode === js.dom.template.ConditionalExpression.Opcode.INVALID) {
            $warn("js.dom.template.ConditionalExpression#evaluate", "Invalid conditional expression |%s|. Not supported opcode.", this._expression);
            return false;
        }
        var processor = this._getProcessor(statement.opcode);

        if (statement.operand === null && !processor.acceptNullOperand()) {
            $warn("js.dom.template.ConditionalExpression#evaluate", "Invalid conditional expression |%s|. Missing mandatory operand for operator |%s|.", this._expression, statement.opcode);
            return false;
        }
        if (!processor.acceptValue(object)) {
            $warn("js.dom.template.ConditionalExpression#evaluate", "Invalid conditional expression |%s|. Operator |%s| does not accept value type |%s|.", this._expression, statement.opcode, object);
            return false;
        }
        if (statement.operand !== null && !js.dom.template.ConditionalExpression.OperandFormatValidator.isValid(object, statement.operand)) {
            $warn("js.dom.template.ConditionalExpression#evaluate", "Invalid conditional expression |%s|. Operand does not match value type |%s|.", this._expression, object);
            return false;
        }

        var value = processor.evaluate(object, statement.operand);
        $assert(js.lang.Types.isBoolean(value), "js.dom.template.ConditionalExpression#evaluate", "Operator processor returned value is not boolean.");
        return statement.not ? !value : value;
    },

    /**
	 * Operator processors cache. Store processor instance for specific opcode.
	 * 
	 * @type Object
	 */
    _processors: {},

    /**
	 * Return processor suitable for requested operator. Returned processor instance is a singleton, that is, reused on
	 * running script engine.
	 * 
	 * @param js.dom.template.ConditionalExpression.Opcode opcode of the requested operator.
	 * @return js.dom.template.ConditionalExpression.Processor operator processor instance.
	 */
    _getProcessor: function (opcode) {
        var processor = this._processors[opcode];
        var ConditionalExpression = js.dom.template.ConditionalExpression;

        if (typeof processor === "undefined") {
            switch (opcode) {
                case ConditionalExpression.Opcode.NOT_EMPTY:
                    processor = new ConditionalExpression.NotEmptyProcessor();
                    break;

                case ConditionalExpression.Opcode.EQUALS:
                    processor = new ConditionalExpression.EqualsProcessor();
                    break;

                case ConditionalExpression.Opcode.LESS_THAN:
                    processor = new ConditionalExpression.LessThanProcessor();
                    break;

                case ConditionalExpression.Opcode.GREATER_THAN:
                    processor = new ConditionalExpression.GreaterThanProcessor();
                    break;

                default:
                    $assert(false, "js.dom.template.ConditionalExpression#_getProcessor", "Illegal state.");
            }
            this._processors[opcode] = processor;
        }

        return processor;
    },

    /**
	 * Class string representation.
	 * 
	 * @return String class string representation.
	 */
    toString: function () {
        return "js.dom.template.ConditionalExpression";
    }
};
$extends(js.dom.template.ConditionalExpression, Object);

/**
 * Operator opcodes supported by current conditional expression implementation. Operators always operates on content
 * value identified by {@link js.dom.template.ConditionalExpression#_propertyPath} and optional
 * {@link js.dom.template.ConditionalExpression#_operand}.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 */
js.dom.template.ConditionalExpression.Opcode = {
    /**
	 * Neutral value.
	 */
    NONE: 0,

    /**
	 * Invalid character code. Parser uses this opcode when discover a not supported character code for opcode.
	 */
    INVALID: 1,

    /**
	 * Value if not empty. A value is empty if is null, empty string, boolean false, zero value number, collection or
	 * array with zero size. It is implemented by {@link js.dom.template.ConditionalExpression.NotEmptyProcessor}.
	 */
    NOT_EMPTY: 2,

    /**
	 * Value and operand are equal. It is implemented by {@link js.dom.template.ConditionalExpression.EqualsProcessor}.
	 */
    EQUALS: 3,

    /**
	 * Value is strictly less than operand. It is implemented by
	 * {@link js.dom.template.ConditionalExpression.LessThanProcessor}.
	 */
    LESS_THAN: 4,

    /**
	 * Value is strictly greater than operand. It is implemented by
	 * {@link js.dom.template.ConditionalExpression.GreaterThanProcessor}.
	 */
    GREATER_THAN: 5
};

js.dom.template.ConditionalExpression.Statement = function () {
    /**
	 * Evaluated value negation flag. If true {@link #evaluate(Object)} applies boolean <code>not</code> on returned
	 * value. This flag is true if expression starts with exclamation mark.
	 * 
	 * @type Boolean
	 */
    this.not = false;

    /**
	 * The property path of the content value to evaluate this conditional expression against. See package API for
	 * object property path description. This value is extracted from given expression and is the only mandatory
	 * component.
	 * 
	 * @type String
	 */
    this.propertyPath = null;

    /**
	 * Optional expression operator opcode, default to {@link js.dom.template.ConditionalExpression.Opcode#NOT_EMPTY}.
	 * This opcode is used to select the proper expression {@link js.dom.template.ConditionalExpression.Processor}.
	 * 
	 * @type js.dom.template.ConditionalExpression.Opcode
	 */
    this.opcode = js.dom.template.ConditionalExpression.Opcode.NONE;

    /**
	 * Operator operand, mandatory only if {@link js.dom.template.ConditionalExpression.Processor#acceptNullOperand()}
	 * requires it. This is the second term of expression evaluation logic; the first is the content value determined by
	 * property path.
	 * 
	 * @type String
	 */
    this.operand = null;
};

/**
 * Returns the opcode encoded by given character code. Current implementation encode opcode with a single character. If
 * given <code>code</code> is not supported returns INVALID.
 * 
 * @param String code opcode character code.
 * @return js.dom.template.ConditionalExpression.Opcode opcode specified by given <code>code</code> or INVALID.
 */
js.dom.template.ConditionalExpression.Opcode.forChar = function (code) {
    switch (code) {
        case '=':
            return js.dom.template.ConditionalExpression.Opcode.EQUALS;
        case '<':
            return js.dom.template.ConditionalExpression.Opcode.LESS_THAN;
        case '>':
            return js.dom.template.ConditionalExpression.Opcode.GREATER_THAN;
    }
    return js.dom.template.ConditionalExpression.Opcode.INVALID;
};

/**
 * Parser state machine.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 */
js.dom.template.ConditionalExpression.State = {
    /** Neutral value. */
    NONE: 0,

    /** Start of a statement. */
    STATEMENT: 1,

    /** Building property path. */
    PROPERTY_PATH: 2,

    /** Building operand. */
    OPERAND: 3
};

/**
 * Every conditional expression operator implements this processor interface. A processor implements the actual
 * evaluation logic, see {@link #evaluate(Object, String)}. Evaluation always occurs on a content value designated by
 * property path and an optional operand, both described by conditional expression. Value is always first and is
 * important on order based operators, e.g. on LESS_THAN value should be less than operand.
 * <p>
 * Operand can miss in which case evaluation consider only the value, for example, NOT_EMPTY test value emptiness.
 * <p>
 * Processor interface provides also predicates to test if implementation supports null operand and if certain value is
 * acceptable for processing.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 */
js.dom.template.ConditionalExpression.Processor = {
    /**
	 * Apply evaluation specific logic to given value and optional operand.
	 * 
	 * @param Object value value to evaluate, possible null,
	 * @param String operand optional operand to evaluate value against, default to null.
	 * @return Boolean evaluation logic result.
	 */
    evaluate: function (value, operand) {
    },

    /**
	 * Test if processor implementation accepts null operand. It is a templates exception if operator processor does not
	 * accept null operand and expression do not include it.
	 * 
	 * @return Boolean true if this processor accepts null operand.
	 */
    acceptNullOperand: function () {
    },

    /**
	 * Test performed just before evaluation to determine if given value can be processed. Most common usage is to
	 * consider value type; for example LESS_THAN operator cannot handle boolean values.
	 * 
	 * @param Object value value to determine if processable.
	 * @return Boolean true if given <code>value</code> can be evaluated by this processor.
	 */
    acceptValue: function (value) {
    }
};

/**
 * Operator processor for not empty value test.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 * @constructor Construct processor instance for not empty value test.
 */
js.dom.template.ConditionalExpression.NotEmptyProcessor = function () {
};

js.dom.template.ConditionalExpression.NotEmptyProcessor.prototype = {
    /**
	 * Return true is given content value is not empty. This method relies on language implicit conversion to
	 * {@link Boolean} and assume that null values, zero numbers and empty strings are all converted to
	 * <code>false</code>. Also this method test if array or object is empty, of course accordingly
	 * <code>value</code> type.
	 * 
	 * @param Object value content value of any primitive or compound type,
	 * @param String operand unused operand.
	 * @return Boolean true is <code>value</code> is not empty.
	 */
    evaluate: function (value, operand) {
        if (js.lang.Types.isArray(value)) {
            return value.length > 0;
        }
        if (js.lang.Types.isStrictObject(value)) {
            for (var prop in value) {
                if (value.hasOwnProperty(prop)) {
                    return true;
                }
            }
            return JSON.stringify(value) !== JSON.stringify({});
        }
        return Boolean(value);
    },

    /**
	 * Not empty value processor uses only content value and does not require operand.
	 * 
	 * @return Boolean always true.
	 */
    acceptNullOperand: function () {
        return true;
    },

    /**
	 * Accepts all values and this predicate is always true.
	 * 
	 * @param Object value unused content value.
	 * @return Boolean always true.
	 */
    acceptValue: function (value) {
        return true;
    }
};
$extends(js.dom.template.ConditionalExpression.NotEmptyProcessor, Object);
$implements(js.dom.template.ConditionalExpression.NotEmptyProcessor, js.dom.template.ConditionalExpression.Processor);

/**
 * Equality operator processor.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 * @constructor Construct equality processor instance.
 */
js.dom.template.ConditionalExpression.EqualsProcessor = function () {
};

js.dom.template.ConditionalExpression.EqualsProcessor.prototype = {
    /**
	 * Implements equality test logic. This method uses language support to convert <code>operand</code> to an object
	 * compatible with given <code>value</code> then perform not strict equality test. If content value is a
	 * {@link Date} delegates {@link #_evaluateDates(Date, String)}.
	 * 
	 * @param Object value content value,
	 * @param String operand expression operand.
	 * @return Boolean true if <code>value</code> and <code>operand</code> are equal.
	 */
    evaluate: function (value, operand) {
        if (value === null) {
            return operand === "null";
        }
        if (js.lang.Types.isBoolean(value)) {
            return operand === (value ? "true" : "false");
        }
        if (js.lang.Types.isDate(value)) {
            return this._evaluateDate(value, operand);
        }
        return value == operand;
    },

    /**
	 * Test if date instance is equal with that described by given date format. Date format is ISO8601 but with optional
	 * fields. Equals test is performed only on date field present in given <code>dateFormat</code>; other fields are
	 * simply ignored.
	 * 
	 * @param Date date instance,
	 * @param String dateFormat date format.
	 * @return Boolean true if dates are equal.
	 */
    _evaluateDate: function (date, dateFormat) {
        var dateItems = js.dom.template.ConditionalExpression.Dates.dateItems(date);
        var matcher = js.dom.template.ConditionalExpression.Dates.dateMatcher(dateFormat);
        for (var i = 0, value; i < dateItems.length; ++i) {
            value = matcher[i + 1];
            if (!value) {
                break;
            }
            if (dateItems[i] !== parseInt(value)) {
                return false;
            }
        }
        return true;
    },

    /**
	 * Always returns false because equals processor requires not null operand.
	 * 
	 * @return Boolean always false.
	 */
    acceptNullOperand: function () {
        return false;
    },

    /**
	 * Equals processor accepts all values and this predicate is always true.
	 * 
	 * @param Object value unused content value.
	 * @return Boolean always true.
	 */
    acceptValue: function (value) {
        return true;
    }
};
$extends(js.dom.template.ConditionalExpression.EqualsProcessor, Object);
$implements(js.dom.template.ConditionalExpression.EqualsProcessor, js.dom.template.ConditionalExpression.Processor);

/**
 * Base class for inequality comparisons.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 * @constructor construct comparison processor instance.
 */
js.dom.template.ConditionalExpression.ComparisonProcessor = function () {
};

js.dom.template.ConditionalExpression.ComparisonProcessor.prototype = {
    /**
	 * Apply specific comparison on given value and operand. This method convert <code>operand</code> to object and
	 * delegate {@link #compare(Object, Object)} abstract method.
	 * 
	 * @param Object value content value,
	 * @param String operand expression operand value.
	 * @return Boolean value returned by delegated subclass.
	 */
    evaluate: function (value, operand) {
        if (js.lang.Types.isNumber(value)) {
            return this.compare(value, Number(operand));
        }
        if (js.lang.Types.isDate(value)) {
            return this.compare(value, js.dom.template.ConditionalExpression.Dates.parse(operand));
        }
        return false;
    },

    /**
	 * Comparator for content value and expression operand. Subclass should implement this abstract method and supply
	 * specific logic.
	 * 
	 * @param Object value numeric value,
	 * @param Object operand numeric operand.
	 * @return Boolean true if value and operand fulfill comparator criterion.
	 */
    compare: function (value, operand) {
    },

    /**
	 * Test if processor implementation accepts null operand. All comparison processors always require not null operand
	 * and return false.
	 * 
	 * @return Boolean always false.
	 */
    acceptNullOperand: function () {
        return false;
    },

    /**
	 * Test performed just before evaluation to determine if given value can be processed. Current implementations of
	 * comparison processor accept numbers and dates.
	 * 
	 * @param Object value content value to test.
	 * @return Boolean true if <code>value</code> is a {@link Number} or a {@link Date}.
	 */
    acceptValue: function (value) {
        if (js.lang.Types.isNumber(value)) {
            return true;
        }
        if (js.lang.Types.isDate(value)) {
            return true;
        }
        return false;
    }
};
$extends(js.dom.template.ConditionalExpression.ComparisonProcessor, Object);
$implements(js.dom.template.ConditionalExpression.ComparisonProcessor, js.dom.template.ConditionalExpression.Processor);

/**
 * Comparison processor implementation for <code>LESS_THAN</code> operator.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 * @constructor Construct processor instance for <code>LESS_THAN</code> operator.
 */
js.dom.template.ConditionalExpression.LessThanProcessor = function () {
};

js.dom.template.ConditionalExpression.LessThanProcessor.prototype = {
    /**
	 * Return true if value is strictly less than operand.
	 * 
	 * @param Object value content value,
	 * @param String operand operand value.
	 * @return Boolean true if <code>value</code> is less than <code>operand</code>.
	 */
    compare: function (value, operand) {
        return value < operand;
    }
};
$extends(js.dom.template.ConditionalExpression.LessThanProcessor, js.dom.template.ConditionalExpression.ComparisonProcessor);

/**
 * Comparison processor implementation for <code>GREATER_THAN</code> operator.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 * @constructor Construct processor instance for <code>GREATER_THAN</code> operator.
 */
js.dom.template.ConditionalExpression.GreaterThanProcessor = function () {
};

js.dom.template.ConditionalExpression.GreaterThanProcessor.prototype = {
    /**
	 * Return true if value is strictly greater than operand.
	 * 
	 * @param Object value content value,
	 * @param String operand operand value.
	 * @return Boolean true if <code>value</code> is greater than <code>operand</code>.
	 */
    compare: function (value, operand) {
        return value > operand;
    }
};
$extends(js.dom.template.ConditionalExpression.GreaterThanProcessor, js.dom.template.ConditionalExpression.ComparisonProcessor);

/**
 * Utility class for operand format validation. Operand is a string and has a specific format that should be compatible
 * with value type. For example if value is a date operand should be ISO8601 date format. A null operand is not
 * compatible with any value.
 * <p>
 * Current validator implementation recognizes boolean, number and date types. All other value types are not on scope of
 * this validator and always return positive. For supported types see this class regular expression patterns.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 */
js.dom.template.ConditionalExpression.OperandFormatValidator = {
    /**
	 * Date format should be ISO8601 with UTC time zone, <code>dddd-dd-ddTdd:dd:ddZ</code>.
	 * 
	 * @type RegExp
	 */
    DATE_PATTERN: /^\d{4}(?:-\d{2}(?:-\d{2}(?:T\d{2}(?::\d{2}(?::\d{2}(?:Z)?)?)?)?)?)?$/,

    /**
	 * Signed numeric decimal number but not scientific notation.
	 * 
	 * @type RegExp
	 */
    NUMBER_PATTERN: /^[+-]?\d+(?:\.\d+)?$/,

    /**
	 * Boolean operand should be <code>true</code> or <code>false</code>, lower case.
	 * 
	 * @type RegExp
	 */
    BOOLEAN_PATTERN: /^true|false$/,

    /**
	 * Check operand format compatibility against value counterpart.
	 * 
	 * @param Object value content value to validate operand against,
	 * @param String operand formatted string operand.
	 * @return Boolean true if <code>operand</code> format is compatible with requested <code>value</code>.
	 */
    isValid: function (value, operand) {
        if (!operand) {
            return false;
        }
        if (js.lang.Types.isBoolean(value)) {
            return this.BOOLEAN_PATTERN.test(operand);
        }
        if (js.lang.Types.isNumber(value)) {
            return this.NUMBER_PATTERN.test(operand);
        }
        if (js.lang.Types.isDate(value)) {
            return this.DATE_PATTERN.test(operand);
        }
        return true;
    }
};

/**
 * Utility class for dates related processing.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 */
js.dom.template.ConditionalExpression.Dates = {
    /**
	 * ISO8601 date format pattern but with optional fields. Only year is mandatory. Optional fields should be in
	 * sequence; if an optional field is missing all others after it should also be missing.
	 * 
	 * @type RegExp
	 */
    DATE_PATTERN: /(\d{4})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2})(?::(\d{2})(?::(\d{2})(?:Z)?)?)?)?)?)?/,

    /**
	 * Get a regular expression matcher for ISO8601 date format but with optional fields.
	 * 
	 * @param String dateFormat date format to parse.
	 * @return Array matcher initialized with values from given <code>dateFormat</code>.
	 */
    dateMatcher: function (dateFormat) {
        // at this point date format is already validated and is safe to ignore null matcher
        var matcher = this.DATE_PATTERN.exec(dateFormat);
        $assert(matcher, "js.dom.template.ConditionalExpression.Dates#dateMatcher", "Unexpectable null matcher.");
        return matcher;
    },

    /**
	 * Parse ISO8601 formatted date but accept optional fields. For missing fields uses sensible default values, that
	 * is, minimum value specific to field. For example, default day of the month value is 1.
	 * 
	 * @param String dateFormat date format to parse.
	 * @return Date date instance initialized from given <code>dateFormat</code>.
	 */
    parse: function (dateFormat) {
        var matcher = this.dateMatcher(dateFormat);

        var year = this._group(matcher, 1);
        var month = this._group(matcher, 2);
        var day = this._group(matcher, 3);
        var hours = this._group(matcher, 4);
        var minutes = this._group(matcher, 5);
        var seconds = this._group(matcher, 6);
        var utc = Date.UTC(year, month, day, hours, minutes, seconds);

        return new Date(utc);
    },

    /**
	 * Return normalized integer value for specified matcher group. If requested group value is null uses sensible
	 * default values. Takes care to return 0 for January and 1 for default day of the month; all other fields defaults
	 * to 0.
	 * 
	 * @param Array matcher regular expression matcher,
	 * @param Number group group number.
	 * @return Number integer value extracted from matcher or specific default value.
	 */
    _group: function (matcher, group) {
        var value = matcher[group];
        if (group == 2) {
            // the second group is hard coded to month and should be normalized, January should be 0
            return this._parseInt(value, 1) - 1;
        }
        if (group == 3) {
            // the third group is hard coded to day of month and should default to 1
            return this._parseInt(value, 1);
        }
        // all other groups defaults to 0
        return this._parseInt(value, 0);
    },

    /**
	 * Return integer value from given numeric string or given default if value is null.
	 * 
	 * @param String value numeric value, possible null,
	 * @param Number defaultValue default value used when value is null.
	 * @return Number integer value, parsed or default.
	 */
    _parseInt: function (value, defaultValue) {
        return value ? parseInt(value) : defaultValue;
    },

    /**
	 * Decompose date into its constituent items. Takes care to human normalize month value, that is, January is 1 not
	 * 0.
	 * 
	 * @param Date date date value.
	 * @return Array given <code>date</code> items.
	 */
    dateItems: function (date) {
        var items = new Array(6);

        items[0] = date.getUTCFullYear();
        items[1] = date.getUTCMonth() + 1;
        items[2] = date.getUTCDate();
        items[3] = date.getUTCHours();
        items[4] = date.getUTCMinutes();
        items[5] = date.getUTCSeconds();

        return items;
    }
};
