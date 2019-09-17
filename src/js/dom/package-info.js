/**
 * Simplified DOM interfaces. This package is loosely based on W3C DOM interface, following the same abstractions of
 * document, element, attribute and so on, but simplified. In this package concept a document is a tree of elements and
 * has a root. An element has a tag name and possible other elements as children. Also an element may have ID,
 * attributes and text. Basically, classes from this package are adapters wrapping W3C DOM Node objects.
 * <p>
 * This package purpose is to hide low level abstractions as node, node type, node list, etc. while focusing on element
 * as a basic construct. Also attribute and text nodes are replaced by simple strings. Finally, document type,
 * processing instruction and comment nodes are not included in this package interface.
 * 
 * @author Iulian Rotaru
 * @version 1.0
 */
$package('js.dom');
