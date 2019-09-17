$package("js.lang");

/**
 * Traverse a collection in natural order. Iterator usage is as follow:
 * 
 * <pre>
 *  var it = collection.it();
 *  while(it.hasNext()) {
 *      // do something with collection item returned by it.next()
 *  }
 * </pre>
 * 
 * On creation, an iterator internal state guarantees that {@link #next()} will return first collection item, of course
 * if underlying collection is not empty. In case collection is empty {@link #hasNext()} first call returns false and
 * above while loop is never executed.
 * 
 * @author Iulian Rotaru
 * @since 1.3
 */
js.lang.Iterator = {
    /**
     * Returns true if this iterator has more items.
     * 
     * @return Boolean true if iterator has more items.
     */
    hasNext : function () {
    },

    /**
     * Return the next collection item.
     * 
     * @return Object next collection item.
     */
    next : function () {
    }
};