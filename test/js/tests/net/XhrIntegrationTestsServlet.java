package js.tests.net;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.lang.reflect.Field;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;

@SuppressWarnings("nls")
public class XhrIntegrationTestsServlet extends HttpServlet
{
  private static final long serialVersionUID = 9087049233023998242L;

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
  {
    System.out.println(req.getRequestURI());
    if(!isRequestValid(req, res)) return;
    res.addHeader("X-JSLIB-Version", "j(s)-lib 1.0.0");

    if(req.getRequestURI().contains("get-string")) {
      if(!isContentType(req, "application/json; charset=UTF-8")) {
        sendBadRequest(res, "get-string: bad content type [%s].", req.getHeader("Content-Type"));
        return;
      }
      res.setContentType("text/plain;charset=UTF-8");
      res.getWriter().append("this is a string");
      return;
    }

    if(req.getRequestURI().contains("send-string")) {
      if(!isContentType(req, "text/plain; charset=UTF-8")) {
        sendBadRequest(res, "send-string: bad content type [%s].", req.getHeader("Content-Type"));
        return;
      }
      res.setContentType("text/plain; charset=UTF-8");
      res.getWriter().append(PayloadReader.read(req));
      return;
    }

    if(req.getRequestURI().contains("get-object")) {
      if(!isContentType(req, "application/json; charset=UTF-8")) {
        sendBadRequest(res, "get-object: bad content type [%s].", req.getHeader("Content-Type"));
        return;
      }
      res.setContentType("application/json; charset=UTF-8");
      res.getWriter().append(JSON.stringify(new Person()));
      return;
    }

    if(req.getRequestURI().contains("send-object")) {
      if(!isContentType(req, "application/json; charset=UTF-8")) {
        sendBadRequest(res, "send-object: bad content type [%s].", req.getHeader("Content-Type"));
        return;
      }
      res.setContentType("application/json; charset=UTF-8");
      res.getWriter().append(PayloadReader.read(req));
      return;
    }

    if(req.getRequestURI().contains("get-xml")) {
      if(!isContentType(req, "application/json; charset=UTF-8")) {
        sendBadRequest(res, "get-xml: bad content type [%s].", req.getHeader("Content-Type"));
        return;
      }
      res.setContentType("text/xml; charset=UTF-8");
      res.getWriter().append(XML.stringify(new Response(new Person())));
      return;
    }

    if(req.getRequestURI().contains("send-xml")) {
      if(!isContentType(req, "text/xml; charset=UTF-8")) {
        sendBadRequest(res, "send-xml: bad content type [%s].", req.getHeader("Content-Type"));
        return;
      }
      res.setContentType("text/xml; charset=UTF-8");
      res.getWriter().append(PayloadReader.read(req));
      return;
    }

    if(req.getRequestURI().contains("send-form")) {
      if(!getContentType(req).startsWith("multipart/form-data")) {
        sendBadRequest(res, "send-form: bad content type [%s].", req.getHeader("Content-Type"));
        return;
      }
      Person person = Form.parse(req);
      String requestedWith = req.getHeader("X-Requested-With");
      if(requestedWith == null) {
        res.setContentType("text/html; charset=UTF-8");
        Writer w = res.getWriter();
        w.append("<!DOCTYPE html>\r\n<html>\r\n<head>\r\n");
        w.append("<meta http-equiv=\"Content-Type\" content=\"application/json;charset=UTF-8\" />\r\n");
        w.append("</head>\r\n<body>");
        w.append(JSON.stringify(person));
        w.append("</body>\r\n</html>");
        return;
      }
      res.setContentType("application/json; charset=UTF-8");
      res.getWriter().append(JSON.stringify(person));
      return;
    }

    if(req.getRequestURI().contains("async-upload")) {
      asyncUpload(req, res);
      return;
    }

    if(req.getRequestURI().contains("bad-xhr-status")) {
      res.setContentType("application/json; charset=UTF-8");
      res.setStatus(404);
      res.getWriter().append(JSON.stringify(new Response("bad status")));
      return;
    }

    if(req.getRequestURI().contains("xhr-timeout")) {
      res.setContentType("application/json; charset=UTF-8");
      try {
        Thread.sleep(2000);
        res.getWriter().append(JSON.stringify(new Response("xhr timeout")));
      }
      catch(InterruptedException e) {}
    }

    res.setStatus(404);
    res.setContentType("text/plain; charset=UTF-8");
    res.getWriter().append("not found");
  }

  /**
   * Asynchronous upload.
   * 
   * @param req
   * @param res
   * @throws IOException
   */
  private void asyncUpload(HttpServletRequest req, HttpServletResponse res) throws IOException
  {
    if(isContentType(req, "application/json; charset=UTF-8")) {
      UploadControlResponse uploadControlResponse = (UploadControlResponse)req.getSession().getAttribute("upload-control-response");
      if(uploadControlResponse == null) {
        uploadControlResponse = new UploadControlResponse();
      }
      req.getSession().setAttribute("upload-control-response", uploadControlResponse);
      uploadControlResponse.opcode = "STATUS";
      res.setContentType("application/json; charset=UTF-8");
      res.getWriter().append(JSON.stringify(uploadControlResponse));
      return;
    }

    UploadControlResponse uploadControlResponse = new UploadControlResponse();
    uploadControlResponse.value.total = req.getContentLength();
    req.getSession(true).setAttribute("upload-control-response", uploadControlResponse);

    if(!getContentType(req).startsWith("multipart/form-data")) {
      sendBadRequest(res, "asyn-upload: bad content type [%s].", req.getHeader("Content-Type"));
      return;
    }

    Person person = Form.parse(req);
    String requestedWith = req.getHeader("X-Requested-With");
    if(requestedWith == null) {
      res.setContentType("text/html; charset=UTF-8");
      Writer w = res.getWriter();
      w.append("<html><head>");
      w.append("<meta http-equiv=\"X-JSLIB-Version\" content=\"j(s)-lib 1.0.0\" />");
      w.append("<meta http-equiv=\"Content-Type\" content=\"application/json;charset=UTF-8\" />");
      w.append("</head><body>");
      w.append(JSON.stringify(person));
      w.append("</body></html>");
      return;
    }

    res.setContentType("application/json; charset=UTF-8");
    res.getWriter().append(JSON.stringify(person));
  }

  private String getContentType(HttpServletRequest req)
  {
    String contentType = req.getHeader("Content-Type");
    if(contentType == null) {
      return "";
    }
    return contentType;
  }

  private boolean isContentType(HttpServletRequest req, String contentTypeToMatch)
  {
    String contentType = req.getHeader("Content-Type");
    if(contentType == null) {
      return true;
    }
    return contentType.equalsIgnoreCase(contentTypeToMatch);
  }

  private boolean isRequestValid(HttpServletRequest req, HttpServletResponse res) throws IOException
  {
    String requestedWith = req.getHeader("X-Requested-With");
    if(requestedWith == null) return true;
    if(!req.getHeader("X-Requested-With").equals("XMLHttpRequest")) return sendBadRequest(res, "Bad X-Requested-With header.");
    if(req.getHeader("Cache-Control") == null) return sendBadRequest(res, "Bad cache control.");
    if(!req.getHeader("Accept").startsWith("application/json")) return sendBadRequest(res, "Bad accept header.");
    return true;
  }

  private boolean sendBadRequest(HttpServletResponse res, String message, Object... args) throws IOException
  {
    message = String.format(message, args);

    P("Bad request -------------------------------");
    P(message);
    P("-------------------------------------------");

    res.setContentType("text/plain; charset=UTF-8");
    res.setStatus(400);
    res.getWriter().append('"' + message + '"');
    return false;
  }

  @SuppressWarnings("unused")
  private void dumpRequest(HttpServletRequest req)
  {
    P(req.getRequestURI());
    P(req.getContentType());
    P(req.getHeader("X-Requested-With"));
    P(req.getHeader("X-JSXHR-Version"));
    P(req.getHeader("X-JSXHR-Request-Type"));
    P(req.getHeader("Cache-Control"));
    P(req.getHeader("Accept"));
  }

  private void P(String s)
  {
    System.out.println(s);
  }
}

@SuppressWarnings("nls")
class Response
{
  String version = "j(s)-lib 1.0.0";
  String code = "SUCCESS";
  Object value;

  public Response(Object value)
  {
    this.value = value;
  }
}

@SuppressWarnings("nls")
class Person
{
  String name = "Maximus Decimus Deridius";
  String profession = "gladiator";
  String origin = "Spanish";
}

class UploadControlResponse
{
  String opcode;
  ProgressEvent value = new ProgressEvent();
}

class ProgressEvent
{
  int total;
  int loaded;
}

class JSON
{
  static String stringify(Object object)
  {
    StringBuilder sb = new StringBuilder();
    try {
      sb.append('{');

      boolean first = true;
      for(Field field : object.getClass().getDeclaredFields()) {
        if(!first) sb.append(',');
        first = false;

        sb.append(quote(field.getName()));
        sb.append(':');

        Object value = field.get(object);
        if(value instanceof Integer) {
          sb.append(value);
        }
        else if(value instanceof String) {
          sb.append(quote((String)value));
        }
        else {
          sb.append(JSON.stringify(value));
        }
      }

      sb.append('}');
    }
    catch(Exception e) {}
    return sb.toString();
  }

  static String quote(String s)
  {
    return '"' + s + '"';
  }
}

@SuppressWarnings("nls")
class XML
{
  static String stringify(Object object)
  {
    StringBuilder sb = new StringBuilder();
    sb.append("<?xml version=\"1.0\"?>");
    sb.append("<root>");
    sb.append(doStringify(object));
    sb.append("</root>");
    return sb.toString();
  }

  static String doStringify(Object object)
  {
    StringBuilder sb = new StringBuilder();
    try {
      for(Field field : object.getClass().getDeclaredFields()) {
        sb.append('<');
        sb.append(field.getName());
        sb.append('>');

        Object value = field.get(object);
        if(value instanceof String) {
          sb.append(value);
        }
        else {
          sb.append(XML.doStringify(value));
        }
        sb.append("</");
        sb.append(field.getName());
        sb.append('>');
      }
    }
    catch(Exception e) {}
    return sb.toString();
  }
}

@SuppressWarnings("nls")
class Form
{
  static Person parse(HttpServletRequest req) throws IOException
  {
    Person person = new Person();
    try {
      ServletFileUpload upload = new ServletFileUpload();
      FileItemIterator iter = upload.getItemIterator(req);
      while(iter.hasNext()) {
        FileItemStream item = iter.next();
        String name = item.getFieldName();
        InputStream stream = item.openStream();
        if(item.isFormField()) {
          setField(person, name, Streams.asString(stream));
        }
        else {
          BufferedInputStream bis = new BufferedInputStream(stream);
          byte[] buffer = new byte[512];
          int length;
          while((length = bis.read(buffer)) != -1) {
            UploadControlResponse uploadControl = (UploadControlResponse)req.getSession().getAttribute("upload-control-response");
            if(uploadControl != null) uploadControl.value.loaded += length;
            System.out.println(new String(buffer));
          }
        }
      }
    }
    catch(FileUploadException e) {}
    return person;
  }

  static boolean isFile(String headers)
  {
    return headers.contains("Content-Type");
  }

  static String getName(String headers)
  {
    int startIndex = headers.indexOf("name=");
    startIndex += 6;
    int endIndex = headers.indexOf('"', startIndex);
    return headers.substring(startIndex, endIndex);
  }

  static void setField(Object object, String name, String value)
  {
    try {
      Field field = object.getClass().getDeclaredField(name);
      field.set(object, value);
    }
    catch(Exception e) {}
  }
}

class PayloadReader
{
  static String read(HttpServletRequest req) throws IOException
  {
    BufferedReader reader = req.getReader();
    StringBuilder sb = new StringBuilder();
    char[] buffer = new char[4 * 1024];
    for(;;) {
      int length = reader.read(buffer);
      if(length == -1) break;
      sb.append(buffer, 0, length);
    }
    return sb.toString();
  }
}