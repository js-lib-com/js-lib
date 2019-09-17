$package('js.net');

/**
 * HTTP request method. HTTP 1.1 defines nine methods, also referred to as <em>verbs</em>, indicating the desired
 * action to be performed on the identified resource. Anyway j(s)-lib implementation does not uses CONNECT, TRACE and
 * TRACK considered unsafe.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.net.Method = {
	/**
	 * The DELETE method requests that the origin server delete the resource identified by the Request-URI.
	 * 
	 * @type String
	 */
	DELETE : 'DELETE',

	/**
	 * The GET method means retrieve whatever information (in the form of an entity) is identified by the Request-URI.
	 * 
	 * @type String
	 */
	GET : 'GET',

	/**
	 * The HEAD method is identical to GET except that the server MUST NOT return a message-body in the response.
	 * 
	 * @type String
	 */
	HEAD : 'HEAD',

	/**
	 * The OPTIONS method represents a request for information about the communication options available on the
	 * request/response chain identified by the Request-URI.
	 * 
	 * @type String
	 */
	OPTIONS : 'OPTIONS',

	/**
	 * The POST method is used to request that the origin server accept the entity enclosed in the request as a new
	 * subordinate of the resource identified by the Request-URI in the Request-Line.
	 * 
	 * @type String
	 */
	POST : 'POST',

	/**
	 * The PUT method requests that the enclosed entity be stored under the supplied Request-URI.
	 * 
	 * @type String
	 */
	PUT : 'PUT'
};
