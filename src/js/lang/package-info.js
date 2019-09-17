/**
 * Language support. This package contains interfaces, classes and exceptions not
 * tied to a specific host environment. They are used for language extension.
 *
 * <p>j(s) language is a syntactically constrained dialect of ECMAScript with couple
 * semantic extensions like package, class, etc., some pseudo-operators like $extends
 * and naming conventions. Aforementioned constrains applies only on code overall
 * structure but not at statement block level. Functional and reflexive ECMAScript
 * features are preserved and actually used extensively throughout j(s)-library.
 * Note that j(s) language is fully compatible at syntax level with ECMAScript,
 * it is merely a subset. For this reason it can be interpreted by any user agent
 * compliant with ECMAScript. A short description of language constructs follows.
 *
 * <p>Compilation unit. A compilation unit is a script source file; it has the standard
 * .js extension. Every compilation unit starts with package statement followed by
 * exactly one type declaration. May have inner type declarations and legacy statement.
 * Legacy statement block is used to adapt type declaration(s) from this compilation
 * unit to non-standard environment.
 * <pre>
 * 	compilation-unit :== package-statement type-declaration inner-type-declaration* [legacy-statement]
 * </pre>
 *
 * <p>Type declaration.
 * <pre>
 *	type-declaration :== (class-declaration | utility-declaration | enum-declaration)
 * </pre>
 *
 * <p>Class declaration.
 * <pre>
 *	class-declaration :== constructor-declaration class-member-declaration* class-body-declaration extends-statement
 *	constructor-declaration :== apidoc class-name "=" "function" "(" [parameter-list] ")" "{" statement-block "}" ";"
 *	class-member-declaration :== class-field-declaration | class-method-declaration
 *	class-field-declaration :== apidoc class-name "." member-name "=" expression ";"
 *	class-method-declaration := apidoc class-name "." member-name "=" "function" "(" [parameter-list] ")" "{" statement-block "}" ";"
 *	class-body-declaration :== class-name "." "prototype" "=" "{" (constant-declaration ",")* (method-declaration [","])+ "}" ";"
 * </pre>
 *
 * <p>Utility declaration.
 * <pre>
 *	utility-declaration :== apidoc class-name "=" "{" constant-declaration* method-declaration+ "}" ";"
 * </pre>
 *
 * <p>Enum declaration.
 * <pre>
 *	enum-declaration :== class-name "=" "{" apidoc constant-identifier ":" <literal> [","] "}" ";"
 * </pre>
 *
 * <p>Statements.
 * <pre>
 * 	package-statement ::= "$package" "(" package-name ")" ";"
 * 	extends-statement :== "$extends" "(" class-name "," class-name ")" ";"
 * 	legacy-statement :== "$legacy" "(" boolean-expression "," "function" "(" ")" "{" statement-block "}" ")" ";"
 * </pre>
 *
 * <p>Annotations.
 * <pre>
 *	type-annotation :== "@type" type-name
 *	param-annotation :== "@param" type-name param-identifier description
 *	return-annotation :== "@return" type-name [description]
 *	assert-annotation :== "@assert" description
 * </pre>
 *
 * <p>Names. One may observer that allowed letters in j(s)-script language is limited
 * to ASCII set. This may sound as a restriction but is a conscious decission. j(s)
 * encourage code portability by using English names.
 * <pre>
 *	type-name :== built-in-type | class-name
 * 	class-name :== package-name "." class-identifier
 * 	inner-class-name :== package-name "." class-identifier "." class-identifier
 * 	package-name :== package-name "." package-identified
 * 	member-name :== constant-identifier | member-identifier
 * 	package-identifier :== "a..z" ("a..z" "0..9")*
 * 	class-identifier :== ["_"] "A..Z" ("a..z" "A..Z" "0..9")*
 * 	constant-identifier :== ["_"] ("A..Z" "_")+
 * 	member-identifier :== ["_"] "a..z" ("a..z" "A..Z" )*
 *	param-identifier :== "a..z" ("a..z" "A..Z" "0..9")*
 * </pre>
 *
 * @author Iulian Rotaru
 * @since 1.0
 */
$package('js.lang');
